"""
Build parent+variants from PRODUCTS using _rules.py.
"""
import json, re, unicodedata, subprocess, sys
sys.path.insert(0, r'C:\jp-wholesale-demo')
from _rules import BRAND_SLUG, SERIES_RULES

def nfkc(s): return unicodedata.normalize('NFKC', s).strip()

out = subprocess.check_output(['node','-e','''
  global.window = {};
  require('./assets/js/data.js');
  console.log(JSON.stringify(window.PRODUCTS));
'''], cwd=r'C:\jp-wholesale-demo', text=True, encoding='utf-8')
ps = json.loads(out)
print(f'Loaded {len(ps)} products')

def extract_attrs(p, slot_type, slot_form):
    n = nfkc(p['name']); u = p.get('unit','') or ''
    attrs = {'capacity': None, 'flavor': None, 'form': slot_form}
    for pat, unit in [(r'(\d+)\s*g', 'g'), (r'(\d+)\s*ml', 'ml'), (r'(\d+)\s*mL?', 'm'),
                      (r'(\d+)\s*本', '本'), (r'(\d+)\s*枚', '枚'),
                      (r'(\d+)\s*セット', 'セット'), (r'(\d+)\s*回', '回')]:
        m = re.search(pat, u)
        if m: attrs['capacity'] = m.group(1) + unit; break
    if not attrs['capacity']:
        for pat, unit in [(r'(\d+)\s*g', 'g'), (r'(\d+)\s*ml', 'ml'), (r'(\d+)\s*本', '本')]:
            m = re.search(pat, n)
            if m: attrs['capacity'] = m.group(1) + unit; break
    if not attrs['capacity']:
        if slot_type == 'brush':
            m = re.search(r'([三四五六七八九]列)', n)
            if m: attrs['capacity'] = m.group(1) + '列'
        elif slot_type == 'wipes':
            m = re.search(r'(\d+)\s*枚', n)
            if m: attrs['capacity'] = m.group(1) + '枚'
    if not attrs['capacity']: attrs['capacity'] = 'standard'

    flavor_kw = [
        'クールミント','フレッシュクリーンミント','ホワイトフローラルミント','フレッシュシトラスミント',
        'リッチシトラスミント','リフレッシュミント','プレミアムミント','ペアーシトラスミント',
        'ホワイトシトラスミント','ホワイトローズミント','シトラスミント','クリアミント','ペアー',
        'フレッシュミント','クール','シトラス','ソフト','フレッシュ','マイルド',
        'ホワイト','クリア','ハーブミント','サボン・ブラン','オー・ローズ','ウッディ・フルール',
        'スウィート','リリカル','ナチュラル','クリスタル','クリアEX','クリーン','モイスト',
        'スムース','ダメージ','スカルプ','バウンシー','ディープ','シルキー','プレミアム','ベーシック',
        'シャイン','モイストリペア','ピュアリー','ライト','クリアモイスト','ボタニカル',
        'いちご','グレープ','メロン','ストロベリー','アップル','オレンジ','バナナ','ピーチ','レモン',
        'マスカット','グレープフルーツ','オーキッド','フローラル','アクア','オーシャンブルー',
        'ベルガモット','アクアブルー','ムスク','ジャスミン','ラベンダー',
        'スペアミント','ペパーミント','スーパークール','ス－パ－クール',
        '低刺激','すっきり','やさしい','やわらか','無香料',
    ]
    flavor_kw.sort(key=len, reverse=True)
    for kw in flavor_kw:
        if kw in n: attrs['flavor'] = kw; break
    if not attrs['flavor']: attrs['flavor'] = 'standard'
    return attrs

clusters = {}
unmatched = []
for p in ps:
    rules = SERIES_RULES.get(p['brand'])
    if not rules:
        unmatched.append(p); continue
    matched = None
    for suffix, pattern, type_, form in rules:
        if re.search(pattern, p['name']):
            matched = (suffix, type_, form); break
    if not matched:
        unmatched.append(p); continue
    suffix, type_, form = matched
    brand_slug = BRAND_SLUG.get(p['brand'], p['brand'].lower().replace(' ', ''))
    parent_id = f'{brand_slug}{suffix}'
    attrs = extract_attrs(p, type_, form)
    clusters.setdefault(parent_id, {'parent_id': parent_id, 'brand': p['brand'], 'series': parent_id, 'type': type_, 'form': form, 'variants': []})
    clusters[parent_id]['variants'].append({
        'id': p['id'], 'jan': p.get('jan',''), 'name': p['name'], 'moq': p.get('moq',''), 'price': p.get('price',0),
        'tag': p.get('tag',''), 'hue': p.get('hue',''), 'category': p.get('category',''), 'sub': p.get('sub',''),
        'capacity': attrs['capacity'], 'flavor': attrs['flavor'], 'form': form
    })

for p in unmatched:
    brand_slug = BRAND_SLUG.get(p['brand'], p['brand'].lower().replace(' ', ''))
    parent_id = f'{brand_slug}_single_{p["id"][-6:]}'
    attrs = extract_attrs(p, 'other', 'standard')
    clusters[parent_id] = {
        'parent_id': parent_id, 'brand': p['brand'], 'series': parent_id, 'type': 'other', 'form': 'standard',
        'variants': [{
            'id': p['id'], 'jan': p.get('jan',''), 'name': p['name'], 'moq': p.get('moq',''), 'price': p.get('price',0),
            'tag': p.get('tag',''), 'hue': p.get('hue',''), 'category': p.get('category',''), 'sub': p.get('sub',''),
            'capacity': attrs['capacity'], 'flavor': attrs['flavor'], 'form': 'standard'
        }]
    }

print(f'\nTotal parents: {len(clusters)}')
print(f'Total variants: {sum(len(c["variants"]) for c in clusters.values())}')
print(f'Unmatched: {len(unmatched)}')
out_obj = {
    'parents': list(clusters.values()),
    'parent_by_jan': {v['jan']: pid for pid, c in clusters.items() for v in c['variants']}
}
with open(r'C:\jp-wholesale-demo\_parent_structure.json','w',encoding='utf-8') as f:
    json.dump(out_obj, f, ensure_ascii=False, indent=2)

top = sorted(clusters.values(), key=lambda c: -len(c['variants']))[:25]
print('\n=== Top 25 parents ===')
for p in top:
    print(f"  {p['parent_id']:40s} ({p['brand']:18s}) {len(p['variants']):3d} variants")
print('\n=== Clinica detail ===')
for p in clusters.values():
    if p['brand'] == 'Clinica':
        print(f"  {p['parent_id']:40s} {len(p['variants']):3d} variants - first: {p['variants'][0]['name'][:50]}")
print('\n=== Systema detail ===')
for p in clusters.values():
    if p['brand'] == 'Systema':
        print(f"  {p['parent_id']:40s} {len(p['variants']):3d} variants")