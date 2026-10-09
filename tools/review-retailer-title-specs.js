// Recheck derived measurements against the original listing title. In diaper
// names kilograms describe body-weight fit, never the contents of the pack.
const fs=require('fs'),path=require('path');
global.window={};require('../assets/js/data.js');
const file=path.resolve(__dirname,'../assets/data/verified-retailer-title-specs.json');
const records=JSON.parse(fs.readFileSync(file,'utf8'));
const products=new Map(window.PRODUCTS.map(p=>[p.jan,p]));
let corrections=0;
for(const [jan,r] of Object.entries(records)){
 const p=products.get(jan);
 if(p?.sub!=='diaper')continue;
 const title=r.specs.find(s=>s.name==='Exact-JAN source listing name')?.value.normalize('NFKC')||'';
 const counts=[...title.matchAll(/\d+\s*(?:枚|個|本|組)(?:\s*[x×]\s*\d+\s*(?:個|袋|パック|組)?)?/g)].map(m=>m[0]);
 const pack=r.specs.find(s=>s.name.startsWith('Pack size stated'));
 if(!pack||!counts.length)continue;
 const size=[...new Set(counts)].join(' / ');
 if(r.unit!==size){pack.value=size;r.unit=size;corrections++;}
 const fit=title.match(/(?:\d+(?:\.\d+)?\s*[~～−–-]\s*)?\d+(?:\.\d+)?\s*kg(?:以上|以下|まで)?/i)?.[0];
 if(fit&&!r.specs.some(s=>s.name==='Body-weight fit stated in retailer title'))r.specs.push({name:'Body-weight fit stated in retailer title',value:fit});
}
fs.writeFileSync(file,JSON.stringify(records,null,2)+'\n');
console.log('Diaper pack/fit corrections',corrections);
