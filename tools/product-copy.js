// Product-specific copy for generated product pages (EN / ZH / JA).
// Everything is derived from catalog facts: the English name (brand, line,
// variant, format, pack size), the product's collection, its sibling variants
// and verified specs. No claims beyond those facts.

const GROUPS = {
  'Oral Care': { zh: '口腔护理', ja: 'オーラルケア' },
  'Laundry': { zh: '洗衣', ja: '洗濯' },
  'Kitchen': { zh: '厨房', ja: 'キッチン' },
  'Home Care': { zh: '居家清洁', ja: 'ホームケア' },
  'Hygiene': { zh: '卫生用品', ja: '衛生用品' },
  'Body Care': { zh: '身体护理', ja: 'ボディケア' },
  'Hair Care': { zh: '头发护理', ja: 'ヘアケア' },
  'Skincare': { zh: '护肤', ja: 'スキンケア' },
  'Makeup': { zh: '彩妆', ja: 'メイクアップ' },
  'Health': { zh: '健康', ja: 'ヘルスケア' },
  'Baby & Kids': { zh: '婴幼儿', ja: 'ベビー・キッズ' },
  'Food & Sweets': { zh: '食品与零食', ja: '食品・お菓子' },
};

// What a wholesale buyer should confirm for this type of product.
const GROUP_NOTES = {
  'Oral Care': {
    en: 'Many Japanese toothpastes and mouthwashes are sold as quasi-drugs (医薬部外品) in Japan. Rules on active ingredients such as fluoride and on labeling differ by destination market, so check your import requirements before ordering.',
    zh: '许多日本牙膏和漱口水在日本属于“医药部外品”。氟化物等有效成分及标签要求因进口国而异，下单前请先确认当地进口规定。',
    ja: '日本の歯みがき粉・洗口液の多くは医薬部外品です。フッ素などの有効成分や表示ルールは輸出先によって異なるため、ご注文前に輸入要件をご確認ください。' },
  'Laundry': {
    en: 'Bottles, refills and jumbo refill pouches are separate JANs with different case packs. Liquid and gel detergents are heavy; consolidated sea freight is usually the most economical way to ship mixed laundry orders.',
    zh: '瓶装、补充装和超大补充袋是不同的 JAN，每箱入数也不同。液体和凝胶洗涤剂较重，混装洗衣用品一般走拼箱海运最划算。',
    ja: '本体・詰替・ジャンボ詰替は別 JAN で、ケース入数も異なります。液体・ジェル洗剤は重量があるため、混載の海上輸送が最も経済的な場合が多いです。' },
  'Kitchen': {
    en: 'Dish soap is sold in bottles, upside-down bottles and refills of several sizes, each with its own JAN and case pack. Liquids ship most economically by consolidated sea freight.',
    zh: '洗洁精有普通瓶、倒置瓶和多种规格的补充装，各自有独立 JAN 和每箱入数。液体商品走拼箱海运最经济。',
    ja: '食器用洗剤は本体・逆さボトル・各種詰替があり、それぞれ JAN とケース入数が異なります。液体は混載の海上輸送が経済的です。' },
  'Home Care': {
    en: 'Main units and refills are listed separately. Sprays, foggers and some deodorizers can be restricted for air freight; we confirm a suitable shipping method with your quotation.',
    zh: '主体与替换装分开列出。喷雾、烟雾型及部分除臭产品空运可能受限，我们会在报价时确认合适的运输方式。',
    ja: '本体と付け替えは別掲載です。スプレー・くん煙剤・一部の消臭剤は航空輸送に制限がある場合があり、お見積り時に適切な輸送方法をご案内します。' },
  'Hygiene': {
    en: 'Alcohol-based sanitizers can be classified as dangerous goods for air freight, and hand-soap refills are bulky. Shipping method is confirmed with your quotation.',
    zh: '含酒精的消毒产品空运时可能被列为危险品，洗手液补充装体积较大，运输方式将在报价时确认。',
    ja: 'アルコール系の手指消毒剤は航空輸送で危険物扱いとなる場合があり、詰替は容積も大きいため、輸送方法はお見積り時に確認します。' },
  'Body Care': {
    en: 'Pump bottles and refill pouches have different JANs and case packs. Japanese labels list ingredients in Japanese; any destination-market labeling is arranged by the importer.',
    zh: '按压瓶与补充袋 JAN 和每箱入数不同。日本包装成分表为日文，进口国所需的标签由进口商负责。',
    ja: 'ポンプ本体と詰替パウチは JAN・ケース入数が異なります。成分表示は日本語のため、輸出先で必要な表示は輸入者側でご対応ください。' },
  'Hair Care': {
    en: 'Shampoo, conditioner and treatment are usually ordered as matching pairs; pumps, refills and extra-large refill pouches are separate JANs. Ingredient labels are in Japanese.',
    zh: '洗发水、护发素和发膜通常成套采购；按压瓶、补充装和特大补充袋是不同 JAN。成分标签为日文。',
    ja: 'シャンプー・コンディショナー・トリートメントはセットでの発注が一般的です。ポンプ・詰替・特大詰替は別 JAN。成分表示は日本語です。' },
  'Skincare': {
    en: 'Japanese skincare labels list ingredients in Japanese, and some items are quasi-drugs (医薬部外品) in Japan. Cosmetic registration and labeling rules depend on the destination market and are the importer\'s responsibility.',
    zh: '日本护肤品成分表为日文，部分商品在日本属于“医药部外品”。化妆品备案和标签要求取决于进口国，由进口商负责。',
    ja: 'スキンケアの成分表示は日本語で、一部は医薬部外品です。化粧品の届出や表示ルールは輸出先により異なり、輸入者側でのご対応となります。' },
  'Makeup': {
    en: 'Each shade is a separate JAN, so list the shade code with the quantity in your inquiry. Limited colors may not be re-supplied; availability is confirmed with your quotation.',
    zh: '每个色号都是独立 JAN，询价时请写明色号与数量。限定色可能不再补货，供货情况以报价为准。',
    ja: '色番号ごとに別 JAN のため、お問い合わせの際は色番号と数量をご記載ください。限定色は再入荷しない場合があり、在庫はお見積り時に確認します。' },
  'Health': {
    en: 'Import rules for supplements and personal-care items (permitted ingredients, health claims, registration) vary widely by country. Please confirm your market\'s requirements before ordering.',
    zh: '保健品与个人护理用品的进口规定（允许成分、功效宣称、注册备案）各国差异很大，下单前请确认当地要求。',
    ja: 'サプリメントや衛生用品の輸入規制（使用可能成分、表示、登録）は国によって大きく異なります。ご注文前に輸出先の要件をご確認ください。' },
  'Baby & Kids': {
    en: 'Baby food, snacks and drinks carry best-before dates; remaining shelf life at shipment is confirmed with your quotation. Diapers are light but bulky, so freight is usually charged by volume.',
    zh: '婴儿辅食、零食和饮品有保质期，发货时的剩余保质期会在报价时确认。纸尿裤重量轻但体积大，运费通常按体积计算。',
    ja: 'ベビーフード・おやつ・飲料には賞味期限があり、出荷時の残り期限はお見積り時に確認します。紙おむつは軽量でもかさばるため、運賃は容積で計算されるのが一般的です。' },
  'Food & Sweets': {
    en: 'Sweets have best-before dates and some markets require food-import registration. Remaining shelf life and packaging are confirmed with your quotation.',
    zh: '点心有保质期，部分国家还需办理食品进口注册。剩余保质期与包装将在报价时确认。',
    ja: 'お菓子には賞味期限があり、輸出先によっては食品輸入の届出が必要です。残り期限とパッケージはお見積り時に確認します。' },
};

