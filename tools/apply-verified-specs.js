// Materialize reviewed evidence into the shared browser/static product catalog.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname,'..');
const dataFile = path.join(root,'assets/js/data.js');
const evidence = JSON.parse(fs.readFileSync(path.join(root,'assets/data/verified-product-specs.json'),'utf8'));
const extraFile = path.join(root,'assets/data/verified-sweets-specs.json');
if(fs.existsSync(extraFile)) Object.assign(evidence.products,JSON.parse(fs.readFileSync(extraFile,'utf8')));
const updates={};
global.window={};
require(dataFile);
for(const p of window.PRODUCTS){
 const record=evidence.products[p.jan];
 if(!record) continue;
 const unit=record.unit || record.specs.find(s=>s.name==='Net content')?.value || p.unit;
 const facts=record.specs.map(s=>`${s.name}: ${s.value}`).join('; ');
 updates[p.jan]={unit, verified_specs:record.specs, spec_source:record.source_url, spec_checked_on:record.checked_on,
  spec_match_note:record.match_note || 'Exact JAN manufacturer product page',
  seo_lead:`${p.name} — ${facts}. JAN / GTIN ${p.jan}. Manufacturer specifications were checked on ${record.checked_on}. Packaging and labeling must be confirmed for the supplied lot.`,
  seo_description:`${p.name}, JAN ${p.jan}. ${facts}. Wholesale quotation from JAPANITEM.`};
}
const start='/* === verified specification enrichment: start === */';
const end='/* === verified specification enrichment: end === */';
let data=fs.readFileSync(dataFile,'utf8');
const block=`${start}\nconst VERIFIED_PRODUCT_SPECS = ${JSON.stringify(updates)};\nfor (const product of PRODUCTS) {\n  const facts = VERIFIED_PRODUCT_SPECS[product.jan];\n  if (facts) Object.assign(product, facts);\n}\n${end}\n\n`;
if(data.includes(start)) data=data.slice(0,data.indexOf(start))+data.slice(data.indexOf(end)+end.length).replace(/^\s*/,'');
data=data.replace('window.CATEGORIES = CATEGORIES;',block+'window.CATEGORIES = CATEGORIES;');
fs.writeFileSync(dataFile,data);
console.log('Enriched',Object.keys(updates).length,'products');
