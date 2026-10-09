// Manufacturer range-level facts. A JAN in the page's shopping links identifies
// membership, not the SKU's size/scent: retain that distinction in every field.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
global.window={};require('../assets/js/data.js');
const root=path.resolve(__dirname,'..'),cache=path.join(process.env.TEMP,'japanitem-lion-ranges');
fs.mkdirSync(cache,{recursive:true});
const products=new Map(window.PRODUCTS.map(p=>[p.jan,p]));
const out={},errors=[];
const clean=s=>s.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
async function read(url){const file=path.join(cache,crypto.createHash('sha256').update(url).digest('hex'));if(fs.existsSync(file))return fs.readFileSync(file,'utf8');const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(`HTTP ${r.status}`);const s=await r.text();fs.writeFileSync(file,s);return s;}
const urls=(html,pattern)=>[...new Set([...html.matchAll(pattern)].map(m=>new URL(m[1],'https://www.lion.co.jp').href))];
(async()=>{
 const index=await read('https://www.lion.co.jp/ja/products/');
 const brands=urls(index,/href=["']([^"']*\/ja\/products\/brand\/series\/\d+)/g);
 const pages=new Set();
 for(const url of brands){try{for(const p of urls(await read(url),/href=["']([^"']*\/ja\/products\/\d+)/g))pages.add(p);}catch(e){errors.push({url,error:e.message});}await new Promise(r=>setTimeout(r,200));}
 console.log('Manufacturer ranges',pages.size);
 let n=0;
 for(const url of pages){try{
  const html=await read(url);
  const jans=[...new Set(html.match(/490330\d{7}/g)||[])].filter(jan=>products.has(jan));
  if(!jans.length)continue;
  const header=html.split('<!--.product-head-->')[0];
  const fields={};for(const m of header.matchAll(/<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/g))fields[clean(m[1])]=clean(m[2]);
  const specs=[];
  if(fields['内容量'])specs.push({name:'Manufacturer range pack-size options (not SKU confirmation)',value:fields['内容量']});
  if(fields['香り'])specs.push({name:'Manufacturer range fragrance options (not SKU confirmation)',value:fields['香り']});
  if(fields['香味'])specs.push({name:'Manufacturer range flavor options (not SKU confirmation)',value:fields['香味']});
  if(!specs.length)continue;
  for(const jan of jans)out[jan]={specs,source_url:url,source_name:'Lion manufacturer product-family information',source_type:'manufacturer-range',checked_on:'2026-10-09',match_note:'This JAN is linked on the manufacturer family page. Listed size/flavor options describe the range, not a confirmed specification for this individual SKU.'};
 }catch(e){errors.push({url,error:e.message});if(e.message==='HTTP 429')break;}n++;if(n%30===0)console.log('Ranges checked',n,'Matching catalog JANs',Object.keys(out).length);await new Promise(r=>setTimeout(r,250));}
 fs.writeFileSync(path.join(root,'assets/data/verified-lion-range-specs.json'),JSON.stringify(out,null,2)+'\n');
 console.log('Manufacturer family matches',Object.keys(out).length,'Errors',errors.length);
})().catch(e=>{console.error(e);process.exitCode=1;});
