// Narrow public category feeds avoid broad-catalog pagination limits and keep
// request volume low. Store SKU + URL matching is not manufacturer confirmation.
const fs=require('fs'),path=require('path');
global.window={};require('../assets/js/data.js');
const root=path.resolve(__dirname,'..'),cache=path.join(process.env.TEMP,'japanitem-retailer-collections');
fs.mkdirSync(cache,{recursive:true});
const outFile=path.join(root,'assets/data/verified-retailer-title-specs.json');
const out=JSON.parse(fs.readFileSync(outFile,'utf8'));
const initial=Object.keys(out).length;
const exact=require('../assets/data/verified-major-brand-specs.json');
const catalog=new Map(window.PRODUCTS.filter(p=>(!p.verified_specs||p.spec_source_type==='manufacturer-range')&&!exact[p.jan]).map(p=>[p.jan,p]));
const collections=['dhc_03','brand-kose','kose_counseling','cosmetics','daily','healthy-supplement','baby'];
const report={checked_on:'2026-10-09',collections:[],new_matches:0};
function save(){fs.writeFileSync(outFile,JSON.stringify(out,null,2)+'\n');report.new_matches=Object.keys(out).length-initial;fs.writeFileSync(path.join(root,'assets/data/collection-spec-research.json'),JSON.stringify(report,null,2)+'\n');}
let limited=false;
(async()=>{for(const collection of collections){
 let checked=0;
 for(let page=1;page<=100;page++){
  const file=path.join(cache,`${collection}-${page}.json`);let j;const cached=fs.existsSync(file);
  if(cached)j=JSON.parse(fs.readFileSync(file,'utf8'));
  else{
   const r=await fetch(`https://sundrug-online.com/collections/${collection}/products.json?limit=250&page=${page}`,{signal:AbortSignal.timeout(25000)});
   if(!r.ok){console.log('Collection stopped',collection,page,r.status);report.collections.push({collection,checked,stop_status:r.status});if(r.status===429)limited=true;break;}
   j=await r.json();fs.writeFileSync(file,JSON.stringify(j));
  }
  if(!j.products?.length)break;
  for(const product of j.products){checked++;
   for(const variant of product.variants||[]){
    const jan=variant.sku,p=catalog.get(jan);
    if(!p||out[jan]||product.handle!==jan)continue;
    const title=product.title.normalize('NFKC');
    const units=[...title.matchAll(/\d+(?:\.\d+)?\s*(?:kg|ml|g|L|枚|粒|本|包|錠|個|組)(?![a-zA-Z])(?:\s*[x×]\s*\d+\s*(?:本|個|袋|包|セット|組)?)?/gi)].map(m=>m[0]);
    const period=p.brand==='DHC'?title.match(/\d+\s*日分/)?.[0]:null;
    if(!units.length&&!period)continue;
    const size=[...new Set(units)].join(' / ');
    const specs=[];
    if(size)specs.push({name:'Pack size stated in retailer title (not manufacturer-confirmed)',value:size});
    if(period)specs.push({name:'Labelled supply period (retailer title; not dosage advice)',value:period});
    if(product.vendor)specs.push({name:'Manufacturer / supplier (retailer listing)',value:product.vendor});
    specs.push({name:'Exact-JAN source listing name',value:product.title});
    out[jan]={specs,...(size?{unit:size}:{}),source_url:`https://sundrug-online.com/products/${jan}`,source_name:'Sundrug official online store — title-derived pack size',source_type:'retailer-title',checked_on:'2026-10-09',match_note:'Store SKU and JAN-shaped product URL both match this catalog identifier. Size and supply-period labels are title-derived, not manufacturer-confirmed specifications or dosage advice. Confirm the supplied package, particularly for bundles.',catalog_unit_before:p.unit||null};
   }
  }
  if(page%5===0){save();console.log(collection,'page',page,'New matches',Object.keys(out).length-initial);}
  if(j.products.length<250)break;
  if(!cached)await new Promise(r=>setTimeout(r,1000));
 }
 report.collections.push({collection,checked});save();console.log('Completed collection',collection,'Records',checked,'New matches',Object.keys(out).length-initial);
 if(limited)break;
 await new Promise(r=>setTimeout(r,1200));
}save();console.log('New title-derived records',Object.keys(out).length-initial);})().catch(e=>{save();console.error(e);process.exitCode=1;});
