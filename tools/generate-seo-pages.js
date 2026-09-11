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

const brandData = new Map((window.BRANDS || []).map(brand => [brand.name, brand]));
const categories = {
  health: 'Health & Wellness', beauty: 'Beauty & Personal Care', daily: 'Daily & Home Care',
  food: 'Food & Beverages', sweets: 'Sweets & Snacks', babykids: 'Baby & Kids',
  hobby: 'Character Goods & Hobby', seasonaltop: 'Seasonal Products',
};
const activeCategories = Object.entries(categories).filter(([id]) => products.some(p => p.category === id));
const activeBrands = [...new Set(products.map(p => p.brand))].sort((a, b) => a.localeCompare(b));

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const escapeXml = escapeHtml;
const jsonForHtml = value => JSON.stringify(value).replace(/</g, '\\u003c');
const truncate = (value, max) => {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text.length <= max ? text : `${text.slice(0, Math.max(1, max - 1)).trim()}…`;
};
const slugify = value => String(value).toLowerCase()
  .replace(/&/g, '-and-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'brand';

const brandSlugs = new Map();
const usedSlugs = new Set();
for (const brand of activeBrands) {
  let slug = slugify(brand);
  let suffix = 2;
  while (usedSlugs.has(slug)) slug = `${slugify(brand)}-${suffix++}`;
  usedSlugs.add(slug);
  brandSlugs.set(brand, slug);
}

const productUrl = p => `https://www.japanitem.com/products/${encodeURIComponent(p.id)}.html`;
const categoryUrl = id => `https://www.japanitem.com/categories/${encodeURIComponent(id)}.html`;
const brandUrl = name => `https://www.japanitem.com/brands/${encodeURIComponent(brandSlugs.get(name))}.html`;
const productImage = p => `https://www.japanitem.com/assets/products/${encodeURIComponent(p.jan || p.id)}.jpg`;
const gtinProperty = jan => {
  const length = /^\d+$/.test(jan) ? jan.length : 0;
  return [8, 12, 13, 14].includes(length) ? { [`gtin${length}`]: jan } : {};
};
const productTitle = p => {
  const jan = String(p.jan || p.id);
  const suffix = ` | JAN ${jan} | JAPANITEM`;
  return `${truncate(`${p.name} — ${p.brand}`, 65 - suffix.length)}${suffix}`;
};
const productDescription = p => truncate(
  `${p.name}（${p.brand}）の業務用卸売。JAN/GTIN ${p.jan || p.id}。日本正規流通品を海外発送。法人向け見積もりをJAPANITEMへご依頼ください。`,
  155,
);

// Editorial content for the first major-brand rollout. Keep claims limited to
// catalog facts and purchasing guidance that can be verified from product data.
const majorBrandContent = {
  'Febreze': {
    overview: 'The JAPANITEM Febreze range brings together Japanese-market home, fabric and space-care formats for wholesale buyers.',
    buyerFit: 'Relevant to supermarkets, household-goods stores, drugstores and online retailers building a Japanese home-care assortment.',
    handling: 'Confirm whether the selected JAN is a main unit, refill, bundle or limited package before finalising the order.',
  },
  'Visee': {
    overview: 'Our Visee catalog covers Japanese color cosmetics across complexion, eye, lip and point-makeup selections.',
    buyerFit: 'Designed for beauty retailers, cosmetics specialists and e-commerce sellers that merchandise Japanese makeup by shade and finish.',
    handling: 'Shade number, color name and package version should be matched to the JAN because visually similar variants may be separate SKUs.',
  },
  'DHC': {
    overview: 'The DHC wholesale selection spans Japanese-market supplements, beauty care and personal-care products.',
    buyerFit: 'Suitable for health-and-beauty retailers, pharmacies, specialist stores and online sellers seeking a broad Japanese DHC assortment.',
    handling: 'Product type, pack size and destination-market labeling or import requirements should be reviewed before ordering.',
  },
  'Lenor': {
    overview: 'Our Lenor catalog groups Japanese-market laundry-care products, including multiple scents, pack formats and refill options.',
    buyerFit: 'A practical range for supermarkets, drugstores, household-goods retailers and e-commerce laundry-care categories.',
    handling: 'Use the JAN to distinguish scent, concentration, pack size and bottle-versus-refill formats; legacy packages may have successor SKUs.',
  },
  'Pantene': {
    overview: 'The Pantene selection includes Japanese-market hair-care products across shampoo, conditioner, treatment and related formats.',
    buyerFit: 'Suitable for drugstores, beauty retailers, supermarkets and online hair-care assortments.',
    handling: 'Check the exact line, product step, volume and bottle or refill format against the JAN before confirming quantities.',
  },
  'Fasio': {
    overview: 'Our Fasio assortment focuses on Japanese color cosmetics, with complexion, eye, brow and lip products represented in the catalog.',
    buyerFit: 'Built for cosmetics retailers and online beauty sellers that need individual Japanese shade and format references.',
    handling: 'Match shade, finish, size and package version to the JAN; names alone may not separate closely related variants.',
  },
  'Joy': {
    overview: 'The JAPANITEM Joy catalog covers Japanese-market kitchen and household cleaning formats for wholesale sourcing.',
    buyerFit: 'Relevant to supermarkets, home-care retailers, drugstores and e-commerce household categories.',
    handling: 'Confirm usage type, fragrance, volume and main-container or refill format using the product name and JAN.',
  },
  'Pampers': {
    overview: 'Our Pampers selection groups Japanese-market baby-care products across multiple sizes, formats and pack counts.',
    buyerFit: 'Suitable for baby stores, supermarkets, pharmacies and online retailers serving parents and family shoppers.',
    handling: 'Size, weight guide, tape-or-pants format and units per pack are essential variant checks before ordering.',
  },
  'Bold': {
    overview: 'The Bold range in our catalog covers Japanese-market laundry products across different scents, pack sizes and formats.',
    buyerFit: 'Relevant to supermarkets, household-goods stores, drugstores and online laundry-care assortments.',
    handling: 'Confirm fragrance, product form, pack size and refill or container format by JAN before purchase.',
  },
  'Whisper': {
    overview: 'Our Whisper catalog brings together Japanese-market feminine and personal-care formats with distinct sizes and pack counts.',
    buyerFit: 'Suitable for pharmacies, supermarkets, personal-care retailers and online health-and-beauty stores.',
    handling: 'Product type, length or size, absorbency designation and units per pack should be verified for each JAN.',
  },
  'Clinica': {
    overview: 'The Clinica selection covers Japanese-market oral-care products, including toothpaste, toothbrush and related daily-care formats.',
    buyerFit: 'Relevant to pharmacies, supermarkets, oral-care specialists and e-commerce health categories.',
    handling: 'Confirm product form, firmness or type where applicable, pack size and current package version by JAN.',
  },
  'Kose Infinity': {
    overview: 'Our Kose Infinity catalog focuses on Japanese prestige skin-care and beauty-care items across multiple product steps and sizes.',
    buyerFit: 'Suitable for specialist beauty retailers, cosmetics counters and e-commerce stores curating Japanese premium skin care.',
    handling: 'Check the exact product step, size, set contents and package version against the JAN before quotation.',
  },
  'Systema': {
    overview: 'The Systema catalog groups Japanese-market oral-care products across toothpaste, toothbrush and supporting care formats.',
    buyerFit: 'Relevant to pharmacies, supermarkets, oral-care retailers and health-focused online stores.',
    handling: 'Use the JAN to confirm product form, brush type or firmness where applicable, pack count and package version.',
  },
  'Ariel': {
    overview: 'Our Ariel assortment covers Japanese-market laundry products across detergent forms, pack sizes and refill options.',
    buyerFit: 'A core range for supermarkets, drugstores, household-goods retailers and e-commerce laundry categories.',
    handling: 'Product form, number of uses, pack size and bottle or refill format should be checked against the JAN.',
  },
  'Head & Shoulders': {
    overview: 'The Head & Shoulders selection includes Japanese-market hair-care products across shampoo, conditioner and treatment formats.',
    buyerFit: 'Suitable for drugstores, supermarkets, beauty retailers and online hair-care assortments.',
    handling: 'Confirm the exact line, product step, volume and bottle or refill format for the selected JAN.',
  },
};

const categoryGuidance = {
  makeup: 'This SKU belongs to the color-cosmetics range. Shade, finish and package version are key ordering details.',
  laundry: 'This SKU belongs to the laundry-care range. Product form, scent, size and refill format may identify separate variants.',
  cleaning: 'This SKU belongs to the household-care range. Intended use, fragrance, size and container type should be checked.',
  haircare: 'This SKU belongs to the hair-care range. Line, product step, volume and bottle or refill format should be checked.',
  diaper: 'This SKU belongs to the baby-care range. Size, fit format and units per pack are key ordering details.',
  supplement: 'This SKU belongs to the health-products range. Pack format and destination-market regulatory requirements should be reviewed.',
  quasidrug: 'This SKU belongs to the health and personal-care range. Format, pack size and local import requirements should be reviewed.',
  serum: 'This SKU belongs to the skin-care range. Product step, size and package version should be confirmed.',
  bodycare: 'This SKU belongs to the personal-care range. Type, size and pack count should be confirmed.',
};

function editorialFor(p) {
  const brand = majorBrandContent[p.brand];
  if (!brand) return null;
  const jan = String(p.jan || p.id);
  const category = categories[p.category] || p.category || 'Japanese consumer goods';
  const unit = p.unit && p.unit !== '—' ? p.unit : 'quoted case configuration';
  const moq = p.moq || 'confirmed at quotation';
  const variantGuidance = categoryGuidance[p.sub] || `This SKU is listed under ${category}. Confirm the exact variant and package configuration before ordering.`;
  const status = p.tag === 'discontinued'
    ? 'This may be a legacy or discontinued catalog record; current availability and any successor JAN must be confirmed.'
    : 'Current packaging, lead time and lot availability are confirmed when we prepare your quotation.';
  return {
    summary: truncate(`${p.name} by ${p.brand}, JAN ${jan}. Japanese wholesale sourcing information, MOQ ${moq}, product identification and quotation guidance from JAPANITEM.`, 155),
    lead: `${p.name} is listed in JAPANITEM's ${p.brand} wholesale catalog under ${category}. The exact catalog identifier is JAN / GTIN ${jan}, helping buyers distinguish this item from similar sizes, colors, scents or package revisions.`,
    overview: brand.overview,
    buyerFit: brand.buyerFit,
    variantGuidance,
    orderFacts: [
      `Quote identifier: JAN / GTIN ${jan}`,
      `Catalog order unit: ${unit}; listed MOQ: ${moq}`,
      `Catalog origin: Japan; export destination and delivery terms are confirmed with the quote`,
      status,
    ],
    handling: brand.handling,
  };
}

function commonHead({ title, description, canonical, type = 'website', image = 'https://www.japanitem.com/assets/og.png', ld = [] }) {
  return `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="/">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="${type}">
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
  <link rel="stylesheet" href="assets/css/style.css?v=72">
  <link rel="stylesheet" href="assets/css/chatbot.css?v=2">
  <link rel="icon" href="assets/brand/japanitem-mark-user.png" type="image/png">
  <meta name="theme-color" content="#174C43">
${ld.map(item => `  <script type="application/ld+json">${jsonForHtml(item)}</script>`).join('\n')}`;
}

function scripts() {
  return `  <script defer src="assets/js/data.js?v=43"></script>
  <script defer src="assets/js/i18n.js?v=45"></script>
  <script defer src="assets/js/app.js?v=62"></script>
  <script defer src="assets/js/auth.js"></script>
  <script defer src="assets/js/chatbot.js?v=4"></script>`;
}

function productCard(p) {
  const jan = String(p.jan || p.id);
  return `<article class="product">
    <a class="media" href="products/${encodeURIComponent(p.id)}.html"><span class="prod-art-wrap"><img class="prod-photo loaded" src="assets/products/${encodeURIComponent(jan)}.jpg" alt="${escapeHtml(p.name)} — JAN ${escapeHtml(jan)}" width="360" height="360" loading="lazy" decoding="async"></span></a>
    <div class="body"><span class="cat">${escapeHtml(categories[p.category] || p.category)}</span><h2><a href="products/${encodeURIComponent(p.id)}.html">${escapeHtml(p.name)}</a></h2><span class="brand">${escapeHtml(p.brand)} · JAN ${escapeHtml(jan)}</span></div>
  </article>`;
}

function compactProductLinks(list) {
  return `<ol class="seo-link-list">${list.map(p => `<li><a href="products/${encodeURIComponent(p.id)}.html"><span>${escapeHtml(p.name)}</span><small>${escapeHtml(p.brand)} · JAN ${escapeHtml(p.jan || p.id)}</small></a></li>`).join('')}</ol>`;
}

function breadcrumb(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({
    '@type': 'ListItem', position: index + 1, name: item.name, item: item.url,
  })) };
}

