"""Smoke test: open Amazon.co.jp search and dump all selectable anchors + text."""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36')
        page = await ctx.new_page()
        await page.goto('https://www.amazon.co.jp/s?k=%E3%83%87%E3%82%A3%E3%83%96+%E3%83%9E%E3%83%8C%E3%82%AB%E3%83%8F%E3%83%8B%E3%83%BC+%E5%8C%96%E7%B2%A7%E6%B0%B4', timeout=30000)
        await asyncio.sleep(2.5)
        cards = await page.query_selector_all('[data-component-type="s-search-result"]')
        print('cards:', len(cards))
        for c in cards[:5]:
            inner_text = (await c.inner_text())[:100]
            asin = await c.get_attribute('data-asin')
            print('  asin:', asin, '|', inner_text.replace('\n', ' / '))
        # Try clicking first card
        if cards:
            first_link = await cards[0].query_selector('a:has(h2)')
            if not first_link:
                first_link = await cards[0].query_selector('a.a-link-normal')
            if first_link:
                href = await first_link.get_attribute('href')
                print('first href:', href[:80] if href else 'none')
        await browser.close()

asyncio.run(main())
