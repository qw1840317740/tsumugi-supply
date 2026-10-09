// Low-request bulk catalog retrieval using the store's public product feed.
// Only matching store SKU and JAN-shaped product URL are eligible. Size is title-derived,
// never presented as manufacturer-confirmed net content or dosing guidance.
const fs=require('fs'),path=require('path');
global.window={};require('../assets/js/data.js');
const root=path.resolve(__dirname,'..'),cache=path.join(process.env.TEMP,'japanitem-retailer-feed');
fs.mkdirSync(cache,{recursive:true});
const outFile=path.join(root,'assets/data/verified-retailer-title-specs.json');
const out=fs.existsSync(outFile)?JSON.parse(fs.readFileSync(outFile,'utf8')):{};
const exact=require('../assets/data/verified-major-brand-specs.json');
const catalog=new Map(window.PRODUCTS.filter(p=>!p.verified_specs&&!exact[p.jan]).map(p=>[p.jan,p]));
let checked=0;
function save(){fs.writeFileSync(outFile,JSON.stringify(out,null,2)+'\n');}
(async()=>{for(let page=1;page<=200;page++){
 const file=path.join(cache,`page-${page}.json`);
 let j;
 const cached=fs.existsSync(file);
 if(cached)j=JSON.parse(fs.readFileSync(file,'utf8'));
 else{
  const r=await fetch(`https://sundrug-online.com/products.json?limit=250&page=${page}`,{signal:AbortSignal.timeout(25000)});
  if(!r.ok){console.log('Stopped at page',page,'HTTP',r.status);break;}
  j=await r.json();fs.writeFileSync(file,JSON.stringify(j));
 }
 if(!j.products?.length)break;
 for(const product of j.products){
  checked++;
  for(const variant of product.variants||[]){
   const jan=variant.sku,p=catalog.get(jan);
   if(!p||out[jan])continue;
   if(product.handle!==jan)continue; // Do not conflate multi-variant landing pages.
   const title=product.title.normalize('NFKC');
   const units=[...title.matchAll(/\d+(?:\.\d+)?\s*(?:kg|ml|g|L|枚|粒|本|包|錠|個|組)(?![a-zA-Z])(?:\s*[x×]\s*\d+\s*(?:本|個|袋|包|セット|組)?)?/gi)].map(m=>m[0]);
   if(!units.length)continue;
   const size=[...new Set(units)].join(' / ');
   const specs=[{name:'Pack size stated in retailer title (not manufacturer-confirmed)',value:size}];
   if(product.vendor)specs.push({name:'Manufacturer / supplier (retailer listing)',value:product.vendor});
   specs.push({name:'Exact-JAN source listing name',value:product.title});
   out[jan]={specs,unit:size,source_url:`https://sundrug-online.com/products/${jan}`,source_name:'Sundrug official online store — title-derived pack size',source_type:'retailer-title',checked_on:'2026-10-09',match_note:'Store SKU and JAN-shaped product URL both match this catalog identifier. Pack size was extracted from the listing title, not a manufacturer specification table. Check the linked title and supplied package, particularly for bundles.',catalog_unit_before:p.unit||null};
  }
 }
 if(page%10===0){save();console.log('Catalog pages',page,'Records checked',checked,'New exact-JAN size matches',Object.keys(out).length);}
 if(!cached)await new Promise(r=>setTimeout(r,1000));
}save();console.log('Feed complete: checked',checked,'Matched',Object.keys(out).length);})().catch(e=>{save();console.error(e);process.exitCode=1;});
