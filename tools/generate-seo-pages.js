const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
global.window = {};
require(path.join(root, 'assets/js/data.js'));

const products = [];
const seen = new Set();
for (const product of window.PRODUCTS) {
  if (!product?.id || seen.has(product.id)) continue;
  seen.add(product.id);
  products.push(product);
}

const brands = new Map((window.BRANDS || []).map(brand => [brand.name, brand]));
const categories = {
  health: 'Health & Wellness', beauty: 'Beauty & Personal Care', daily: 'Daily & Home Care',
  food: 'Food & Beverages', sweets: 'Sweets & Snacks', babykids: 'Baby & Kids',
  hobby: 'Character Goods & Hobby', seasonaltop: 'Seasonal Products',
};

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const escapeXml = escapeHtml;
const jsonForHtml = value => JSON.stringify(value).replace(/</g, '\\u003c');

const outDir = path.resolve(root, 'products');
if (outDir !== path.join(root, 'products') || !outDir.startsWith(root + path.sep)) {
  throw new Error(`Unsafe output directory: ${outDir}`);
}
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const p of products) {
  const jan = String(p.jan || p.id);
  const brand = brands.get(p.brand) || {};
  const category = categories[p.category] || p.category || 'Japanese daily goods';
  const canonical = `https://www.japanitem.com/products/${encodeURIComponent(p.id)}.html`;
  const image = `https://www.japanitem.com/assets/products/${encodeURIComponent(jan)}.jpg`;
  const title = `${p.name} — ${p.brand} Wholesale | JAN ${jan} | JAPANITEM`;
  const description = `${p.name} by ${p.brand}. JAN/GTIN ${jan}. Authentic ${category.toLowerCase()} sourced in Japan for B2B wholesale and global export. Request bulk pricing from JAPANITEM.`;
  const gtin = /^\d{13}$/.test(jan) ? { gtin13: jan } : (/^\d{14}$/.test(jan) ? { gtin14: jan } : {});
  const productLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name,
    brand: { '@type': 'Brand', name: p.brand }, category, sku: String(p.id),
    ...gtin, description, image: [image], url: canonical,
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.japanitem.com/' },
      { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://www.japanitem.com/products.html' },
      { '@type': 'ListItem', position: 3, name: p.name, item: canonical },
    ],
  };
  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="/">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="JAPANITEM by 和潤合同会社">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="assets/css/style.css?v=67">
  <link rel="stylesheet" href="assets/css/chatbot.css?v=2">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <meta name="theme-color" content="#174C43">
  <script type="application/ld+json">${jsonForHtml(productLd)}</script>
  <script type="application/ld+json">${jsonForHtml(breadcrumbLd)}</script>
</head>
<body>
  <div id="site-header"></div>
  <main id="pdp" data-product-id="${escapeHtml(p.id)}">
    <div class="container pdp-wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="products.html">Products</a><span class="sep">/</span><span class="cur">${escapeHtml(p.name)}</span></nav>
      <div class="pdp-grid">
        <div class="pdp-media"><img class="prod-photo loaded" src="assets/products/${encodeURIComponent(jan)}.jpg" alt="${escapeHtml(p.name)} — JAN ${escapeHtml(jan)}" width="600" height="600" loading="eager"></div>
        <div class="pdp-info">
          <span class="cat">${escapeHtml(category)}</span>
          <h1>${escapeHtml(p.name)}</h1>
          <p class="brand">${escapeHtml(p.brand)}</p>
          <p class="pdp-blurb">${escapeHtml(brand.blurb || description)}</p>
          <div class="pdp-specs">
            <div><span>Brand</span><b>${escapeHtml(p.brand)}</b></div>
            <div><span>Category</span><b>${escapeHtml(category)}</b></div>
            <div><span>Unit</span><b>${escapeHtml(p.unit || '—')}</b></div>
            <div><span>MOQ</span><b>${escapeHtml(p.moq || '—')}</b></div>
            <div><span>JAN / GTIN</span><b>${escapeHtml(jan)}</b></div>
            <div><span>Origin</span><b>Japan</b></div>
          </div>
          <p><a class="btn btn-primary btn-lg" href="how-to-order.html?product=${encodeURIComponent(p.id)}&amp;name=${encodeURIComponent(p.name)}&amp;brand=${encodeURIComponent(p.brand)}#request">Request wholesale quote</a></p>
        </div>
      </div>
    </div>
  </main>
  <div id="site-footer"></div>
  <script defer src="assets/js/data.js?v=43"></script>
  <script defer src="assets/js/i18n.js?v=44"></script>
  <script defer src="assets/js/app.js?v=53"></script>
  <script defer src="assets/js/auth.js"></script>
  <script defer src="assets/js/chatbot.js?v=4"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(outDir, `${p.id}.html`), html, 'utf8');
}

const today = new Date().toISOString().slice(0, 10);
const coreUrls = ['/', '/products.html', '/brands.html', '/how-to-order.html', '/faq.html'];
const urls = [
  ...coreUrls.map((url, index) => `  <url><loc>https://www.japanitem.com${url}</loc><lastmod>${today}</lastmod><changefreq>${index < 2 ? 'weekly' : 'monthly'}</changefreq><priority>${index === 0 ? '1.0' : index === 1 ? '0.9' : '0.7'}</priority></url>`),
  ...products.map(p => `  <url><loc>https://www.japanitem.com/products/${escapeXml(p.id)}.html</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`),
];
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`, 'utf8');

console.log(`Generated ${products.length} unique product pages and ${urls.length} sitemap URLs.`);
