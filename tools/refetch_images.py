#!/usr/bin/env python3
"""Re-fetch product images by direct JAN lookup on Amazon.co.jp.

Uses the canonical Amazon URL: https://www.amazon.co.jp/s?k=<JAN>
which returns the product-as-JAN result page. Then opens the /dp/
link and grabs the SL1500 image via #landingImage.

Usage: python tools/refetch_images.py
"""
from __future__ import annotations
import asyncio
import pathlib
import re
import sys
import urllib.parse

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'products'

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
]

# (JAN, search-query backup if JAN lookup fails)
TARGETS = [
    ('4513574038790', 'DEVECICA マヌカハニー 化粧水'),
    ('4513574032934', 'DEVECICA オリーブ&アルガン ボディソープ'),
    ('4513574044371', 'DEVECICA シャインマスカット 洗顔フォーム'),
    ('4513574044302', 'DEVECICA マヌカハニー ボディソープ 詰替'),
    ('4513574024328', 'DEVECICA 3種 コンディショナー 詰替'),
    ('4513574042346', 'チャコット 炭&酵素 洗顔フォーム'),
    ('4513574042353', 'チャコット 炭&酵素 W 洗顔'),
    ('4513574042377', 'チャコット 炭&酵素 クレンジングオイル'),
    # Round 2: 6 SKUs flagged by the user
    ('4513574014169', 'サロンリンク エクストラ コンディショナー'),
    ('4513574027749', '麗白 ハトムギ ベビーオイル'),
    ('4513574039957', 'cyclea ビタミンC 酵素洗顔'),
    ('4513574040137', 'cyclea ビタミンC 酵素ボディソープ 詰替'),
    ('4513574042865', 'cyclea 薬用 ビタミンC 洗顔'),
    ('4513574040144', 'cyclea ビタミンC 酵素泡洗顔 本体'),
    # Round 3: 26 SKUs flagged by the user (non-DEVECICA/Chacott brands)
    ('4903301186403', 'ホワイト＆ホワイト よこ'),
    ('49795462',       'NONIO 舌専用 クリーニングジェル'),
    ('4903301293187', 'NONIO ハブラシ SHARP やわらかめ'),
    ('4903301241614', 'クリニカ AD デンタルリンス すっきり'),
    ('4903301099277', 'クリニカ Kids デンタルリンス グレープ'),
    ('49795660',       'NONIO マウスウォッシュ クリアハーブ'),
    ('49795615',       'NONIO マウスウォッシュ NAライトハーブ'),
    ('4903301176824', 'キレイキレイ 薬用液体ハンドソープ 詰替'),
    ('49795479',       'キレイキレイ 薬用ハンドコンディショニングソープ'),
    ('45185618',       'キレイキレイ ハンドコンディショニング 木漏れ日'),
    ('45185601',       'キレイキレイ 手指消毒ジェルプラス'),
    ('4903301326441', 'ハダカラ 泡BS デオドラント 詰替'),
    ('4903301375364', 'NANOX one 洗浄プラス 600g'),
    ('4903301375449', 'NANOX one ニオイ専用 600g'),
    ('4903301375470', 'NANOX one PRO 600g'),
    ('4903301375395', 'NANOX one 洗浄プラス 詰替 1080g'),
    ('4903301375463', 'NANOX one ニオイ専用 詰替 1080g'),
    ('4903301375494', 'NANOX one PRO 詰替 1010g'),
    ('4903301274650', 'アクロン フローラルブーケ 本体'),
    ('4903301344575', 'アクロン フローラルブーケ 詰替'),
    ('4903301344582', 'アクロン フローラルブーケ 詰替大'),
    ('4903301344612', 'アクロン ナチュラルソープ 詰替大'),
    ('4903301745525', 'NANOX エリそで用 本体'),
    ('4903301231363', 'NANOX エリそで用 詰替大'),
    ('4903301353157', 'ソフランアロマリッチ ジュリエット 詰替'),
    ('4903301353171', 'ソフランアロマリッチ ダイアナ 詰替'),
]


async def find_dp_url_via_jan(page, jan):
    """Open Amazon search by JAN, follow the first /dp/ result link."""
    q = urllib.parse.quote(jan)
    await page.goto('https://www.amazon.co.jp/s?k=' + q, timeout=30000)
    try:
        await page.wait_for_selector('[data-component-type="s-search-result"]', timeout=10000)
    except Exception:
        return None
    await asyncio.sleep(1.0)
    href = await page.evaluate("""() => {
        for (const a of document.querySelectorAll('[data-component-type=\"s-search-result\"] a[href*=\"/dp/\"]')) {
            const h = a.getAttribute('href');
            if (h) return h;
        }
        return null;
    }""")
    return href


