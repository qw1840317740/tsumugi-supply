/* =========================================================
   KAISEI SANGYOU LLC. — i18n (EN / 中文 / 日本語)
   Static UI strings + category names. Product names stay as-is.
   ========================================================= */

const LANG_META = {
  en: { label: 'EN',    html: 'en', dir: 'ltr' },
  zh: { label: '中文',  html: 'zh-CN', dir: 'ltr' },
  ja: { label: '日本語', html: 'ja', dir: 'ltr' },
};
const LANG_ORDER = ['en', 'zh', 'ja'];
const LANG_KEY = 'tsumugi_lang';

const L = {
  en: {
    _name:'English',
    'a11y.skip':'Skip to content',
    // topbar / nav
    'topbar': `Ships worldwide — no payment needed to request a quote · <strong>¥25,000+ minimum order</strong>`,
    'nav.home':'Home', 'nav.products':'Products', 'nav.brands':'Brands', 'nav.howto':'How to Order', 'nav.faq':'FAQ',
    'mega.browse':'Browse', 'mega.viewall':'View all products', 'mega.allBrands':'All brands A–Z',
    'mega.curated':'12 curated houses', 'cur.search':'Search', 'cur.account':'Account', 'cur.cart':'Cart', 'cur.menu':'Menu',
    'mm.viewall':'View all', 'mm.allBrands':'All brands', 'mm.howto':'How to Order', 'mm.quote':'Request a quote',
    // currency / language toasts
    't.currency':'Showing prices in CUR',
    't.login':'Please contact us to open a wholesale account.',
    't.added':'Added ITEM · QTY pcs',
    't.saved':'Saved',
    't.subscribed':'Thanks — you are subscribed.',
    't.request':'Thank you! We will email your proforma invoice within 1 business day.',
    't.loginFirst':'Please sign in to request a quote.',
    't.moq':'Minimum order is ¥25,000 — add a little more.',
    't.moqAdd':'Add AMT more to reach the ¥25,000 minimum.',
    't.moqOk':'Minimum order reached — ready to request your invoice.',
    't.requestSent':'Thank you! We will reply within 1 business day.',
    // hero
    'hero.eyebrow':'Japan daily goods · B2B wholesale',
    'hero.h1.1':"Japan's everyday",
    'hero.h1.2':'essentials',
    'hero.h1.3':'sourced for your shelves.',
    'hero.lead':"From cult skincare to onsen bath salts, stationery and home care — we curate authentic Japanese brands and ship them wholesale to retailers across Japan and overseas. No payment to request a quote.",
    'hero.browse':'Browse the catalog', 'hero.howto':'How to order',
    'hero.sku':'¥10M','hero.skuL':'Capital', 'hero.brands':'2017','hero.brandsL':'Established',
    'hero.countries':'15+','hero.countriesL':'Categories', 'hero.day':'4','hero.dayL':'Licenses',
    'hero.badgeT':'Live stock, daily','hero.badgeS':'Freshest batches, latest packaging',
    'hero.f1':'Worldwide shipping — EMS & sea', 'hero.f2':'Authentic · sourced in Japan',
    // trust
    't.logistics':'Global logistics','t.logisticsL':'EMS air & consolidated sea freight',
    't.auth':'100% authentic','t.authL':'Direct from Japanese distributors',
    't.price':'Transparent pricing','t.priceL':'Wholesale JPY, no hidden fees',
    't.day':'1-day quotes','t.dayL':'Proforma invoice next business day',
    't.label':'Export docs','t.labelL':'Invoices & customs paperwork',
    // categories
    'cat.eyebrow':'Browse by category','cat.title.1':'Twelve shelves of','cat.title.2':'Japanese daily life',
    'cat.lead':'From the beauty counter to the laundry room — every category Japanese households reach for, ready to wholesale.',
    'cat.skus':'SKU','cat.skusPl':'SKUs',
    // featured
    'feat.eyebrow':'Bestsellers this month','feat.title':'What retailers are ordering now','feat.seeall':'See all products',
    // brand strip
    'bs.eyebrow':'Curated houses','bs.title':'The brands behind the shelves',
    'bs.lead':"A growing directory of Japanese makers — from botanical independents to beloved household names.",
    'bs.explore':'Explore all brands A–Z','bs.products':'products','bs.kind':'Kind',
    // why
    'why.eyebrow':'Why retailers choose Kaisei','why.title.1':'A sourcing partner,','why.title.2':'not just a supplier.',
    'why.lead':'We handle the hard parts of importing from Japan — sourcing authentic stock, negotiating bulk pricing, consolidating freight, and preparing customs paperwork — so you can focus on selling.',
    'why.cta':'Start an order',
    'why.f1t':'Authentic sourcing','why.f1d':'Every item is sourced through authorised Japanese distribution channels — serials and lot codes verified.',
    'why.f2t':'Better bulk pricing','why.f2d':'Tiered volume discounts kick in automatically, and we quote deeper on 5,000+ pcs per SKU.',
    'why.f3t':'Consolidated freight','why.f3d':'Mix brands and categories in one shipment — air for speed, sea for margin.',
    'why.f4t':'Export documentation','why.f4d':'Packing lists, invoices and customs paperwork prepared for smooth clearance.',
    // stats
    'stats.skuL':'Service regions — Kantō·Kansai·Kyūshū','stats.brandsL':'Prefectures covered',
    'stats.countriesL':'Major bank partners','stats.shippedL':'Product categories handled',
    // steps teaser
    'step.eyebrow':'Ordering in four moves','step.title':'From cart to customs, handled','step.full':'See the full process',
    's1t':'Add to cart','s1d':'Mix brands and categories. Prices shown are wholesale JPY.',
    's1m':'Choose your country and shipping method at checkout to draft a proforma invoice.',
    's2t':'Get your invoice','s2d':'We email a proforma invoice with shipping within 1 business day.',
    's2m':'Orders over 30 kg are re-quoted with exact freight before payment.',
    's3t':'Pay securely','s3d':'Wise bank transfer (recommended), PayPal or card. No fee on T/T.',
    's3m':"For T/T bank transfers, both sides' bank charges are borne by the buyer.",
    's4t':'We ship','s4d':'Orders ready at our warehouse within 7 business days, then global dispatch.',
    's4m':'3+ cartons of a single SKU may take longer — we confirm timelines upfront.',
    // testimonials
    'testi.eyebrow':'From our partners','testi.title':'Retailers in 40+ markets',
    'cred.eyebrow':'Company profile','cred.title':'Licensed, established, trusted','cred.pT':'Management philosophy','cred.pD':'Through trust and innovation, we create a rich lifestyle culture — always customer-first.','cred.lT':'Licensed operations','cred.lD':'Antique-dealer, pharmaceutical-sales, liquor-sales and controlled medical-device sales/leasing licences.','cred.aT':'Coverage and partners','cred.aD':'Kanto (Tokyo/Yokohama/Chiba/Gumma/Saitama), Kansai (Osaka/Kyoto/Kobe), Kyushu (Fukuoka). Banks: SMBC and Mizuho.',
    // cta home
    'cta.eyebrow':'No payment to inquire','cta.title':'Tell us what your shelves need.',
    'cta.lead':'Submit a product request or build a cart — we will send a proforma invoice with shipping within one business day. Call or email us.',
    'cta.quote':'Request a quote','cta.chat':'Contact us',
    // product card
    'pc.add':'Add QTY+ to cart','pc.per':'/ UNIT · MOQ QTY','pc.save':'Save',
    'pc.best':'Bestseller','pc.new':'New','pc.low':'Low stock',
    // shop page
    'shop.crumb':'Products','shop.eyebrow':'Wholesale catalog','shop.all':'All products',
    'shop.lead':'Authentic Japanese daily goods at wholesale JPY pricing. Filter by category or brand, add to cart, and request a proforma invoice — no payment needed to inquire.',
    'shop.cat':'Category','shop.brand':'Brand','shop.maxPrice':'Max unit price','shop.inStock':'In stock only',
    'shop.cantFind':"Can't find it? Request a product",'shop.results':'products','shop.allCat':'All categories',
    'shop.sortFeatured':'Sort: Featured','shop.sortLow':'Price: low to high','shop.sortHigh':'Price: high to low','shop.sortBrand':'Brand A–Z',
    'shop.search':'Search name or brand…','shop.allP':'All products',
    'shop.emptyT':'No products match','shop.emptyP':'Try clearing a filter or searching another term.',
    // brands page
    'bp.crumb':'Brands','bp.eyebrow':'Curated houses','bp.title':'Japanese brands, A to Z',
    'bp.lead':'A growing directory of makers we source wholesale — botanical independents, cult cosmetics houses and beloved everyday names.',
    'bp.brands':'brand','bp.brandsPl':'brands','bp.products':'products · view stock',
    // how to order
    'ht.crumb':'How to Order','ht.eyebrow':'Ordering','ht.title':'How to order in four steps',
    'ht.lead':'Build a cart, receive a proforma invoice by email, pay securely, and we handle sourcing, packing and global shipping. No payment is required to request a quote.',
    'ht.moq':'Minimum order amount: ¥25,000 JPY',
    'ht.s1m':'Choose your country and shipping method at checkout to draft a proforma invoice.',
    'ht.s2m':'Orders over 30 kg are re-quoted with exact freight before payment.',
    'ht.s3m':"For T/T bank transfers, both sides' bank charges are borne by the buyer.",
    'ht.s4m':'3+ cartons of a single SKU may take longer — we confirm timelines upfront.',
    // volume discount
    'vd.eyebrow':'Volume discount','vd.title':'The more you order, the less you pay per unit',
    'vd.lead':'Volume tiers are applied automatically to your cart subtotal. Need an even deeper price on a single SKU? Ask us about 5,000+ piece quotes.',
    'vd.cta':'Build a cart','vd.subtotal':'Order subtotal (JPY)','vd.discount':'Discount','vd.save':'You save',
    'vd.std':'Standard wholesale','vd.t1':'¥25,000 – ¥99,999','vd.t2':'¥100,000 – ¥299,999','vd.t3':'¥300,000 – ¥799,999','vd.t4':'¥800,000 – ¥1,999,999','vd.t5':'¥2,000,000+',
    'vd.bronze':'Bronze tier','vd.silver':'Silver tier','vd.gold':'Gold tier','vd.plat':'Platinum / custom','vd.dash':'—',
    // shipping
    'ship.eyebrow':'Shipping & fees','ship.title':'Two ways to receive your order',
    'sh1.t':'EMS air freight','sh1.d':'Fastest option — tracked, insured, 3–10 days to most destinations. Ideal for time-sensitive or high-value shipments under 30 kg.','sh1.p':'From ~¥2,800 / kg (varies by zone)',
    'sh2.t':'Consolidated sea freight','sh2.d':'Best landed cost for larger orders. We consolidate multiple brands into one shipment, 2–5 weeks transit, full documentation.','sh2.p':'Best value from ~¥50,000 order',

    'ship.note':'Final freight is confirmed in your proforma invoice. Duties and taxes are the buyer’s responsibility unless arranged otherwise.',
    // request form
    'req.eyebrow':"Can't find a product?",'req.title':'Request any Japanese product',
    'req.lead':"If an item isn't listed, send us the brand, product name or a photo. We'll source it through our Japanese distribution network and quote wholesale.",
    'req.wa':'Phone','req.em':'Email','req.cc':'Address','req.hours':'Mon–Fri · 9:00–18:00',
    'req.name':'Your name','req.company':'Company / shop','req.email':'Email','req.country':'Country',
    'req.product':'Product / brand you need','req.productPh':'e.g. Hanabira Snow Rice Lotion, 150ml','req.qty':'Estimated quantity',
    'req.notes':'Notes (link, photo reference, packaging needs)','req.notesPh':"Paste a product URL or describe what you're looking for…",
    'req.q1':'12–48 pcs','req.q2':'48–240 pcs','req.q3':'240–1,000 pcs','req.q4':'1,000–5,000 pcs','req.q5':'5,000+ pcs (bulk quote)',
    'req.send':'Send product request','req.phName':'Jane Tanaka','req.phCo':'Tanaka Beauty Co.','req.phEm':'you@shop.com','req.phCountry':'e.g. Singapore',
    // faq
    'faq.crumb':'FAQ','faq.eyebrow':'Help centre','faq.title':'Frequently asked questions',
    'faq.lead':'Everything about pricing, payment, shipping, authenticity and after-sales. Can’t find your answer? Message us by phone or email.',
    'faq.ctaEy':'Still have questions?','faq.ctaT':'Talk to a sourcing specialist','faq.ctaP':'We reply within one business day — usually much faster by phone.',
    'faq.wa':'Call us','faq.em':'Send an email',
    'q1':'Do I need to pay to request a quote?','a1':'No. Adding products to your cart and submitting a request is completely free — we email a proforma invoice with final pricing and shipping, and you decide whether to proceed before any payment.',
    'q2':'What is the minimum order amount?','a2':'The minimum order is <b>¥25,000 JPY</b> (subtotal, before shipping). The cart shows live progress toward the threshold, and volume discounts apply as your subtotal grows.',
    'q3':'Are all products authentic and sourced in Japan?','a3':'Yes. Every item is sourced through authorised Japanese distribution channels. We verify serial and lot codes and can provide documentation on request.',
    'q4':'Which payment methods do you accept?','a4':'Wise bank transfer (recommended — no handling fee), PayPal, and credit card. Card and PayPal carry a 3% handling fee. For T/T bank transfers, both sides’ bank charges are borne by the buyer.',
    'q5':'How is shipping calculated?','a5':'Shipping depends on destination, total weight and the method you choose (EMS air or consolidated sea). A draft estimate appears in your cart; the exact freight is confirmed in your proforma invoice. Orders over 30 kg are re-quoted for precision.',
    'q6':'How long until my order ships?','a6':'Orders are typically ready at our warehouse within <b>7 business days</b> of payment, then dispatched. Single-SKU orders of 3+ cartons may take a little longer — we confirm timelines before you pay.',
    'q7':'Can I get a better price on large volumes?','a7':'Yes. Automatic volume discounts apply from ¥100,000, and we quote bespoke pricing on <b>5,000+ pieces per SKU</b>. Contact us by phone or email for a bulk quote.',
    'q8':'Can you consolidate multiple brands into one shipment?','a8':'Yes — consolidation is core to what we do. We combine multiple brands and categories into a single air or sea shipment to lower your landed cost and simplify customs.',
    'q9':'What if a product is out of stock or renewed?','a9':'We always ship the latest available packaging and notify you of any product renewals or discontinuations. If a requested item is unavailable, we suggest the closest equivalent before invoicing.',
    'q10':'Can I become an exclusive distributor?','a10':'Possibly. We work with exclusive distributors in select markets. Tell us about your business and territory via the product request form and our team will follow up.',
    // cart drawer
    'cart.title':'Your order','cart.empty':'Your cart is empty.','cart.browse':'Browse products',
    'cart.subtotal':'Subtotal (ex. shipping)','cart.jpy':'JPY · wholesale price','cart.request':'Request invoice',
    'cart.keep':'Keep browsing','cart.nopay':'No payment now — we email a proforma invoice within 1 business day.',
    'cart.pc':'/ UNIT · MOQ QTY','cart.remove':'Remove',
    // footer
    'foot.about':'KAISEI SANGYOU LLC (開成産業合同会社) — a Japanese general wholesaler and trading company supplying daily goods, cosmetics, food, wellness and household products to retailers worldwide.',
    'foot.shop':'Shop','foot.company':'Company','foot.support':'Support','foot.news':'Stay in the loop',
    'foot.newsP':'Monthly stock drops, new houses and exclusive distributor offers.','foot.ph':'you@shop.com','foot.join':'Join',
    'foot.all':'All products','foot.brands':'Our brands','foot.howto':'How to order','foot.shipping':'Shipping & fees',
    'foot.discount':'Volume discount','foot.faq':'FAQ','foot.request':'Product request','foot.stock':"Today's stock",
    'foot.help':'Help centre','foot.copy':'All rights reserved.',
    // pdp
    'pdp.crumb':'Products','pdp.moq':'MOQ','pdp.unit':'Unit','pdp.sku':'SKU','pdp.brand':'Brand','pdp.cat':'Category',
    'pdp.addCart':'Add QTY+ to cart','pdp.buyNow':'Request invoice','pdp.save':'Save',
    'pdp.desc':'About this product','pdp.specs':'Specifications','pdp.origin':'Country of origin','pdp.related':'You may also like',
    'pdp.back':'Back to catalog','pdp.notfound':'Product not found','pdp.notfoundP':'We couldn’t find that item. Browse the catalog instead.',
    'pdp.tag.best':'Bestseller','pdp.tag.new':'New','pdp.tag.low':'Low stock',
    // category names
    'c.skincare':'Skincare','c.makeup':'Makeup','c.haircare':'Hair Care','c.bodycare':'Body Care','c.bath':'Bath & Wellness',
    'c.suncare':'Sun Care','c.oral':'Oral Care','c.home':'Home & Laundry','c.supplement':'Supplements','c.stationery':'Stationery','c.kits':'Sets & Kits','c.food':'Food & Drink',
  },

  zh: {
    _name:'中文',
    'a11y.skip':'跳到主要内容',
    'topbar':`全球发货 · 询价无需付款 · <strong>起订金额 ¥25,000+</strong>`,
    'nav.home':'首页','nav.products':'商品','nav.brands':'品牌','nav.howto':'下单流程','nav.faq':'常见问题',
    'mega.browse':'浏览','mega.viewall':'查看全部商品','mega.allBrands':'全部品牌 A–Z','mega.curated':'12 个精选品牌',
    'cur.search':'搜索','cur.account':'账户','cur.cart':'购物车','cur.menu':'菜单',
    'mm.viewall':'查看全部','mm.allBrands':'全部品牌','mm.howto':'下单流程','mm.quote':'获取报价',
    't.currency':'价格以 CUR 显示','t.login':'请联系我们开通批发账户。',
    't.added':'已加入 ITEM · QTY 件','t.saved':'已收藏','t.subscribed':'订阅成功，感谢关注。',
    't.request':'感谢！我们将在 1 个工作日内邮件发送形式发票。',
    't.loginFirst':'请先登录再提交报价请求。',
    't.moq':'最低起订金额为 ¥25,000 — 请再多加一点。',
    't.moqAdd':'再加 AMT 即可达 ¥25,000 起订金额。',
    't.moqOk':'已达起订金额 — 可以申请发票了。',
    't.requestSent':'感谢！我们将在 1 个工作日内回复。',
    'hero.eyebrow':'日本日用品 · 批发 B2B',
    'hero.h1.1':'把日本的日常',
    'hero.h1.2':'好物',
    'hero.h1.3':'搬到你的货架上。',
    'hero.lead':'从人气护肤品到温泉浴盐、文具与家居清洁。我们精选正品日本品牌，批发直货日本全国（関东・関西・関西・九州）及海外的零售商。询价无需付款。',
    'hero.browse':'浏览商品目录','hero.howto':'下单流程',
    'hero.sku':'¥10M','hero.skuL':'資本金', 'hero.brands':'2017','hero.brandsL':'設立',
    'hero.countries':'15+','hero.countriesL':'取扱品目', 'hero.day':'4','hero.dayL':'許認可',
    'hero.badgeT':'每日实时库存','hero.badgeS':'最新批次 · 最新包装',
    'hero.f1':'全球发货 — EMS 空运 & 海运','hero.f2':'正品保障 · 日本直采',
    't.logistics':'全球物流','t.logisticsL':'EMS 空运与拼箱海运','t.auth':'100% 正品','t.authL':'日本正规渠道直采',
    't.price':'价格透明','t.priceL':'批发日元价 · 无隐藏费用','t.day':'1 天报价','t.dayL':'次工作日出形式发票',
    't.label':'出口单证','t.labelL':'发票与清关单证',
    'cat.eyebrow':'按品类浏览','cat.title.1':'十二个货架的','cat.title.2':'日本日常好物',
    'cat.lead':'从美妆柜台到洗衣房 —— 日本家庭日常所需的每一个品类，皆可批发。',
    'cat.skus':'款','cat.skusPl':'款',
    'feat.eyebrow':'本月热销','feat.title':'零售商正在下单的商品','feat.seeall':'查看全部商品',
    'bs.eyebrow':'精选品牌','bs.title':'货架背后的品牌们',
    'bs.lead':'不断扩充的日本品牌库 —— 从植物系独立品牌到广受喜爱的国民品牌。',
    'bs.explore':'浏览全部品牌 A–Z','bs.products':'款商品','bs.kind':'类别',
    'why.eyebrow':'零售商为何选择 Kaisei','why.title.1':'不只是供应商，','why.title.2':'更是你的采购伙伴。',
    'why.lead':'我们包办从日本进口的所有繁琐环节 —— 正品采购、批量议价、拼箱货运、清关文件 —— 你只管安心卖货。',
    'why.cta':'开始下单',
    'why.f1t':'正品直采','why.f1d':'每件商品均通过日本正规授权渠道采购 —— 可核对序列号与批号。',
    'why.f2t':'批量更优价','why.f2d':'分层量贩折扣自动生效，单品 5,000+ 件可申请更深折扣。',
    'why.f3t':'拼箱货运','why.f3d':'多品牌多品类合并一票发货 —— 空运求快，海运求利润。',
    'why.f4t':'出口单证','why.f4d':'装箱单、发票与清关单证，保障顺利通关。',
    'stats.skuL':'服务区域——関東・関西・九州','stats.brandsL':'覆盖都道府县',
    'stats.countriesL':'主要合作银行','stats.shippedL':'取扱品类',
    'step.eyebrow':'四步完成下单','step.title':'从下单到清关，全程代办','step.full':'查看完整流程',
    's1t':'加入购物车','s1d':'多品牌多品类随心混搭。所示价格均为批发日元价。',
    's1m':'结算时选择目的国与运输方式，即可生成形式发票草稿。',
    's2t':'获取发票','s2d':'我们将在 1 个工作日内邮件发送含运费的形式发票。',
    's2m':'超过 30 kg 的订单会在付款前重新精确核算运费。',
    's3t':'安全付款','s3d':'推荐 Wise 银行转账，或 PayPal / 信用卡。T/T 无手续费。',
    's3m':'T/T 电汇的买卖双方银行手续费由买方承担。',
    's4t':'安排发货','s4d':'付款后通常 7 个工作日内于仓库备妥，随后全球发运。',
    's4m':'单品 3 箱以上的订单可能稍久 —— 我们会提前确认时间。',
    'testi.eyebrow':'合作伙伴评价','testi.title':'40+ 国家的零售商',
    'cred.eyebrow':'公司信息','cred.title':'资质 · 资历 · 信赖','cred.pT':'经营理念','cred.pD':'「通过信赖与革新，创造丰富的生活文化」——始终客户至上，提供高品质的产品与服务。','cred.lT':'官方许可','cred.lD':'持有古物商、医药品销售、酒类销售、高度管理医疗器械销售·租赁等许可。','cred.aT':'业务范围 · 合作银行','cred.aD':'覆盖关东（东京/神奈川/千叶/群马/埼玉）·关西（大阪/京都/神户）·九州（福冈）。合作银行：三井住友银行、瑞穗银行。',
    'cta.eyebrow':'询价无需付款','cta.title':'告诉我们你的货架需要什么。',
    'cta.lead':'提交寻货需求或选购加车 —— 我们将在一个工作日内发送含运费的形式发票。随时电话或邮件联系我们。',
    'cta.quote':'获取报价','cta.chat':'联系我们',
    'pc.add':'加入购物车 QTY+ 件','pc.per':'/ UNIT · 起订 QTY','pc.save':'收藏',
    'pc.best':'热销','pc.new':'新品','pc.low':'库存紧张',
    'shop.crumb':'商品','shop.eyebrow':'批发目录','shop.all':'全部商品',
    'shop.lead':'正品日本日用品，批发日元价。按品类或品牌筛选、加购并申请形式发票 —— 询价无需付款。',
    'shop.cat':'品类','shop.brand':'品牌','shop.maxPrice':'最高单价','shop.inStock':'仅看有货',
    'shop.cantFind':'没找到？提交寻货需求','shop.results':'款商品','shop.allCat':'全部分类',
    'shop.sortFeatured':'排序：推荐','shop.sortLow':'价格：从低到高','shop.sortHigh':'价格：从高到低','shop.sortBrand':'品牌 A–Z',
    'shop.search':'搜索名称或品牌…','shop.allP':'全部商品',
    'shop.emptyT':'没有符合条件的商品','shop.emptyP':'试试清除筛选或换个关键词。',
    'bp.crumb':'品牌','bp.eyebrow':'精选品牌','bp.title':'日本品牌 A 到 Z',
    'bp.lead':'我们批发采购的品牌库 —— 植物系独立品牌、人气彩妆与国民日用品牌。',
    'bp.brands':'个品牌','bp.brandsPl':'个品牌','bp.products':'款商品 · 查看库存',
    'ht.crumb':'下单流程','ht.eyebrow':'下单','ht.title':'四步完成下单',
    'ht.lead':'加选购物车，邮件接收形式发票，安全付款，由我们负责采购、打包与全球发货。询价无需付款。',
    'ht.moq':'起订金额：¥25,000 JPY',
    'ht.s1m':'结算时选择目的国与运输方式，即可生成形式发票草稿。',
    'ht.s2m':'超过 30 kg 的订单会在付款前重新精确核算运费。',
    'ht.s3m':'T/T 电汇的买卖双方银行手续费由买方承担。',
    'ht.s4m':'单品 3 箱以上的订单可能稍久 —— 我们会提前确认时间。',
    'vd.eyebrow':'量贩折扣','vd.title':'订得越多，单价越低',
    'vd.lead':'量贩折扣按购物车小计自动生效。单品想要更深折扣？可咨询 5,000+ 件报价。',
    'vd.cta':'去选购','vd.subtotal':'订单小计（JPY）','vd.discount':'折扣','vd.save':'你省下',
    'vd.std':'标准批发价','vd.t1':'¥25,000 – ¥99,999','vd.t2':'¥100,000 – ¥299,999','vd.t3':'¥300,000 – ¥799,999','vd.t4':'¥800,000 – ¥1,999,999','vd.t5':'¥2,000,000+',
    'vd.bronze':'铜级','vd.silver':'银级','vd.gold':'金级','vd.plat':'白金 / 定制','vd.dash':'—',
    'ship.eyebrow':'运输与费用','ship.title':'两种收货方式',
    'sh1.t':'EMS 空运','sh1.d':'最快方式 —— 可追踪、含保险，多数地区 3–10 天送达。适合 30 kg 以下时效或高价值订单。','sh1.p':'约 ¥2,800 / kg 起（因地区而异）',
    'sh2.t':'拼箱海运','sh2.d':'大单最优到岸价。多品牌合并一票，运输 2–5 周，全套单证。','sh2.p':'约 ¥50,000 订单起最具性价比',
    'ship.note':'最终运费以形式发票为准。除非另有约定，关税与税费由买方承担。',
    'req.eyebrow':'没找到商品？','req.title':'寻货任意日本商品',
    'req.lead':'若目录中没有，把品牌、品名或照片发给我们。我们将通过日本分销网络为你采购并报批发价。',
    'req.wa':'电话','req.em':'邮箱','req.cc':'地址','req.hours':'周一至周五 · 9:00–18:00',
    'req.name':'你的姓名','req.company':'公司 / 店铺','req.email':'邮箱','req.country':'国家',
    'req.product':'所需商品 / 品牌','req.productPh':'例如：Hanabira 雪米化妆水 150ml','req.qty':'预估数量',
    'req.notes':'备注（链接、参考图、包装需求）','req.notesPh':'粘贴商品链接或描述你的需求…',
    'req.q1':'12–48 件','req.q2':'48–240 件','req.q3':'240–1,000 件','req.q4':'1,000–5,000 件','req.q5':'5,000+ 件（批量报价）',
    'req.send':'发送寻货需求','req.phName':'张 三','req.phCo':'某某美妆有限公司','req.phEm':'you@shop.com','req.phCountry':'例如：新加坡',
    'faq.crumb':'常见问题','faq.eyebrow':'帮助中心','faq.title':'常见问题',
    'faq.lead':'关于价格、付款、运输、正品与售后的所有解答。没找到答案？电话或邮件联系我们。',
    'faq.ctaEy':'还有疑问？','faq.ctaT':'与采购顾问聊聊','faq.ctaP':'我们一个工作日内回复 —— 电话通常更快。',
    'faq.wa':'电话咨询','faq.em':'发送邮件',
    'q1':'询价需要付款吗？','a1':'不需要。加购并提交询价完全免费 —— 我们会邮件发送含最终价格与运费的形式发票，你在付款前自行决定是否下单。',
    'q2':'最低起订金额是多少？','a2':'起订金额为 <b>¥25,000 JPY</b>（小计，不含运费）。购物车会实时显示进度，小计越高折扣越大。',
    'q3':'所有商品都是日本正品吗？','a3':'是的。所有商品均通过日本正规授权渠道采购，可核对序列号与批号，需要可提供凭证。',
    'q4':'支持哪些付款方式？','a4':'推荐 Wise 银行转账（无手续费），也支持 PayPal 与信用卡。信用卡与 PayPal 收取 3% 手续费。T/T 电汇的买卖双方银行手续费由买方承担。',
    'q5':'运费如何计算？','a5':'运费取决于目的地、总重量与所选方式（EMS 空运或拼箱海运）。购物车会显示预估运费，最终运费以形式发票为准。超过 30 kg 的订单会重新精确核算。',
    'q6':'多久能发货？','a6':'付款后通常 <b>7 个工作日</b>内于仓库备妥，随后发运。单品 3 箱以上的订单可能稍久 —— 我们会在付款前确认时间。',
    'q7':'大量采购能更便宜吗？','a7':'可以。¥100,000 起自动享量贩折扣，单品 <b>5,000+ 件</b>可申请定制报价。电话或邮件联系获取批量价。',
    'q8':'可以把多个品牌合并成一票发货吗？','a8':'可以——拼箱是我们的核心服务。把多个品牌、品类合并成一票空运或海运，降低到岸成本、简化清关。',
    'q9':'商品缺货或更新怎么办？','a9':'我们始终发最新包装，并通知任何产品更新或停产。若所需商品缺货，开票前会推荐最接近的替代品。',
    'q10':'可以成为独家代理吗？','a10':'有可能。我们在部分市场设有独家代理。通过寻货表单告知你的业务与区域，团队会跟进。',
    'cart.title':'你的订单','cart.empty':'购物车是空的。','cart.browse':'浏览商品',
    'cart.subtotal':'小计（不含运费）','cart.jpy':'JPY · 批发价','cart.request':'申请发票',
    'cart.keep':'继续选购','cart.nopay':'无需立即付款 —— 我们将在 1 个工作日内邮件发送形式发票。',
    'cart.pc':'/ UNIT · 起订 QTY','cart.remove':'移除',
    'foot.about':'开成产业合同会社（KAISEI SANGYOU）—— 日本综合批发商社，为全球零售商供应日用品、化妆品、食品、健康与家居用品。',
    'foot.shop':'商品','foot.company':'公司','foot.support':'支持','foot.news':'保持联系',
    'foot.newsP':'每月上新、新品牌与独家代理优惠。','foot.ph':'you@shop.com','foot.join':'订阅',
    'foot.all':'全部商品','foot.brands':'我们的品牌','foot.howto':'下单流程','foot.shipping':'运输与费用',
    'foot.discount':'量贩折扣','foot.faq':'常见问题','foot.request':'寻货需求','foot.stock':'今日库存',
    'foot.help':'帮助中心','foot.copy':'保留所有权利。',
    'pdp.crumb':'商品','pdp.moq':'起订','pdp.unit':'规格','pdp.sku':'货号','pdp.brand':'品牌','pdp.cat':'品类',
    'pdp.addCart':'加入购物车 QTY+ 件','pdp.buyNow':'申请发票','pdp.save':'收藏',
    'pdp.desc':'商品介绍','pdp.specs':'规格参数','pdp.origin':'原产地','pdp.related':'你可能还喜欢',
    'pdp.back':'返回目录','pdp.notfound':'未找到该商品','pdp.notfoundP':'找不到这件商品，去看看目录吧。',
    'pdp.tag.best':'热销','pdp.tag.new':'新品','pdp.tag.low':'库存紧张',
    'c.skincare':'护肤','c.makeup':'彩妆','c.haircare':'护发','c.bodycare':'身体护理','c.bath':'入浴·养生',
    'c.suncare':'防晒','c.oral':'口腔护理','c.home':'家居·洗衣','c.supplement':'保健食品','c.stationery':'文具','c.kits':'套装礼盒','c.food':'食品饮料',
  },

  ja: {
    _name:'日本語',
    'a11y.skip':'主要内容へスキップ',
    'topbar':`世界中へ出荷 · 見積依頼は無料 · <strong>最小注文金額 ¥25,000+</strong>`,
    'nav.home':'ホーム','nav.products':'商品','nav.brands':'ブランド','nav.howto':'ご注文方法','nav.faq':'よくある質問',
    'mega.browse':'見る','mega.viewall':'すべての商品','mega.allBrands':'全ブランド A–Z','mega.curated':'厳選12ブランド',
    'cur.search':'検索','cur.account':'アカウント','cur.cart':'カート','cur.menu':'メニュー',
    'mm.viewall':'すべて見る','mm.allBrands':'全ブランド','mm.howto':'ご注文方法','mm.quote':'見積依頼',
    't.currency':'価格は CUR 表示','t.login':'口座開設はお問い合わせください。',
    't.added':'ITEM を追加 · QTY 個','t.saved':'保存しました','t.subscribed':'ご登録ありがとうございます。',
    't.request':'ありがとうございます！1営業日以内にプロフォーマインボイスをメールします。',
    't.loginFirst':'見積依頼にはサインインが必要です。',
    't.moq':'最小注文金額は ¥25,000 です。あと少しお買い求めください。',
    't.moqAdd':'あと AMT で ¥25,000 の最小注文に到達します。',
    't.moqOk':'最小注文金額に到達 — インボイス依頼できます。',
    't.requestSent':'ありがとうございます！1営業日以内にご返信します。',
    'hero.eyebrow':'日本の日用品 · B2B卸売',
    'hero.h1.1':'日本の毎日の',
    'hero.h1.2':'必需品',
    'hero.h1.3':'を、あなたの店頭へ。',
    'hero.lead':'話題のスキンケアから温泉入浴剤、文房具、ホームケアまで。本物の日本ブランドを厳選し、全国（関東・関西・九州）および海外の小売店へ卸売出荷します。見積依頼は無料です。',
    'hero.browse':'カタログを見る','hero.howto':'ご注文方法',
    'hero.sku':'¥10M','hero.skuL':'資本金', 'hero.brands':'2017','hero.brandsL':'設立',
    'hero.countries':'15+','hero.countriesL':'取扱品目', 'hero.day':'4','hero.dayL':'許認可',
    'hero.badgeT':'毎日のリアルタイム在庫','hero.badgeS':'最新ロット・最新パッケージ',
    'hero.f1':'世界出荷 — EMS航空便 & 船便','hero.f2':'正規品 · 日本直接仕入',
    't.logistics':'世界の物流','t.logisticsL':'EMS航空便と混載船便','t.auth':'100%正規品','t.authL':'日本の正規ルートから直接',
    't.price':'明瞭な価格','t.priceL':'卸売JPY・隠し費用なし','t.day':'1日の見積','t.dayL':'翌営業日にインボイス',
    't.label':'輸出書類','t.labelL':'インボイス・通関書類',
    'cat.eyebrow':'カテゴリーから探す','cat.title.1':'日本の毎日を','cat.title.2':'12の棚に。',
    'cat.lead':'美容コーナーから洗濯室まで —— 日本の家庭が毎日手にするカテゴリーを卸売で。',
    'cat.skus':'SKU','cat.skusPl':'SKU',
    'feat.eyebrow':'今月のベストセラー','feat.title':'今、小売店が買っている商品','feat.seeall':'すべての商品',
    'bs.eyebrow':'厳選ブランド','bs.title':'棚を支えるブランドたち',
    'bs.lead':'拡大中の日本ブランド集 —— 植物系インディーズから愛される定番まで。',
    'bs.explore':'全ブランド A–Z を見る','bs.products':'商品','bs.kind':'種類',
    'why.eyebrow':'小売店がKaiseiを選ぶ理由','why.title.1':'仕入先ではなく、','why.title.2':'パートナー。',
    'why.lead':'日本からの輸入の面倒な部分は全部引き受けます —— 正規品の仕入、数量割引の交渉、混載輸送、通関書類。あなたは販売に集中。',
    'why.cta':'注文を始める',
    'why.f1t':'正規品仕入','why.f1d':'全商品は日本の正規ルートから仕入。シリアル・ロット番号を確認します。',
    'why.f2t':'より良い数量価格','why.f2d':'段階的な数量割引が自動適用。SKU5,000個以上はさらに深い価格をご提案。',
    'why.f3t':'混載輸送','why.f3d':'複数ブランド・カテゴリーを一便に集約 —— 急ぎは航空、利益は船便。',
    'why.f4t':'輸出書類','why.f4d':'パッキングリスト・インボイス・通関書類を整備し、スムーズな通関を支援。',
    'stats.skuL':'サービスエリア——関東・関西・九州','stats.brandsL':'対応都道府県',
    'stats.countriesL':'主要取引銀行','stats.shippedL':'取扱品目',
    'step.eyebrow':'4ステップでご注文','step.title':'カートから通関までお任せ','step.full':'全行程を見る',
    's1t':'カートに追加','s1d':'複数ブランド・カテゴリーを自由に組み合わせ。表示価格は卸売JPY。',
    's1m':'決済時に国と配送方法を選ぶとプロフォーマインボイス草案が作成されます。',
    's2t':'インボイス受取','s2d':'送料込みのプロフォーマインボイスを1営業日以内にメール。',
    's2m':'30kg超の注文は、お支払い前に送料を再計算します。',
    's3t':'安全な決済','s3d':'Wise銀行送金（推奨）・PayPal・カード。T/Tは手数料なし。',
    's3m':'T/T銀行送金の双方の銀行手数料は買主負担です。',
    's4t':'出荷','s4d':'入金後通常7営業日以内に倉庫で準備完了、その後世界へ出荷。',
    's4m':'同SKU3箱以上は時間がかかる場合あり — 事前に所要をご案内します。',
    'testi.eyebrow':'パートナーの声','testi.title':'40ヶ国以上の小売店',
    'cred.eyebrow':'会社情報','cred.title':'許認可・実績・信頼','cred.pT':'経営理念','cred.pD':'「信頼と革新を通じて豊かな生活文化を創造する」——顧客第一主義で高品質な製品とサービスをお届けします。','cred.lT':'許認可','cred.lD':'古物商・医薬品販売業・酒類販売業・高度管理医療機器販売業・貸与業の許認可を取得。','cred.aT':'対応エリア・取引銀行','cred.aD':'関東（東京/神奈川/千葉/群馬/埼玉）・関西（大阪/京都/神戸）・九州（福岡）。取引銀行：三井住友銀行・みずほ銀行。',
    'cta.eyebrow':'見積は無料','cta.title':'店頭に必要なものを教えてください。',
    'cta.lead':'商品リクエストかカート作成を — 送料込みのプロフォーマインボイスを1営業日以内にお送りします。お電話・メールで気軽にどうぞ。',
    'cta.quote':'見積依頼','cta.chat':'お問い合わせ',
    'pc.add':'カートに追加 QTY+ 個','pc.per':'/ UNIT · 最小QTY','pc.save':'保存',
    'pc.best':'ベストセラー','pc.new':'新着','pc.low':'残りわずか',
    'shop.crumb':'商品','shop.eyebrow':'卸売カタログ','shop.all':'すべての商品',
    'shop.lead':'正規品の日本日用品を卸売JPY価格で。カテゴリーやブランドで絞り込み、カートに追加してプロフォーマインボイスをご依頼ください。見積は無料。',
    'shop.cat':'カテゴリー','shop.brand':'ブランド','shop.maxPrice':'上限単価','shop.inStock':'在庫ありのみ',
    'shop.cantFind':'見つからない？商品リクエスト','shop.results':'商品','shop.allCat':'全カテゴリー',
    'shop.sortFeatured':'並び順：おすすめ','shop.sortLow':'価格：安い順','shop.sortHigh':'価格：高い順','shop.sortBrand':'ブランド A–Z',
    'shop.search':'商品名やブランドを検索…','shop.allP':'すべての商品',
    'shop.emptyT':'該当する商品がありません','shop.emptyP':'絞り込みを解除するか、別のキーワードでお試しください。',
    'bp.crumb':'ブランド','bp.eyebrow':'厳選ブランド','bp.title':'日本ブランド A to Z',
    'bp.lead':'卸売で扱うブランド集 —— 植物系インディーズ、話題のコスメ、愛される定番まで。',
    'bp.brands':'ブランド','bp.brandsPl':'ブランド','bp.products':'商品 · 在庫を見る',
    'ht.crumb':'ご注文方法','ht.eyebrow':'ご注文','ht.title':'4ステップでご注文',
    'ht.lead':'カートを作成し、メールでインボイスを受取、安全に決済。仕入・梱包・世界出荷は当社が担当。見積は無料です。',
    'ht.moq':'最小注文金額：¥25,000 JPY',
    'ht.s1m':'決済時に国と配送方法を選ぶとプロフォーマインボイス草案が作成されます。',
    'ht.s2m':'30kg超の注文は、お支払い前に送料を再計算します。',
    'ht.s3m':'T/T銀行送金の双方の銀行手数料は買主負担です。',
    'ht.s4m':'同SKU3箱以上は時間がかかる場合あり — 事前に所要をご案内します。',
    'vd.eyebrow':'数量割引','vd.title':'多く注文するほど単価が下がります',
    'vd.lead':'数量割引はカート小計に自動適用。SKU単位でさらに深い価格をご希望？5,000個以上のお見積もりをご相談ください。',
    'vd.cta':'カートを作る','vd.subtotal':'注文小計（JPY）','vd.discount':'割引','vd.save':'節約',
    'vd.std':'標準卸売価格','vd.t1':'¥25,000 – ¥99,999','vd.t2':'¥100,000 – ¥299,999','vd.t3':'¥300,000 – ¥799,999','vd.t4':'¥800,000 – ¥1,999,999','vd.t5':'¥2,000,000+',
    'vd.bronze':'ブロンズ','vd.silver':'シルバー','vd.gold':'ゴールド','vd.plat':'プラチナ / カスタム','vd.dash':'—',
    'ship.eyebrow':'配送と費用','ship.title':'2つの受取方法',
    'sh1.t':'EMS航空便','sh1.d':'最速 — 追跡・補償付き、多くの地域に3〜10日。30kg以下の時限・高額注文に最適。','sh1.p':'〜¥2,800 / kg から（地域による）',
    'sh2.t':'混載船便','sh2.d':'大口に最適な着価格。複数ブランドを一便に集約、輸送2〜5週間、書類完備。','sh2.p':'〜¥50,000 以上がお得',
    'ship.note':'最終送料はプロフォーマインボイスで確定します。別途の取り決めがない限り、関税・税金は買主負担です。',
    'req.eyebrow':'商品が見つからない？','req.title':'あらゆる日本商品をリクエスト',
    'req.lead':'カタログに無ければ、ブランド・商品名・写真を送ってください。日本の販路から仕入し卸価をお見積もりします。',
    'req.wa':'電話','req.em':'メール','req.cc':'住所','req.hours':'月〜金 · 9:00〜18:00',
    'req.name':'お名前','req.company':'会社 / 店舗名','req.email':'メール','req.country':'国',
    'req.product':'必要な商品 / ブランド','req.productPh':'例：Hanabira Snow Rice Lotion 150ml','req.qty':'想定数量',
    'req.notes':'備考（URL・画像・パッケージ要件）','req.notesPh':'商品URLを貼るか、ご要望を記入…',
    'req.q1':'12〜48個','req.q2':'48〜240個','req.q3':'240〜1,000個','req.q4':'1,000〜5,000個','req.q5':'5,000+個（特別見積）',
    'req.send':'商品リクエストを送信','req.phName':'山田 花子','req.phCo':'〇〇ビューティー株式会社','req.phEm':'you@shop.com','req.phCountry':'例：シンガポール',
    'faq.crumb':'よくある質問','faq.eyebrow':'ヘルプセンター','faq.title':'よくある質問',
    'faq.lead':'価格・支払い・配送・正規品・アフターサービスについて。解決しない場合はお電話・メールへ。',
    'faq.ctaEy':'まだ質問がありますか？','faq.ctaT':'仕入スペシャリストに相談','faq.ctaP':'1営業日以内に返信 — お電話ならさらに早いです。',
    'faq.wa':'お電話でご相談','faq.em':'メールを送る',
    'q1':'見積依頼に支払いは必要ですか？','a1':'いいえ。カートに追加して依頼を出すのは完全無料です。最終価格と送料のプロフォーマインボイスをメールし、お支払い前にご判断いただけます。',
    'q2':'最小注文金額は？','a2':'最小注文は <b>¥25,000 JPY</b>（小計・送料別）。カートが進捗を表示し、小計に応じて数量割引が適用されます。',
    'q3':'すべて正規品で日本発ですか？','a3':'はい。全商品は日本の正規ルートから仕入。シリアル・ロット番号を確認し、ご要望で書類を提示します。',
    'q4':'支払い方法は？','a4':'Wise銀行送金（推奨・手数料無料）、PayPal、カード。カードとPayPalは3%の手数料。T/T銀行送金は双方の銀行手数料が買主負担。',
    'q5':'送料はどう決まりますか？','a5':'仕向地・総重量・方式（EMS航空または混載船便）で決まります。カートに概算を表示、確定送料はインボイスで通知。30kg超は再計算します。',
    'q6':'出荷までどのくらい？','a6':'入金後通常 <b>7営業日以内</b>に倉庫で準備完了し出荷。同SKU3箱以上はやや時間がかかる場合 — お支払い前にご案内します。',
    'q7':'大口で安くなりますか？','a7':'はい。¥100,000から自動で数量割引、SKU <b>5,000個以上</b>は個別見積。お電話かメールでご相談を。',
    'q8':'複数ブランドを1便にまとめられますか？','a8':'はい — 混載は当社の中核サービスです。複数ブランド・カテゴリーを1便（航空・船便）に集約し、着価格を下げ、通関をシンプルにします。',
    'q9':'欠品やリニューアルは？','a9':'常に最新パッケージを出荷し、リニューアルや廃盤をお知らせします。ご希望品が無い場合は、請求前に最も近い代替をご提案します。',
    'q10':'独占販売店になれますか？','a10':'可能性はあります。一部地域で独占販売店を募集しています。商品リクエストフォームから事業と地域をお知らせください。',
    'cart.title':'ご注文内容','cart.empty':'カートは空です。','cart.browse':'商品を見る',
    'cart.subtotal':'小計（送料別）','cart.jpy':'JPY · 卸売価格','cart.request':'インボイス依頼',
    'cart.keep':'買い物を続ける','cart.nopay':'今すぐのお支払い不要 — 1営業日以内にプロフォーマインボイスをメール。',
    'cart.pc':'/ UNIT · 最小QTY','cart.remove':'削除',
    'foot.about':'開成産業合同会社（KAISEI SANGYOU）は、日本の総合卸し問屋・商社として、日用品・化粧品・食品・健康食品・雑貨を国内外の小売店へお届けします。',
    'foot.shop':'商品','foot.company':'会社','foot.support':'サポート','foot.news':'最新情報を受け取る',
    'foot.newsP':'毎月の新着在庫、新ブランド、独占販売店向けオファー。','foot.ph':'you@shop.com','foot.join':'登録',
    'foot.all':'すべての商品','foot.brands':'取扱ブランド','foot.howto':'ご注文方法','foot.shipping':'配送と費用',
    'foot.discount':'数量割引','foot.faq':'よくある質問','foot.request':'商品リクエスト','foot.stock':'本日の在庫',
    'foot.help':'ヘルプセンター','foot.copy':'All rights reserved.',
    'pdp.crumb':'商品','pdp.moq':'最小単位','pdp.unit':'規格','pdp.sku':'SKU','pdp.brand':'ブランド','pdp.cat':'カテゴリー',
    'pdp.addCart':'カートに追加 QTY+ 個','pdp.buyNow':'インボイス依頼','pdp.save':'保存',
    'pdp.desc':'この商品について','pdp.specs':'仕様','pdp.origin':'原産国','pdp.related':'こちらもおすすめ',
    'pdp.back':'カタログへ戻る','pdp.notfound':'商品が見つかりません','pdp.notfoundP':'該当商品が見つかりません。カタログをご覧ください。',
    'pdp.tag.best':'ベストセラー','pdp.tag.new':'新着','pdp.tag.low':'残りわずか',
    'c.skincare':'スキンケア','c.makeup':'メイクアップ','c.haircare':'ヘアケア','c.bodycare':'ボディケア','c.bath':'入浴・ウェルネス',
    'c.suncare':'UVケア','c.oral':'オーラルケア','c.home':'家事・洗濯','c.supplement':'サプリメント','c.stationery':'文具','c.kits':'ギフトセット','c.food':'食品',
  },
};