const productDir = path.resolve(root, 'products');
const categoryDir = path.resolve(root, 'categories');
const brandDir = path.resolve(root, 'brands');
for (const output of [productDir, categoryDir, brandDir]) {
  if (!output.startsWith(root + path.sep)) throw new Error(`Unsafe output directory: ${output}`);
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
}

for (const p of products) {
  const jan = String(p.jan || p.id);
  const brand = brandData.get(p.brand) || {};
  const category = categories[p.category] || p.category || 'Japanese daily goods';
  const canonical = productUrl(p);
  const image = productImage(p);
  const title = productTitle(p);
  const editorial = editorialFor(p);
  const description = editorial?.summary || productDescription(p);
  const related = [
    ...products.filter(x => x.id !== p.id && x.brand === p.brand),
    ...products.filter(x => x.id !== p.id && x.brand !== p.brand && x.category === p.category),
  ].slice(0, 4);
  const productLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name,
    brand: { '@type': 'Brand', name: p.brand }, category, sku: String(p.id),
    ...gtinProperty(jan), description, image: [image], url: canonical,
  };
  const breadcrumbLd = breadcrumb([
    { name: 'Home', url: 'https://www.japanitem.com/' },
    { name: category, url: categoryUrl(p.category) },
    { name: p.name, url: canonical },
  ]);
  const html = `<!doctype html>
<html lang="ja">
<head>
${commonHead({ title, description, canonical, type: 'product', image, ld: [productLd, breadcrumbLd] })}
</head>
<body>
  <div id="site-header"></div>
  <main id="pdp" data-product-id="${escapeHtml(p.id)}">
    <div class="container pdp-wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="categories/${escapeHtml(p.category)}.html">${escapeHtml(category)}</a><span class="sep">/</span><span class="cur">${escapeHtml(p.name)}</span></nav>
      <div class="pdp-grid">
        <div class="pdp-media"><img class="prod-photo loaded" src="assets/products/${encodeURIComponent(jan)}.jpg" alt="${escapeHtml(p.name)} — JAN ${escapeHtml(jan)}" width="600" height="600" loading="eager" decoding="async"></div>
        <div class="pdp-info">
          <span class="cat">${escapeHtml(category)}</span>
          <h1>${escapeHtml(p.name)}</h1>
          <p class="brand"><a href="brands/${escapeHtml(brandSlugs.get(p.brand))}.html">${escapeHtml(p.brand)}</a></p>
          <p class="pdp-blurb">${escapeHtml(editorial?.lead || brand.blurb || description)}</p>
          <div class="pdp-specs">
            <div><span>Brand</span><b>${escapeHtml(p.brand)}</b></div><div><span>Category</span><b>${escapeHtml(category)}</b></div>
            <div><span>Unit</span><b>${escapeHtml(p.unit || '—')}</b></div><div><span>MOQ</span><b>${escapeHtml(p.moq || '—')}</b></div>
            <div><span>JAN / GTIN</span><b>${escapeHtml(jan)}</b></div><div><span>Origin</span><b>Japan</b></div>
          </div>
          <p><a class="btn btn-primary btn-lg" href="how-to-order.html?product=${encodeURIComponent(p.id)}&amp;name=${encodeURIComponent(p.name)}&amp;brand=${encodeURIComponent(p.brand)}#request">Request wholesale quote</a></p>
        </div>
      </div>
      ${editorial ? `<section class="product-editorial" aria-labelledby="product-overview">
        <div class="product-copy-grid">
          <div class="product-copy-main"><span class="eyebrow">PRODUCT INFORMATION</span><h2 id="product-overview">About this ${escapeHtml(p.brand)} product</h2><p>${escapeHtml(editorial.overview)}</p><p>${escapeHtml(editorial.buyerFit)}</p></div>
          <aside class="product-order-card"><span class="eyebrow">WHOLESALE CHECKLIST</span><h2>Before you order</h2><ul>${editorial.orderFacts.map(fact => `<li>${escapeHtml(fact)}</li>`).join('')}</ul></aside>
        </div>
        <div class="product-variant-note"><div><span class="eyebrow">VARIANT GUIDANCE</span><h2>Identify the exact SKU</h2></div><div><p>${escapeHtml(editorial.variantGuidance)}</p><p>${escapeHtml(editorial.handling)}</p><p class="product-compliance-note">Images and catalog details are for product identification. Buyers are responsible for confirming destination-market labeling, import and sales requirements.</p></div></div>
      </section>` : ''}
      <section class="related seo-related" aria-labelledby="related-products"><div class="section-head"><div><span class="eyebrow">MORE FROM JAPAN</span><h2 class="h" id="related-products">Related wholesale products</h2></div><a href="brands/${escapeHtml(brandSlugs.get(p.brand))}.html">View ${escapeHtml(p.brand)} products →</a></div><div class="product-grid cols-4">${related.map(productCard).join('')}</div></section>
    </div>
  </main>
  <div id="site-footer"></div>
${scripts()}
</body>
</html>
`;
  fs.writeFileSync(path.join(productDir, `${p.id}.html`), html, 'utf8');
}

