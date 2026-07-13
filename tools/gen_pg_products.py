#!/usr/bin/env python3
"""Generate JS object literals from _pg_aug.xlsx for data.js import.

Output: stdout, one JS object per product line:
  {"id": "...", "jan": "...", "name": "...", "brand": "...", "category": "...", ...}

Field mapping (verified):
  col 2  category (PG raw)  -> site category/sub/glyph/hue via CATEGORY_MAP
  col 3  brand (PG raw)     -> romanized via BRAND_MAP
  col 4  switch_type        -> tag via TAG_MAP
  col 6  JAN                -> id, jan
  col 7  name               -> name (size already included)
  col 9  CS入数             -> moq (case pack count)
  price = 0  (site policy: pricing on request, matches existing catalog)
  unit = ''  (size is in name already)
"""
from __future__ import annotations
import json
import sys
from collections import Counter

import openpyxl

ROOT = r'C:\jp-wholesale-demo'
XLSX = ROOT + r'\_pg_aug.xlsx'

# PG xlsx col 2 -> (site category, sub, glyph, hue)
CATEGORY_MAP = {
    'ﾎｰﾑ':      ('daily',    'cleaning', '掃', '#5B8C7F'),
    'ﾌｧﾌﾞﾘｯｸ':  ('daily',    'laundry',  '洗', '#3E5A45'),
    'ﾍｱｹｱ':     ('beauty',   'haircare', '髪', '#9C6B3B'),
    'ﾍﾞﾋﾞｰ':     ('babykids', 'diaper',   '子', '#4A7C59'),
    'ﾌｪﾐｹｱ':     ('beauty',   'bodycare', '魅', '#BE5A38'),
    'ｵｰﾗﾙ':      ('health',   'hygiene',  '歯', '#3A4A66'),
}

# PG xlsx col 3 -> romanized
BRAND_MAP = {
    'ｱﾘｴｰﾙ':       'Ariel',
    'ﾎﾞｰﾙﾄﾞ':     'Bold',
    'さらさ':       'Sarasa',
    'ﾚﾉｱ':         'Lenor',
    'ｼﾞｮｲ':       'Joy',
    'ﾌｧﾌﾞﾘｰｽﾞ':   'Febreze',
    'ﾊﾟﾝﾃｰﾝ':     'Pantene',
    'HE':          'H&E',
    'h&s':         'Head & Shoulders',
    'h&s for men': 'Head & Shoulders for Men',
    'ﾍｱﾚｼﾋﾟ':     'Hair Recipe',
    'ﾊﾟﾝﾊﾟｰｽ':   'Pampers',
    'ｳｨｽﾊﾟｰ':    'Whisper',
    'ｵｰﾗﾙ':       'Oral-B',
}

# PG xlsx col 4 -> site tag
TAG_MAP = {
    '廃番':       'discontinued',
    '自然切替':   'new',
    '新規':       'new',
    '優先出荷':   'new',
    '価格変更':   'new',
    None:         'new',
}


def main():
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb['PG8月']

    out_lines = []
    brand_counts: Counter = Counter()
    cat_counts: Counter = Counter()
    skip_count = 0
    fallback_count = 0

    for row in ws.iter_rows(min_row=5, values_only=True):
        if not row or not row[5]:
            skip_count += 1
            continue
        jan_raw = row[5]
        # Coerce JAN to 13-digit string
        if isinstance(jan_raw, (int, float)):
            jan = str(int(jan_raw)).zfill(13)
        else:
            jan = str(jan_raw).strip()
        if not jan.isdigit() or len(jan) != 13:
            skip_count += 1
            continue

        pg_cat = (row[1] or '').strip()
        pg_brand = (row[2] or '').strip()
        switch_type = row[3]
        name = (row[6] or '').strip()
        pack_raw = row[8]
        moq = int(pack_raw) if isinstance(pack_raw, (int, float)) and pack_raw > 0 else 1

        # Map category
        if pg_cat not in CATEGORY_MAP:
            print(f'  warn: unknown PG category {pg_cat!r} for {jan}', file=sys.stderr)
            skip_count += 1
            continue
        cat, sub, glyph, hue = CATEGORY_MAP[pg_cat]

        # Map brand
        brand = BRAND_MAP.get(pg_brand)
        if not brand:
            brand = 'P&G'
            fallback_count += 1

        # Tag
        tag = TAG_MAP.get(switch_type, 'new')

        out_lines.append(
            '{"id": "' + jan + '", "jan": "' + jan + '", "name": "' +
            name.replace('\\', '\\\\').replace('"', '\\"') +
            '", "brand": "' + brand + '", "category": "' + cat +
            '", "sub": "' + sub + '", "price": 0, "moq": ' + str(moq) +
            ', "unit": "", "tag": "' + tag + '", "glyph": "' + glyph +
            '", "hue": "' + hue + '"},'
        )

        brand_counts[brand] += 1
        cat_counts[sub] += 1

    # Header comment + body
    print('/* === P&G Japan 2026-08 === ' + str(len(out_lines)) + ' SKUs === */')
    for line in out_lines:
        print(line)
    print('/* === END P&G === */', file=sys.stderr)
    print('  total: ' + str(len(out_lines)), file=sys.stderr)
    print('  skipped: ' + str(skip_count), file=sys.stderr)
    print('  brand_fallback: ' + str(fallback_count), file=sys.stderr)
    print('  by brand:', file=sys.stderr)
    for b, n in brand_counts.most_common():
        print(f'    {b}: {n}', file=sys.stderr)
    print('  by sub:', file=sys.stderr)
    for s, n in cat_counts.most_common():
        print(f'    {s}: {n}', file=sys.stderr)


if __name__ == '__main__':
    main()