/* ---------- engine ---------- */
let _lang = (localStorage.getItem(LANG_KEY) || 'en');
if(!L[_lang]) _lang = 'en';

function getLang(){ return _lang; }
function setLang(l){
  if(!L[l]) return;
  _lang = l; localStorage.setItem(LANG_KEY, l);
  applyI18n();
}
function cycleLang(){
  const i = LANG_ORDER.indexOf(_lang);
  setLang(LANG_ORDER[(i+1) % LANG_ORDER.length]);
}
function t(key, fallback){
  const v = L[_lang] && L[_lang][key];
  if(v === undefined){ // fallback to en then key
    return (L.en && L.en[key] !== undefined) ? L.en[key] : (fallback !== undefined ? fallback : key);
  }
  return v;
}
// t with token replacement: t2('pc.add', {QTY:12, UNIT:'150ml'})
function t2(key, vars, fallback){
  let s = t(key, fallback);
  if(vars) for(const k in vars){ s = s.split(k).join(vars[k]); }
  return s;
}

const _renderers = [];
function addRenderer(fn){ _renderers.push(fn); }
function runRenderers(){ _renderers.forEach(f=>{ try{ f(); }catch(e){ console.error('renderer error', e); } }); }

function applyI18n(){
  const meta = LANG_META[_lang];
  document.documentElement.setAttribute('lang', meta.html);

  // static nodes
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    const v = t(k);
    if(typeof v === 'string') el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el=>{
    const k = el.getAttribute('data-i18n-html');
    const v = t(k);
    if(typeof v === 'string') el.innerHTML = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    const k = el.getAttribute('data-i18n-ph');
    const v = t(k);
    if(typeof v === 'string') el.setAttribute('placeholder', v);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{
    const k = el.getAttribute('data-i18n-title');
    const v = t(k);
    if(typeof v === 'string'){ el.setAttribute('title', v); el.setAttribute('aria-label', v); }
  });

  // lang pill
  if(typeof syncDD==='function') syncDD('langDD', _lang, LANG_META[_lang] && LANG_META[_lang].label);

  runRenderers();
}

window.LANG_META = LANG_META; window.LANG_ORDER = LANG_ORDER;
window.getLang = getLang; window.setLang = setLang; window.cycleLang = cycleLang;
window.t = t; window.t2 = t2; window.addRenderer = addRenderer; window.runRenderers = runRenderers;
window.applyI18n = applyI18n;