function writeCollectionPage({ output, canonical, title, description, eyebrow, heading, intro, list, parent, editorial = null }) {
  const collectionLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: heading,
    description, url: canonical,
    mainEntity: { '@type': 'ItemList', numberOfItems: list.length, itemListElement: list.slice(0, 50).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: productUrl(p), name: p.name })) },
  };
  const html = `<!doctype html>
<html lang="en">
<head>
${commonHead({ title, description, canonical, ld: [collectionLd, breadcrumb([{ name: 'Home', url: 'https://www.japanitem.com/' }, { name: parent, url: 'https://www.japanitem.com/products.html' }, { name: heading, url: canonical }])] })}
</head>
<body>
  <div id="site-header"></div>
  <main id="content">
    <section class="page-hero seo-collection-hero"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span class="sep">/</span><a href="products.html">Catalog</a><span class="sep">/</span><span class="cur">${escapeHtml(heading)}</span></nav><span class="eyebrow">${escapeHtml(eyebrow)}</span><h1 class="tight">${escapeHtml(heading)}</h1><p>${escapeHtml(intro)}</p><div class="seo-count">${list.length.toLocaleString('en-US')} wholesale products · Searchable by JAN / GTIN</div></div></section>
    ${editorial ? `<section class="section-sm brand-editorial"><div class="container"><div class="brand-editorial-grid"><div><span class="eyebrow">BRAND SOURCING GUIDE</span><h2 class="h">Source ${escapeHtml(heading.replace(/ Wholesale$/, ''))} from Japan</h2><p>${escapeHtml(editorial.overview)}</p><p>${escapeHtml(editorial.buyerFit)}</p></div><aside><strong>Ordering note</strong><p>${escapeHtml(editorial.handling)}</p><a href="how-to-order.html#request">Ask for availability and export pricing →</a></aside></div></div></section>` : ''}
    <section class="section-sm"><div class="container"><div class="section-head"><div><span class="eyebrow">FEATURED SELECTION</span><h2 class="h">Products from Japan</h2></div><a href="how-to-order.html#request">Request a quote →</a></div><div class="product-grid cols-4">${list.slice(0, 12).map(productCard).join('')}</div></div></section>
    <section class="section-sm seo-directory"><div class="container"><div class="section-head"><div><span class="eyebrow">COMPLETE INDEX</span><h2 class="h">Browse every product</h2></div><a href="products.html">Search and filter →</a></div>${compactProductLinks(list)}</div></section>
  </main>
  <div id="site-footer"></div>
${scripts()}
</body>
</html>`;
  fs.writeFileSync(output, html, 'utf8');
}

