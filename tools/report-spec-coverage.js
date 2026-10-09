const fs=require('fs'),path=require('path');
global.window={};require('../assets/js/data.js');
const records=require('./load-spec-evidence')();
const products=[...new Map(window.PRODUCTS.map(p=>[p.id,p])).values()];
const brands={},sources={};let facts=0;
const invalid=[];
function validJan(jan){if(!/^\d{13}$/.test(jan))return false;const sum=[...jan.slice(0,12)].reduce((n,d,i)=>n+Number(d)*(i%2?3:1),0);return (10-sum%10)%10===Number(jan[12]);}
for(const p of products){
 const r=records[p.jan];brands[p.brand]??={catalog:0,sku_specs:0,range_only:0,unresearched:0};brands[p.brand].catalog++;
 if(!validJan(p.jan))invalid.push({jan:p.jan,name:p.name,brand:p.brand,reason:'Retail JAN length or checksum requires manual confirmation; do not silently correct'});
 if(r){const t=r.source_type||'manufacturer';sources[t]=(sources[t]||0)+1;facts+=r.specs.length;brands[p.brand][t==='manufacturer-range'?'range_only':'sku_specs']++;}
 else brands[p.brand].unresearched++;
}
const report={checked_on:'2026-10-09',catalog_products:products.length,researched_products:Object.keys(records).length,source_types:sources,fact_fields:facts,limitations:['Sundrug individual requests encountered rate limiting and were stopped; this does not mean a product has no specifications.','Public retailer feed pagination ended after 25,000 records (page 101 returned HTTP 400); the entire retailer catalog was not exhausted.','Retailer-title specifications are SKU/URL matched, title-derived and not manufacturer confirmed.','Manufacturer-range information describes product families, not exact SKU sizes or scents.'],brands,invalid_identifiers:invalid};
fs.writeFileSync(path.join(__dirname,'../assets/data/specification-coverage.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({products:report.researched_products,fields:facts,sources,invalid:invalid.length}));
// Repair older interrupted research checkpoints that incorrectly labeled the
// entire candidate count as attempted. HTTP 429 is deferred, not absent data.
const gapFile=path.join(__dirname,'../assets/data/specification-research-gaps.json');
if(fs.existsSync(gapFile)){
 const gaps=JSON.parse(fs.readFileSync(gapFile,'utf8'));
 if(gaps.attempted){gaps.total_candidates=gaps.attempted;delete gaps.attempted;gaps.checkpoint_processed_count=(gaps.unresolved||[]).length+Object.keys(require('./load-spec-evidence')()).filter(jan=>records[jan].source_type==='retailer').length;}
 gaps.rate_limited=(gaps.unresolved||[]).some(x=>x.reason==='HTTP 429');
 fs.writeFileSync(gapFile,JSON.stringify(gaps,null,2)+'\n');
}
