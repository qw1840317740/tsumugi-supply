#!/usr/bin/env python3
"""For missing PG images, try DuckDuckGo/Bing image search by JAN.

For each missing SKU:
  1. Search DuckDuckGo Images with the JAN
  2. Extract first product image URL (skip logos/banners)
  3. Download and save

Usage:
  python tools/find_missing_images.py 2>&1 | tee _missing_run.log
"""
from __future__ import annotations
import asyncio
import pathlib
import re
import sys
import urllib.parse
import csv

import imagehash
from PIL import Image
from io import BytesIO
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'products'

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'


async def fetch_one(browser, jan):
    """Try DDG image search for a JAN; return image bytes or None."""
    OUT.joinpath(f'{jan}.jpg')  # just to ensure exists
    if (OUT / f'{jan}.jpg').exists() and (OUT / f'{jan}.jpg').stat().st_size > 5000:
        return 'skip'
    ctx = await browser.new_context(user_agent=UA)
    try:
        page = await ctx.new_page()
        url = f'https://duckduckgo.com/?q={jan}+product&iax=image&ia=images'
        await page.goto(url, timeout=20000)
        try:
            await page.wait_for_selector('img', timeout=10000)
        except Exception:
            await ctx.close()
            return None
        await asyncio.sleep(2.0)
        # Extract image URLs from the DDG results page
        urls = await page.evaluate('''() => {
            const out = [];
            // DDG image tile links navigate to /images?q=...&imgurl=...
            for (const a of document.querySelectorAll('a[href*="imgurl="]')) {
                const m = a.href.match(/imgurl=([^&]+)/);
                if (m) {
                    try {
                        const u = decodeURIComponent(m[1]);
                        if (u.startsWith('http')) out.push(u);
                    } catch (e) {}
                }
            }
            // Also pick direct img srcs that look like product photos
            const imgs = document.querySelectorAll('img');
            for (const i of imgs) {
                const s = i.src || '';
                if (s.startsWith('http') && s.includes('http') && !s.includes('duckduckgo.com')) {
                    out.push(s);
                }
            }
            return out;
        }''')
        # Try each URL until one gives a real product image
        for url in urls[:8]:
            try:
                resp = await page.request.get(url, timeout=10000)
                if resp.status != 200:
                    continue
                body = await resp.body()
                if len(body) < 8000:
                    continue
                # Open and verify it's a real photo (not logo)
                try:
                    im = Image.open(BytesIO(body))
                    im.load()
                    w, h = im.size
                except Exception:
                    continue
                if w * h < 100000:  # too small
                    continue
                ratio = w / h
                if ratio < 0.3 or ratio > 3.5:  # too elongated
                    continue
                (OUT / f'{jan}.jpg').write_bytes(body)
                await ctx.close()
                return f'OK {len(body):>7}B {w}x{h}'
            except Exception:
                continue
        await ctx.close()
        return None
    except Exception as e:
        try:
            await ctx.close()
        except Exception:
            pass
        return None


async def main():
    targets_file = ROOT / '_pg_retry.csv'
    if not targets_file.exists():
        print('_pg_retry.csv missing')
        return
    with open(targets_file, encoding='utf-8') as f:
        targets = [line.strip().split(',', 1) for line in f if line.strip()]
    print(f'{len(targets)} targets to retry')

    ok = fail = 0
    t0 = asyncio.get_event_loop().time()
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            for i, (jan, _) in enumerate(targets, 1):
                if i % 10 == 0:
                    el = asyncio.get_event_loop().time() - t0
                    print(f'  [{i}/{len(targets)}] {el:.0f}s ok={ok} fail={fail}')
                r = await fetch_one(browser, jan)
                if r == 'skip':
                    ok += 1
                elif r and r.startswith('OK'):
                    ok += 1
                    print(f'  [{jan}] {r}')
                else:
                    fail += 1
                await asyncio.sleep(2.0)
        finally:
            await browser.close()
    el = asyncio.get_event_loop().time() - t0
    print(f'Done in {el:.0f}s -- {ok} ok / {fail} failed of {len(targets)}')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    asyncio.run(main())