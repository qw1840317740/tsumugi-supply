// Materialize reviewed evidence into the shared browser/static product catalog.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname,'..');
const dataFile = path.join(root,'assets/js/data.js');
const records = require('./load-spec-evidence')();
const updates={};
global.window={};
require(dataFile);
for(const p of window.PRODUCTS){
 const record=records[p.jan];
 if(!record) continue;
 const unit=record.unit || record.specs.find(s=>s.name==='Net content')?.value || p.unit;
 const facts=record.specs.filter(s=>s.name!=='Exact-JAN source listing name').map(s=>`${s.name}: ${s.value}`).join('; ');
 const sourceName=record.source_name || 'Manufacturer product information';
 const origin=record.specs.find(s=>s.name==='Country of origin (retailer listing)')?.value || 'Not verified; confirm supplied package';
 const primary=record.specs.find(s=>/^(Net content|Pack size stated|Pack contents)/.test(s.name));
 const concise=primary?`Pack size: ${primary.value}. `:'';
 updates[p.jan]={unit, origin, verified_specs:record.specs, spec_source:record.source_url, spec_source_name:sourceName, spec_source_type:record.source_type||'manufacturer', spec_checked_on:record.checked_on, spec_range_source:record.range_source||null, spec_range_note:record.range_note||null,
  spec_match_note:record.match_note || 'Exact JAN manufacturer product page',
  seo_lead:`${p.name} — ${facts}. JAN / GTIN ${p.jan}. Source: ${sourceName}, checked ${record.checked_on}. Packaging and labeling must be confirmed for the supplied lot.`,
  seo_description:`JAN ${p.jan}. ${concise}${p.name} by ${p.brand}. Wholesale quotation from JAPANITEM. ${record.source_type==='retailer-title'?'Pack size is retailer title-derived.':''}`};
}
const start='/* === verified specification enrichment: start === */';
const end='/* === verified specification enrichment: end === */';
let data=fs.readFileSync(dataFile,'utf8');
const block=`${start}\nconst VERIFIED_PRODUCT_SPECS = ${JSON.stringify(updates)};\nfor (const product of PRODUCTS) {\n  const facts = VERIFIED_PRODUCT_SPECS[product.jan];\n  if (facts) Object.assign(product, facts);\n}\n${end}\n\n`;
if(data.includes(start)) data=data.slice(0,data.indexOf(start))+data.slice(data.indexOf(end)+end.length).replace(/^\s*/,'');
data=data.replace('window.CATEGORIES = CATEGORIES;',block+'window.CATEGORIES = CATEGORIES;');
fs.writeFileSync(dataFile,data);
console.log('Enriched',Object.keys(updates).length,'products');
