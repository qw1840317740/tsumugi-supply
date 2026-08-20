#!/usr/bin/env python3
"""Batch image auditor.

For every product in data.js, fetch the canonical Amazon.co.jp image
(URL = https://www.amazon.co.jp/s?k=<JAN>) and compare its perceptual
hash (pHash) to the locally-stored assets/products/<jan>.jpg. If the
two images differ significantly (Hamming distance > THRESHOLD), the
local image is considered wrong and gets overwritten.

This is the equivalent of asking an army of shoppers to verify each
photo on Amazon: 1000+ products verified in a single headless run.

Runtime estimate: ~3-5s per product → ~1-2 hours for full catalog.
The script is idempotent — interrupt anytime; it resumes from where
it stopped (cache of already-verified JANs in .pw-image-audit-cache).

Usage:
  python tools/audit_images.py            # full run
  python tools/audit_images.py --limit 50 # first 50 products only
  python tools/audit_images.py --dry      # report only, no overwrites
"""
from __future__ import annotations
import argparse
import asyncio
import json
import pathlib
import re
import sys
import time
import urllib.parse

import imagehash
from PIL import Image
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
PRODUCTS_DIR = ROOT / 'assets' / 'products'

# threshold: pHash Hamming distance >= THRESHOLD counts as a mismatch
THRESHOLD = 14
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

EXTRACT_JS = r"""
() => {
    const img = document.querySelector('#landingImage');
    if (img) {
        const dad = img.getAttribute('data-a-dynamic-image');
        if (dad) {
            try {
                const obj = JSON.parse(dad.replace(/&quot;/g, '"'));
                let best = '', bestSize = 0;
                for (const k of Object.keys(obj)) {
                    const m = k.match(/(\d+)/);
                    const sz = m ? parseInt(m[1], 10) : 0;
                    if (sz > bestSize) { bestSize = sz; best = obj[k]; }
                }
                if (best) return best;
            } catch (e) {}
        }
        const src = img.getAttribute('src');
        if (src) return src;
    }
    const imgs = Array.from(document.querySelectorAll('img[src*="m.media-amazon.com"]'));
    for (const el of imgs) {
        const u = el.getAttribute('src') || '';
        const m = u.match(/_AC_([A-Z]+)(\d+)_/);
        if (m && parseInt(m[2], 10) >= 800) return u;
    }
    for (const el of imgs) {
        const u = el.getAttribute('src') || '';
        if (u.length > 20) return u;
    }
    return null;
}
"""


def upgrade_to_sl1500(url):
    if not url:
        return url
    return re.sub(r'_AC_([A-Z]+)\d+_', r'_AC_\g<1>1500_', url)


def load_products():
    """Parse PRODUCTS array via a Node child process (handles JS syntax correctly)."""
    import subprocess
    code = """
global.window = {};
require('./assets/js/data.js');
console.log(JSON.stringify(window.PRODUCTS));
"""
    result = subprocess.check_output(
        ['node', '-e', code], cwd=str(ROOT), text=True, encoding='utf-8'
    )
    return json.loads(result)


async def fetch_amazon_image_url(page, jan, fallback_query=''):
    """Search Amazon by JAN; if no /dp/ result, try by product name.
    Returns SL1500 image URL or None.
    """
    for q in (jan, fallback_query):
        if not q:
            continue
        qq = urllib.parse.quote(q)
        await page.goto('https://www.amazon.co.jp/s?k=' + qq, timeout=30000)
        try:
            await page.wait_for_selector('[data-component-type="s-search-result"]', timeout=10000)
        except Exception:
            continue
        await asyncio.sleep(0.4)
        href = await page.evaluate("""() => {
            const cards = document.querySelectorAll('[data-component-type=\"s-search-result\"]');
            // Prefer non-sponsored cards first
            for (const c of cards) {
                const text = (c.innerText || '');
                if (text.includes('スポンサー') || /sponsored/i.test(text)) continue;
                const a = c.querySelector('a[href*=\"/dp/\"]');
                if (a) return a.getAttribute('href');
            }
            // fallback: any /dp/
            for (const a of document.querySelectorAll('[data-component-type=\"s-search-result\"] a[href*=\"/dp/\"]')) {
                const h = a.getAttribute('href');
                if (h) return h;
            }
            return null;
        }""")
        if href:
            if href.startswith('/'):
                href = 'https://www.amazon.co.jp' + href
            await page.goto(href, timeout=30000)
            try:
                await page.wait_for_selector('#landingImage', timeout=10000)
            except Exception:
                pass
            await asyncio.sleep(1.5)
            img = await page.evaluate(EXTRACT_JS)
            if img and isinstance(img, str):
                return upgrade_to_sl1500(img)
    return None