async def find_dp_url_query(page, query):
    """Fallback: search by Japanese query, return first /dp/ card link."""
    q = urllib.parse.quote(query)
    await page.goto('https://www.amazon.co.jp/s?k=' + q, timeout=30000)
    try:
        await page.wait_for_selector('[data-component-type="s-search-result"]', timeout=10000)
    except Exception:
        return None
    await asyncio.sleep(1.0)
    href = await page.evaluate("""() => {
        const cards = document.querySelectorAll('[data-component-type=\"s-search-result\"]');
        for (const c of cards) {
            const text = c.innerText || '';
            if (text.includes('スポンサー')) continue;
            const a = c.querySelector('a[href*=\"/dp/\"]');
            if (a) return a.getAttribute('href');
        }
        // fall back to any /dp/ link
        for (const c of cards) {
            const a = c.querySelector('a[href*=\"/dp/\"]');
            if (a) return a.getAttribute('href');
        }
        return null;
    }""")
    return href


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
                if (typeof best === 'string' && best.indexOf('media-amazon') !== -1) return best;
            } catch (e) {}
        }
        const src = img.getAttribute('src');
        if (typeof src === 'string' && src.indexOf('media-amazon') !== -1) return src;
    }
    const imgs = Array.from(document.querySelectorAll('img[src*="m.media-amazon.com"]'));
    for (const el of imgs) {
        const u = el.getAttribute('src');
        if (typeof u === 'string') {
            const m = u.match(/_AC_([A-Z]+)(\d+)_/);
            if (m && parseInt(m[2], 10) >= 800) return u;
        }
    }
    for (const el of imgs) {
        const u = el.getAttribute('src');
        if (typeof u === 'string' && u.length > 20) return u;
    }
    return null;
}
"""


def upgrade_to_sl1500(url):
    if not url:
        return url
    return re.sub(r'_AC_([A-Z]+)\d+_', r'_AC_\g<1>1500_', url)


async def fetch_one(browser, jan, fallback_query):
    # Resume support: skip if local file exists and is large enough
    target = OUT / f'{jan}.jpg'
    if target.exists() and target.stat().st_size > 5000:
        print(f'  [{jan}] SKIP (exists, {target.stat().st_size}B)')
        return True
    for attempt in range(2):
        ua = USER_AGENTS[(hash(jan) + attempt) % len(USER_AGENTS)]
        ctx = await browser.new_context(user_agent=ua)
        try:
            page = await ctx.new_page()
            href = await find_dp_url_via_jan(page, jan)
            if not href:
                # try fallback query
                href = await find_dp_url_query(page, fallback_query)
            if not href:
                print(f'  [{jan}] attempt {attempt}: no /dp/ result')
                await ctx.close()
                continue
            if href.startswith('/'):
                href = 'https://www.amazon.co.jp' + href
            await page.goto(href, timeout=30000)
            try:
                await page.wait_for_selector('#landingImage', timeout=10000)
            except Exception:
                pass
            await asyncio.sleep(2.5)
            img = await page.evaluate(EXTRACT_JS)
            if not img or not isinstance(img, str):
                tname = type(img).__name__ if img is not None else 'None'
                print(f'  [{jan}] attempt {attempt}: extract -> {tname}: {str(img)[:80] if img else "none"}')
                await ctx.close()
                continue
            img = upgrade_to_sl1500(img)
            resp = await page.request.get(img)
            if resp.status != 200:
                print(f'  [{jan}] attempt {attempt}: image HTTP {resp.status}')
                await ctx.close()
                continue
            body = await resp.body()
            if len(body) < 5000:
                print(f'  [{jan}] attempt {attempt}: image too small {len(body)}B')
                await ctx.close()
                continue
            (OUT / f'{jan}.jpg').write_bytes(body)
            print(f'  [{jan}] OK {len(body):>7}B')
            await ctx.close()
            return True
        except Exception as e:
            import traceback
            print(f'  [{jan}] attempt {attempt} exception: {e}')
            traceback.print_exc()
            try:
                await ctx.close()
            except Exception:
                pass
            continue
    print(f'  [{jan}] FAILED after 2 attempts')
    return False


def load_targets_from_csv(path: str):
    """Read (JAN, query) pairs from CSV. Skip blank/comment lines."""
    import csv
    out = []
    with open(path, encoding='utf-8', newline='') as fh:
        for row in csv.reader(fh):
            if not row or row[0].startswith('#'):
                continue
            jan = row[0].strip()
            query = row[1].strip() if len(row) > 1 else ''
            if jan:
                out.append((jan, query))
    return out


async def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('--targets', default='', help='CSV with JAN,query (default: built-in 40)')
    args = ap.parse_args()

    if args.targets:
        targets = load_targets_from_csv(args.targets)
        print(f'loaded {len(targets)} targets from {args.targets}')
    else:
        targets = TARGETS
        print(f'running built-in {len(targets)} TARGETS')

    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            ok = 0
            for jan, query in targets:
                if await fetch_one(browser, jan, query):
                    ok += 1
                await asyncio.sleep(2.0)
            print(f'Done -- {ok} ok / {len(targets)-ok} failed of {len(targets)}')
        finally:
            await browser.close()


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    asyncio.run(main())
