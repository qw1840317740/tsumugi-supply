"""Smoke test: open Amazon.co.jp search and dump first results."""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36')
        page = await ctx.new_page()
        await page.goto('https://www.amazon.co.jp/s?k=%E3%83%87%E3%82%A3%E3%83%96+%E3%83%9E%E3%83%8C%E3%82%AB%E3%83%8F%E3%83%8B%E3%83%BC+%E5%8C%96%E7%B2%A7%E6%B0%B4', timeout=30000)
        await asyncio.sleep(2.5)
        # Print full title of page
        print('TITLE:', await page.title())
        # Check for the captcha / no-results banner
        html = await page.content()
        if 'No results' in html:
            print('  empty: "No results for ..."')
        if 'Robot Check' in html or 'captcha' in html.lower():
            print('  BLOCKED: amazon captcha')
        # Pick search results if present
        cards = await page.query_selector_all('[data-component-type="s-search-result"]')
        print(f'  search result cards: {len(cards)}')
        cards2 = await page.query_selector_all('h2 a')
        print(f'  h2 a count: {len(cards2)}')
        for c in cards2[:5]:
            t = await c.text_content()
            h = await c.get_attribute('href')
            print('   -', (t or '').strip()[:60], '->', (h or '')[:80])
        await browser.close()

asyncio.run(main())
