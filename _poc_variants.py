"""
PoC: cluster Clinica 68 SKUs into parents with variants.
Print proposed structure for user review.
"""
import json, re, unicodedata

def nfkc(s): return unicodedata.normalize('NFKC', s).strip()

CS = json.load(open(r'C:\Users\download\Desktop\list\nichinichi_parsed.json', encoding='utf-8'))  # placeholder, real data below

# Real Clinica data
import subprocess
out = subprocess.check_output(['node','-e','''
  global.window={};
  require('./assets/js/data.js');
  const cs = window.PRODUCTS.filter(p => p.brand === 'Clinica');
  console.log(JSON.stringify(cs));
'''], cwd=r'C:\jp-wholesale-demo', text=True, encoding='utf-8')
cs = json.loads(out)

# Define family extraction
def extract_family_clinica(p):
    n = nfkc(p['name'])
    # Type: ハミガキ / ハブラシ / リンス / フロス / etc
    if 'デンタルリンス' in n or 'クイックウォッシュ' in n or 'クイックウォツシュ' in n:
        type_ = 'rinse'
    elif 'フロス' in n or 'トラベル' in n:
        type_ = 'accessory'
    elif 'ハブラシ' in n:
        type_ = 'brush'
    else:
        type_ = 'paste'
    # Series
    series = None
    if 'クリニカＡＤ' in n: series = 'AD'
    elif 'クリニカＰＲＯ' in n:
        if 'オールインワン' in n: series = 'PRO_allinone'
        elif 'Ｗ' in n: series = 'PRO_white'
        elif 'プラス' in n or 'plus' in n: series = 'PRO_plus'
        elif 'ハブラシ' in n: series = 'PRO'
        else: series = 'PRO'
    elif 'エナメルパール' in n: series = 'enamel_pearl'
    elif 'Kid' in n or 'Ｋｉｄ' in n: series = 'kids'
    elif 'Jr' in n or 'Ｊｒ' in n: series = 'jr'
    elif 'ＭＩＧＡＣＯＴ' in n: series = 'migacot_set'
    elif 'フッ素メディカル' in n: series = 'fluor_medcoat'
    elif 'トラベル' in n: series = 'travel'
    elif 'クイックウォッシュ' in n or 'クイックウォツシュ' in n: series = 'quickwash'
    else: series = 'standard'

    # Variant attrs
    flavor = None; capacity = None; bristle = None; rows = None; hardness = None; head = None; form = None
    unit = p.get('unit','') or ''
    m = re.search(r'(\d+)\s*[gGｇ]', unit)
    if m: capacity = m.group(1) + 'g'
    m = re.search(r'(\d+)\s*ml', unit, re.I)
    if m: capacity = m.group(1) + 'ml'
    m = re.search(r'(\d+)\s*本', unit)
    if m: capacity = m.group(1) + '本'
    m = re.search(r'(\d+)\s*m[^lL]', unit)
    if m: capacity = m.group(1) + 'm'
    if not capacity: capacity = unit or 'NA'

    # Flavor
    for f in ['クール','シトラス','ソフト','クリアミント','シトラスミント','フレッシュクリーンミント',
              'リッチシトラスミント','リフレッシュミント','クールミント','フレッシュミント',
              'ホワイトフローラルミント','フレッシュシトラスミント','低刺激タイプ','すっきりタイプ',
              'やさしいミント','ミント','いちご','グレープ','マイルド','フレッシュ','ペアー',
              'プレミアムミント','クリアシトラス','ペアーシトラスミント','ハーブミント','無香料']:
        if f in n: flavor = f; break

    # Brush attrs
    if type_ == 'brush':
        for b in ['フラットカット','3Dカット','アラームハンドル','ラバーヘッド']:
            if b in n: bristle = b; break
        m = re.search(r'([三四五六]列)', n)
        if m: rows = m.group(1)
        if '超コンパクト' in n: head = '超コンパクト'
        elif 'コンパクト' in n: head = 'コンパクト'
        elif 'レギュラー' in n: head = 'レギュラー'
        for h in ['ふつう','やわらかめ','かため']:
            if h in n: hardness = h; break

    if 'ジェル' in n: form = 'ジェル'
    if 'タテ' in n: form = (form or '') + 'タテ' if form else 'タテ'

    parent_key = f"clinica_{series or 'std'}_{type_}"
    return {
        'parent_key': parent_key,
        'type': type_, 'series': series, 'flavor': flavor,
        'capacity': capacity, 'bristle': bristle, 'rows': rows, 'head': head,
        'hardness': hardness, 'form': form
    }

# Cluster
clusters = {}
for p in cs:
    info = extract_family_clinica(p)
    info['name'] = p['name']; info['jan'] = p.get('jan',''); info['moq'] = p.get('moq','')
    clusters.setdefault(info['parent_key'], []).append(info)

# Output
print(f'Total SKUs: {len(cs)}')
print(f'Total parents: {len(clusters)}\n')
for key, items in sorted(clusters.items()):
    print(f'=== {key} ({len(items)}) ===')
    for it in items[:3]:
        attrs = {k:v for k,v in it.items() if k not in ('name','parent_key','jan','moq') and v}
        print(f'  {it["name"][:35]:36s} -> {attrs}')
    if len(items) > 3:
        print(f'  ... +{len(items)-3} more')
    print()