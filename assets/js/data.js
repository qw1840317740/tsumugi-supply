/* =========================================================
   TSUMUGI SUPPLY CO. — Sample catalog data
   Catalog data. Replace these sample brands, products and prices
   with your real catalog before going live.
   ========================================================= */

const CATEGORIES = [
  { id:'skincare',  name:'Skincare',      glyph:'肌', desc:'Lotion, serum, cream, masks' },
  { id:'makeup',    name:'Makeup',        glyph:'艶', desc:'Foundation, lip, eye color' },
  { id:'haircare',  name:'Hair Care',     glyph:'髪', desc:'Shampoo, treatment, styling' },
  { id:'bodycare',  name:'Body Care',     glyph:'肌', desc:'Soap, hand & foot care' },
  { id:'bath',      name:'Bath & Wellness', glyph:'湯', desc:'Bath salts, onsen tabs' },
  { id:'suncare',   name:'Sun Care',      glyph:'陽', desc:'SPF, UV protection' },
  { id:'oral',      name:'Oral Care',     glyph:'歯', desc:'Toothpaste, brushes' },
  { id:'home',      name:'Home & Laundry',glyph:'住', desc:'Detergent, cleaners' },
  { id:'supplement',name:'Supplements',   glyph:'健', desc:'Collagen, daily support' },
  { id:'stationery',name:'Stationery',    glyph:'筆', desc:'Pens, notebooks, tape' },
  { id:'kits',      name:'Sets & Kits',   glyph:'組', desc:'Gift sets, travel kits' },
  { id:'food',      name:'Food & Drink',  glyph:'味', desc:'Tea, snacks, pantry' },
];

const BRANDS = [
  { name:'Hanabira',      kana:'花弁', letter:'H', hue:'#BE5A38', blurb:'Botanical skincare from Hokkaido', items:9,  kind:'Skincare' },
  { name:'Yukiho',        kana:'雪穂', letter:'Y', hue:'#21463D', blurb:'Snow-moisture hair & body line',   items:6,  kind:'Hair / Body' },
  { name:'Rinto',         kana:'凛途', letter:'R', hue:'#BE9B4A', blurb:'Minimalist colour cosmetics',      items:8,  kind:'Makeup' },
  { name:'Aoyagi',        kana:'青柳', letter:'A', hue:'#2F5A4F', blurb:'Barbershop-grade men\'s grooming', items:5,  kind:'Grooming' },
  { name:'Suiren',        kana:'睡蓮', letter:'S', hue:'#5B8C7F', blurb:'Water-lily sensitive-skin care',  items:7,  kind:'Skincare' },
  { name:'Mochiko',       kana:'餅粉', letter:'M', hue:'#C2603F', blurb:'Rice-ferment brightening range',   items:6,  kind:'Skincare' },
  { name:'Hinoki Lab',    kana:'檜',   letter:'H', hue:'#3E5A45', blurb:'Cypress-scented bath & home',      items:8,  kind:'Bath / Home' },
  { name:'Tsukikage',     kana:'月影', letter:'T', hue:'#3A4A66', blurb:'Night-repair serums & masks',      items:5,  kind:'Skincare' },
  { name:'Akaoni',        kana:'赤鬼', letter:'A', hue:'#9C3B2E', blurb:'Bold long-wear lip & eye',         items:7,  kind:'Makeup' },
  { name:'Kogane',        kana:'黄金', letter:'K', hue:'#B8923D', blurb:'Gold-infused anti-aging',          items:4,  kind:'Premium' },
  { name:'Midori Shokudo',kana:'緑',   letter:'M', hue:'#4A7C59', blurb:'Plant-based supplements',          items:9,  kind:'Supplement' },
  { name:'Sumi Ink',      kana:'墨',   letter:'S', hue:'#20211C', blurb:'Artisan stationery & ink',         items:11, kind:'Stationery' },
];

