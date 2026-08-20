#!/usr/bin/env python3
"""Scan all assets/products/*.jpg for suspicious images.

Heuristics (cheap, no network) — tuned to the actual failure modes we saw:
  - file size < 4KB  (placeholder / SVG-as-JPG garbage)
  - file size > 500KB (decoration / panorama, usually wrong)
  - dimensions 405x405 or 1035x1035 (Amazon default placeholders)
  - mean RGB near pure white (>245 on all channels) or pure black (<10)
  - Pillow cannot decode

pHash is computed for every image but ONLY used for reporting — no
network calls happen in scan. This lets us later cross-check what
Amazon's image looks like vs. what we have.

Usage:
  python tools/scan_images.py                       # just scan + JSON report
  python tools/scan_images.py --emit-csv out.csv   # also write JAN,query CSV
"""
from __future__ import annotations
import argparse
import csv
import json
import pathlib
import sys

import imagehash
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
PRODUCTS_DIR = ROOT / 'assets' / 'products'
DATA_JS = ROOT / 'assets' / 'js' / 'data.js'
REPORT = ROOT / '_image_audit.json'

# Tight thresholds based on observed failure modes
SIZE_TOO_SMALL = 4_000        # bytes — anything smaller is a placeholder
SIZE_TOO_LARGE = 500_000      # bytes — usually decoration or panorama
PLACEHOLDER_SIZES = {(405, 405), (1035, 1035), (500, 500), (300, 300)}
MEAN_NEAR_WHITE = 245         # all-RGB mean above this = nearly white
MEAN_NEAR_BLACK = 10          # all-RGB mean below this = nearly black


def mean_rgb(im: Image.Image) -> tuple[float, float, float]:
    """Downsample to 32x32, return (R, G, B) means."""
    small = im.convert('RGB').resize((32, 32))
    px = list(small.getdata())
    n = len(px)
    r = sum(p[0] for p in px) / n
    g = sum(p[1] for p in px) / n
    b = sum(p[2] for p in px) / n
    return r, g, b


def scan_one(path: pathlib.Path) -> dict:
    """Return dict with jan, size, dim, phash, and reasons[]. reasons=[] means OK."""
    jan = path.stem
    out = {'jan': jan, 'size': path.stat().st_size, 'reasons': []}
    try:
        im = Image.open(path)
        im.load()
        w, h = im.size
        out['width'] = w
        out['height'] = h
    except Exception as e:
        out['reasons'].append(f'broken:{e!s}')
        return out

    if out['size'] < SIZE_TOO_SMALL:
        out['reasons'].append(f'too_small:{out["size"]}B')
    if out['size'] > SIZE_TOO_LARGE:
        out['reasons'].append(f'too_large:{out["size"]}B')
    if (w, h) in PLACEHOLDER_SIZES:
        out['reasons'].append(f'placeholder_dim:{w}x{h}')
    try:
        r, g, b = mean_rgb(im)
        if r > MEAN_NEAR_WHITE and g > MEAN_NEAR_WHITE and b > MEAN_NEAR_WHITE:
            out['reasons'].append(f'near_white:{r:.0f},{g:.0f},{b:.0f}')
        if r < MEAN_NEAR_BLACK and g < MEAN_NEAR_BLACK and b < MEAN_NEAR_BLACK:
            out['reasons'].append(f'near_black:{r:.0f},{g:.0f},{b:.0f}')
    except Exception:
        pass
    try:
        out['phash'] = str(imagehash.phash(Image.open(path)))
    except Exception:
        out['phash'] = None
    return out


def load_products():
    """Parse PRODUCTS array via Node child process (handles JS syntax)."""
    import subprocess
    code = """
global.window = {};
require('./assets/js/data.js');
console.log(JSON.stringify(window.PRODUCTS.map(p => ({id:p.id, brand:p.brand, name:p.name}))));
"""
    result = subprocess.check_output(
        ['node', '-e', code], cwd=str(ROOT), text=True, encoding='utf-8'
    )
    return json.loads(result)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--emit-csv', default='', help='also write JAN,query CSV to this path')
    args = ap.parse_args()

    # 1. load products (so we can flag data.js says X but no file too)
    try:
        products = {p['id']: p for p in load_products()}
    except Exception as e:
        print(f'  warn: could not load data.js: {e}', file=sys.stderr)
        products = {}

    # 2. scan all local jpegs
    flagged = []
    n_total = 0
    for p in sorted(PRODUCTS_DIR.glob('*.jpg')):
        n_total += 1
        info = scan_one(p)
        if info['reasons']:
            flagged.append(info)

    # 3. find products in data.js that have no local jpg
    have = {p.stem for p in PRODUCTS_DIR.glob('*.jpg')}
    missing = []
    for pid in products:
        if pid not in have:
            missing.append(pid)

    print(f'scanned {n_total} images, {len(flagged)} flagged, {len(missing)} missing')
    for f in flagged[:30]:
        reasons = ','.join(f['reasons'])
        print(f'  {f["jan"]:16s} {f.get("width","?"):>4}x{f.get("height","?"):<4} {f["size"]:>7}B  {reasons}')

    # 4. write report
    REPORT.write_text(json.dumps({
        'flagged': flagged,
        'missing_in_data': missing,
    }, indent=2, ensure_ascii=False))
    print(f'\nfull report: {REPORT}')

    # 5. optional CSV for refetch
    if args.emit_csv:
        targets = []
        for f in flagged:
            pid = f['jan']
            prod = products.get(pid)
            if prod:
                tokens = prod['name'].split()[:3]
                query = f'{prod["brand"]} {" ".join(tokens)}'
            else:
                query = ''
            targets.append((pid, query))
        with open(args.emit_csv, 'w', encoding='utf-8', newline='') as fh:
            w = csv.writer(fh)
            for row in targets:
                w.writerow(row)
        print(f'\nCSV for refetch: {args.emit_csv}  ({len(targets)} rows)')


if __name__ == '__main__':
    main()