from pathlib import Path
import asyncio
from PIL import Image, ImageDraw
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'docs' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)

async def main():
    frames = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 980}, device_scale_factor=1)
        await page.goto('http://127.0.0.1:18080', wait_until='networkidle')
        await page.screenshot(path=str(OUT / 'demo-ready.png'), full_page=True)
        frames.append(await page.screenshot())
        await page.locator('#run').click()
        for delay in (350, 700, 700, 700, 900):
            await page.wait_for_timeout(delay)
            frames.append(await page.screenshot())
        await page.screenshot(path=str(OUT / 'demo-complete.png'), full_page=True)
        await browser.close()

    images = [Image.open(__import__('io').BytesIO(frame)).convert('RGB') for frame in frames]
    images[0].save(OUT / 'bughunt-kit-demo.gif', save_all=True, append_images=images[1:], duration=[700, 850, 850, 850, 1200, 1600], loop=0, optimize=False)
    # A compact poster is useful in README previews and social cards.
    images[-1].save(OUT / 'bughunt-kit-demo-poster.png')
    print(f'captured {len(images)} frames to {OUT}')

asyncio.run(main())
