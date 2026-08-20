"""Debug search: dump first 3 result card titles and URLs."""
import asyncio
import urllib.parse
from playwright.async_api import async_playwright

QUERIES = [
    'DEVECICA マヌカハニー',
    'DEVECICA オリーブ アルガン ボディソープ',
    'DEVECICA シャインマスカット 洗顔フォーム',
    'Chacott 炭 酵素 洗顔フォーム',
    'Chacott 炭 酵素 クレンジングオイル',
]

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(user_agent=UA)
        page = await ctx.new_page()
        for q in QUERIES:
            print(f'\n=== {q} ===')
            url = 'https://www.amazon.co.jp/s?k=' + urllib.parse.quote(q)
            await page.goto(url, timeout=30000)
            try:
                await page.wait_for_selector('[data-component-type="s-search-result"]', timeout=10000)
            except Exception:
                print('  no results selector')
                continue
            await asyncio.sleep(1.0)
            data = await page.evaluate("""(q) => {
                const cards = document.querySelectorAll('[data-component-type=\"s-search-result\"]');
                const out = [];
                for (let i = 0; i < Math.min(5, cards.length); i++) {
                    const c = cards[i];
                    const a = c.querySelector('a[href*=\"/dp/\"]');
                    out.push({
                        href: a ? a.getAttribute('href') : null,
                        title: (c.querySelector('h2') || {}).textContent || '',
                        text: c.innerText.replace(/\\n/g, ' ').slice(0, 200)
                    });
                }
                return out;
            }""", q)
            for d in data:
                print(f'  - {d["title"][:60]}')
                print(f'    href: {(d["href"] or "")[:80]}')
            await asyncio.sleep(1.5)
        await browser.close()

asyncio.run(main())
