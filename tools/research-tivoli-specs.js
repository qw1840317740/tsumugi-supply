const fs = require('fs');
const path = require('path');
const cache = path.join(process.env.TEMP, 'japanitem-tivoli');
fs.mkdirSync(cache, {recursive:true});
const clean = s => s.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&emsp;/g,' ').replace(/\s+/g,' ').trim();
(async()=>{
 const index = await (await fetch('https://www.tivoli-factory.co.jp/c/brands/akaibohshi')).text();
 const urls = [...new Set([...index.matchAll(/href=["']([^"']*\/a-[^"']*)/g)].map(m=>new URL(m[1],'https://www.tivoli-factory.co.jp').href))];
 const out=[];
 for(const url of urls){
   const html=await (await fetch(url)).text();
   const fields={};
   for(const m of html.matchAll(/<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/g)) fields[clean(m[1])]=clean(m[2]);
   const title=clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]||'');
   out.push({url,title,fields});
   console.log(JSON.stringify({url,title,content:fields['内容量'],size:fields['サイズ']}));
 }
 fs.writeFileSync(path.join(cache,'research.json'),JSON.stringify(out,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