const FORMS = [
  [/Refill Super Ultra Jumbo/i, { en: 'refill (Super Ultra Jumbo size)', zh: '补充装（超极大号）', ja: '詰替（超ウルトラジャンボ）' }],
  [/Refill Ultra Jumbo/i, { en: 'refill (Ultra Jumbo size)', zh: '补充装（极大号）', ja: '詰替（ウルトラジャンボ）' }],
  [/Refill Super Mega Jumbo/i, { en: 'refill (Super Mega Jumbo size)', zh: '补充装（超巨大号）', ja: '詰替（超メガジャンボ）' }],
  [/Refill (Tera|Hyper|Mega) Jumbo/i, { en: 'refill (jumbo size)', zh: '补充装（巨大号）', ja: '詰替（ジャンボサイズ）' }],
  [/Refill Super Jumbo/i, { en: 'refill (Super Jumbo size)', zh: '补充装（超大号）', ja: '詰替（超ジャンボ）' }],
  [/Refill Super Extra Large/i, { en: 'refill (Super Extra Large size)', zh: '补充装（超特大号）', ja: '詰替（超特大）' }],
  [/Refill Extra Large/i, { en: 'refill (Extra Large size)', zh: '补充装（特大号）', ja: '詰替（特大）' }],
  [/Refill Large/i, { en: 'refill (large size)', zh: '补充装（大号）', ja: '詰替（大型）' }],
  [/Refill \d+(\.\d+)?x Size|Refill \dx Size/i, { en: 'multi-use refill', zh: '多次量补充装', ja: '詰替（複数回分）' }],
  [/Refill Bonus Size/i, { en: 'refill (bonus size)', zh: '补充装（增量装）', ja: '詰替（増量）' }],
  [/Refill \d+ Pack|Refill 2 Pack|Refill 3 Pack|Refill 4 Pack/i, { en: 'refill multipack', zh: '替换装多件组', ja: '付け替え複数個パック' }],
  [/Main Unit \+ 1 Refill/i, { en: 'main unit with one refill', zh: '主体加一个替换装', ja: '本体＋付け替え1個' }],
  [/\bRefill\b/i, { en: 'refill', zh: '补充装', ja: '詰替' }],
  [/Upside-Down Bottle/i, { en: 'upside-down bottle', zh: '倒置瓶', ja: '逆さボトル' }],
  [/Large Bottle|Large Pump/i, { en: 'large bottle', zh: '大瓶装', ja: '大容量本体' }],
  [/\bPump\b/i, { en: 'pump bottle', zh: '按压瓶', ja: 'ポンプ本体' }],
  [/\bBottle\b/i, { en: 'bottle', zh: '瓶装', ja: '本体ボトル' }],
  [/\bContainer\b/i, { en: 'container', zh: '盒装', ja: '本体容器' }],
  [/Main Unit/i, { en: 'main unit', zh: '主体', ja: '本体' }],
  [/Standing Tube/i, { en: 'standing tube', zh: '直立管装', ja: 'スタンドチューブ' }],
  [/Trial Sachet/i, { en: 'trial sachet', zh: '试用装', ja: 'トライアルサシェ' }],
  [/Travel Size|Mini\b/i, { en: 'travel size', zh: '便携装', ja: '携帯・ミニサイズ' }],
];

