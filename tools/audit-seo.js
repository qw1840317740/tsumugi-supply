const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const productDir = path.join(root, 'products');
const categoryDir = path.join(root, 'categories');
const brandDir = path.join(root, 'brands');
const failures = [];
const warn = (condition, message) => { if (!condition) failures.push(message); };
const read = file => fs.readFileSync(file, 'utf8');
const match = (html, regex) => (html.match(regex) || [])[1] || '';
const decodeHtml = value => String(value).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

global.window = {};
require(path.join(root, 'assets/js/data.js'));
const productCount = new Set(window.PRODUCTS.map(p => p.id)).size;
const activeBrandCount = new Set(window.PRODUCTS.map(p => p.brand)).size;
const activeCategoryCount = new Set(window.PRODUCTS.map(p => p.category)).size;

const productFiles = fs.readdirSync(productDir).filter(name => name.endsWith('.html'));
const categoryFiles = fs.readdirSync(categoryDir).filter(name => name.endsWith('.html'));
const brandFiles = fs.readdirSync(brandDir).filter(name => name.endsWith('.html'));
warn(productFiles.length === productCount, `Expected ${productCount} product pages, found ${productFiles.length}`);
warn(categoryFiles.length === activeCategoryCount, `Expected ${activeCategoryCount} category pages, found ${categoryFiles.length}`);
warn(brandFiles.length === activeBrandCount, `Expected ${activeBrandCount} brand pages, found ${brandFiles.length}`);

const titles = new Set();
const descriptions = new Set();
const canonicals = new Set();
for (const name of productFiles) {
  const html = read(path.join(productDir, name));
  const title = decodeHtml(match(html, /<title>([\s\S]*?)<\/title>/i));
  const description = decodeHtml(match(html, /<meta name="description" content="([^"]*)"/i));
  const canonical = match(html, /<link rel="canonical" href="([^"]*)"/i);
  warn(Boolean(title), `${name}: missing title`);
  warn(title.length <= 65, `${name}: title is ${title.length} characters`);
  warn(Boolean(description), `${name}: missing description`);
  warn(description.length <= 155, `${name}: description is ${description.length} characters`);
  warn(Boolean(canonical), `${name}: missing canonical`);
  warn((html.match(/<h1(?:\s|>)/gi) || []).length === 1, `${name}: expected exactly one H1`);
  warn((html.match(/href="products\/[^"]+\.html"/gi) || []).length >= 4, `${name}: fewer than four crawlable related-product links`);
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  warn(scripts.length >= 2, `${name}: missing structured data blocks`);
  let hasGtin = false;
  for (const script of scripts) {
    try {
      const data = JSON.parse(script[1]);
      if (data['@type'] === 'Product') hasGtin = ['gtin8', 'gtin12', 'gtin13', 'gtin14'].some(key => data[key]);
    } catch (error) {
      failures.push(`${name}: invalid JSON-LD (${error.message})`);
    }
  }
  warn(hasGtin, `${name}: missing typed GTIN property`);
  titles.add(title); descriptions.add(description); canonicals.add(canonical);
}

warn(titles.size === productFiles.length, 'Product titles are not unique');
warn(descriptions.size === productFiles.length, 'Product descriptions are not unique');
warn(canonicals.size === productFiles.length, 'Product canonicals are not unique');

for (const [directory, names] of [[categoryDir, categoryFiles], [brandDir, brandFiles]]) {
  for (const name of names) {
    const html = read(path.join(directory, name));
    warn((html.match(/<h1(?:\s|>)/gi) || []).length === 1, `${path.basename(directory)}/${name}: expected exactly one H1`);
    warn(/href="products\/[^"]+\.html"/i.test(html), `${path.basename(directory)}/${name}: no crawlable product links`);
    for (const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
      try { JSON.parse(script[1]); } catch (error) { failures.push(`${path.basename(directory)}/${name}: invalid JSON-LD (${error.message})`); }
    }
  }
}

const sitemap = read(path.join(root, 'sitemap.xml'));
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(item => item[1]);
warn(new Set(locations).size === locations.length, 'Sitemap contains duplicate URLs');
warn(locations.length === 5 + productFiles.length + categoryFiles.length + brandFiles.length, `Unexpected sitemap URL count: ${locations.length}`);
for (const location of locations) {
  const pathname = new URL(location).pathname;
  if (pathname === '/') continue;
  warn(fs.existsSync(path.join(root, decodeURIComponent(pathname).replace(/^\//, ''))), `Sitemap target missing: ${pathname}`);
}

const catalog = read(path.join(root, 'products.html'));
warn((catalog.match(/href="categories\//g) || []).length === categoryFiles.length, 'Catalog category index is incomplete');
warn((catalog.match(/href="brands\//g) || []).length === brandFiles.length, 'Catalog brand index is incomplete');
const heroWebp = path.join(root, 'assets/hero/japanitem-hero-products-v2.webp');
warn(fs.existsSync(heroWebp), 'Optimized hero WebP is missing');
if (fs.existsSync(heroWebp)) warn(fs.statSync(heroWebp).size < 100 * 1024, 'Optimized hero WebP is larger than 100 KiB');

const result = {
  products: productFiles.length,
  categories: categoryFiles.length,
  brands: brandFiles.length,
  sitemapUrls: locations.length,
  uniqueTitles: titles.size,
  uniqueDescriptions: descriptions.size,
  uniqueCanonicals: canonicals.size,
  heroWebpBytes: fs.existsSync(heroWebp) ? fs.statSync(heroWebp).size : null,
  failures: failures.length,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) {
  console.error(failures.slice(0, 50).join('\n'));
  if (failures.length > 50) console.error(`...and ${failures.length - 50} more`);
  process.exitCode = 1;
}