for (const [id, name] of activeCategories) {
  const list = products.filter(p => p.category === id).sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
  writeCollectionPage({
    output: path.join(categoryDir, `${id}.html`), canonical: categoryUrl(id),
    title: `${name} Wholesale from Japan | JAPANITEM`,
    description: `Browse ${list.length} authentic Japanese ${name.toLowerCase()} products for B2B wholesale. Search by brand or JAN/GTIN and request export pricing.`,
    eyebrow: 'JAPANESE WHOLESALE CATEGORY', heading: name,
    intro: `Authentic ${name.toLowerCase()} sourced from Japanese distribution channels for retailers, importers and business buyers worldwide.`,
    list, parent: 'Categories',
  });
}

for (const name of activeBrands) {
  const list = products.filter(p => p.brand === name).sort((a, b) => a.name.localeCompare(b.name));
  const brand = brandData.get(name) || {};
  const editorial = majorBrandContent[name] || null;
  writeCollectionPage({
    output: path.join(brandDir, `${brandSlugs.get(name)}.html`), canonical: brandUrl(name),
    title: `${name} Wholesale Japan | ${list.length} Products | JAPANITEM`,
    description: editorial
      ? truncate(`Browse ${list.length} ${name} products for Japanese B2B wholesale. Search exact JAN/GTIN codes, compare variants and request export pricing from JAPANITEM.`, 155)
      : `Browse ${list.length} authentic ${name} products for Japanese B2B wholesale. Search JAN/GTIN codes and request export pricing from JAPANITEM.`,
    eyebrow: 'JAPANESE WHOLESALE BRAND', heading: `${name} Wholesale`,
    intro: editorial?.overview || brand.blurb || `Source authentic ${name} products from Japan for wholesale and international export.`,
    list, parent: 'Brands', editorial,
  });
}

