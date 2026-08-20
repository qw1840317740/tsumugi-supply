"""Test: can we extract SL1500 image from a known Amazon product page?"""
import asyncio, json, re
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36')
        page = await ctx.new_page()
        url = 'https://www.amazon.co.jp/dp/B0G5FBQR51'
        await page.goto(url, timeout=30000)
        await asyncio.sleep(3.0)
        # 1. data-a-dynamic-image in next.js JSON
        html = await page.content()
        m = re.search(r'"data-a-dynamic-image"\s*=\s*"([^"]+)"', html)
        print('a-dynamic-image match:', bool(m))
        if m:
            data = json.loads(m.group(1).replace('&quot;','"'))
            big = sorted(((int(re.search(r'\d+', k.split('.')[0]).group() or 0), u) for k,u in data.items()), reverse=True)
            for sz, u in big[:3]:
                print(f'  SL{sz}:', u[:80])
        # 2. Look for image URLs in the html
        imgs = re.findall(r'https://m\.media-amazon\.com/images/I/[A-Za-z0-9_\.,\-]+', html)
        print(f'm.media-amazon images found: {len(imgs)}')
        for im in imgs[:5]:
            print(' ', im[:80])
        # 3. Look for landing-image data
        landing = re.search(r'"landingImage":"([^"]+)"', html)
        print('landingImage match:', bool(landing))
        if landing:
            print(' ', landing.group(1)[:80])
        # 4. main image data-aid attribute
        main_img = await page.query_selector('#landingImage, #imgTagWrapperId img, #main-image-container img')
        if main_img:
            src = await main_img.get_attribute('src')
            print('main img src:', (src or '')[:100])
            data_aid = await page.evaluate("() => document.querySelector('#landingImage')?.getAttribute('data-a-dynamic-image') || null")
            print('data-a-dynamic-image via eval:', bool(data_aid))
            if data_aid:
                d = json.loads(data_aid.replace('&quot;', '"'))
                big = sorted(((int(re.search(r'\\d+', k.split('.')[0]).group() or 0), u) for k,u in d.items()), reverse=True)
                print('  best SL:', big[0][1][:80] if big else 'none')
        await browser.close()

asyncio.run(main())
