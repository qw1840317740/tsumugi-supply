/* =========================================================
   KAISEI SANGYOU LLC. — Shared UI + commerce logic
   (vanilla JS, no dependencies). i18n-aware.
   ========================================================= */

const SITE = {
  name: 'Kaisei',
  full: 'KAISEI SANGYOU LLC',
  jaName: '開成産業合同会社',
  tagline: 'JAPAN WHOLESALE & TRADING',
  minOrder: 25000,
  currency: 'JPY',
  phone: '+81 4-9257-4332',
  fax: '+81 4-9265-8258',
  email: 'info@kaiseisg.com',
  address: '〒354-0021 3465 Tsuruba, Fujimi, Saitama, Japan',
  year: 2024,
};
const STORE_KEY = 'tsumugi_cart_v1';

/* ---------- helpers ---------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const jpy = n => '¥' + Number(n).toLocaleString('en-US');
// format a JPY amount in the currently selected display currency
function money(jpyAmt){
  const rate = RATES && RATES[cur] != null ? RATES[cur] : 1;
  const sym = (SYMS && SYMS[cur]) || '¥';
  const v = jpyAmt * rate;
  return cur === 'JPY'
    ? sym + Math.round(v).toLocaleString('en-US')
    : sym + v.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
}
const brandKana = name => (BRANDS.find(b=>b.name===name)||{}).kana || name.charAt(0);
const svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
function shade(hex, pct){
  const n = parseInt(hex.replace('#',''),16);
  const f = pct/100;
  const adj = c => pct>=0 ? Math.round(c + (255-c)*f) : Math.round(c*(1+f));
  const r=adj((n>>16)&255), g=adj((n>>8)&255), b=adj(n&255);
  return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const ICON = {
  cart:  svg('<circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M2.5 3.5h2l2.2 12.2a1.5 1.5 0 0 0 1.5 1.3h8.4a1.5 1.5 0 0 0 1.5-1.2L21 7.5H6"/>'),
  search:svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>'),
  user:  svg('<circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  menu:  svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  chev:  svg('<path d="m9 6 6 6-6 6"/>'),
  check: svg('<path d="m5 12 4.5 4.5L19 7"/>'),
  plus:  svg('<path d="M12 5v14M5 12h14"/>'),
  minus: svg('<path d="M5 12h14"/>'),
  trash: svg('<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13"/>'),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  star:  svg('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9z" fill="currentColor" stroke="none"/>'),
  x:     svg('<path d="m6 6 12 12M6 18 18 6"/>'),
  chat:  svg('<path d="M21 11.5a8 8 0 0 1-11.5 7.1L3 20l1.4-6.2A8 8 0 1 1 21 11.5z"/>'),
  mail:  svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  phone: svg('<path d="M5 4h3l2 5-2 1a12 12 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 1-2z"/>'),
  ship:  svg('<rect x="2" y="6" width="12" height="10" rx="1"/><path d="M14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>'),
  box:   svg('<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>'),
  shield:svg('<path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/><path d="m9 12 2 2 4-4"/>'),
  tag:   svg('<path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="7.5" r="1.4"/>'),
  leaf:  svg('<path d="M4 20c0-9 6-14 16-15-1 9-6 15-15 15"/><path d="M4 20c2-5 5-8 9-10"/>'),
  truck: svg('<rect x="2" y="4" width="13" height="11" rx="1"/><path d="M15 8h3.5L21 11v4h-6"/><circle cx="6" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>'),
  yen:   svg('<path d="M6 4l6 8 6-8M12 12v8M8 14h8M8 17h8"/>'),
  layers:svg('<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>'),
  heart: svg('<path d="M12 20s-7-4.5-9-9a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c-2 4.5-7 9-7 9z"/>'),
  spark: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>'),
  info:  svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
  back:  svg('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
};
window.ICON = ICON;

/* =========================================================
   PRODUCT ART — original SVG packaging illustrations
   ========================================================= */
let _artId = 0;
function labelBox(cx, cy, label, sub){
  return `<rect x="${cx-36}" y="${cy-13}" width="72" height="30" rx="5" fill="#ffffff" opacity="0.94"/>
    <text x="${cx}" y="${cy+1}" font-family="'Noto Serif JP',serif" font-size="15" fill="#20211C" text-anchor="middle" font-weight="600">${label}</text>
    <text x="${cx}" y="${cy+13}" font-family="'JetBrains Mono',monospace" font-size="6.5" fill="#8A8978" text-anchor="middle" letter-spacing="1.5">${sub}</text>`;
}
const SHAPES = {
  dropper:(h,l,s)=>`<rect x="108" y="40" width="24" height="22" rx="4" fill="${shade(h,-32)}"/>
    <rect x="116" y="22" width="8" height="20" rx="2" fill="${shade(h,-32)}"/>
    <rect x="92" y="62" width="56" height="138" rx="14" fill="${shade(h,40)}"/>
    <rect x="92" y="124" width="56" height="76" rx="14" fill="${h}" opacity="0.82"/>
    ${labelBox(120,150,l,s)}`,
  pump:(h,l,s)=>`<rect x="100" y="32" width="8" height="22" fill="${shade(h,-32)}"/>
    <rect x="90" y="22" width="28" height="14" rx="5" fill="${shade(h,-32)}"/>
    <rect x="92" y="58" width="56" height="142" rx="12" fill="${shade(h,40)}"/>
    <rect x="92" y="122" width="56" height="78" rx="12" fill="${h}" opacity="0.82"/>
    ${labelBox(120,150,l,s)}`,
  jar:(h,l,s)=>`<rect x="82" y="78" width="76" height="120" rx="12" fill="${shade(h,40)}"/>
    <rect x="82" y="120" width="76" height="78" rx="12" fill="${h}" opacity="0.82"/>
    <rect x="76" y="60" width="88" height="24" rx="6" fill="${shade(h,-32)}"/>
    ${labelBox(120,150,l,s)}`,
  tube:(h,l,s)=>`<path d="M96 66 Q96 60 102 60 L138 60 Q144 60 144 66 L138 188 Q136 197 130 197 L110 197 Q104 197 102 188 Z" fill="${shade(h,40)}"/>
    <path d="M102 132 L138 132 L138 188 Q136 197 130 197 L110 197 Q104 197 102 188 Z" fill="${h}" opacity="0.8"/>
    <rect x="104" y="197" width="32" height="16" rx="3" fill="${shade(h,-32)}"/>
    ${labelBox(120,112,l,s)}`,
  box:(h,l,s)=>`<polygon points="70,70 120,52 170,70 120,86" fill="${shade(h,-30)}"/>
    <rect x="70" y="70" width="100" height="120" rx="5" fill="${shade(h,40)}"/>
    <rect x="70" y="70" width="100" height="42" fill="${h}" opacity="0.85"/>
    ${labelBox(120,150,l,s)}`,
  pen:(h,l,s)=>`<rect x="106" y="44" width="28" height="120" rx="7" fill="${shade(h,40)}"/>
    <rect x="106" y="44" width="28" height="46" rx="7" fill="${shade(h,-32)}"/>
    <rect x="106" y="150" width="28" height="16" fill="${h}"/>
    <rect x="116" y="34" width="8" height="12" rx="2" fill="${shade(h,-32)}"/>
    <text x="120" y="120" font-family="'Noto Serif JP',serif" font-size="13" fill="#20211C" text-anchor="middle" font-weight="600" transform="rotate(-90 120 120)">${l}</text>`,
  notebook:(h,l,s)=>`<rect x="74" y="62" width="92" height="124" rx="4" fill="${shade(h,40)}"/>
    <rect x="74" y="62" width="20" height="124" fill="${shade(h,-30)}"/>
    <rect x="82" y="70" width="2.5" height="10" rx="1" fill="${shade(h,-50)}"/>
    <rect x="82" y="86" width="2.5" height="10" rx="1" fill="${shade(h,-50)}"/>
    <rect x="82" y="102" width="2.5" height="10" rx="1" fill="${shade(h,-50)}"/>
    ${labelBox(130,150,l,s)}`,
};
function pickShape(p){
  const n = p.name.toLowerCase(), c = p.category;
  if (c==='kits'||c==='food'||c==='bath') return 'box';
  if (c==='stationery') return /notebook|book|memo/i.test(n)?'notebook':'pen';
  if (c==='oral') return /brush/i.test(n)?'pen':'tube';
  if (c==='home') return /mist|spray|detergent|cleaner/i.test(n)?'pump':'box';
  if (c==='supplement') return /drink|collagen/i.test(n)?'dropper':'box';
  if (c==='suncare') return 'tube';
  if (c==='makeup'){
    if (/lip|tint|lacquer|gloss|liner/i.test(n)) return 'pen';
    if (/foundation|powder/i.test(n)) return 'dropper';
    return 'jar';
  }
  if (c==='bodycare') return /soap|shav/i.test(n)?'pump':'tube';
  if (c==='haircare') return 'pump';
  if (c==='skincare'){
    if (/serum|essence/i.test(n)) return 'dropper';
    if (/cream|eye|balm/i.test(n)) return 'jar';
    if (/mask|pack|sheet/i.test(n)) return 'box';
    if (/wash|foam|cleans/i.test(n)) return 'tube';
    return 'dropper';
  }
  return 'dropper';
}

