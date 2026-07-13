#!/usr/bin/env python3
"""Generate refetch CSV (JAN, query) from _pg_aug.xlsx for refetch_images.py.

Query format: <brand_romanized> <first 2 space-separated tokens from name>
This gives Amazon a stronger search anchor than JAN alone.

Output: CSV to stdout: <JAN>,<query>
"""
from __future__ import annotations
import csv
import sys
import openpyxl

ROOT = r'C:\jp-wholesale-demo'
XLSX = ROOT + r'\_pg_aug.xlsx'

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


def main():
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb['PG8月']
    w = csv.writer(sys.stdout, lineterminator='\n')
    n = 0
    for row in ws.iter_rows(min_row=5, values_only=True):
        if not row or not row[5]:
            continue
        jan_raw = row[5]
        if isinstance(jan_raw, (int, float)):
            jan = str(int(jan_raw)).zfill(13)
        else:
            jan = str(jan_raw).strip()
        if not jan.isdigit() or len(jan) != 13:
            continue
        pg_brand = (row[2] or '').strip()
        brand = BRAND_MAP.get(pg_brand, 'P&G')
        name = (row[6] or '').strip()
        tokens = name.split()[:2]
        query = f'{brand} {" ".join(tokens)}' if tokens else brand
        w.writerow([jan, query])
        n += 1
    print(f'  total: {n} rows', file=sys.stderr)


if __name__ == '__main__':
    main()