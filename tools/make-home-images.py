"""Build the homepage's product imagery from real catalogue photos.

  python tools/make-home-images.py

Writes small square WebP files (white border trimmed, product centred) to
  assets/home/hero-*.webp, assets/home/cat-*.webp   - homepage hero + category cards
  assets/brand-thumbs/<slug>.webp                   - one representative product per brand
and refreshes the generated BRAND_THUMBS / NO_PHOTO block in assets/js/app.js.
"""
import json
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
PHOTOS = ROOT / 'assets' / 'products'

HERO = {  # tile id -> JAN
    'main': '4971710573992',
    'botanist': '4582521686087',
    'honey': '4589546890758',
    'akaibohshi': '4975186230175',
    'clinica': '4903301241447',
    'kireikirei': '4903301176848',
}
CATEGORY = {  # category id -> JAN
    'health': '4511413407936',
    'beauty': '4971710632422',
    'daily': '4987176319760',
    'sweets': '4934675230027',
    'babykids': '4987176334886',
}


def trimmed_square(jan, size, pad=0.1):
    im = Image.open(PHOTOS / f'{jan}.jpg').convert('RGB')
    # Treat near-white as background so JPEG noise around the edges is ignored.
    diff = ImageChops.difference(im, Image.new('RGB', im.size, (255, 255, 255))).convert('L')
    box = diff.point(lambda v: 255 if v > 12 else 0).getbbox()
    if box:
        im = im.crop(box)
    side = int(max(im.size) * (1 + 2 * pad))
    canvas = Image.new('RGB', (side, side), (255, 255, 255))
    canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    return canvas.resize((size, size), Image.LANCZOS)


def save(img, path, quality=82):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, 'WEBP', quality=quality, method=6)


def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def main():
    for tile, jan in HERO.items():
        save(trimmed_square(jan, 720 if tile == 'main' else 360), ROOT / 'assets' / 'home' / f'hero-{tile}.webp')
    for cat, jan in CATEGORY.items():
        save(trimmed_square(jan, 400, pad=0.08), ROOT / 'assets' / 'home' / f'cat-{cat}.webp')

    # First product (catalogue order) that has a photo represents each brand.
    products = json.loads(subprocess.check_output(['node', '-e', (
        "global.window={};require('./assets/js/data.js');"
        "process.stdout.write(JSON.stringify(window.PRODUCTS.map(p=>[p.brand,p.jan])))"
    )], cwd=ROOT))
    thumbs = {}
    for brand, jan in products:
        if brand in thumbs or not (PHOTOS / f'{jan}.jpg').exists():
            continue
        thumbs[brand] = slug(brand)
        save(trimmed_square(jan, 112, pad=0.06), ROOT / 'assets' / 'brand-thumbs' / f'{thumbs[brand]}.webp')
    no_photo = sorted({jan for _, jan in products if not (PHOTOS / f'{jan}.jpg').exists()})
    app = ROOT / 'assets' / 'js' / 'app.js'
    start, end = '// <generated:home-images>', '// </generated:home-images>'
    text = app.read_text(encoding='utf-8')
    a, b = text.index(start), text.index(end)
    block = '\n'.join([
        f'{start} tools/make-home-images.py',
        f"const BRAND_THUMBS = {json.dumps(thumbs, ensure_ascii=False, separators=(',', ':'))};",
        f"const NO_PHOTO = new Set({json.dumps(no_photo, separators=(',', ':'))});",
        '',
    ])
    app.write_text(text[:a] + block + text[b:], encoding='utf-8')
    print(f'hero {len(HERO)}, categories {len(CATEGORY)}, brand thumbs {len(thumbs)}, products without photo {len(no_photo)}')


if __name__ == '__main__':
    main()