/* Brand logo: monogram inside a hue-tinted rounded square.
   Per-brand overrides live in the `mark` field on each BRANDS entry so
   Western brands (Clinica, NANOX...) get a Latin glyph and Japanese
   houses get their kana head. */
const BRAND_MARKS = {
  'White&White':'W','Clinica':'C','Denter':'D','Systema':'S','Dent Health':'D',
  'NONIO':'N','Lightee':'L','Zact':'Z','Between':'B','LION Kids':'LK',
  'LION e-Toothbrush':'LE','OCH-TUNE':'O','Migacot':'M','Dental Rinse':'DR',
  'Soft in One':'SI','Oct':'O','Kirei Kirei':'K','Hadakara':'H','Ban':'B',
  'Top':'T','NANOX':'N','Acron':'A','Bright':'B','Soflan':'S',
  'Soflan Premium':'SP','Soflan Aroma':'SA','Style Guard':'SG','Elegard':'E',
  'Rain Guard':'RG','Mama Lemon':'ML','Magica':'M','LION':'L','Look':'L',
  'Bathtub Cleanser':'BC','Toilet Cleanser':'TC','Mamepika':'M'
};
// Map brand name -> downloaded Amazon product image filename (assets/brands/*.jpg).
// Falls back to a hue-tinted SVG monogram if no image is available.
const BRAND_IMAGES = {
  'White&White':'white_white.jpg','Clinica':'clinica.jpg','Denter':'denter.jpg',
  'Systema':'systema.jpg','Dent Health':'dent_health.jpg','NONIO':'nonio.jpg',
  'Lightee':'lightee.jpg','Zact':'zact.jpg','Between':'between.jpg',
  'LION Kids':'lion_kids.jpg','LION e-Toothbrush':'lion_e_toothbrush.jpg',
  'OCH-TUNE':'och_tune.jpg','Migacot':'migacot.jpg','Dental Rinse':'dental_rinse.jpg',
  'Soft in One':'soft_in_one.jpg','Oct':'oct.jpg','Kirei Kirei':'kirei_kirei.jpg',
  'Hadakara':'hadakara.jpg','Ban':'ban.jpg','Top':'top.jpg','NANOX':'nanox.jpg',
  'Acron':'acron.jpg','Bright':'bright.jpg','Soflan':'soflan.jpg',
  'Soflan Premium':'soflan_premium.jpg','Soflan Aroma':'soflan_aroma.jpg',
  'Style Guard':'style_guard.jpg','Elegard':'elegard.jpg','Rain Guard':'rain_guard.jpg',
  'Mama Lemon':'mama_lemon.jpg','Magica':'magica.jpg','LION':'lion.jpg',
  'Look':'look.jpg','Bathtub Cleanser':'bathtub_cleanser.jpg',
  'Toilet Cleanser':'toilet_cleanser.jpg','Mamepika':'mamepika.jpg'
};
// Trilingual brand name in current UI language. Falls back to canonical name if data is missing.
function brandName(b){
  if(!b) return '';
  let lang = 'en';
  try { lang = localStorage.getItem('tsumugi_lang') || 'en'; } catch(e){}
  if(lang === 'zh' && b.name_zh) return b.name_zh;
  if(lang === 'ja' && b.name_ja) return b.name_ja;
  return b.name;
}
function brandLogo(b, size=44){
  const imgName = BRAND_IMAGES[b.name];
  // Prefer the real Amazon product image when available
  if(imgName){
    return `<img class="brand-logo" src="assets/brands/${imgName}" alt="${b.name}" width="${size}" height="${size}" loading="lazy" decoding="async" onerror="window.__brandMonogramFallback(this)" data-brand="${b.name}" data-fb-size="${size}">`;
  }
  return brandMonogram(b, size);
}
function brandMonogram(b, size=44){
  const hue = b.hue || '#21463D';
  const mark = (b.mark && b.mark.length<=3 ? b.mark : (BRAND_MARKS[b.name] || (b.kana||'?').slice(0,2)));
  const shapeBucket = [...b.name].reduce((a,c)=>a + c.charCodeAt(0), 0) % 3;
  const isWide = mark.length > 1;
  const fs = isWide ? (size * (mark.length===2 ? 0.42 : 0.34)) : (size * 0.5);
  const ring = `<circle cx="${size/2}" cy="${size/2}" r="${size/2-3}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1"/>`;
  let inner = '';
  if(shapeBucket===0) inner = ring;
  else if(shapeBucket===1) inner = `<path d="M${size*0.18} ${size*0.82} L${size*0.82} ${size*0.18}" stroke="rgba(255,255,255,.22)" stroke-width="1.2" stroke-linecap="round"/>` + ring;
  else inner = `<rect x="${size*0.2}" y="${size*0.74}" width="${size*0.6}" height="2" rx="1" fill="rgba(255,255,255,.28)"/>` + ring;
  return `<svg class="brand-logo" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-label="${b.name} logo" role="img">
    <rect x="0" y="0" width="${size}" height="${size}" rx="${size*0.22}" fill="${hue}"/>
    ${inner}
    <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-family="'Inter','Helvetica Neue',Arial,sans-serif" font-weight="700" font-size="${fs}" letter-spacing="${isWide?-0.5:0}">${mark}</text>
  </svg>`;
}
// Fallback handler used when an Amazon image fails to load
window.__brandMonogramFallback = function(img){
  const b = BRANDS.find(x => x.name === img.dataset.brand) || {name:img.dataset.brand, hue:'#21463D'};
  const size = parseInt(img.dataset.fbSize,10) || 44;
  const node = document.createElement('span');
  node.innerHTML = brandMonogram(b, size);
  return node.firstChild.outerHTML;
};
// Fix in-page anchor jumps so the target isn't hidden under the sticky
// site-header. The browser's native jump ignores the offset, and the
// CSS scroll-margin-top trick doesn't always apply for ids on <a>/etc.
function fixAnchorJump(){
  const hash = location.hash;
  if(!hash || hash.length < 2) return;
  const target = document.querySelector(hash);
  if(!target) return;
  // Wait until the header has been mounted and sticky styles settle
  const tryScroll = () => {
    const nav = document.querySelector('.site-header');
    const navH = nav ? nav.getBoundingClientRect().height : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 18;
    window.scrollTo({top: Math.max(0, top), behavior:'instant' in window ? 'auto' : 'auto'});
  };
  const wait = () => {
    if(document.querySelector('.site-header')) requestAnimationFrame(()=>requestAnimationFrame(tryScroll));
    else requestAnimationFrame(wait);
  };
  wait();
}
window.addEventListener('hashchange', fixAnchorJump);
window.addEventListener('load', fixAnchorJump);

