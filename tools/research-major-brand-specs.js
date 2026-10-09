// Exact-barcode lookup against a Japanese retailer's own product records.
// No ingredients, medical efficacy, prices or inferred country of origin.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
global.window={};
require('../assets/js/data.js');
const root=path.resolve(__dirname,'..');
const cache=path.join(process.env.TEMP,'japanitem-major-specs');
fs.mkdirSync(cache,{recursive:true});
const output=path.join(root,'assets/data/verified-major-brand-specs.json');
const results=fs.existsSync(output)?JSON.parse(fs.readFileSync(output,'utf8')):{};
const clean=s=>s.replace(/<br\s*\/?\s*>/gi,'; ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const targets=[...new Map(window.PRODUCTS.map(p=>[p.id,p])).values()].filter(p=>!p.verified_specs&&!['Wakodo','Akai Bohshi','Moegino','RUYSDAEL'].includes(p.brand));
const failures=[];
async function read(url){
 const file=path.join(cache,crypto.createHash('sha256').update(url).digest('hex'));
 if(fs.existsSync(file))return fs.readFileSync(file,'utf8');
 const r=await fetch(url,{signal:AbortSignal.timeout(20000)});
 if(r.status===404){fs.writeFileSync(file,'NOT_FOUND');return 'NOT_FOUND';}
 if(!r.ok)throw Error(`HTTP ${r.status}`);
 const text=await r.text();fs.writeFileSync(file,text);return text;
}
function save(){fs.writeFileSync(output,JSON.stringify(results,null,2)+'\n');fs.writeFileSync(path.join(root,'assets/data/specification-research-gaps.json'),JSON.stringify({checked_on:'2026-10-09',total_candidates:targets.length,checkpoint_processed_count:done,rate_limited:rateLimited,unresolved:failures},null,2)+'\n');}
let next=0,done=0,rateLimited=false;
async function worker(){while(next<targets.length&&!rateLimited){
 const p=targets[next++];
 if(results[p.jan])continue;
 try{
  if(!/^\d{13}$/.test(p.jan))throw Error('Not a 13-digit retail JAN; requires manual identification');
  const url=`https://sundrug-online.com/products/${p.jan}`;
  const raw=await read(url+'.json');
  if(raw==='NOT_FOUND')throw Error('No exact JAN listing');
  const j=JSON.parse(raw).product;
  if(!j||!j.variants.some(v=>v.barcode===p.jan))throw Error('Listing barcode does not match');
  const html=await read(url);
  const fields={};
  for(const m of html.matchAll(/<span class="card__title heading h3">([\s\S]*?)<\/span>[\s\S]*?<div class="rte text--pull">([\s\S]*?)<\/div>/g))fields[clean(m[1])]=clean(m[2]);
  const specs=[];
  if(fields['内容量']&&fields['内容量'].length<180) specs.push({name:'Net content / pack size',value:fields['内容量']});
  if(fields['原産国']&&fields['原産国'].length<100) specs.push({name:'Country of origin (retailer listing)',value:fields['原産国']});
  if(!specs.length)throw Error('No usable size or origin field');
  if(j.vendor)specs.push({name:'Manufacturer / supplier (retailer listing)',value:j.vendor});
  specs.push({name:'Exact-JAN source listing name',value:j.title});
  const unit=fields['内容量']&&fields['内容量'].length<80?fields['内容量']:p.unit;
  results[p.jan]={official_name:j.title,specs,unit,source_url:url,source_name:'Sundrug official online store',source_type:'retailer',checked_on:'2026-10-09',match_note:'Retailer product barcode matches this exact JAN. Manufacturer confirmation and supplied package label take precedence.',catalog_unit_before:p.unit||null};
 }catch(e){if(e.message==='HTTP 429'){rateLimited=true;console.error('Rate limited: stopping requests; remaining JANs need a later attempt.');}failures.push({jan:p.jan,brand:p.brand,name:p.name,reason:e.message});}
 done++;
 if(done%100===0){save();console.log('Checked',done,'Matched',Object.keys(results).length);}
 await new Promise(r=>setTimeout(r,200));
}}
(async()=>{await Promise.all([worker(),worker(),worker()]);save();console.log('Completed',done,'Matched',Object.keys(results).length,'Unresolved',failures.length);})().catch(e=>{save();console.error(e);process.exitCode=1;});
