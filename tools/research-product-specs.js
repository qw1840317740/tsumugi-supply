// Fetch only manufacturer pages linked by their official catalog indexes.
// Preserve evidence and leave absent fields unknown; never infer by similar JAN.
const fs = require('fs');
const path = require('path');
global.window = {};
require('../assets/js/data.js');
const root = path.resolve(__dirname, '..');
const cache = path.join(process.env.TEMP || '/tmp', 'japanitem-official-specs');
fs.mkdirSync(cache, { recursive: true });
const clean = s => s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
async function read(url) {
  const file = path.join(cache, require('crypto').createHash('sha256').update(url).digest('hex') + '.html');
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  const response = await fetch(url, {signal: AbortSignal.timeout(25000)});
  if (!response.ok) throw Error(`${response.status} ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const header = bytes.subarray(0, 1500).toString();
  const html = new TextDecoder(/shift[_-]?jis|sjis/i.test(header) ? 'shift-jis' : 'utf-8').decode(bytes);
  fs.writeFileSync(file, html);
  return html;
}
async function main() {
  const products = window.PRODUCTS.filter(p => p.brand === 'Wakodo');
  const links = new Map();
  const indexes = ['baby/food/wakodo/', 'baby/', 'baby/drink/', 'baby/snack/', 'baby/medicines/', 'baby/care/', 'food/', 'skincare/', 'sanitation/'];
  for (const index of indexes) {
    try {
      const url = `https://www.asahi-gf.co.jp/products/${index}`;
      const html = await read(url);
      for (const m of html.matchAll(/href=["']([^"']*\/(\d{13})\.html)["']/g)) links.set(m[2], new URL(m[1], url).href);
      // Additional brand-category indexes discovered in manufacturer navigation.
      if (index !== 'baby/food/wakodo/') for (const m of html.matchAll(/href=["']([^"']*\/products\/(?:baby|food)\/[^"'#]+\/)(?:#[^"']*)?["']/g)) {
        const child = new URL(m[1], url).href;
        if (/\/products\/(?:baby\/(?:drink|snack|medicines|care)|food\/[^/]+)\//.test(child)) {
          const sub = await read(child);
          for (const n of sub.matchAll(/href=["']([^"']*\/(\d{13})\.html)["']/g)) links.set(n[2], new URL(n[1], child).href);
        }
      }
    } catch (e) { console.error(e.message); }
  }
  const result = { checked_on: '2026-10-09', products: {}, unresolved: [] };
  for (const p of products) {
    const url = links.get(p.jan);
    if (!url) { result.unresolved.push({jan:p.jan,name:p.name,reason:'No exact JAN linked in manufacturer indexes'}); continue; }
    try {
      const html = await read(url);
      const info = html.match(/<section id="product_info">([\s\S]*?)<\/section>/)?.[1] || '';
      const fields = {};
      for (const m of info.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/g)) fields[clean(m[1])] = clean(m[2]);
      const specs = [];
      if (fields['内容量']) specs.push({name:'Net content', value:fields['内容量']});
      if (fields['対象年齢（目安）']) specs.push({name:'Age guidance (manufacturer)',value:fields['対象年齢（目安）']});
      if (!specs.length) { result.unresolved.push({jan:p.jan,name:p.name,reason:'Official page has no supported specification fields',url}); continue; }
      result.products[p.jan] = { official_name: clean(html.match(/<div class="hgroup line">[\s\S]*?<h2>([\s\S]*?)<\/h2>/)?.[1] || p.name), specs, source_url:url, checked_on:result.checked_on };
      console.log(p.jan, JSON.stringify(specs));
    } catch(e) { result.unresolved.push({jan:p.jan,name:p.name,reason:e.message}); }
  }
  fs.mkdirSync(path.join(root, 'assets/data'), {recursive:true});
  fs.writeFileSync(path.join(root,'assets/data/verified-product-specs.json'), JSON.stringify(result,null,2)+'\n');
  console.log('Verified',Object.keys(result.products).length,'Unresolved',result.unresolved.length);
}
main().catch(e=>{ console.error(e); process.exitCode=1; });