const productsPath = path.join(root, 'products.html');
const productsHtml = fs.readFileSync(productsPath, 'utf8');
const startMarker = '  <!-- SEO-DIRECTORY:START -->';
const endMarker = '  <!-- SEO-DIRECTORY:END -->';
const directory = `${startMarker}
  <section class="section-sm seo-directory" aria-labelledby="catalog-directory-title"><div class="container"><div class="section-head"><div><span class="eyebrow">CRAWLABLE CATALOG</span><h2 class="h" id="catalog-directory-title">Shop by category or brand</h2></div></div><div class="seo-index-grid">${activeCategories.map(([id, name]) => `<a class="seo-index-card" href="categories/${id}.html"><strong>${escapeHtml(name)}</strong><span>${products.filter(p => p.category === id).length.toLocaleString('en-US')} products</span></a>`).join('')}</div><div class="seo-brand-links">${activeBrands.map(name => `<a href="brands/${escapeHtml(brandSlugs.get(name))}.html">${escapeHtml(name)}</a>`).join('')}</div></div></section>
${endMarker}`;
let nextProductsHtml;
if (productsHtml.includes(startMarker) && productsHtml.includes(endMarker)) {
  nextProductsHtml = productsHtml.replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`), directory);
} else {
  nextProductsHtml = productsHtml.replace('  <div id="site-footer"></div>', `${directory}\n\n  <div id="site-footer"></div>`);
}
fs.writeFileSync(productsPath, nextProductsHtml, 'utf8');

const sourceDate = fs.statSync(path.join(root, 'assets/js/data.js')).mtime.toISOString().slice(0, 10);
const coreUrls = ['/', '/products.html', '/brands.html', '/how-to-order.html', '/faq.html'];
const urls = [
  ...coreUrls.map((url, index) => `  <url><loc>https://www.japanitem.com${url}</loc><lastmod>${sourceDate}</lastmod><changefreq>${index < 2 ? 'weekly' : 'monthly'}</changefreq><priority>${index === 0 ? '1.0' : index === 1 ? '0.9' : '0.7'}</priority></url>`),
  ...activeCategories.map(([id]) => `  <url><loc>${categoryUrl(id)}</loc><lastmod>${sourceDate}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
  ...activeBrands.map(name => `  <url><loc>${brandUrl(name)}</loc><lastmod>${sourceDate}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
  ...products.map(p => `  <url><loc>${productUrl(p)}</loc><lastmod>${sourceDate}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`),
];
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`, 'utf8');

console.log(`Generated ${products.length} product pages, ${activeCategories.length} category pages, ${activeBrands.length} brand pages and ${urls.length} sitemap URLs.`);