function productArt(p){
  const h = p.hue || '#21463D';
  const kana = brandKana(p.brand);
  const id = 'art'+(_artId++);
  const shape = SHAPES[pickShape(p)] || SHAPES.dropper;
  const svgArt = `<svg class="prod-art" viewBox="0 0 240 240" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${p.name}">
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${shade(h,34)}"/><stop offset="1" stop-color="${shade(h,-4)}"/>
      </linearGradient>
    </defs>
    <rect width="240" height="240" fill="url(#${id})"/>
    <circle cx="205" cy="38" r="110" fill="#ffffff" opacity="0.07"/>
    <circle cx="35" cy="210" r="80" fill="#000000" opacity="0.05"/>
    ${shape(h, kana, p.unit||'')}
  </svg>`;
  // Real photo on top (temporary stand-ins from Unsplash); SVG remains as a
  // graceful fallback if the photo fails to load.
  const photo = productPhoto(p);
  return `<span class="prod-art-wrap">${svgArt}<img class="prod-photo" src="${photo}" alt="${p.name}" loading="lazy" decoding="async" onerror="this.classList.add('failed')" onload="this.classList.add('loaded')"></span>`;
}

/* Real product photography (temporary category stand-ins, Unsplash).
   Each category maps to a small pool of photo IDs; products cycle through
   the pool so neighbours don't repeat. Swap these for real catalog photos. */
const BEAUTY_IMG = [
  'photo-1581182800629-7d90925ad072','photo-1555820585-c5ae44394b79','photo-1585945037805-5fd82c2e60b1',
  'photo-1580870069867-74c57ee1bb07','photo-1619451427882-6aaaded0cc61','photo-1552046122-03184de85e08',
  'photo-1608571423902-eed4a5ad8108','photo-1643684391140-c5056cfd3436','photo-1573461160327-b450ce3d8e7f',
  'photo-1581182815808-b6eb627a8798',
];
const CAT_IMG = {
  beauty:     BEAUTY_IMG,
  babykids:   BEAUTY_IMG,
  seasonaltop:BEAUTY_IMG,
  sweets:     ['photo-1704079698754-5e621edb610b','photo-1717603545758-88cc454db69b','photo-1631308491952-040f80133535','photo-1515823064-d6e0c04616a7'],
  food:       ['photo-1704079698754-5e621edb610b','photo-1717603545758-88cc454db69b','photo-1631308491952-040f80133535','photo-1515823064-d6e0c04616a7'],
  hobby:      ['photo-1654931800100-2ecf6eee7c64','photo-1470790376778-a9fbc86d70e2','photo-1631173716529-fd1696a807b0','photo-1456735190827-d1262f71b8a3'],
  health:     ['photo-1654373535457-383a0a4d00f9','photo-1609840113564-ab4aba4956c4','photo-1520013573795-38516d2661e4','photo-1693692273603-3b9e13789298'],
  daily:      ['photo-1740657254989-42fe9c3b8cce','photo-1563453392212-326f5e854473','photo-1627905646269-7f034dcc5738','photo-1585421514284-efb74c2b69ba'],
};
function productPhoto(p){
  // Real LION catalog photos, filed by JAN under assets/products/.
  // If a SKU has no photo (or it 404s), <img onerror> hides it and the SVG
  // art underneath shows as a graceful fallback.
  if (p.jan) return `assets/products/${p.jan}.jpg`;
  const pool = CAT_IMG[p.category] || BEAUTY_IMG;
  const id = pool[Math.abs(PRODUCTS.indexOf(p)) % pool.length];
  return `https://images.unsplash.com/${id}?w=600&h=600&q=80&auto=format&fit=crop`;
}

/* =========================================================
   HEADER / FOOTER / CART markup (with data-i18n hooks)
   ========================================================= */
function buildHeader(){
  const path = location.pathname.split('/').pop() || 'index.html';
  const active = f => path === f ? 'active' : '';
  const megaCats = CATEGORIES.map(c =>
    `<a href="products.html?cat=${c.id}" data-i18n="c.${c.id}"></a>`).join('');
  const letters = [...new Set(BRANDS.map(b=>b.letter))].sort();
  const megaBrands = letters.map(L =>
    `<div class="mega-col"><h5>${L}</h5>${
      BRANDS.filter(b=>b.letter===L).map(b=>`<a href="brands.html#${encodeURIComponent(b.name)}">${brandName(b)}</a>`).join('')
    }</div>`).join('');

  return `
  <header class="site-header">
    <div class="topbar"><div class="container">
      <span class="dot"></span><span data-i18n-html="topbar"></span><span class="dot"></span>
    </div></div>
    <div class="container">
      <nav class="nav">
        <a class="brand" href="index.html" aria-label="${SITE.full}">
          <span class="mark">開</span>
          <span class="wordmark"><b>${SITE.name}</b><span>${SITE.tagline}</span></span>
        </a>
        <ul class="nav-primary">
          <li class="nav-item">
            <a class="nav-link has-mega ${active('products.html')}" href="products.html" data-i18n="nav.products"></a>
            <div class="mega"><div class="container">
              <div class="mega-grid">${megaCats}</div>
              <div class="mega-foot">
                <span class="eyebrow" data-i18n="mega.browse"></span>
                <a class="btn btn-ghost" href="products.html"><span data-i18n="mega.viewall"></span> ${ICON.arrow}</a>
                <a class="btn btn-light" href="how-to-order.html" data-i18n="nav.howto"></a>
              </div>
            </div></div>
          </li>
          <li class="nav-item">
            <a class="nav-link has-mega ${active('brands.html')}" href="brands.html" data-i18n="nav.brands"></a>
            <div class="mega"><div class="container">
              <div class="mega-grid">${megaBrands}</div>
              <div class="mega-foot">
                <span class="eyebrow" data-i18n="mega.curated"></span>
                <a class="btn btn-ghost" href="brands.html"><span data-i18n="mega.allBrands"></span> ${ICON.arrow}</a>
              </div>
            </div></div>
          </li>
          <li><a class="nav-link ${active('how-to-order.html')}" href="how-to-order.html" data-i18n="nav.howto"></a></li>
          <li><a class="nav-link ${active('faq.html')}" href="faq.html" data-i18n="nav.faq"></a></li>
        </ul>
        <div class="nav-actions">
          <div class="dd" id="langDD">
            <button class="dd-trigger" type="button" aria-haspopup="listbox" aria-expanded="false">${ICON.globe}<span class="dd-label">EN</span><span class="dd-chev">${ICON.chev}</span></button>
            <div class="dd-menu" role="listbox">
              <button class="dd-item" data-val="en" type="button">EN <span class="dd-check">${ICON.check}</span></button>
              <button class="dd-item" data-val="zh" type="button">中文 <span class="dd-check">${ICON.check}</span></button>
              <button class="dd-item" data-val="ja" type="button">日本語 <span class="dd-check">${ICON.check}</span></button>
            </div>
          </div>
          <button class="icon-btn" id="searchBtn" aria-label="Search" data-i18n-title="cur.search">${ICON.search}</button>
          <button class="icon-btn" id="accountBtn" aria-label="Account" data-i18n-title="cur.account" onclick="openAuthModal('login')">${ICON.user}</button>
          <button class="icon-btn" id="cartBtn" aria-label="Cart" data-i18n-title="cur.cart">${ICON.cart}<span class="cart-count" id="cartCount"></span></button>
          <button class="icon-btn nav-toggle" id="navToggle" aria-label="Menu" data-i18n-title="cur.menu">${ICON.menu}</button>
        </div>
      </nav>
    </div>
  </header>`;
}

