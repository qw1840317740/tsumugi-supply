const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const assetVersion = name => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'assets/js', name))).digest('hex').slice(0, 12);
const dataVersion = assetVersion('data.js');
const appVersion = assetVersion('app.js');
const i18nVersion = assetVersion('i18n.js');
const cssVersion = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'assets/css/style.min.css'))).digest('hex').slice(0, 12);
for (const name of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
  const file = path.join(root, name);
  const original = fs.readFileSync(file, 'utf8');
  const updated = original.replace(/assets\/js\/data\.js\?v=[^"\s]+/g, `assets/js/data.js?v=${dataVersion}`)
    .replace(/assets\/js\/app\.js\?v=[^"\s]+/g, `assets/js/app.js?v=${appVersion}`)
    .replace(/assets\/js\/i18n\.js\?v=[^"\s]+/g, `assets/js/i18n.js?v=${i18nVersion}`)
    .replace(/assets\/css\/style\.min\.css\?v=[^"\s]+/g, `assets/css/style.min.css?v=${cssVersion}`);
  if(updated !== original) fs.writeFileSync(file, updated, 'utf8');
}
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
// Cut at a word boundary and drop a dangling comma so titles read cleanly.
const truncateWords = (value, max) => {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const atSpace = cut.lastIndexOf(' ');
  return `${(atSpace > max * 0.6 ? cut.slice(0, atSpace) : cut).replace(/[\s,;:&+-]+$/, '')}…`;
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

// Search-intent collections (tools/collections.js); thin ones are skipped.
const collections = require('./collections')
  .map(def => ({ ...def, list: products.filter(p => p.name_en && def.match(p)).sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name)) }))
  .filter(c => c.list.length >= 8);
const collectionsByProduct = new Map();
for (const c of collections) for (const p of c.list) {
  if (!collectionsByProduct.has(p.id)) collectionsByProduct.set(p.id, []);
  collectionsByProduct.get(p.id).push(c);
}
const collectionUrl = c => `https://www.japanitem.com/collections/${c.slug}.html`;
const collectionLinks = list => `<div class="seo-brand-links">${list.map(c => `<a href="collections/${c.slug}.html">${escapeHtml(c.name)}</a>`).join('')}</div>`;

const productUrl = p => `https://www.japanitem.com/products/${encodeURIComponent(p.id)}.html`;
const categoryUrl = id => `https://www.japanitem.com/categories/${encodeURIComponent(id)}.html`;
const brandUrl = name => `https://www.japanitem.com/brands/${encodeURIComponent(brandSlugs.get(name))}.html`;
const productImage = p => {
  const jan = String(p.jan || p.id);
  const localPath = path.join(root, 'assets', 'products', `${jan}.jpg`);
  return fs.existsSync(localPath)
    ? `https://www.japanitem.com/assets/products/${encodeURIComponent(jan)}.jpg`
    : null;
};
const gtinProperty = jan => {
  const length = /^\d+$/.test(jan) ? jan.length : 0;
  return [8, 12, 13, 14].includes(length) ? { [`gtin${length}`]: jan } : {};
};
const shortProductTitle = p => {
  const base = p.name_en || (p.name.toLowerCase().includes(String(p.brand).toLowerCase()) ? p.name : `${p.brand} ${p.name}`);
  return base.length + ' | JAPANITEM'.length <= 70 ? `${base} | JAPANITEM` : truncateWords(base, 100);
};
const shortTitleCounts = new Map();
for (const p of products) shortTitleCounts.set(shortProductTitle(p), (shortTitleCounts.get(shortProductTitle(p)) || 0) + 1);
// "Full English name | JAPANITEM" titles (Google indexes the full title even when it truncates the display); add the JAN only where two catalog names are identical.
const productTitle = p => {
  const short = shortProductTitle(p);
  if (shortTitleCounts.get(short) === 1) return short;
  const suffix = ` | JAN ${p.jan || p.id} | JAPANITEM`;
  const base = p.name_en || (p.name.toLowerCase().includes(String(p.brand).toLowerCase()) ? p.name : `${p.brand} ${p.name}`);
  return `${truncateWords(base, 100)}${suffix}`;
};
const nameWithJa = p => p.name_ja ? `${p.name} (${p.name_ja})` : p.name;
const productDescription = p => truncate(
  p.seo_description || `${nameWithJa(p)} by ${p.brand}, JAN ${p.jan || p.id}. Wholesale export from Japan — request a B2B quotation from JAPANITEM.`,
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
  'Wakodo': {
    overview: 'The Wakodo range covers Japanese-market baby food, snacks, drinks and family-care products supplied by Asahi Group Foods.',
    buyerFit: 'Suitable for baby stores, pharmacies, supermarkets and online retailers sourcing Japanese infant and family-care assortments.',
    handling: 'Check the age-stage guidance, flavor or recipe, net content, case pack and current package version for each JAN before ordering.',
  },
  'Akai Bohshi': {
    overview: 'Akai Bohshi is a Japanese confectionery brand known for cookies, chocolate-filled Kukkia and assorted baked-gift formats.',
    buyerFit: 'Suitable for confectionery retailers, gift shops, department stores and online sellers building a Japanese sweets assortment.',
    handling: 'Confirm the flavor assortment, piece count, case pack, shelf life and seasonal shipping conditions for the selected JAN.',
  },
  'Moegino': {
    overview: 'The Moegino range presents Japanese baked confectionery in multiple piece-count and gift-assortment formats.',
    buyerFit: 'Relevant to confectionery retailers, gift shops and online sellers sourcing Japanese packaged sweets.',
    handling: 'Confirm the exact assortment, piece count, case pack and remaining shelf-life requirement before quotation.',
  },
  'RUYSDAEL': {
    overview: 'RUYSDAEL products in this catalog are Japanese baked confectionery selected for wholesale and gift-channel sourcing.',
    buyerFit: 'Relevant to confectionery retailers, gift shops, specialty grocers and online sellers.',
    handling: 'Confirm the flavor, net content, case configuration, availability and shelf-life requirement before ordering.',
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
  babyfood: 'This SKU belongs to the baby-food range. Recipe, age-stage guidance, net content and case pack should be checked.',
  kidsdrink: 'This SKU belongs to the baby snack and drink range. Flavor, age-stage guidance, unit size and case pack should be checked.',
  babyhygiene: 'This SKU belongs to the baby and family-care range. Intended use, net content and case pack should be checked.',
  biscuit: 'This SKU belongs to the Japanese cookie and baked-confectionery range. Flavor, piece count and case pack should be checked.',
  yogashi: 'This SKU belongs to the Japanese baked-confectionery range. Flavor, net content, shelf life and case pack should be checked.',
};


// ---------------------------------------------------------------------------
// Multilingual output: /, /zh/, /ja/ mirror each other. Each page has its own
// canonical plus hreflang alternates; links inside a language stay in it.
// ---------------------------------------------------------------------------
const { L } = require('./load-i18n')();
const collectionI18n = require('./collections-i18n');
const { productCopyHtml, lineKey, GROUPS } = require('./product-copy');

const LANGS = ['en', 'zh', 'ja'];
const PRE = { en: '', zh: 'zh/', ja: 'ja/' };
const HREFLANG = { en: 'en', zh: 'zh-Hans', ja: 'ja' };
const HTML_LANG = { en: 'en', zh: 'zh-CN', ja: 'ja' };
const OG_LOCALE = { en: 'en_US', zh: 'zh_CN', ja: 'ja_JP' };
const SITE = 'https://www.japanitem.com/';
// vercel.json has trailingSlash:false, so the zh/ja home pages live at /zh and /ja (no slash).
const abs = (lang, rel) => (lang !== "en" && rel === "") ? `${SITE}${lang}` : `${SITE}${PRE[lang]}${rel}`;

const nameIn = (p, lang) => lang === 'zh' ? (p.name_zh || p.name_en || p.name)
  : lang === 'ja' ? String(p.name_ja || p.name).normalize('NFKC').replace(/\s+/g, ' ').trim()
  : (p.name_en || p.name);
const catIn = (id, lang) => lang === 'en' ? (categories[id] || id) : (L[lang][`c.${id}`] || categories[id] || id);
const collName = (c, lang) => lang === 'en' ? c.name : (collectionI18n[c.slug]?.[lang]?.name || c.name);
const collIntro = (c, lang) => lang === 'en' ? c.intro : (collectionI18n[c.slug]?.[lang]?.intro || c.intro);
const groupIn = (g, lang) => lang === 'en' ? g : (GROUPS[g]?.[lang] || g);
const num = (n, lang) => n.toLocaleString(lang === 'en' ? 'en-US' : lang === 'zh' ? 'zh-CN' : 'ja-JP');

const T = {
  en: {
    home: 'Home', catalog: 'Catalog', categories: 'Categories', brands: 'Brands', collections: 'Collections',
    allProducts: 'All products', brandsAZ: 'Brands A–Z', howto: 'How to order', faq: 'FAQ',
    photoPending: 'Product photo pending', unit: 'Unit', moq: 'MOQ', jan: 'JAN / GTIN', origin: 'Origin',
    confirmOrigin: 'Confirm with quotation', blurb: 'Request availability and wholesale pricing for this exact item using the JAN / GTIN below.',
    requestPrice: 'Request price', contact: 'Contact us', packageNote: 'Packaging, lead time and supplied-lot details are confirmed with your quotation.',
    specs: 'Specifications &amp; sources', moreFrom: 'MORE FROM JAPAN', related: 'Related wholesale products', viewBrand: b => `View ${b} products →`,
    shopByType: 'SHOP BY TYPE', moreType: t => `More wholesale ${t.replace(/^Japanese /, '').toLowerCase()} from Japan`,
    featured: 'FEATURED SELECTION', fromJapan: 'Products from Japan', requestQuote: 'Request a quote →', completeIndex: 'COMPLETE INDEX',
    browseEvery: 'Browse every product', searchFilter: 'Search and filter →', count: n => `${num(n, 'en')} wholesale products · Searchable by JAN / GTIN`,
    brandsIn: c => `${c} brands`, brandsInEyebrow: 'BRANDS IN THIS COLLECTION', relatedColl: 'RELATED COLLECTIONS',
    catEyebrow: 'JAPANESE WHOLESALE CATEGORY', brandEyebrow: 'JAPANESE WHOLESALE BRAND', collEyebrow: g => `${g.toUpperCase()} · WHOLESALE FROM JAPAN`,
    shopByCatBrand: 'Shop by category or brand', crawlable: 'CRAWLABLE CATALOG', byType: 'Shop by product type', productsN: n => `${num(n, 'en')} products`,
    brandGuide: 'BRAND SOURCING GUIDE', orderingNote: 'Ordering note', askAvailability: 'Ask for availability and export pricing →',
    quoteSubject: 'Quote request',
    guides: 'Buying guides', guidesEyebrow: 'IMPORT GUIDES', guidesIntro: 'Practical guides for retailers and importers sourcing Japanese daily goods: ordering by JAN, shipping, labels and pack sizes.', readGuide: 'Read the guide →', moreGuides: 'More buying guides', relatedCollections: 'Related product collections', published: 'Published', ctaTitle: 'Ready to request a quote?', ctaText: 'Send your JAN list and quantities. No payment or account needed.', ctaButton: 'Request a quote →',
  },
  zh: {
    home: '首页', catalog: '商品目录', categories: '分类', brands: '品牌', collections: '专题',
    allProducts: '全部商品', brandsAZ: '品牌 A–Z', howto: '下单流程', faq: '常见问题',
    photoPending: '商品图片准备中', unit: L.zh['pdp.unit'], moq: L.zh['pdp.moq'], jan: L.zh['pdp.jan'], origin: L.zh['pdp.origin'],
    confirmOrigin: L.zh['pdp.confirmOrigin'], blurb: L.zh['pdp.procurement'], requestPrice: '询价', contact: '联系我们',
    packageNote: L.zh['pdp.packageNote'], specs: L.zh['pdp.evidence'], moreFrom: '更多日本商品', related: '相关批发商品', viewBrand: b => `查看 ${b} 全部商品 →`,
    shopByType: '按品类浏览', moreType: t => `更多${t.replace(/^日本/, '')}批发`,
    featured: '精选商品', fromJapan: '日本直供商品', requestQuote: '提交询价 →', completeIndex: '完整目录',
    browseEvery: '浏览全部商品', searchFilter: '搜索与筛选 →', count: n => `共 ${num(n, 'zh')} 款批发商品 · 可按 JAN / GTIN 查询`,
    brandsIn: c => `${c}品牌`, brandsInEyebrow: '本专题品牌', relatedColl: '相关专题',
    catEyebrow: '日本批发分类', brandEyebrow: '日本批发品牌', collEyebrow: g => `${g} · 日本批发`,
    shopByCatBrand: '按分类或品牌浏览', crawlable: '商品目录', byType: '按品类浏览', productsN: n => `${num(n, 'zh')} 款商品`,
    brandGuide: '品牌采购指南', orderingNote: '下单提示', askAvailability: '咨询供货与出口报价 →',
    quoteSubject: '询价',
    guides: '采购指南', guidesEyebrow: '进口指南', guidesIntro: '面向采购日本日用品的零售商与进口商的实用指南：按 JAN 下单、运输、标签与包装规格。', readGuide: '阅读指南 →', moreGuides: '更多采购指南', relatedCollections: '相关商品专题', published: '发布日期', ctaTitle: '准备好询价了吗？', ctaText: '把 JAN 清单和数量发给我们，无需付款，无需注册。', ctaButton: '提交询价 →',
  },
  ja: {
    home: 'ホーム', catalog: 'カタログ', categories: 'カテゴリ', brands: 'ブランド', collections: '特集',
    allProducts: 'すべての商品', brandsAZ: 'ブランド A–Z', howto: 'ご注文方法', faq: 'よくある質問',
    photoPending: '商品画像準備中', unit: L.ja['pdp.unit'], moq: L.ja['pdp.moq'], jan: L.ja['pdp.jan'], origin: L.ja['pdp.origin'],
    confirmOrigin: L.ja['pdp.confirmOrigin'], blurb: L.ja['pdp.procurement'], requestPrice: '見積依頼', contact: 'お問い合わせ',
    packageNote: L.ja['pdp.packageNote'], specs: L.ja['pdp.evidence'], moreFrom: '日本の商品をもっと見る', related: '関連する卸売商品', viewBrand: b => `${b} の商品一覧 →`,
    shopByType: 'カテゴリから探す', moreType: t => `${t}の卸売をもっと見る`,
    featured: 'おすすめ商品', fromJapan: '日本からの商品', requestQuote: '見積依頼 →', completeIndex: '全商品一覧',
    browseEvery: 'すべての商品を見る', searchFilter: '検索・絞り込み →', count: n => `卸売商品 ${num(n, 'ja')} 点 · JAN / GTIN で検索可能`,
    brandsIn: c => `${c}のブランド`, brandsInEyebrow: 'この特集のブランド', relatedColl: '関連する特集',
    catEyebrow: '日本の卸売カテゴリ', brandEyebrow: '日本の卸売ブランド', collEyebrow: g => `${g} · 日本から卸売`,
    shopByCatBrand: 'カテゴリ・ブランドから探す', crawlable: '商品カタログ', byType: '商品タイプから探す', productsN: n => `${num(n, 'ja')} 商品`,
    brandGuide: 'ブランド仕入れガイド', orderingNote: 'ご注文の注意', askAvailability: '在庫と輸出価格を問い合わせる →',
    quoteSubject: '見積依頼',
    guides: '仕入れガイド', guidesEyebrow: '輸入ガイド', guidesIntro: '日本の日用品を仕入れる小売店・輸入業者向けの実用ガイド。JAN での発注、輸送、表示、容量表記について。', readGuide: 'ガイドを読む →', moreGuides: 'ほかの仕入れガイド', relatedCollections: '関連する商品特集', published: '公開日', ctaTitle: '見積りを依頼しますか？', ctaText: 'JAN リストと数量をお送りください。支払いもアカウント登録も不要です。', ctaButton: '見積依頼 →',
  },
};

const guides = require('./guides');
const guidesByCollection = new Map();
for (const g of guides) for (const slug of g.collections) {
  if (!guidesByCollection.has(slug)) guidesByCollection.set(slug, []);
  guidesByCollection.get(slug).push(g);
}
const guideLinks = (list, lang) => `<ul class="guide-links">${list.map(g => `<li><a href="guides/${g.slug}.html">${escapeHtml(g.title[lang])}</a></li>`).join('')}</ul>`;

// Relative page links get the language prefix (base href stays "/" so assets resolve at the root).
const PAGE_LINK = /(?<!<base )(href=")(\/|(?:index|products|brands|how-to-order|faq)\.html(?:[?#][^"]*)?|(?:products|categories|brands|collections|guides)\/[^"]*)"/g;
const localizeLinks = (html, lang) => lang === 'en' ? html
  : html.replace(PAGE_LINK, (m, a, link) => link === '/' ? `${a}/${lang}"` : `${a}/${PRE[lang]}${link}"`);

const alternates = rel => [
  ...LANGS.map(l => `  <link rel="alternate" hreflang="${HREFLANG[l]}" href="${abs(l, rel)}">`),
  `  <link rel="alternate" hreflang="x-default" href="${abs('en', rel)}">`,
].join('\n');

function commonHead({ lang, title, description, rel, type = 'website', image = 'https://www.japanitem.com/assets/og.png', ld = [] }) {
  const canonical = abs(lang, rel);
  return `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base href="/">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${canonical}">
${alternates(rel)}
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="JAPANITEM by 和潤合同会社">
  <meta property="og:locale" content="${OG_LOCALE[lang]}">
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
  <link rel="stylesheet" href="assets/css/style.min.css?v=${cssVersion}">
  <link rel="preload" as="style" href="assets/css/chatbot.css?v=2" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="assets/css/chatbot.css?v=2"></noscript>
  <link rel="icon" href="assets/brand/japanitem-mark-user.png?v=2" type="image/png">
  <meta name="theme-color" content="#174C43">
${ld.map(item => `  <script type="application/ld+json">${jsonForHtml(item)}</script>`).join('\n')}`;
}

function staticFooterNav(lang = 'en') {
  const t = T[lang];
  const links = [
    ['/', t.home], ['products.html', t.allProducts], ['brands.html', t.brandsAZ],
    ...activeCategories.map(([id]) => [`categories/${id}.html`, catIn(id, lang)]),
    ['how-to-order.html', t.howto], ['faq.html', t.faq], ['guides/index.html', t.guides],
  ];
  return `<nav class="static-footer-nav" aria-label="Site"><ul>${links.map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`).join('')}</ul></nav>`;
}

function scripts() {
  return `  <script defer src="assets/js/data.js?v=${dataVersion}"></script>
  <script defer src="assets/js/i18n.js?v=${i18nVersion}"></script>
  <script defer src="assets/js/app.js?v=${appVersion}"></script>
  <script defer src="assets/js/auth.js"></script>
  <script defer src="assets/js/chatbot.js?v=4"></script>`;
}

function productCard(p, lang) {
  const jan = String(p.jan || p.id);
  const photo = productImage(p);
  const name = nameIn(p, lang);
  return `<article class="product">
    <a class="media" href="products/${encodeURIComponent(p.id)}.html"><span class="prod-art-wrap">${photo ? `<img class="prod-photo loaded" src="assets/products/${encodeURIComponent(jan)}.jpg" alt="${escapeHtml(name)} — JAN ${escapeHtml(jan)}" width="360" height="360" loading="lazy" decoding="async">` : `<span class="product-photo-placeholder"><strong>${escapeHtml(p.brand)}</strong><span>${T[lang].photoPending}</span><small>JAN ${escapeHtml(jan)}</small></span>`}</span></a>
    <div class="body"><span class="cat">${escapeHtml(catIn(p.category, lang))}</span><h2><a href="products/${encodeURIComponent(p.id)}.html">${escapeHtml(name)}</a></h2><span class="brand">${escapeHtml(p.brand)} · JAN ${escapeHtml(jan)}</span></div>
  </article>`;
}

const compactProductLinks = (list, lang) => `<ol class="seo-link-list">${list.map(p => `<li><a href="products/${encodeURIComponent(p.id)}.html"><span>${escapeHtml(nameIn(p, lang))}</span><small>${escapeHtml(p.brand)} · JAN ${escapeHtml(p.jan || p.id)}</small></a></li>`).join('')}</ol>`;
const collectionLinksIn = (list, lang) => `<div class="seo-brand-links">${list.map(c => `<a href="collections/${c.slug}.html">${escapeHtml(collName(c, lang))}</a>`).join('')}</div>`;

function breadcrumb(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, index) => ({
    '@type': 'ListItem', position: index + 1, name: item.name, item: item.url,
  })) };
}

const outDirs = [];
for (const lang of LANGS) for (const dir of ['products', 'categories', 'brands', 'collections', 'guides']) {
  const output = path.resolve(root, PRE[lang], dir);
  if (!output.startsWith(root + path.sep)) throw new Error(`Unsafe output directory: ${output}`);
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
  outDirs.push(output);
}
const outFile = (lang, rel) => path.join(root, PRE[lang], rel);
const writePage = (lang, rel, html) => fs.writeFileSync(outFile(lang, rel), localizeLinks(html, lang).replace(/[\t ]+$/gm, ''), 'utf8');

// Sibling variants: same brand + same line (English name before the first comma, sizes removed).
const lines = new Map();
for (const p of products) {
  const k = lineKey(p);
  if (!lines.has(k)) lines.set(k, []);
  lines.get(k).push(p);
}

// Localised product titles; JAN is added only where two names in that language collide.
const titleBase = {
  en: p => shortProductTitle(p),
  zh: p => `${nameIn(p, 'zh')} | 日本批发 JAPANITEM`,
  ja: p => `${nameIn(p, 'ja')}｜卸売・輸出 JAPANITEM`,
};
const titleCounts = Object.fromEntries(LANGS.map(lang => {
  const m = new Map();
  for (const p of products) m.set(titleBase[lang](p), (m.get(titleBase[lang](p)) || 0) + 1);
  return [lang, m];
}));
const titleIn = (p, lang) => {
  if (lang === 'en') return productTitle(p);
  const base = titleBase[lang](p);
  if (titleCounts[lang].get(base) === 1) return base;
  return lang === 'zh' ? `${nameIn(p, 'zh')} JAN ${p.jan || p.id} | 日本批发 JAPANITEM` : `${nameIn(p, 'ja')} JAN ${p.jan || p.id}｜卸売・輸出 JAPANITEM`;
};
const descriptionIn = (p, lang) => {
  const jan = p.jan || p.id;
  if (lang === 'zh') return truncate(`${nameIn(p, 'zh')}（${p.brand}，JAN ${jan}）日本正品批发出口。按 JAN 询价，支持全球发货，询价无需付款。`, 150);
  if (lang === 'ja') return truncate(`${nameIn(p, 'ja')}（${p.brand}・JAN ${jan}）の卸売・海外輸出。JAN 単位でお見積り、世界各国へ発送。見積り無料。`, 150);
  return truncate(p.seo_description || `${nameWithJa(p)} by ${p.brand}, JAN ${jan}. Japanese wholesale sourcing information, MOQ ${p.moq || 'confirmed at quotation'}, product identification and quotation guidance from JAPANITEM.`, 155);
};

for (const p of products) {
  const jan = String(p.jan || p.id);
  const rel = `products/${encodeURIComponent(p.id)}.html`;
  const productPhoto = productImage(p);
  const image = productPhoto || 'https://www.japanitem.com/assets/og.png';
  const productCollections = collectionsByProduct.get(p.id) || [];
  const primary = productCollections[0] || null;
  // Two same-type products from other brands (rotated by position so links spread
  // across the collection), then same brand, then same category.
  const typeList = primary?.list || [];
  const typeStart = Math.max(0, typeList.indexOf(p));
  const sameTypeOtherBrand = [...typeList.slice(typeStart + 1), ...typeList.slice(0, typeStart)].filter(x => x.brand !== p.brand);
  const related = [...new Set([
    ...sameTypeOtherBrand.filter((_, i) => i % 7 === 0).slice(0, 2),
    ...products.filter(x => x.id !== p.id && x.brand === p.brand),
    ...products.filter(x => x.id !== p.id && x.brand !== p.brand && x.category === p.category),
  ])].slice(0, 4);
  // Other sizes / scents in the same line (rotated, max 12); otherwise same brand + type.
  const line = lines.get(lineKey(p)) || [];
  const lineStart = Math.max(0, line.indexOf(p));
  let variants = [...line.slice(lineStart + 1), ...line.slice(0, lineStart)].slice(0, 12);
  if (!variants.length) variants = typeList.filter(x => x.id !== p.id && x.brand === p.brand).slice(0, 6);

  for (const lang of LANGS) {
    const t = T[lang];
    const name = nameIn(p, lang);
    const category = catIn(p.category, lang);
    const title = titleIn(p, lang);
    const description = descriptionIn(p, lang);
    const otherNames = [...new Set(LANGS.filter(l => l !== lang).map(l => nameIn(p, l)))].filter(n => n !== name);
    const productLd = {
      '@context': 'https://schema.org', '@type': 'Product', name, ...(otherNames.length ? { alternateName: otherNames } : {}),
      brand: { '@type': 'Brand', name: p.brand }, category, sku: String(p.id),
      ...gtinProperty(jan), description, ...(productPhoto ? { image: [productPhoto] } : {}), url: abs(lang, rel),
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Catalog unit', value: p.unit || '1 unit' },
        { '@type': 'PropertyValue', name: 'Case pack / MOQ', value: String(p.moq || 'Confirm at quotation') },
        ...(p.shelf_life ? [{ '@type': 'PropertyValue', name: 'Catalog shelf life', value: p.shelf_life }] : []),
        ...(p.verified_specs || []).map(spec => ({ '@type': 'PropertyValue', name: spec.name, value: spec.value })),
      ],
    };
    const breadcrumbLd = breadcrumb([
      { name: t.home, url: abs(lang, '') },
      { name: category, url: abs(lang, `categories/${p.category}.html`) },
      { name, url: abs(lang, rel) },
    ]);
    const altName = lang === 'ja' ? (p.name_en ? { text: p.name_en, l: 'en' } : null) : (p.name_ja ? { text: nameIn(p, 'ja'), l: 'ja' } : null);
    const copy = productCopyHtml({ ...p, name }, {
      lang, jan, moq: p.moq, unit: p.unit && p.unit !== '—' ? p.unit : null,
      typeName: primary ? collName(primary, lang) : null, typeHref: primary ? `collections/${primary.slug}.html` : null,
      group: primary?.group || null, brandHref: `brands/${escapeHtml(brandSlugs.get(p.brand))}.html`,
      brandOverview: lang === 'en' ? (majorBrandContent[p.brand] ? `${majorBrandContent[p.brand].overview} ${majorBrandContent[p.brand].buyerFit}` : null) : null,
      variants: variants.map(v => ({ name: nameIn(v, lang), href: `products/${encodeURIComponent(v.id)}.html` })),
    });
    const html = `<!doctype html>
<html lang="${HTML_LANG[lang]}">
<head>
${commonHead({ lang, title, description, rel, type: 'product', image, ld: [productLd, breadcrumbLd] })}
</head>
<body>
  <div id="site-header"></div>
  <main id="pdp" data-product-id="${escapeHtml(p.id)}">
    <div class="container pdp-wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">${t.home}</a><span class="sep">/</span><a href="categories/${escapeHtml(p.category)}.html">${escapeHtml(category)}</a><span class="sep">/</span><span class="cur">${escapeHtml(name)}</span></nav>
      <div class="pdp-grid">
        <div class="pdp-media">${productPhoto ? `<img class="prod-photo loaded" src="assets/products/${encodeURIComponent(jan)}.jpg" alt="${escapeHtml(name)} — JAN ${escapeHtml(jan)}" width="600" height="600" loading="eager" decoding="async">` : `<span class="product-photo-placeholder"><strong>${escapeHtml(p.brand)}</strong><span>${t.photoPending}</span><small>JAN ${escapeHtml(jan)}</small></span>`}</div>
        <div class="pdp-info">
          <span class="cat">${escapeHtml(category)}</span>
          <h1>${escapeHtml(name)}</h1>
${altName ? `          <p class="pdp-name-ja" lang="${altName.l}">${escapeHtml(altName.text)}</p>\n` : ''}          <p class="brand"><a href="brands/${escapeHtml(brandSlugs.get(p.brand))}.html">${escapeHtml(p.brand)}</a></p>
          <p class="pdp-blurb">${escapeHtml(t.blurb)}</p>
          <div class="pdp-specs">
            <div><span>${escapeHtml(t.unit)}</span><b>${escapeHtml(p.unit || '—')}</b></div><div><span>${escapeHtml(t.moq)}</span><b>${escapeHtml(p.moq || '—')}</b></div>
            <div><span>${escapeHtml(t.jan)}</span><b>${escapeHtml(jan)}</b></div><div><span>${escapeHtml(t.origin)}</span><b>${escapeHtml(!p.origin || /not verified|not independently verified/i.test(p.origin) ? t.confirmOrigin : p.origin)}</b></div>
          </div>
          <div class="pdp-actions"><a class="btn btn-primary btn-lg" href="how-to-order.html?product=${encodeURIComponent(p.id)}&amp;name=${encodeURIComponent(name)}&amp;brand=${encodeURIComponent(p.brand)}#request">${t.requestPrice}</a><a class="btn btn-outline btn-lg" href="mailto:info@japanitem.com?subject=${encodeURIComponent(`${t.quoteSubject}: ${name} (${p.id})`)}">${t.contact}</a></div>
          <p class="pdp-package-note">${escapeHtml(t.packageNote)}</p>
          ${(p.verified_specs?.length || p.shelf_life || p.spec_source || p.spec_range_source) ? `<details class="pdp-evidence"><summary>${t.specs}</summary><div class="pdp-evidence-body"><dl class="pdp-evidence-list">${p.shelf_life ? `<div><dt>Catalog shelf life (not remaining shelf life)</dt><dd>${escapeHtml(p.shelf_life)}</dd></div>` : ''}${(p.verified_specs || []).map(spec => `<div><dt>${escapeHtml(spec.name)}</dt><dd>${escapeHtml(spec.value)}</dd></div>`).join('')}</dl>` : ''}
          ${p.spec_source ? `<p class="product-compliance-note">Source: <a href="${escapeHtml(p.spec_source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.spec_source_name || 'Manufacturer product information')}</a> · Checked ${escapeHtml(p.spec_checked_on)}. ${escapeHtml(p.spec_match_note)}. The supplied package label takes precedence.</p>` : ''}
          ${p.spec_range_source ? `<p class="product-compliance-note">Additional manufacturer reference: <a href="${escapeHtml(p.spec_range_source)}" target="_blank" rel="noopener noreferrer">Lion product-family information</a>. ${escapeHtml(p.spec_range_note)}</p>` : ''}
          ${(p.verified_specs?.length || p.shelf_life || p.spec_source || p.spec_range_source) ? '</div></details>' : ''}
        </div>
      </div>
      ${copy}
      <section class="related seo-related" aria-labelledby="related-products"><div class="section-head"><div><span class="eyebrow">${t.moreFrom}</span><h2 class="h" id="related-products">${t.related}</h2></div><a href="brands/${escapeHtml(brandSlugs.get(p.brand))}.html">${escapeHtml(t.viewBrand(p.brand))}</a></div><div class="product-grid cols-4">${related.map(x => productCard(x, lang)).join('')}</div></section>
    </div>
  </main>
${productCollections.length ? `  <nav class="container section-sm shop-by-type" aria-labelledby="shop-by-type"><span class="eyebrow">${t.shopByType}</span><h2 class="h" id="shop-by-type">${escapeHtml(t.moreType(collName(primary, lang)))}</h2>${collectionLinksIn(productCollections, lang)}</nav>\n` : ''}  <div id="site-footer">${staticFooterNav(lang)}</div>
${scripts()}
</body>
</html>
`;
    writePage(lang, rel, html);
  }
}

function writeListingPage({ lang, rel, title, description, eyebrow, heading, intro, list, parent, editorial = null, extra = '' }) {
  const t = T[lang];
  const collectionLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: heading, inLanguage: HTML_LANG[lang],
    description, url: abs(lang, rel),
    mainEntity: { '@type': 'ItemList', numberOfItems: list.length, itemListElement: list.slice(0, 50).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(lang, `products/${encodeURIComponent(p.id)}.html`), name: nameIn(p, lang) })) },
  };
  const html = `<!doctype html>
<html lang="${HTML_LANG[lang]}">
<head>
${commonHead({ lang, title, description, rel, ld: [collectionLd, breadcrumb([{ name: t.home, url: abs(lang, '') }, { name: parent, url: abs(lang, 'products.html') }, { name: heading, url: abs(lang, rel) }])] })}
</head>
<body>
  <div id="site-header"></div>
  <main id="content">
    <section class="page-hero seo-collection-hero"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">${t.home}</a><span class="sep">/</span><a href="products.html">${t.catalog}</a><span class="sep">/</span><span class="cur">${escapeHtml(heading)}</span></nav><span class="eyebrow">${escapeHtml(eyebrow)}</span><h1 class="tight">${escapeHtml(heading)}</h1><p>${escapeHtml(intro)}</p><div class="seo-count">${escapeHtml(t.count(list.length))}</div></div></section>
    ${editorial ? `<section class="section-sm brand-editorial"><div class="container"><div class="brand-editorial-grid"><div><span class="eyebrow">${t.brandGuide}</span><h2 class="h">Source ${escapeHtml(heading.replace(/ Wholesale$/, ''))} from Japan</h2><p>${escapeHtml(editorial.overview)}</p><p>${escapeHtml(editorial.buyerFit)}</p></div><aside><strong>${t.orderingNote}</strong><p>${escapeHtml(editorial.handling)}</p><a href="how-to-order.html#request">${t.askAvailability}</a></aside></div></div></section>` : ''}
    <section class="section-sm"><div class="container"><div class="section-head"><div><span class="eyebrow">${t.featured}</span><h2 class="h">${t.fromJapan}</h2></div><a href="how-to-order.html#request">${t.requestQuote}</a></div><div class="product-grid cols-4">${list.slice(0, 12).map(p => productCard(p, lang)).join('')}</div></div></section>
    ${extra}
    <section class="section-sm seo-directory"><div class="container"><div class="section-head"><div><span class="eyebrow">${t.completeIndex}</span><h2 class="h">${t.browseEvery}</h2></div><a href="products.html">${t.searchFilter}</a></div>${compactProductLinks(list, lang)}</div></section>
  </main>
  <div id="site-footer">${staticFooterNav(lang)}</div>
${scripts()}
</body>
</html>`;
  writePage(lang, rel, html);
}

for (const [id] of activeCategories) {
  const list = products.filter(p => p.category === id).sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
  for (const lang of LANGS) {
    const name = catIn(id, lang);
    const copy = {
      en: { title: `${name} Wholesale from Japan | JAPANITEM`, description: `Browse ${list.length} authentic Japanese ${name.toLowerCase()} products for B2B wholesale. Search by brand or JAN/GTIN and request export pricing.`, intro: `Authentic ${name.toLowerCase()} sourced from Japanese distribution channels for retailers, importers and business buyers worldwide.` },
      zh: { title: `${name}批发 | 日本货源 | JAPANITEM`, description: `${list.length} 款日本${name}商品，面向零售商、进口商与企业采购。可按品牌或 JAN 查询，并询价批发出口。`, intro: `${name}类日本正品，来自日本国内正规流通渠道，供应全球零售商、进口商与企业采购。` },
      ja: { title: `${name}の卸売・輸出 | JAPANITEM`, description: `${name}の日本国内流通品 ${list.length} 点。ブランドや JAN で検索し、卸売・輸出価格をお問い合わせいただけます。`, intro: `日本国内の正規流通ルートから仕入れた${name}を、世界の小売店・輸入業者・法人のお客様へ卸売します。` },
    }[lang];
    writeListingPage({ lang, rel: `categories/${id}.html`, ...copy, eyebrow: T[lang].catEyebrow, heading: name, list, parent: T[lang].categories });
  }
}

for (const name of activeBrands) {
  const list = products.filter(p => p.brand === name).sort((a, b) => (a.name_en || a.name).localeCompare(b.name_en || b.name));
  const brand = brandData.get(name) || {};
  const editorial = majorBrandContent[name] || null;
  for (const lang of LANGS) {
    const copy = {
      en: {
        title: `${name} Wholesale Japan | ${list.length} Products | JAPANITEM`,
        description: editorial
          ? truncate(`Browse ${list.length} ${name} products for Japanese B2B wholesale. Search exact JAN/GTIN codes, compare variants and request export pricing from JAPANITEM.`, 155)
          : `Browse ${list.length} authentic ${name} products for Japanese B2B wholesale. Search JAN/GTIN codes and request export pricing from JAPANITEM.`,
        heading: `${name} Wholesale`,
        intro: editorial?.overview || brand.blurb || `Source authentic ${name} products from Japan for wholesale and international export.`,
      },
      zh: { title: `${name} 批发 | 日本货源 ${list.length} 款 | JAPANITEM`, description: `${name} 日本正品批发：共 ${list.length} 款商品，可按 JAN 精确查询规格与变体，并询价出口。`, heading: `${name} 批发`, intro: `${name} 日本国内流通正品，批发与出口。共 ${list.length} 款，按 JAN 列出，支持询价。` },
      ja: { title: `${name} 卸売・輸出 | ${list.length}商品 | JAPANITEM`, description: `${name} の日本国内流通品 ${list.length} 点を JAN ごとに掲載。バリエーションを比較し、輸出価格をお問い合わせいただけます。`, heading: `${name} 卸売`, intro: `${name} の日本国内流通品を卸売・輸出。${list.length} 商品を JAN ごとに掲載しています。` },
    }[lang];
    writeListingPage({ lang, rel: `brands/${brandSlugs.get(name)}.html`, ...copy, eyebrow: T[lang].brandEyebrow, list, parent: T[lang].brands, editorial: lang === 'en' ? editorial : null });
  }
}

for (const c of collections) {
  const brandCounts = new Map();
  for (const p of c.list) brandCounts.set(p.brand, (brandCounts.get(p.brand) || 0) + 1);
  const topBrands = [...brandCounts].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  const sameGroup = collections.filter(x => x !== c && x.group === c.group);
  const others = collections.filter(x => x !== c && x.group !== c.group);
  for (const lang of LANGS) {
    const t = T[lang];
    const name = collName(c, lang);
    const extra = `<section class="section-sm"><div class="container"><span class="eyebrow">${t.brandsInEyebrow}</span><h2 class="h">${escapeHtml(t.brandsIn(name))}</h2><div class="seo-brand-links">${topBrands.map(b => `<a href="brands/${escapeHtml(brandSlugs.get(b))}.html">${escapeHtml(b)} <small>(${brandCounts.get(b)})</small></a>`).join('')}</div><span class="eyebrow" style="display:block;margin-top:28px">${t.relatedColl}</span>${collectionLinksIn([...sameGroup, ...others], lang)}${guidesByCollection.has(c.slug) ? `<span class="eyebrow" style="display:block;margin-top:28px">${t.guidesEyebrow}</span>${guideLinks(guidesByCollection.get(c.slug), lang)}` : ''}</div></section>`;
    const copy = {
      en: { title: `${name} Wholesale | ${c.list.length} Products | JAPANITEM`, description: truncate(`Wholesale Japanese ${name.replace(/^Japanese /, '').toLowerCase()} from Japan: ${c.list.length} products from ${topBrands.slice(0, 4).join(', ')}. Search by JAN and request B2B export pricing.`, 155), heading: `${name} Wholesale` },
      zh: { title: `${name}批发 | ${c.list.length} 款 | JAPANITEM`, description: truncate(`${name}批发：共 ${c.list.length} 款，品牌包括 ${topBrands.slice(0, 4).join('、')}。可按 JAN 查询并询价出口。`, 150), heading: `${name}批发` },
      ja: { title: `${name}の卸売・輸出 | ${c.list.length}商品 | JAPANITEM`, description: truncate(`${name}の卸売：${topBrands.slice(0, 4).join('・')} など ${c.list.length} 商品。JAN で検索し、輸出価格をお問い合わせください。`, 150), heading: `${name}の卸売` },
    }[lang];
    writeListingPage({ lang, rel: `collections/${c.slug}.html`, ...copy, eyebrow: t.collEyebrow(groupIn(c.group, lang)), intro: collIntro(c, lang), list: c.list, parent: t.collections, extra });
  }
}

// ---------------------------------------------------------------------------
// Buying guides
// ---------------------------------------------------------------------------
const collectionBySlug = new Map(collections.map(c => [c.slug, c]));
for (const lang of LANGS) {
  const t = T[lang];
  for (const g of guides) {
    const rel = `guides/${g.slug}.html`;
    const related = g.collections.map(slug => collectionBySlug.get(slug)).filter(Boolean);
    const others = guides.filter(x => x !== g);
    const articleLd = {
      '@context': 'https://schema.org', '@type': 'Article', headline: g.title[lang], description: g.description[lang],
      inLanguage: HTML_LANG[lang], datePublished: g.date, dateModified: g.date, mainEntityOfPage: abs(lang, rel),
      author: { '@type': 'Organization', name: 'JAPANITEM by 和潤合同会社', url: SITE },
      publisher: { '@type': 'Organization', name: 'JAPANITEM by 和潤合同会社', logo: { '@type': 'ImageObject', url: 'https://www.japanitem.com/assets/brand/japanitem-logo-user.png' } },
      image: 'https://www.japanitem.com/assets/og.png',
    };
    const body = g.sections.map(sec => `        <h2>${escapeHtml(sec.h[lang])}</h2>\n${sec.p[lang].map(para => `        <p>${escapeHtml(para)}</p>`).join('\n')}`).join('\n');
    const html = `<!doctype html>
<html lang="${HTML_LANG[lang]}">
<head>
${commonHead({ lang, title: `${g.seoTitle?.[lang] || g.title[lang]} | JAPANITEM`, description: g.description[lang], rel, type: 'article', ld: [articleLd, breadcrumb([{ name: t.home, url: abs(lang, '') }, { name: t.guides, url: abs(lang, 'guides/index.html') }, { name: g.title[lang], url: abs(lang, rel) }])] })}
</head>
<body>
  <div id="site-header"></div>
  <main id="content">
    <article class="guide-article">
      <section class="page-hero"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">${t.home}</a><span class="sep">/</span><a href="guides/index.html">${t.guides}</a><span class="sep">/</span><span class="cur">${escapeHtml(g.title[lang])}</span></nav><span class="eyebrow">${t.guidesEyebrow}</span><h1 class="tight">${escapeHtml(g.title[lang])}</h1><p>${escapeHtml(g.description[lang])}</p><p class="guide-date">${t.published}: <time datetime="${g.date}">${g.date}</time></p></div></section>
      <section class="section-sm"><div class="container guide-body">
${body}
        <aside class="guide-cta"><h2>${t.ctaTitle}</h2><p>${t.ctaText}</p><a class="btn btn-primary" href="how-to-order.html#request">${t.ctaButton}</a></aside>
        ${related.length ? `<h2>${t.relatedCollections}</h2>${collectionLinksIn(related, lang)}` : ''}
        <h2>${t.moreGuides}</h2>${guideLinks(others, lang)}
      </div></section>
    </article>
  </main>
  <div id="site-footer">${staticFooterNav(lang)}</div>
${scripts()}
</body>
</html>`;
    writePage(lang, rel, html);
  }
  const indexLd = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: t.guides, inLanguage: HTML_LANG[lang], url: abs(lang, 'guides/index.html'),
    mainEntity: { '@type': 'ItemList', itemListElement: guides.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(lang, `guides/${g.slug}.html`), name: g.title[lang] })) },
  };
  writePage(lang, 'guides/index.html', `<!doctype html>
<html lang="${HTML_LANG[lang]}">
<head>
${commonHead({ lang, title: `${t.guides} | JAPANITEM`, description: t.guidesIntro, rel: 'guides/index.html', ld: [indexLd] })}
</head>
<body>
  <div id="site-header"></div>
  <main id="content">
    <section class="page-hero"><div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">${t.home}</a><span class="sep">/</span><span class="cur">${t.guides}</span></nav><span class="eyebrow">${t.guidesEyebrow}</span><h1 class="tight">${t.guides}</h1><p>${escapeHtml(t.guidesIntro)}</p></div></section>
    <section class="section-sm"><div class="container"><div class="guide-index">${guides.map(g => `<a class="guide-card" href="guides/${g.slug}.html"><h2>${escapeHtml(g.title[lang])}</h2><p>${escapeHtml(g.description[lang])}</p><span>${t.readGuide}</span></a>`).join('')}</div></div></section>
  </main>
  <div id="site-footer">${staticFooterNav(lang)}</div>
${scripts()}
</body>
</html>`);
}

// ---------------------------------------------------------------------------
// Core pages: products.html directory + footer per language, then /zh/ and /ja/ copies
// ---------------------------------------------------------------------------
const startMarker = '  <!-- SEO-DIRECTORY:START -->';
const endMarker = '  <!-- SEO-DIRECTORY:END -->';
const directoryFor = lang => `${startMarker}
  <section class="section-sm seo-directory" aria-labelledby="catalog-directory-title"><div class="container"><div class="section-head"><div><span class="eyebrow">${T[lang].crawlable}</span><h2 class="h" id="catalog-directory-title">${T[lang].shopByCatBrand}</h2></div></div><div class="seo-index-grid">${activeCategories.map(([id]) => `<a class="seo-index-card" href="categories/${id}.html"><strong>${escapeHtml(catIn(id, lang))}</strong><span>${T[lang].productsN(products.filter(p => p.category === id).length)}</span></a>`).join('')}</div><div class="seo-brand-links">${activeBrands.map(name => `<a href="brands/${escapeHtml(brandSlugs.get(name))}.html">${escapeHtml(name)}</a>`).join('')}</div><h3 class="h" style="margin-top:28px;font-size:20px">${T[lang].byType}</h3>${collectionLinksIn(collections, lang)}</div></section>
${endMarker}`;

const CORE = [
  { file: 'index.html', rel: '', key: 'home' },
  { file: 'products.html', rel: 'products.html', key: 'products' },
  { file: 'brands.html', rel: 'brands.html', key: 'brands' },
  { file: 'how-to-order.html', rel: 'how-to-order.html', key: 'how' },
  { file: 'faq.html', rel: 'faq.html', key: 'faq' },
];
const HREFLANG_START = '  <!-- HREFLANG:START -->';
const HREFLANG_END = '  <!-- HREFLANG:END -->';
const setHreflang = (html, rel) => {
  const block = `${HREFLANG_START}\n${alternates(rel)}\n${HREFLANG_END}`;
  if (html.includes(HREFLANG_START)) return html.replace(new RegExp(`${HREFLANG_START}[\\s\\S]*?${HREFLANG_END}`), block);
  return html.replace(/(\n\s*<link rel="canonical"[^>]*>)/, `$1\n${block}`);
};
const escAttr = v => escapeHtml(v);
const setMeta = (html, re, value) => html.replace(re, (m, a, b) => `${a}${escAttr(value)}${b}`);

for (const page of CORE) {
  const file = path.join(root, page.file);
  let html = fs.readFileSync(file, 'utf8');
  if (page.file === 'products.html') {
    html = html.includes(startMarker) && html.includes(endMarker)
      ? html.replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`), directoryFor('en'))
      : html.replace('  <div id="site-footer">', `${directoryFor('en')}\n\n  <div id="site-footer">`);
  }
  html = html.replace(/<div id="site-footer">(?:<nav class="static-footer-nav"[\s\S]*?<\/nav>)?<\/div>/, `<div id="site-footer">${staticFooterNav('en')}</div>`);
  html = setHreflang(html, page.rel);
  fs.writeFileSync(file, html, 'utf8');

  for (const lang of LANGS.filter(l => l !== 'en')) {
    const dict = L[lang];
    let out = html.replace(/<html lang="[^"]*"/, `<html lang="${HTML_LANG[lang]}"`);
    const title = dict[`seo.${page.key}.title`];
    const desc = dict[`seo.${page.key}.desc`];
    const ogDesc = dict[`seo.${page.key}.ogdesc`] || desc;
    const twDesc = dict[`seo.${page.key}.twdesc`] || desc;
    if (title) {
      out = out.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
      out = setMeta(out, /(<meta property="og:title" content=")[^"]*(")/, title);
      out = setMeta(out, /(<meta name="twitter:title" content=")[^"]*(")/, title);
    }
    if (desc) out = setMeta(out, /(<meta name="description" content=")[^"]*(")/, desc);
    if (ogDesc) out = setMeta(out, /(<meta property="og:description" content=")[^"]*(")/, ogDesc);
    if (twDesc) out = setMeta(out, /(<meta name="twitter:description" content=")[^"]*(")/, twDesc);
    out = out.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${abs(lang, page.rel)}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${abs(lang, page.rel)}$2`)
      .replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1${OG_LOCALE[lang]}$2`)
      .replace(/\s*<meta property="og:locale:alternate"[^>]*>/g, '');
    // Pre-render translated static text so crawlers see it before JS runs.
    out = out.replace(/(<([a-z0-9]+)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/g, (m, open, tag, key, inner, close) =>
      typeof dict[key] === 'string' ? `${open}${escapeHtml(dict[key])}${close}` : m);
    out = out.replace(/(<([a-z0-9]+)\b[^>]*\sdata-i18n-html="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/g, (m, open, tag, key, inner, close) =>
      typeof dict[key] === 'string' ? `${open}${dict[key]}${close}` : m);
    out = out.replace(/(<[^>]*\sdata-i18n-ph="([^"]+)"[^>]*\splaceholder=")[^"]*(")/g, (m, a, key, b) =>
      typeof dict[key] === 'string' ? `${a}${escapeHtml(dict[key])}${b}` : m);
    if (page.file === 'products.html') out = out.replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`), directoryFor(lang));
    out = out.replace(/<div id="site-footer">(?:<nav class="static-footer-nav"[\s\S]*?<\/nav>)?<\/div>/, `<div id="site-footer">${staticFooterNav(lang)}</div>`);
    // Core pages have no <base>; make asset paths root-absolute so they resolve under /zh/ and /ja/.
    out = out.replace(/((?:src|href)=")assets\//g, '$1/assets/')
      .replace(/((?:image)?srcset=")([^"]*)/g, (m, attr, value) => attr + value.replace(/(^|,\s*)assets\//g, '$1/assets/'));
    fs.writeFileSync(outFile(lang, page.file), localizeLinks(out, lang), 'utf8');
  }
}

const sourceDate = fs.statSync(path.join(root, 'assets/js/data.js')).mtime.toISOString().slice(0, 10);
const urlEntry = (loc, freq, priority) => `  <url><loc>${loc}</loc><lastmod>${sourceDate}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`;
const urls = [];
for (const lang of LANGS) {
  urls.push(
    ...CORE.map((page, index) => urlEntry(abs(lang, page.rel), index < 2 ? 'weekly' : 'monthly', index === 0 ? '1.0' : index === 1 ? '0.9' : '0.7')),
    ...activeCategories.map(([id]) => urlEntry(abs(lang, `categories/${id}.html`), 'weekly', '0.8')),
    ...collections.map(c => urlEntry(abs(lang, `collections/${c.slug}.html`), 'weekly', '0.8')),
    urlEntry(abs(lang, 'guides/index.html'), 'monthly', '0.7'),
    ...guides.map(g => urlEntry(abs(lang, `guides/${g.slug}.html`), 'monthly', '0.7')),
    ...activeBrands.map(name => urlEntry(abs(lang, `brands/${brandSlugs.get(name)}.html`), 'weekly', '0.8')),
    ...products.map(p => urlEntry(abs(lang, `products/${encodeURIComponent(p.id)}.html`), 'monthly', '0.7')),
  );
}
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`, 'utf8');

console.log(`Generated ${products.length} product pages, ${activeCategories.length} category pages, ${collections.length} collection pages, ${activeBrands.length} brand pages (x${LANGS.length} languages) and ${urls.length} sitemap URLs.`);