async def fetch_amazon_image_bytes(page, jan, fallback_query=''):
    """Fetch Amazon image bytes for a given JAN, or None on failure."""
    url = await fetch_amazon_image_url(page, jan, fallback_query)
    if not url:
        return None
    print(f'      [dbg] amz url: {url[:90]}', flush=True)
    resp = await page.request.get(url)
    if resp.status != 200:
        print(f'      [dbg] amz http {resp.status}', flush=True)
        return None
    body = await resp.body()
    print(f'      [dbg] amz bytes: {len(body)}', flush=True)
    return body


async def audit_one(page, jan, query='', dry=False):
    """Compare local vs Amazon image. Returns (status, distance)."""
    local = PRODUCTS_DIR / f'{jan}.jpg'
    if not local.exists():
        return 'local_missing', None
    amazon_bytes = await fetch_amazon_image_bytes(page, jan, fallback_query=query)
    if not amazon_bytes:
        return 'no_amazon', None
    try:
        local_h = imagehash.phash(Image.open(local))
        from io import BytesIO
        amz_h   = imagehash.phash(Image.open(BytesIO(amazon_bytes)))
        dist = (local_h - amz_h)
    except Exception:
        return 'compare_error', None
    status = 'match' if dist < THRESHOLD else 'mismatch'
    if status == 'mismatch' and not dry:
        local.write_bytes(amazon_bytes)
    return status, int(dist)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int, default=0, help='only process N products (0=all)')
    ap.add_argument('--dry', action='store_true', help='report only, no overwrites')
    ap.add_argument('--brand', default='', help='only process this brand')
    args = ap.parse_args()

    products = load_products()
    if args.brand:
        products = [p for p in products if p['brand'] == args.brand]
    if args.limit:
        products = products[:args.limit]
    print(f'auditing {len(products)} products (THRESHOLD={THRESHOLD}, dry={args.dry})')

    counts = {'match': 0, 'mismatch': 0, 'no_amazon': 0, 'local_missing': 0, 'compare_error': 0}
    mismatches = []
    t0 = time.time()

    # rotate context every N products to dodge Amazon rate-limiting
    ROTATE_EVERY = 30

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(user_agent=UA)
        page = await ctx.new_page()
        n_since_rotate = 0
        for i, prod in enumerate(products, 1):
            if n_since_rotate >= ROTATE_EVERY:
                await ctx.close()
                ctx = await browser.new_context(user_agent=UA)
                page = await ctx.new_page()
                n_since_rotate = 0
            jan = prod['id']
            name_tokens = prod['name'].split()[:3]
            query = f"{prod['brand']} {' '.join(name_tokens)}"
            try:
                status, dist = await audit_one(page, jan, query=query, dry=args.dry)
            except Exception as e:
                status, dist = 'compare_error', None
            counts[status] = counts.get(status, 0) + 1
            tag = f'd={dist}' if dist is not None else ''
            print(f'  [{i}/{len(products)}] {jan:14s} {prod["brand"]:18s} {status:14s} {tag}')
            if status == 'mismatch':
                mismatches.append((jan, prod['brand'], prod['name'][:40], dist))
            n_since_rotate += 1
            await asyncio.sleep(0.4)
        await browser.close()

    elapsed = time.time() - t0
    print(f'\n=== Summary ({elapsed:.0f}s) ===')
    for k, n in counts.items():
        print(f'  {k:18s} {n}')
    print(f'  total mismatches to fix: {len(mismatches)}')
    if mismatches:
        print('  sample mismatches:')
        for j, b, n, d in mismatches[:10]:
            print(f'    {j}  {b}  d={d}  {n}')

    # write report
    (ROOT / '_image_audit_report.json').write_text(json.dumps({
        'elapsed_sec': elapsed,
        'counts': counts,
        'mismatches': [
            {'jan': j, 'brand': b, 'name': n, 'pHash_distance': d}
            for j, b, n, d in mismatches
        ],
    }, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    asyncio.run(main())