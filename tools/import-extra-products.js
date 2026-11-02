// Add products from assets/data/extra-products.json to the catalog (assets/js/data.js).
//   node tools/import-extra-products.js
// - Products and brands go into their own marked blocks, so re-running replaces them cleanly.
// - name_en / name_zh are merged into product-names-en.json / product-names-zh.json, which
//   tools/apply-english-names.js applies during `npm run build:seo`. `name` stays Japanese (name_ja).
// - JANs already in the catalog outside this block are skipped, never duplicated.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dataFile = path.join(root, 'assets/js/data.js');
const extra = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/extra-products.json'), 'utf8'));
const P_START = '  /* === extra product imports: start === */';
const P_END = '  /* === extra product imports: end === */';
const B_START = '  /* === extra brand imports: start === */';
const B_END = '  /* === extra brand imports: end === */';

let data = fs.readFileSync(dataFile, 'utf8');
const strip = (text, start, end) => text.includes(start)
  ? text.slice(0, text.indexOf(start)) + text.slice(text.indexOf(end) + end.length).replace(/^\n/, '')
  : text;
data = strip(strip(data, P_START, P_END), B_START, B_END);

// JANs and brand names that exist outside the import blocks.
global.window = {};
const sandbox = data.slice(0, data.indexOf('/* === english product names: start === */')) + '\nwindow.PRODUCTS = PRODUCTS; window.BRANDS = BRANDS;';
new Function('window', sandbox)(global.window);
const existingJans = new Set(window.PRODUCTS.map(p => String(p.jan || p.id)));
const existingBrands = new Set(window.BRANDS.map(b => b.name));

const products = extra.products.filter(p => !existingJans.has(String(p.jan)));
const brands = extra.brands.filter(b => !existingBrands.has(b.name));
const row = p => '  ' + JSON.stringify({
  id: p.id, jan: p.jan, name: p.name, brand: p.brand, category: p.category, sub: p.sub,
  price: p.price, moq: p.moq ?? undefined, unit: p.unit, tag: p.tag, glyph: p.glyph, hue: p.hue,
}) + ',';

// Insert before the closing "];" of each array.
const insertBefore = (text, arrayDecl, block) => {
  const start = text.indexOf(arrayDecl);
  const close = text.indexOf('\n];', start);
  // The array's last entry may have no trailing comma; add one so the block can follow it.
  const before = text.slice(0, close).replace(/\}\s*$/, m => m.replace('}', '},'));
  return before + '\n' + block + text.slice(close);
};
data = insertBefore(data, 'const PRODUCTS = [', [P_START, ...products.map(row), P_END].join('\n'));
data = insertBefore(data, 'const BRANDS = [', [B_START, ...brands.map(b => '  ' + JSON.stringify(b) + ','), B_END].join('\n'));
fs.writeFileSync(dataFile, data);

for (const [file, key] of [['product-names-en.json', 'name_en'], ['product-names-zh.json', 'name_zh']]) {
  const target = path.join(root, 'assets/data', file);
  const names = JSON.parse(fs.readFileSync(target, 'utf8'));
  for (const p of products) names[p.jan] = p[key];
  fs.writeFileSync(target, JSON.stringify(names, null, 2) + '\n');
}
console.log(`Imported ${products.length} products (${extra.products.length - products.length} already in catalog) and ${brands.length} brands`);
