/* One-shot sitemap generator for the tsumugi-supply storefront.
   Run from the repo root:  node tools/gen-sitemap.js
   Writes sitemap.xml at repo root. Not deployed.
*/
const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const BASE  = 'https://www.kaiseisg.com';
const STAMP = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

// Load data.js in a sandbox so its `window` exports are reachable.
const ctx = { window: {}, console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.resolve('assets/js/data.js'), 'utf8'), ctx);
const { PRODUCTS = [], BRANDS = [], CATEGORIES = [] } = ctx.window;

const urls = [];
const push = (loc, prio, freq = 'monthly') => {
  if (!loc) return;
  // Escape only XML-required chars (sitemap locators don't usually need much)
  urls.push(
    `  <url><loc>${loc}</loc><lastmod>${STAMP}</lastmod><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`
  );
};

// --- static pages ---
push(`${BASE}/`,                  1.0,  'weekly');
push(`${BASE}/products.html`,     0.9,  'weekly');
push(`${BASE}/brands.html`,       0.85, 'monthly');
push(`${BASE}/how-to-order.html`, 0.6,  'monthly');
push(`${BASE}/faq.html`,          0.6,  'monthly');

// --- top categories (8) ---
for (const c of CATEGORIES) {
  if (!c || !c.id) continue;
  push(`${BASE}/products.html?cat=${c.id}`, 0.85, 'weekly');
  // --- subcategories (only those with count > 0) ---
  for (const s of (c.subs || [])) {
    if ((s.count || 0) > 0) push(`${BASE}/products.html?cat=${c.id}&sub=${s.id}`, 0.8, 'weekly');
  }
}

// --- brand filters (only brands with >=3 SKUs in catalog) ---
const brandCounts = new Map();
for (const p of PRODUCTS) brandCounts.set(p.brand, (brandCounts.get(p.brand) || 0) + 1);
const seenBrands = new Set();
for (const b of BRANDS) {
  if (!b || !b.name) continue;
  if (seenBrands.has(b.name)) continue;
  seenBrands.add(b.name);
  const n = brandCounts.get(b.name) || 0;
  if (n >= 3) {
    const enc = encodeURIComponent(b.name);
    push(`${BASE}/products.html?brand=${enc}`, 0.8, 'weekly');
  }
}

// --- all PDPs (1041 SKUs) ---
for (const p of PRODUCTS) {
  if (!p || !p.id) continue;
  push(`${BASE}/product.html?id=${encodeURIComponent(p.id)}`, 0.8, 'weekly');
}

const out = `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
            `${urls.join('\n')}\n` +
            `</urlset>\n`;

fs.writeFileSync(path.resolve('sitemap.xml'), out, 'utf8');
console.log(`OK: wrote ${urls.length} URLs to sitemap.xml`);