const PRODUCTS = [
  { id:'P-1001', name:'Snow Rice Lotion (Toner)',     brand:'Hanabira',      category:'skincare',  price:1280, glyph:'肌', hue:'#BE5A38', tag:'best', moq:12, unit:'150ml' },
  { id:'P-1002', name:'Hokkaido Birch Serum',         brand:'Hanabira',      category:'skincare',  price:2480, glyph:'滴', hue:'#BE5A38', tag:'best', moq:12, unit:'30ml' },
  { id:'P-1003', name:'Botanical Recovery Cream',     brand:'Hanabira',      category:'skincare',  price:3180, glyph:'壺', hue:'#BE5A38', tag:'',     moq:6,  unit:'50g' },
  { id:'P-1004', name:'Snow Lotus Hair Shampoo',      brand:'Yukiho',        category:'haircare',  price:1620, glyph:'髪', hue:'#21463D', tag:'',     moq:12, unit:'480ml' },
  { id:'P-1005', name:'Snow Lotus Treatment Mask',    brand:'Yukiho',        category:'haircare',  price:1840, glyph:'泡', hue:'#21463D', tag:'new',  moq:12, unit:'480g' },
  { id:'P-1006', name:'Milk Whitening Body Soap',     brand:'Yukiho',        category:'bodycare',  price:1180, glyph:'磨', hue:'#21463D', tag:'',     moq:12, unit:'500ml' },
  { id:'P-1007', name:'Calm Velvet Foundation',       brand:'Rinto',         category:'makeup',    price:2980, glyph:'艶', hue:'#BE9B4A', tag:'best', moq:6,  unit:'30g' },
  { id:'P-1008', name:'Matte Lip Tint — 6 shades',    brand:'Rinto',         category:'makeup',    price:1680, glyph:'唇', hue:'#BE9B4A', tag:'best', moq:6,  unit:'3g' },
  { id:'P-1009', name:'Liquid Liner — Deep Black',    brand:'Rinto',         category:'makeup',    price:1380, glyph:'線', hue:'#BE9B4A', tag:'',     moq:12, unit:'0.5ml' },
  { id:'P-1010', name:'Barber Classic Shaving Foam',  brand:'Aoyagi',        category:'bodycare',  price:1480, glyph:'剃', hue:'#2F5A4F', tag:'',     moq:12, unit:'180g' },
  { id:'P-1011', name:'Daily Defence Sun Lotion SPF50',brand:'Suiren',       category:'suncare',   price:1980, glyph:'陽', hue:'#5B8C7F', tag:'best', moq:12, unit:'60g' },
  { id:'P-1012', name:'Sensitive Skin Face Wash',     brand:'Suiren',       category:'skincare',  price:1320, glyph:'泡', hue:'#5B8C7F', tag:'',     moq:12, unit:'120g' },
  { id:'P-1013', name:'Rice Paste Brightening Mask',  brand:'Mochiko',       category:'skincare',  price:2280, glyph:'膜', hue:'#C2603F', tag:'new',  moq:10, unit:'5pcs' },
  { id:'P-1014', name:'Fermented Rice Essence',       brand:'Mochiko',       category:'skincare',  price:3880, glyph:'壺', hue:'#C2603F', tag:'',     moq:6,  unit:'40ml' },
  { id:'P-1015', name:'Cypress Onsen Bath Salt',      brand:'Hinoki Lab',    category:'bath',      price:980,  glyph:'湯', hue:'#3E5A45', tag:'best', moq:24, unit:'30g×5' },
  { id:'P-1016', name:'Hinoki Wood Room Mist',        brand:'Hinoki Lab',    category:'home',      price:1480, glyph:'森', hue:'#3E5A45', tag:'',     moq:12, unit:'100ml' },
  { id:'P-1017', name:'Moon Repair Night Serum',      brand:'Tsukikage',     category:'skincare',  price:4680, glyph:'月', hue:'#3A4A66', tag:'best', moq:6,  unit:'30ml' },
  { id:'P-1018', name:'Silk Sheet Mask (7-pack)',     brand:'Tsukikage',     category:'skincare',  price:2580, glyph:'夜', hue:'#3A4A66', tag:'low',  moq:6,  unit:'7pcs' },
  { id:'P-1019', name:'Red Oni 24h Lip Lacquer',      brand:'Akaoni',        category:'makeup',    price:1880, glyph:'赤', hue:'#9C3B2E', tag:'new',  moq:6,  unit:'4g' },
  { id:'P-1020', name:'Volcanic Charcoal Cleanser',   brand:'Akaoni',        category:'skincare',  price:1780, glyph:'墨', hue:'#9C3B2E', tag:'',     moq:12, unit:'150g' },
  { id:'P-1021', name:'Gold Infusion Eye Cream',      brand:'Kogane',        category:'skincare',  price:6480, glyph:'金', hue:'#B8923D', tag:'',     moq:4,  unit:'15g' },
  { id:'P-1022', name:'Green Barley Collagen Drink',  brand:'Midori Shokudo',category:'supplement',price:2980, glyph:'健', hue:'#4A7C59', tag:'best', moq:12, unit:'10×50ml' },
  { id:'P-1023', name:'Matcha Detox Tablets',         brand:'Midori Shokudo',category:'supplement',price:2280, glyph:'緑', hue:'#4A7C59', tag:'',     moq:12, unit:'90tabs' },
  { id:'P-1024', name:'Sumi Brush Pen — Fine',        brand:'Sumi Ink',      category:'stationery',price:860,  glyph:'筆', hue:'#20211C', tag:'best', moq:24, unit:'1pc' },
  { id:'P-1025', name:'Washi Notebook A5',            brand:'Sumi Ink',      category:'stationery',price:1280, glyph:'冊', hue:'#20211C', tag:'',     moq:24, unit:'1pc' },
  { id:'P-1026', name:'Herbal Mint Toothpaste',       brand:'Suiren',        category:'oral',      price:780,  glyph:'歯', hue:'#5B8C7F', tag:'',     moq:24, unit:'120g' },
  { id:'P-1027', name:'Charcoal Soft Toothbrush',     brand:'Suiren',        category:'oral',      price:520,  glyph:'磨', hue:'#5B8C7F', tag:'',     moq:48, unit:'1pc' },
  { id:'P-1028', name:'Onsen Gift Set (3 items)',     brand:'Hinoki Lab',    category:'kits',      price:4980, glyph:'組', hue:'#3E5A45', tag:'new',  moq:6,  unit:'set' },
  { id:'P-1029', name:'Uji Matcha Latte Sachets',     brand:'Midori Shokudo',category:'food',      price:1880, glyph:'茶', hue:'#4A7C59', tag:'best', moq:12, unit:'20 sticks' },
  { id:'P-1030', name:'Snow Lotus Travel Kit',        brand:'Yukiho',        category:'kits',      price:3980, glyph:'組', hue:'#21463D', tag:'low',  moq:6,  unit:'5 items' },
];

window.CATEGORIES = CATEGORIES;
window.BRANDS = BRANDS;
window.PRODUCTS = PRODUCTS;
