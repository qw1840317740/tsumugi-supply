// Materialize reviewed product names into the shared browser/static product catalog.
// Sources: assets/data/product-names-en.json and product-names-zh.json ({ JAN: "name" }).
// The Japanese catalog name is kept as name_ja; name becomes the English name.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const dataFile = path.join(root, 'assets/js/data.js');
const readNames = file => JSON.parse(fs.readFileSync(path.join(root, 'assets/data', file), 'utf8'));
const names = readNames('product-names-en.json');
const namesZh = readNames('product-names-zh.json');

const start = '/* === english product names: start === */';
const end = '/* === english product names: end === */';
let data = fs.readFileSync(dataFile, 'utf8');
if (data.includes(start)) data = data.slice(0, data.indexOf(start)) + data.slice(data.indexOf(end) + end.length).replace(/^\s*/, '');
const block = `${start}
const PRODUCT_NAMES_EN = ${JSON.stringify(names)};
const PRODUCT_NAMES_ZH = ${JSON.stringify(namesZh)};
for (const product of PRODUCTS) {
  const en = PRODUCT_NAMES_EN[product.jan];
  if (!en || product.name_en) continue;
  product.name_ja = String(product.name).normalize('NFKC');
  product.name_en = en;
  product.name_zh = PRODUCT_NAMES_ZH[product.jan] || en;
  product.name = en;
}
${end}

`;
data = data.replace('window.CATEGORIES = CATEGORIES;', block + 'window.CATEGORIES = CATEGORIES;');
fs.writeFileSync(dataFile, data);
console.log(`Applied ${Object.keys(names).length} English and ${Object.keys(namesZh).length} Chinese product names`);
