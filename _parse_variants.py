"""
Variant parser for LION/KOSE/日常用品 catalog.
Identifies parent product groups by (brand, series, category, type),
extracts variant attributes (capacity, flavor, bristle-type, hardness).

For each cluster, generates:
  parent = { id, name_en/ja/zh, brand, category, sub, type, series, ... }
  variants = [{ id, jan, unit, moq, price, flavor, capacity, bristle, hardness, image, parent_id }]
"""
import json, re, unicodedata

def nfkc(s): return unicodedata.normalize('NFKC', s).strip()

# ============================================================
# Clinica-specific parser (the most varied)
# ============================================================
def parse_clinica(name):
    n = nfkc(name)
    # Pattern: クリニカ[AD|PRO オールインワン|PRO ホワイトニング|PRO plus 歯周バリア|...] [flavor] [size]
    # Or: クリニカハミガキ [flavor] [タテ] [size]
    # Or: クリニカハブラシ [type] [rows] [hardness]
    # Or: クリニカKid's [ジェル|]ハミガキ [flavor]
    series = None
    type_ = None  # 歯磨き粉 / 歯ブラシ
    flavor = None
    capacity = None
    bristle_type = None
    rows = None
    hardness = None
    form = None  # ジェル etc.

    if 'ハブラシ' in n:
        type_ = '歯ブラシ'
        series = 'ハブラシ'
        # bristle: フラットカット / 3Dカット / 超コンパクト etc
        m = re.search(r'(フラットカット|3Dカット|超コンパクト)', n)
        if m: bristle_type = m.group(1)
        # rows: 3列 / 4列
        m = re.search(r'([三四五六七八九]列)', n)
        if m: rows = m.group(1)
        # hardness: ふつう / やわらかめ / かため
        m = re.search(r'(ふつう|やわらかめ|かため|ハード)', n)
        if m: hardness = m.group(1)
    elif 'Kid' in n or 'kid' in n:
        type_ = 'ハミガキ'
        series = 'Kid' + ("'s" if "'" in n else "'s")
        if 'ジェル' in n: form = 'ジェル'
        m = re.search(r'(いちご|グレープ|メロン|ストロベリー|アップル|オレンジ|バナナ|ピーチ|レモン)', n)
        if m: flavor = m.group(1)
    elif 'Jr' in n:
        type_ = 'ハミガキ'
        series = 'Jr.'
        m = re.search(r'(やさしいミント|ピーチ|ストロベリー|ミント)', n)
        if m: flavor = m.group(1)
    elif 'AD' in n.upper() or 'ＡＤ' in n:
        type_ = 'ハミガキ'
        if 'ジェル' in n: form = 'ジェル'
        series = 'AD'
        # Flavor
        flavors = ['クール', 'シトラス', 'ソフト', 'クリアミント', 'シトラスミント', 'フレッシュミント']
        for f in flavors:
            if f in n: flavor = f; break
    elif 'PRO' in n.upper() or 'ＰＲＯ' in n:
        type_ = 'ハミガキ'
        series = 'PRO'
        if 'オールインワン' in n: series = 'PRO オールインワン'
        elif 'Ｗ' in n or 'W ' in n or 'ｗ' in n or 'ＷＨＩＴＥ' in n.upper() or 'ホワ' in n or 'ＷＨＩＴＥＮＩＮＧ' in n.upper():
            series = 'PRO Ｗ'
        if 'ジェル' in n: form = 'ジェル'
        flavors = ['フレッシュクリーンミント','リッチシトラスミント','リフレッシュミント','クールミント','フレッシュミント','シトラスミント','ペアーシトラスミント','クリアミント','プレミアムミント','ピーチ','グレープ','クリアシトラス']
        for f in flavors:
            if f in n: flavor = f; break
    elif 'エナメルパール' in n:
        type_ = 'ハミガキ'
        series = 'エナメルパール'
        flavors = ['ホワイトフローラルミント','フレッシュシトラスミント','シトラスミント','クールミント']
        for f in flavors:
            if f in n: flavor = f; break
    else:
        type_ = 'ハミガキ'
        series = 'standard'
        flavors = ['マイルド','フレッシュ','ミント','クールミント','ハーブミント','シトラスミント','ペアー','クリアミント']
        for f in flavors:
            if f in n: flavor = f; break
        if 'タテ' in n: form = 'タテ'

    # Capacity: parse from unit field
    m = re.search(r'(\d+)\s*ｇ', n)
    if m: capacity = m.group(1) + 'g'

    return {
        'series': series, 'type': type_, 'flavor': flavor,
        'capacity': capacity, 'bristle_type': bristle_type,
        'rows': rows, 'hardness': hardness, 'form': form
    }

# Test
if __name__ == '__main__':
    ps = json.load(open('C:/Users/download/Desktop/list/nichinichi_parsed.json', encoding='utf-8'))  # just placeholder
    cs = [
        'クリニカＡＤ　クール　３０ｇ',
        'クリニカＡＤ　シトラス　１３０ｇ',
        'クリニカＡＤ　ジェルハミガキ　９０ｇ',
        'クリニカＰＲＯオールインワンハミガキ　フレッシュクリーンミント　９５ｇ',
        'クリニカＰＲＯＷＨＩＴＥＮＩＮＧハミガキ　リフレッシュミント　９５ｇ',
        'クリニカハミガキ　マイルド　３０ｇ',
        'クリニカハミガキ　マイルド　タテ　１３０ｇ',
        'クリニカエナメルパール　ホワイトフローラルミント　１３０ｇ',
        'クリニカＫｉｄ’ｓジエルハミガキ　グレープ',
        'クリニカハブラシ　フラットカット　３列ふつう',
        'クリニカＡＤ　３列超コンパクト　やわらかめ',
    ]
    for n in cs:
        print(n, '=>', parse_clinica(n))