const SIZE_RE = /(\d+(?:\.\d+)?\s?(?:ml|g|kg|L|cc))(?![a-z])(?:\s?x\s?\d+)?|\d+(?:\.\d+)?g\s?\+\s?\d+g|\b\d+\s(?:Sheets|Tablets|Capsules|Pods|Pads|Pieces|Packets|Packs|Sticks|Tabs)\b|\d+-Day Supply/gi;

function attributes(nameEn) {
  const form = FORMS.find(([re]) => re.test(nameEn))?.[1] || null;
  const sizes = [...new Set(nameEn.match(SIZE_RE) || [])];
  return { form, sizes };
}

// Line key: the part of the English name before variant details (scent, size, format).
function lineKey(p) {
  return `${p.brand}|${String(p.name_en || p.name).split(',')[0].replace(SIZE_RE, '').replace(/\s+/g, ' ').trim().toLowerCase()}`;
}

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ctx: { lang, typeName, typeHref, group, variants: [{name, href}], brandHref, categoryName, jan, moq, unit, specs }
function productCopyHtml(p, ctx) {
  const { lang } = ctx;
  const a = attributes(p.name_en || p.name);
  const form = a.form ? a.form[lang] : null;
  const sizes = a.sizes.join(', ');
  const note = ctx.group ? GROUP_NOTES[ctx.group]?.[lang] : null;
  const type = ctx.typeName;
  const T = {
    en: {
      h: 'About this product',
      p1: `${esc(p.name)} is ${type ? `a ${esc(type.replace(/^Japanese /, '').toLowerCase())} product` : 'a Japanese-market product'} from <a href="${ctx.brandHref}">${esc(p.brand)}</a>${p.name_ja ? `, sold in Japan as <span lang="ja">${esc(String(p.name_ja).normalize('NFKC'))}</span>` : ''}.`,
      p2: [form && `Format: ${esc(form)}.`, sizes && `Pack size stated in the product name: ${esc(sizes)}.`, `Catalog order unit: ${esc(ctx.unit || 'confirmed at quotation')}; case pack / MOQ: ${esc(ctx.moq || 'confirmed at quotation')}.`].filter(Boolean).join(' '),
      p3: `Quote it by JAN ${esc(ctx.jan)}${type ? `, or compare it with other items in <a href="${ctx.typeHref}">${esc(type)} wholesale</a>` : ''}.`,
      variants: 'Other sizes and variants in this line', notes: `Buying notes${ctx.group ? `: ${esc(ctx.group.toLowerCase())}` : ''}`,
      order: 'Ordering notes', orderList: ['Include this JAN / GTIN and your required quantity in the inquiry.', 'Tell us your destination market so we can confirm export terms.', 'Current packaging, lead time and lot availability are confirmed with your quotation.'],
    },
    zh: {
      h: '商品说明',
      p1: `${esc(p.name)} 是 <a href="${ctx.brandHref}">${esc(p.brand)}</a> 的${type ? esc(type.replace(/^日本/, '')) + '商品' : '日本市场商品'}${p.name_ja ? `，日本商品名为 <span lang="ja">${esc(String(p.name_ja).normalize('NFKC'))}</span>` : ''}。`,
      p2: [form && `规格形态：${esc(form)}。`, sizes && `商品名标示规格：${esc(sizes)}。`, `目录订购单位：${esc(ctx.unit || '报价时确认')}；每箱入数 / 起订量：${esc(ctx.moq || '报价时确认')}。`].filter(Boolean).join(''),
      p3: `询价时请提供 JAN ${esc(ctx.jan)}${type ? `，也可以在 <a href="${ctx.typeHref}">${esc(type)}批发</a> 中比较同类商品` : ''}。`,
      variants: '同系列其他规格与款式', notes: `采购须知${ctx.group ? `：${esc(GROUPS[ctx.group]?.zh || ctx.group)}` : ''}`,
      order: '下单说明', orderList: ['询价时请注明此 JAN / GTIN 与所需数量。', '请告知目的地国家，以便确认出口条件。', '实际包装、交期与供货批次将在报价时确认。'],
    },
    ja: {
      h: '商品について',
      p1: `${esc(p.name)}は、<a href="${ctx.brandHref}">${esc(p.brand)}</a> の${type ? esc(type) : '日本市場向け商品'}です${p.name_ja ? `（日本での商品名：<span lang="ja">${esc(String(p.name_ja).normalize('NFKC'))}</span>）` : ''}。`,
      p2: [form && `形態：${esc(form)}。`, sizes && `商品名記載の容量・入数：${esc(sizes)}。`, `カタログ発注単位：${esc(ctx.unit || 'お見積り時に確認')}、ケース入数・最小ロット：${esc(ctx.moq || 'お見積り時に確認')}。`].filter(Boolean).join(''),
      p3: `お見積りは JAN ${esc(ctx.jan)} でご依頼ください${type ? `。同じカテゴリーの商品は <a href="${ctx.typeHref}">${esc(type)}の卸売</a> で比較できます` : ''}。`,
      variants: '同シリーズの他のサイズ・バリエーション', notes: `仕入れの注意点${ctx.group ? `：${esc(GROUPS[ctx.group]?.ja || ctx.group)}` : ''}`,
      order: 'ご注文について', orderList: ['お問い合わせ時にこの JAN / GTIN とご希望数量をご記載ください。', '輸出条件確認のため、仕向け国をお知らせください。', '実際のパッケージ、納期、供給ロットはお見積り時に確認します。'],
    },
  }[lang];

  const variantList = ctx.variants.length
    ? `<h3>${T.variants}</h3><ul class="product-variants">${ctx.variants.map(v => `<li><a href="${v.href}">${esc(v.name)}</a></li>`).join('')}</ul>` : '';
  return `<section class="product-editorial" aria-labelledby="product-overview">
        <div class="product-copy-grid">
          <div class="product-copy-main"><h2 id="product-overview">${T.h}</h2><p>${T.p1}</p><p>${T.p2}</p><p>${T.p3}</p>${ctx.brandOverview ? `<p>${esc(ctx.brandOverview)}</p>` : ''}${variantList}${note ? `<h3>${T.notes}</h3><p>${esc(note)}</p>` : ''}</div>
          <aside class="product-order-card"><h2>${T.order}</h2><ul>${T.orderList.map(x => `<li>${x}</li>`).join('')}</ul></aside>
        </div>
      </section>`;
}

module.exports = { productCopyHtml, lineKey, attributes, GROUPS, GROUP_NOTES };
