const assert = require('assert/strict');
const fs = require('fs');
global.window = {};
require('../assets/js/data.js');
const evidence = require('../assets/data/verified-product-specs.json');
const sweets = require('../assets/data/verified-sweets-specs.json');
const records = {...evidence.products,...sweets};
for(const [jan,record] of Object.entries(records)){
 const p=window.PRODUCTS.find(p=>p.jan===jan);
 assert(p,`Missing catalog JAN ${jan}`);
 assert.deepEqual(p.verified_specs,record.specs,jan);
 assert.match(p.spec_source,/^https:\/\/www\.(asahi-gf|tivoli-factory)\.co\.jp\//);
 const html=fs.readFileSync(require('path').join(__dirname,'..','products',jan+'.html'),'utf8');
 const ld=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 for(const spec of record.specs) assert(ld.additionalProperty.some(x=>x.name===spec.name&&x.value===spec.value),`Static schema dropped ${jan}: ${spec.name}`);
 assert(html.includes(p.spec_source),`Missing visible evidence for ${jan}`);
}
assert.equal(window.PRODUCTS.find(p=>p.jan==='4987244196804').unit,'130g');
assert(window.PRODUCTS.find(p=>p.jan==='4975186230175').verified_specs.some(x=>x.value.includes('not net food weight')));
console.log(`PASS: ${Object.keys(records).length} enriched products; source links and static structured facts verified.`);