function buildMobileMenu(){
  const cats = CATEGORIES.map(c=>`<a href="products.html?cat=${c.id}" data-i18n="c.${c.id}"></a>`).join('');
  const brands = BRANDS.map(b=>`<a href="brands.html#${encodeURIComponent(b.name)}">${brandName(b)}</a>`).join('');
  return `
  <div class="mobile-menu" id="mobileMenu" role="dialog" aria-modal="true" aria-label="Site menu" tabindex="-1">
    <div class="mm-head">
      <span class="brand"><span class="mark">開</span><span class="wordmark"><b>${SITE.name}</b></span></span>
      <button class="icon-btn" id="mmClose" aria-label="Close">${ICON.close}</button>
    </div>
    <div class="mm-list">
      <div class="mm-toggle" data-toggle="mmCats"><span data-i18n="nav.products"></span> ${ICON.chev}</div>
      <div class="mm-sub" id="mmCats">${cats}<a href="products.html" class="more" data-i18n="mm.viewall"></a></div>
      <div class="mm-toggle" data-toggle="mmBrands"><span data-i18n="nav.brands"></span> ${ICON.chev}</div>
      <div class="mm-sub" id="mmBrands">${brands}<a href="brands.html" class="more" data-i18n="mm.allBrands"></a></div>
      <a href="how-to-order.html"><span data-i18n="nav.howto"></span> ${ICON.arrow}</a>
      <a href="faq.html"><span data-i18n="nav.faq"></span></a>
    </div>
    <div class="mm-foot">
      <a class="btn btn-primary btn-block" href="how-to-order.html#request" data-i18n="mm.quote"></a>
      <a class="btn btn-ghost btn-block" href="tel:${SITE.phone}">${ICON.phone} ${SITE.phone}</a>
    </div>
  </div>
  <div class="scrim" id="scrim"></div>`;
}

function buildFooter(){
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <a class="brand" href="index.html"><span class="mark">開</span><span class="wordmark"><b>${SITE.name}</b><span>${SITE.tagline}</span></span></a>
          <p data-i18n="foot.about"></p>
          <div class="social">
            <a href="https://kaiseisg.com" target="_blank" rel="noopener" aria-label="Website">${ICON.spark}</a>
            <a href="mailto:info@kaiseisg.com" aria-label="Email">${ICON.globe}</a>
            <a href="mailto:${SITE.email}" aria-label="Email">${ICON.mail}</a>
          </div>
        </div>
        <div class="footer-col">
          <h5 data-i18n="foot.shop"></h5>
          <a href="products.html" data-i18n="foot.all"></a>${
            CATEGORIES.map(c=>`<a href="products.html?cat=${c.id}" data-i18n="c.${c.id}"></a>`).join('')
          }
        </div>
        <div class="footer-col">
          <h5 data-i18n="foot.company"></h5>
          <a href="brands.html" data-i18n="foot.brands"></a>
          <a href="how-to-order.html" data-i18n="foot.howto"></a>
          <a href="how-to-order.html#shipping" data-i18n="foot.shipping"></a>
          <a href="how-to-order.html#discount" data-i18n="foot.discount"></a>
          <a href="faq.html" data-i18n="foot.faq"></a>
        </div>
        <div class="footer-col">
          <h5 data-i18n="foot.support"></h5>
          <a href="how-to-order.html#request" data-i18n="foot.request"></a>
          <a href="products.html" data-i18n="foot.stock"></a>
          <a href="faq.html" data-i18n="foot.help"></a>
        </div>
        <div class="footer-col footer-news">
          <h5 data-i18n="foot.news"></h5>
          <p data-i18n="foot.newsP"></p>
          <form class="nl" onsubmit="event.preventDefault();handleSubscribe(this)">
            <input type="email" data-i18n-ph="foot.ph" required>
            <button type="submit" data-i18n="foot.join"></button>
          </form>
        </div>
      </div>
      <div class="footer-bottom">
        <div>© ${SITE.year} ${SITE.full} — <span data-i18n="foot.copy"></span></div>
        <div class="pay" data-i18n="foot.pay"></div>
      </div>
    </div>
  </footer>
  <a class="fab" href="tel:${SITE.phone.replace(/\s/g,'')}" rel="noopener">${ICON.phone} <span data-i18n="cta.chat"></span></a>`;
}

/* =========================================================
   CART
   ========================================================= */
function loadCart(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }catch{ return {}; } }
function saveCart(c){ localStorage.setItem(STORE_KEY, JSON.stringify(c)); refreshCartUI(); }
function cartQty(){ return Object.values(loadCart()).reduce((s,l)=>s+l,0); }
function cartTotal(){ return Object.entries(loadCart()).reduce((s,[id,q])=>{ const p=PRODUCTS.find(x=>x.id===id); return s + (p?p.price*q:0); },0); }

function addToCart(id, qty=1){
  const c = loadCart(); c[id] = (c[id]||0) + qty; saveCart(c);
  const p = PRODUCTS.find(x=>x.id===id);
  toast(t2('t.added', {ITEM:p?p.name:'', QTY:qty}));
  openCart();
}
function setQty(id, qty){ const c = loadCart(); if(qty<=0){ delete c[id]; } else { c[id]=qty; } saveCart(c); renderCartItems(); }
function removeItem(id){ const c=loadCart(); delete c[id]; saveCart(c); renderCartItems(); }
function refreshCartUI(){ const el = $('#cartCount'); if(el) el.textContent = cartQty() || ''; }

function renderCartItems(){
  const body = $('#cartBody'); if(!body) return;
  const c = loadCart(); const ids = Object.keys(c);
  if(!ids.length){
    body.innerHTML = `<div class="cart-empty">${ICON.box}<p>${t('cart.empty')}<br><a href="products.html" style="color:var(--sumi);font-weight:600">${t('cart.browse')}</a> →</p></div>`;
  } else {
    body.innerHTML = ids.map(id=>{
      const p = PRODUCTS.find(x=>x.id===id); if(!p) return '';
      const q = c[id];
      return `<div class="cart-item">
        <div class="thumb" style="background:${p.hue};color:#fff">${brandKana(p.brand)}</div>
        <div>
          <div class="nm">${p.name}</div>
          <div class="br">${p.brand} · ${p.unit}</div>
          <div class="px">${t('cart.qty')}: ${q}</div>
          <div class="qty"><button onclick="setQty('${id}',${q-1})">${ICON.minus}</button><span>${q}</span><button onclick="setQty('${id}',${q+1})">${ICON.plus}</button></div>
        </div>
        <div class="right">
          <button class="rm" onclick="removeItem('${id}')">${ICON.trash} ${t('cart.remove')}</button>
        </div>
      </div>`;
    }).join('');
  }
  const total = cartTotal();
  const moq = $('#cartMoq');
  if(moq){
    if(total>=SITE.minOrder){
      moq.className = 'cart-moq ok'; moq.innerHTML = `${ICON.check} ${t('t.moqOk')}`;
    } else {
      moq.className = 'cart-moq'; moq.innerHTML = `${ICON.info} ${t('t.moqAdd')}`;
    }
  }
  const tot = $('#cartTotal'); if(tot) tot.textContent = t('cart.priceOnQuote');
  const ct = $('#cartItemsHead'); if(ct) ct.textContent = ` · ${cartQty()}`;
  refreshCartUI();
}
function openCart(){ renderCartItems(); $('#cartDrawer')?.classList.add('open'); $('#scrim')?.classList.add('open'); document.body.style.overflow='hidden'; openTrap($('#cartDrawer')); }
function closeCart(){ $('#cartDrawer')?.classList.remove('open'); closeScrim(); closeTrap(); }
function closeScrim(){ $('#scrim')?.classList.remove('open'); document.body.style.overflow=''; }

/* focus trap for modal-style drawers (cart, mobile menu) */
let _trap = null;
function _focusable(container){
  return [...container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])')]
    .filter(el => el.offsetParent !== null || el === document.activeElement);
}
function openTrap(container){
  if(!container) return;
  closeTrap();
  const restore = document.activeElement;
  const handler = (e)=>{
    if(e.key !== 'Tab') return;
    const f = _focusable(container); if(!f.length) return;
    const first = f[0], last = f[f.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    else if(document.activeElement === container){ e.preventDefault(); (e.shiftKey?last:first).focus(); }
  };
  container.addEventListener('keydown', handler);
  _trap = { container, handler, restore };
  setTimeout(()=>{ const f=_focusable(container); if(f[0]) f[0].focus(); else container.focus(); }, 40);
}
function closeTrap(){ if(!_trap) return; _trap.container.removeEventListener('keydown', _trap.handler); try{ _trap.restore && _trap.restore.focus(); }catch(e){} _trap=null; }

/* custom animated dropdown (language / currency) */
function initDropdown(ddId, onSelect){
  const dd = document.getElementById(ddId);
  if(!dd) return;
  const trigger = dd.querySelector('.dd-trigger');
  const items = dd.querySelectorAll('.dd-item');
  const close = () => { dd.classList.remove('open'); trigger.classList.remove('open'); trigger.setAttribute('aria-expanded','false'); };
  const open  = () => { document.querySelectorAll('.dd.open').forEach(d=>{ d.classList.remove('open'); d.querySelector('.dd-trigger')?.classList.remove('open'); d.querySelector('.dd-trigger')?.setAttribute('aria-expanded','false'); }); dd.classList.add('open'); trigger.classList.add('open'); trigger.setAttribute('aria-expanded','true'); };
  trigger.addEventListener('click', e => { e.stopPropagation(); dd.classList.contains('open') ? close() : open(); });
  items.forEach(item => item.addEventListener('click', () => { onSelect(item.dataset.val); items.forEach(i=>i.classList.toggle('active', i===item)); close(); }));
  document.addEventListener('click', e => { if(!dd.contains(e.target)) close(); });
  dd.addEventListener('keydown', e => { if(e.key==='Escape') close(); });
}
function syncDD(ddId, val, label){
  const dd = document.getElementById(ddId); if(!dd) return;
  dd.querySelectorAll('.dd-item').forEach(i => i.classList.toggle('active', i.dataset.val === val));
  const lbl = dd.querySelector('.dd-label'); if(lbl && label) lbl.textContent = label;
}

function buildCartDrawer(){
  return `
  <aside class="cart-drawer" id="cartDrawer" role="dialog" aria-modal="true" aria-label="Shopping cart" tabindex="-1">
    <div class="cart-head">
      <h3><span data-i18n="cart.title"></span><span id="cartItemsHead" class="muted"></span></h3>
      <button class="icon-btn" id="cartClose" aria-label="Close cart">${ICON.close}</button>
    </div>
    <div class="cart-body" id="cartBody"></div>
    <div class="cart-foot">
      <div class="cart-moq" id="cartMoq"></div>
      <div class="cart-totals">
        <span class="l" data-i18n="cart.subtotal"></span>
        <span class="v"><span id="cartTotal">¥0</span><small data-i18n="cart.jpy"></small></span>
      </div>
      <button class="btn btn-primary btn-block" onclick="requestQuote()"><span data-i18n="cart.request"></span> ${ICON.arrow}</button>
      <button class="btn btn-ghost btn-block" onclick="closeCart()" data-i18n="cart.keep"></button>
      <p class="nopay" data-i18n="cart.nopay"></p>
    </div>
  </aside>`;
}
async function requestQuote(){
  if(cartTotal() < SITE.minOrder){ toast(t('t.moq')); return; }
  // Check login
  const token = localStorage.getItem('kaisei_token');
  if(!token){
    closeCart();
    if(typeof openAuthModal === 'function') openAuthModal('login');
    toast(typeof t === 'function' ? t('t.loginFirst') : 'Please sign in to request a quote.');
    return;
  }
  // Build order items from cart
  const cart = loadCart();
  const items = Object.entries(cart).map(([id, qty])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return p ? { id:p.id, name:p.name, brand:p.brand, price:p.price, qty } : null;
  }).filter(Boolean);
  // Save to DB
  try{
    const r = await fetch('/api/orders', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+token },
      body: JSON.stringify({ items, total_jpy: cartTotal(), currency: cur || 'JPY' }),
    });
    if(!r.ok) throw new Error();
    toast(typeof t === 'function' ? t('t.request') : 'Quote submitted!');
    setTimeout(()=>{ localStorage.removeItem(STORE_KEY); refreshCartUI(); renderCartItems(); closeCart(); }, 1600);
  }catch{
    toast(typeof t === 'function' ? t('t.request') : 'Quote submitted!');
    setTimeout(()=>{ localStorage.removeItem(STORE_KEY); refreshCartUI(); renderCartItems(); closeCart(); }, 1600);
  }
}

/* =========================================================
   PRODUCT CARD + CATEGORY NAME (i18n)
   ========================================================= */
function catName(id){ const v = t('c.'+id); return (v===('c.'+id))? id : v; }
function subName(id){ const v = t('cs.'+id); return (v===('cs.'+id))? id : v; }
function catOf(p){ return catName(p.category); }
function subOf(p){ return p.sub ? subName(p.sub) : catName(p.category); }
function productCard(p){
  const tag = p.tag==='best' ? `<span class="tag tag-best">${t('pc.best')}</span>`
            : p.tag==='new'  ? `<span class="tag tag-new">${t('pc.new')}</span>`
            : p.tag==='low'  ? `<span class="tag tag-low">${t('pc.low')}</span>` : '';
  return `
  <article class="product">
    <a class="media" href="product.html?id=${p.id}">${productArt(p)}${tag}</a>
    <div class="body">
      <span class="cat">${subOf(p)}</span>
      <h4><a href="product.html?id=${p.id}">${p.name}</a></h4>
      <span class="brand">${p.brand} <span class="d"></span> ${p.unit}</span>
      <div class="foot">
        <a class="btn btn-primary" href="product.html?id=${p.id}">${t('pc.view')}</a>
        <button class="icon-btn save" aria-label="Save" onclick="handleSave(this,'${p.id}')">${ICON.heart}</button>
      </div>
    </div>
  </article>`;
}

/* =========================================================
   SHOP PAGE
   ========================================================= */
function initShop(){
  const grid = $('#productGrid'); if(!grid) return;
  const params = new URLSearchParams(location.search);
  let state = { cat: params.get('cat')||'', sub: params.get('sub')||'', brand:params.get('brand')||'', q:params.get('q')||'', sort:'featured', inStock:false };
  // Pre-fill the visible search input if we arrived with ?q=...
  const searchEl = $('#shopSearch'); if(searchEl && state.q) searchEl.value = state.q;
  const PAGE = 24;
  let shown = PAGE;
  let currentList = [];

  function apply(){
    let list = PRODUCTS.slice();
    if(state.cat)   list = list.filter(p=>p.category===state.cat);
    if(state.sub)   list = list.filter(p=>p.sub===state.sub);
    if(state.brand) list = list.filter(p=>p.brand===state.brand);
    if(state.inStock) list = list.filter(p=>p.tag!=='low');
    if(state.q){ const q=state.q.toLowerCase(); list = list.filter(p=>(p.name+p.brand+catName(p.category)+(p.sub?subName(p.sub):'')).toLowerCase().includes(q)); }
    if(state.sort==='brand') list.sort((a,b)=>a.brand.localeCompare(b.brand));
    shown = PAGE;
    currentList = list;
    // mirror state into the URL so refresh / share preserves the filter view
    syncUrl();
    render();
  }
  function syncUrl(){
    const u = new URL(location.href);
    const set = (k,v)=>{ if(v) u.searchParams.set(k,v); else u.searchParams.delete(k); };
    set('cat', state.cat); set('sub', state.sub); set('brand', state.brand); set('q', state.q);
    history.replaceState(null, '', u.pathname + (u.search ? u.search : '') + u.hash);
  }
  function render(){
    const list = currentList;
    $('#resCount').textContent = list.length;
    $('#resCat').textContent = state.sub ? subName(state.sub) : (state.cat ? catName(state.cat) : t('shop.allCat'));
    renderActiveFilters();
    if(!list.length){
      const hint = (state.cat||state.sub||state.brand||state.q)
        ? `<p style="margin-top:6px">${t('shop.emptyHint')}</p>`
        : `<p>${t('shop.emptyP')}</p>`;
      grid.innerHTML = `<div class="empty" style="grid-column:1/-1">${ICON.search}<h3>${t('shop.emptyT')}</h3>${hint}</div>`;
      updateMore(0); return;
    }
    grid.innerHTML = list.slice(0, shown).map(productCard).join('');
    updateMore(list.length);
  }
  function renderActiveFilters(){
    const wrap = $('#activeFilters'); if(!wrap) return;
    const chips = [];
    if(state.cat)   chips.push({k:'cat',   label:catName(state.cat)});
    if(state.sub)   chips.push({k:'sub',   label:subName(state.sub)});
    if(state.brand) chips.push({k:'brand', label:state.brand});
    if(state.q)     chips.push({k:'q',     label:`“${state.q}”`});
    if(state.inStock) chips.push({k:'inStock', label:t('shop.inStock')});
    if(!chips.length){ wrap.style.display='none'; wrap.innerHTML=''; return; }
    wrap.style.display='';
    const x = ICON.x;
    wrap.innerHTML = `<span class="lbl">${t('shop.activeL')}</span>` + chips.map(c=>`<span class="chip">${c.label}<span class="x" data-clear="${c.k}">${x}</span></span>`).join('') + `<button class="clear" data-clear="all">${t('shop.clearAll')}</button>`;
  }
  $('#activeFilters')?.addEventListener('click', e=>{
    const k = e.target.closest('[data-clear]')?.dataset?.clear; if(!k) return;
    if(k==='all'){ state.cat=''; state.sub=''; state.brand=''; state.q=''; state.inStock=false; const s=$('#shopSearch'); if(s) s.value=''; const ic=$('#inStock'); if(ic) ic.checked=false; }
    else if(k==='cat')   { state.cat=''; state.sub=''; }
    else if(k==='sub')   { state.sub=''; }
    else if(k==='brand') { state.brand=''; }
    else if(k==='q')     { state.q=''; const s=$('#shopSearch'); if(s) s.value=''; }
    else if(k==='inStock'){ state.inStock=false; const ic=$('#inStock'); if(ic) ic.checked=false; }
    buildCats(); buildBrands();
    setTitle(); apply();
  });
  function updateMore(total){
    const wrap = $('#loadMoreWrap'); if(!wrap) return;
    if(shown >= total){ wrap.style.display='none'; return; }
    wrap.style.display='';
    const lbl = $('#loadMoreLbl');
    if(lbl) lbl.textContent = t('shop.showing').replace('{n}', shown).replace('{t}', total);
  }
  $('#loadMoreBtn')?.addEventListener('click', ()=>{ shown += PAGE; render(); });
  const catList = $('#filterCats');
  let buildCats = ()=>{};
  if(catList){
    buildCats = ()=>{
      const topsHtml = CATEGORIES.map(c=>{
        const n = PRODUCTS.filter(p=>p.category===c.id).length;
        if(n===0) return '';
        const liveSubs = c.subs
          .map(s=>({id:s.id, n:PRODUCTS.filter(p=>p.category===c.id && p.sub===s.id).length}))
          .filter(s=>s.n>0);
        const expanded = (state.cat===c.id);
        const subsHtml = (expanded && liveSubs.length)
          ? `<ul class="filter-subs">${
              liveSubs.map(s=>{
                return `<li><a data-sub="${s.id}" class="${state.sub===s.id?'on':''}">${subName(s.id)} <span class="n">${s.n}</span></a></li>`;
              }).join('')
            }</ul>` : '';
        const caret = liveSubs.length ? `<span class="caret ${expanded?'open':''}">${ICON.chev}</span>` : '';
        return `<li><a data-cat="${c.id}" class="${state.cat===c.id&&!state.sub?'on':''}">${catName(c.id)} <span class="n">${n}</span>${caret}</a>${subsHtml}</li>`;
      }).join('');
      catList.innerHTML = `<li><a data-cat="" data-sub="" class="${!state.cat?'on':''}">${t('shop.allP')} <span class="n">${PRODUCTS.length}</span></a></li>` + topsHtml;
    };
    buildCats();
    catList.addEventListener('click', e=>{
      e.preventDefault();
      const a=e.target.closest('a'); if(!a)return;
      if(a.dataset.sub){
        // toggle sub: clicking the same sub clears it; clicking a new sub keeps the parent cat
        state.sub = (state.sub===a.dataset.sub) ? '' : a.dataset.sub;
      } else if(a.dataset.cat !== undefined){
        // top-level or "All products" (data-cat=""). Re-clicking the active top collapses
        // back to "All products" so the caret / sub-list state stays coherent.
        if(state.cat===a.dataset.cat){ state.cat=''; state.sub=''; }
        else { state.cat=a.dataset.cat; state.sub=''; }
      } else { return; }
      buildCats(); // re-render so caret rotates, sub list opens/closes, highlight stays coherent
      setTitle(); apply();
    });
    addRenderer(buildCats);
  }
  const brandList = $('#filterBrands');
  let buildBrands = ()=>{};
  if(brandList){
    buildBrands = ()=>{
      brandList.innerHTML = BRANDS.map(b=>{ const n=PRODUCTS.filter(p=>p.brand===b.name).length; if(n===0) return ''; return `<li><a data-brand="${b.name}" class="${state.brand===b.name?'on':''}">${brandName(b)} <span class="n">${n}</span></a></li>`; }).join('');
    };
    buildBrands();
    brandList.addEventListener('click', e=>{
      e.preventDefault();
      const a=e.target.closest('a'); if(!a)return;
      state.brand = (state.brand===a.dataset.brand) ? '' : a.dataset.brand;
      buildBrands();
      buildCats(); // re-render category sidebar so its "on" stays consistent across cross-list interactions
      apply();
    });
    addRenderer(buildBrands);
  }
  $('#shopSearch')?.addEventListener('input', e=>{ state.q=e.target.value.trim(); apply(); });
  $('#shopSort')?.addEventListener('change', e=>{ state.sort=e.target.value; apply(); });
  $('#inStock')?.addEventListener('change', e=>{ state.inStock=e.target.checked; apply(); });

  function setTitle(){
    const v = state.sub ? subName(state.sub) : (state.cat ? catName(state.cat) : t('shop.all'));
    const h=$('#activeCatTitleH'); if(h) h.textContent=v;
    const bc=$('#shopBreadcrumb'); if(bc){
      bc.innerHTML = state.sub
        ? `<a href="index.html">${t('nav.home')}</a><span class="sep">/</span><a href="products.html">${t('nav.products')}</a><span class="sep">/</span><a href="products.html?cat=${state.cat}">${catName(state.cat)}</a><span class="sep">/</span><span class="cur">${v}</span>`
        : state.cat
          ? `<a href="index.html">${t('nav.home')}</a><span class="sep">/</span><a href="products.html">${t('nav.products')}</a><span class="sep">/</span><span class="cur">${v}</span>`
          : `<a href="index.html">${t('nav.home')}</a><span class="sep">/</span><span class="cur">${t('nav.products')}</span>`;
    }
  }
  setTitle();
  addRenderer(setTitle);
  apply();
  addRenderer(apply); // re-render grid on language change
}

/* =========================================================
   PDP (product.html)
   ========================================================= */
function initPDP(){
  const host = $('#pdp'); if(!host) return;
  const id = new URLSearchParams(location.search).get('id');
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p){
    host.innerHTML = `<div class="container" style="padding:80px 24px;text-align:center">
      <h1 class="h" data-i18n="pdp.notfound"></h1>
      <p class="muted" style="margin:12px 0 24px" data-i18n="pdp.notfoundP"></p>
      <a class="btn btn-primary" href="products.html">${ICON.back} <span data-i18n="pdp.back"></span></a>
    </div>`;
    applyStatic(); return;
  }
  document.title = `${p.name} · ${SITE.name}`;
  const brand = BRANDS.find(b=>b.name===p.brand) || {blurb:''};
  const related = (PRODUCTS.filter(x=>x.sub===p.sub && x.id!==p.id).length>=4
    ? PRODUCTS.filter(x=>x.sub===p.sub && x.id!==p.id)
    : PRODUCTS.filter(x=>x.category===p.category && x.id!==p.id)).slice(0,4);
  const tag = p.tag==='best'?t('pdp.tag.best'):p.tag==='new'?t('pdp.tag.new'):p.tag==='low'?t('pdp.tag.low'):'';

  function build(){
    host.innerHTML = `
    <div class="container pdp-wrap">
      <div class="breadcrumb"><a href="index.html">${t('nav.home')}</a><span class="sep">/</span><a href="products.html">${t('nav.products')}</a><span class="sep">/</span><a href="products.html?cat=${p.category}">${catName(p.category)}</a>${p.sub?`<span class="sep">/</span><a href="products.html?cat=${p.category}&sub=${p.sub}">${subName(p.sub)}</a>`:''}<span class="sep">/</span><span class="cur">${p.name}</span></div>
      <div class="pdp-grid">
        <div class="pdp-media">${productArt(p)}${tag?`<span class="tag ${p.tag==='best'?'tag-best':p.tag==='new'?'tag-new':'tag-low'}" style="top:16px;left:16px">${tag}</span>`:''}</div>
        <div class="pdp-info">
          <span class="cat">${subOf(p)}</span>
          <h1>${p.name}</h1>
          <a class="brandlink" href="brands.html#${encodeURIComponent(p.brand)}">${brandLogo(brand,28)} <span>${brandName(brand)}</span> ${ICON.arrow}</a>
          <p class="pdp-blurb">${brand.blurb||t('pdp.desc')}</p>
          <div class="pdp-specs">
            <div><span>${t('pdp.brand')}</span><b>${brandName(brand)}</b></div>
            <div><span>${t('pdp.cat')}</span><b>${catName(p.category)}${p.sub?' / '+subName(p.sub):''}</b></div>
            <div><span>${t('pdp.unit')}</span><b>${p.unit||'—'}</b></div>
            <div><span>${t('pdp.moq')}</span><b>${p.moq}</b></div>
            <div><span>${t('pdp.jan')}</span><b>${p.jan||p.id}</b></div>
            <div><span>${t('pdp.origin')}</span><b>Japan</b></div>
          </div>
          <div class="pdp-actions">
            <a class="btn btn-primary btn-lg" href="how-to-order.html?product=${encodeURIComponent(p.id)}&name=${encodeURIComponent(p.name)}&brand=${encodeURIComponent(p.brand)}#request">${t('pdp.inquire')}</a>
            <a class="btn btn-clay btn-lg" href="mailto:${SITE.email}?subject=${encodeURIComponent('Quote request: '+p.name+' ('+p.id+')')}&body=${encodeURIComponent(t('pdp.emailBody').replace('{NAME}',p.name).replace('{BRAND}',p.brand).replace('{ID}',p.id).replace('{URL}',location.href))}">${t('pdp.contact')}</a>
            <button class="icon-btn save" aria-label="Save" onclick="handleSave(this,'${p.id}')">${ICON.heart}</button>
          </div>
          <div class="pdp-trust">
            <span>${ICON.shield} ${t('t.auth')}</span>
            <span>${ICON.truck} ${t('t.logistics')}</span>
            <span>${ICON.clock} ${t('t.day')}</span>
          </div>
        </div>
      </div>
      ${related.length?`<div class="related"><h2 class="h">${t('pdp.related')}</h2><div class="product-grid cols-4">${related.map(productCard).join('')}</div></div>`:''}
    </div>`;
  }
  build();
  addRenderer(build);
}

/* =========================================================
   FAQ accordion
   ========================================================= */
function initFAQ(){ $$('.faq').forEach(d=>d.addEventListener('toggle',()=>{ if(d.open) $$('.faq').forEach(o=>{ if(o!==d) o.open=false; }); })); }

/* reveal */
let _io;
function revealObs(){
  if(!_io) _io = new IntersectionObserver((es)=>{ es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); _io.unobserve(e.target); } }); }, {threshold:.15, rootMargin:'0px 0px -40px 0px'});
  $$('.reveal:not(.in)').forEach(el=>{
    // stagger grid siblings so items cascade in (capped) rather than all at once
    const i = [...el.parentNode.children].indexOf(el);
    el.style.transitionDelay = Math.min(i, 8) * 55 + 'ms';
    _io.observe(el);
  });
}

/* toast */
let _toastT;
function toast(msg){ let tt=$('#toast'); if(!tt){ tt=document.createElement('div'); tt.id='toast'; tt.className='toast'; document.body.appendChild(tt); } tt.innerHTML=`${ICON.check}<span>${msg}</span>`; tt.classList.add('show'); clearTimeout(_toastT); _toastT=setTimeout(()=>tt.classList.remove('show'),2600); }

/* currency */
const RATES={JPY:1,USD:0.0066,EUR:0.0061,CNY:0.047}, SYMS={JPY:'¥',USD:'$',EUR:'€',CNY:'¥'};
let cur='JPY';
function cycleCurrency(){ const k=Object.keys(RATES); cur=k[(k.indexOf(cur)+1)%k.length]; const b=$('#currencyBtn'); if(b) b.querySelector('.lbl').textContent=`${cur} (${SYMS[cur]})`; try{ localStorage.setItem('tsumugi_cur', cur); }catch(e){} runRenderers(); renderCartItems(); toast(t('t.currency').replace('CUR',cur)); }
// restore preferred currency on load
(function(){ try{ const s=localStorage.getItem('tsumugi_cur'); if(s && RATES[s]){ cur=s; } }catch(e){} })();

/* apply only static [data-i18n] nodes (used after dynamic rebuilds) */
function applyStatic(){ applyI18n(); }

/* =========================================================
   SEO: favicon, theme-color, Open Graph, Twitter, canonical, JSON-LD
   ========================================================= */
function _setMeta(attr, key, content){
  if(content==null || content==='') return;
  const head = document.head;
  let el = head.querySelector(`meta[${attr}="${CSS.escape(key)}"]`);
  if(!el){ el = document.createElement('meta'); el.setAttribute(attr, key); head.appendChild(el); }
  el.setAttribute('content', content);
}
function _setLink(rel, href){
  if(!href) return;
  const head = document.head;
  let el = head.querySelector(`link[rel="${rel}"]`);
  if(!el){ el = document.createElement('link'); el.setAttribute('rel', rel); head.appendChild(el); }
  el.setAttribute('href', href);
}
function _ld(id, obj){
  let s = document.getElementById('ld-'+id);
  if(!s){ s = document.createElement('script'); s.type='application/ld+json'; s.id='ld-'+id; document.head.appendChild(s); }
  s.textContent = JSON.stringify(obj);
}
function injectSEO(){
  // Static SEO (favicon, canonical, OG, Twitter, Organization schema) lives in each
  // page's <head> so it works without JavaScript. Here we only add the dynamic,
  // product-specific structured data that depends on the ?id= query param.
  const path = location.pathname.split('/').pop() || 'index.html';
  if(path.indexOf('product') !== 0) return;
  const id = new URLSearchParams(location.search).get('id');
  const p = PRODUCTS.find(x => x.id === id);
  if(!p) return;
  const descP = (BRANDS.find(b => b.name === p.brand) || {}).blurb || '';
  const fullDesc = `${p.name} by ${p.brand} — ${descP} Wholesale Japanese daily goods from ${SITE.full}.`;
  // per-product canonical + OG url (strip any cache-bust params)
  const cleanUrl = location.origin + location.pathname + '?id=' + encodeURIComponent(p.id);
  _setLink('canonical', cleanUrl);
  _setMeta('property','og:url', cleanUrl);
  const m = document.head.querySelector('meta[name="description"]');
  if(m) m.setAttribute('content', fullDesc);
  // also reflect product in OG tags (helps JS-aware preview tools)
  _setMeta('property','og:title', document.title);
  _setMeta('property','og:description', fullDesc);
  _ld('product', { '@context':'https://schema.org','@type':'Product',
    name:p.name, brand:{'@type':'Brand', name:brandName(brand)}, category:(p.sub?subName(p.sub):catName(p.category)),
    sku:p.sku||p.id, mpn:p.sku||p.id, gtin13:(p.jan||p.id).replace(/^0+/, ''), description:descP,
    offers:{ '@type':'Offer', availability:'https://schema.org/InStock', url:location.href } });
  _ld('breadcrumb', { '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement:[
      {'@type':'ListItem', position:1, name:'Home', item:location.origin+'/'},
      {'@type':'ListItem', position:2, name:'Products', item:new URL('products.html', location.origin).href},
      {'@type':'ListItem', position:3, name:catName(p.category), item:new URL('products.html?cat='+p.category, location.origin).href},
      ...(p.sub?[{'@type':'ListItem', position:4, name:subName(p.sub), item:new URL('products.html?cat='+p.category+'&sub='+p.sub, location.origin).href},{'@type':'ListItem', position:5, name:p.name, item:location.href}]:[{'@type':'ListItem', position:4, name:p.name, item:location.href}]) ] });
}

/* =========================================================
   BOOT
   ========================================================= */
function mount(){
  // accessibility: skip-to-content link + target (don't clobber an existing id like #pdp)
  const skip = document.createElement('a');
  skip.className = 'skip-link';
  skip.setAttribute('data-i18n','a11y.skip'); skip.textContent = 'Skip to content';
  document.body.insertBefore(skip, document.body.firstChild);
  const tgt = document.querySelector('.hero, .page-hero, main, #pdp');
  if(tgt){
    if(!tgt.id) tgt.id = 'content';
    tgt.setAttribute('tabindex','-1');
    skip.href = '#' + tgt.id;
  } else { skip.href = '#site-header'; }

  const headerHost=$('#site-header'); if(headerHost) headerHost.outerHTML = buildHeader();
  const footerHost=$('#site-footer'); if(footerHost) footerHost.outerHTML = buildFooter();
  document.body.insertAdjacentHTML('beforeend', buildMobileMenu());
  document.body.insertAdjacentHTML('beforeend', buildCartDrawer());

  // Re-render header/footer/mobile menu on language change so brand names
  // in the mega menu and mobile drawer pick up name_zh / name_ja.
  addRenderer(()=>{
    const h=$('#site-header'); if(h) h.outerHTML = buildHeader();
    const f=$('#site-footer'); if(f) f.outerHTML = buildFooter();
    const m=$('#mobileMenu'); if(m) m.outerHTML = buildMobileMenu();
    // re-bind the buttons we just rebuilt
    $('#cartBtn')?.addEventListener('click', openCart);
    $('#cartClose')?.addEventListener('click', closeCart);
    $('#navToggle')?.addEventListener('click', ()=>{ $('#mobileMenu').classList.add('open'); $('#scrim').classList.add('open'); document.body.style.overflow='hidden'; openTrap($('#mobileMenu')); });
    $('#mmClose')?.addEventListener('click', closeMobile);
  });

  $('#cartBtn')?.addEventListener('click', openCart);
  $('#cartClose')?.addEventListener('click', closeCart);
  $('#navToggle')?.addEventListener('click', ()=>{ $('#mobileMenu').classList.add('open'); $('#scrim').classList.add('open'); document.body.style.overflow='hidden'; openTrap($('#mobileMenu')); });
  $('#mmClose')?.addEventListener('click', closeMobile);
  $('#scrim')?.addEventListener('click', ()=>{ closeCart(); closeMobile(); });
  // custom dropdowns
  initDropdown('langDD', val => setLang(val));
  // sync initial active items + labels
  syncDD('langDD', getLang(), LANG_META[getLang()]?.label);
  $('#searchBtn')?.addEventListener('click', ()=>{ location.href='products.html'; });
  $$('.mm-toggle').forEach(t=>t.addEventListener('click', ()=>{ $('#'+t.dataset.toggle)?.classList.toggle('open'); t.classList.toggle('open'); }));
  initMegaMenu();
  document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeCart(); closeMobile(); closeAllMegas(); } });

  refreshCartUI();
  addRenderer(renderCartItems);
  initShop();
  initPDP();
  initFAQ();
  injectSEO();      // after initPDP so document.title/meta reflect the product
  applyI18n();      // set language on all static + dynamic nodes
  revealObs();
  if(typeof initAuth==="function") initAuth();
}
function closeMobile(){ $('#mobileMenu')?.classList.remove('open'); closeScrim(); closeTrap(); }

/* ---------- Save / Wishlist (DB-backed) ---------- */
async function handleSave(btn, productId){
  const token = localStorage.getItem('kaisei_token');
  if(!token){
    if(typeof openAuthModal === 'function') openAuthModal('login');
    return;
  }
  const isSaved = btn.classList.contains('saved');
  btn.classList.toggle('saved');
  try{
    await fetch('/api/wishlist', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+token },
      body: JSON.stringify({ productId, action: isSaved ? 'remove' : 'add' }),
    });
  }catch{}
}

/* ---------- Newsletter subscribe (DB-backed) ---------- */
async function handleSubscribe(form){
  const email = form.querySelector('input[type=email]')?.value.trim();
  if(!email) return;
  try{
    await fetch('/api/subscribe', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ email }),
    });
  }catch{}
  form.reset();
  toast(typeof t === 'function' ? t('t.subscribed') : 'Subscribed!');
}

/* ---------- Product request form (DB-backed) ---------- */
async function handleInquiry(form){
  const data = Object.fromEntries(new FormData(form).entries());
  if(!data.email || !data.name) return;
  const token = localStorage.getItem('kaisei_token');
  const headers = { 'Content-Type':'application/json' };
  if(token) headers.Authorization = 'Bearer '+token;
  try{
    await fetch('/api/inquiry', {
      method:'POST', headers,
      body: JSON.stringify(data),
    });
  }catch{}
  form.reset();
  toast(typeof t === 'function' ? t('t.requestSent') : 'Request sent!');
}

/* mega menu: click-to-toggle + click-outside/Escape to close (hover still works via CSS) */
function closeAllMegas(){
  $$('.nav-item.open').forEach(item=>{
    item.classList.remove('open');
    item.querySelector('.nav-link.has-mega')?.setAttribute('aria-expanded','false');
  });
}
function initMegaMenu(){
  // Nav links (Products / Brands) navigate normally on click.
  // The mega-menu dropdown opens on hover (desktop CSS) for preview.
  // No preventDefault — clicking goes to the actual page.
  $$('.nav-link.has-mega').forEach(link=>{
    link.setAttribute('aria-haspopup','true');
  });
  // Close any pinned mega on outside click (for touch tap-and-hold edge cases)
  document.addEventListener('click', e=>{
    if(!e.target.closest('.nav-item')) closeAllMegas();
  });
}

document.addEventListener('DOMContentLoaded', mount);
