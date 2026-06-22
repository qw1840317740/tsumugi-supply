# KAISEI SANGYOU LLC — Japan Daily-Goods Wholesale (Demo)

An **original** demo website for a Japanese daily-goods (日用品) wholesale business.
Inspired by the *functionality* and *information architecture* of modern
Japan-wholesale platforms, but **not a copy** — every brand name, product, logo,
colour palette, illustration and layout here is newly created for this demo.

> ⚠️ All brand names, products, prices and contact details are **fictional
> samples**. Swap them for your real catalog before going live.

---

## ✨ Features

### Pages
| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Hero, trust bar, category grid, bestsellers, brands, stats, how-to teaser, testimonials, CTA |
| Catalog | `products.html` | Filterable wholesale catalog (category, brand, price, in-stock, search, sort) + live cart |
| Product detail | `product.html?id=...` | Full PDP: art, specs, MOQ, add-to-cart, related products |
| Brands A–Z | `brands.html` | Alphabetical brand directory with A–Z jump index |
| How to Order | `how-to-order.html` | 4-step process, MOQ note, volume-discount table, shipping options, product-request form |
| FAQ | `faq.html` | Accordion FAQ + contact CTA |

### ① Real product imagery (original SVG packaging)
Products are no longer text placeholders. Each item is drawn as an **original
SVG illustration** of its packaging — dropper bottles, pump bottles, jars,
squeeze tubes, cartons, pens, notebooks — auto-selected from the product's
category and tinted in its brand colour, with the brand kana on the label.
- Generator: `productArt(p)` in [`assets/js/app.js`](assets/js/app.js)
- Shape logic: `pickShape(p)` maps category/name keywords → package type
- Fully self-contained (no external images), scales crisply at any size, and
  is trivial to **swap for real photos** — replace the `<svg>` returned by
  `productArt()` with an `<img src="...">`.

### ② Trilingual switching — English / 中文 / 日本語
A language pill in the header cycles **EN → 中文 → 日本語**. The whole UI
translates instantly and the choice is saved to `localStorage`; `<html lang>`
updates too.
- Engine + dictionary: [`assets/js/i18n.js`](assets/js/i18n.js) (`L.en / L.zh / L.ja`)
- Static strings use `data-i18n="key"`; rich text uses `data-i18n-html`;
  placeholders use `data-i18n-ph`; titles/aria-labels use `data-i18n-title`.
- Dynamic sections register a renderer via `addRenderer(fn)` and rebuild with
  `t('key')` / `t2('key', {TOKENS})` so they retranslate on switch.
- Product names are intentionally left in their original form (common for
  Japanese goods sold internationally). To localise them, add per-language
  names to `PRODUCTS` in `data.js` and read them via the current lang.

### ③ Product detail pages (PDP)
Every product card links to `product.html?id=<SKU>`, which renders:
large product art, breadcrumb, brand link, price/MOQ/unit, description,
a specifications grid (brand, category, unit, MOQ, SKU, origin),
add-to-cart + request-invoice + save actions, a trust row, and a
"You may also like" row of related items from the same category.
The PDP is i18n-aware and fully responsive.

### Commerce (demo)
- **Mega menu** (Products by category, Brands by letter) — desktop & mobile drawer
- **Live cart** with `localStorage`: add / change qty / remove
- **Minimum-order progress** in the cart drawer (¥25,000 JPY threshold)
- **Filtering & search** on the catalog (category, brand, price slider, in-stock, text, sort)
- **Volume discount** tier table, **shipping** options, **product-request** form
- **Currency switcher** (JPY / USD / EUR / CNY demo), reveal-on-scroll, toasts, fully responsive

---

## 🔍 SEO

On-page, technical and structured-data SEO are implemented **in static HTML** (not JS-only), so social scrapers and non-JS crawlers see everything on the first byte:

- **Per-page `<title>` + meta description** — keyword-fronted, unique per page.
- **Canonical** — one clean canonical URL per page (PDP canonical becomes the per-product URL via JS).
- **Open Graph + Twitter Card** — `og:type/title/description/url/image` (+ width/height), `og:locale` with `zh_CN`/`ja_JP` alternates, `twitter:card` summary-large-image.
- **Structured data (JSON-LD)** — `Organization` + `WebSite` (home), `BreadcrumbList` (interior pages), `Product` + `Offer` + `BreadcrumbList` (PDP), and `FAQPage` with the real Q&A (FAQ page → eligible for rich results).
- **`robots.txt` + `sitemap.xml`** at the site root (main pages + all product URLs).
- **Favicon** — `assets/favicon.svg` (+ apple-touch-icon), `theme-color`, `color-scheme`.
- **Mobile-first / responsive**, semantic landmarks (`header/main/footer`), single `H1` per page.
- **Core Web Vitals** — system fonts as fallback with Google Fonts `display=swap` + `preconnect` (no invisible text), reserved image/box sizes to minimise CLS, no heavy JS.

> ⚠️ **Before going live, replace the placeholder domain `https://www.kaiseisg.com`** everywhere it appears (canonical URLs, OG/Twitter tags, JSON-LD, `sitemap.xml`, `robots.txt`) with your real domain. A project-wide find-and-replace handles it.

> 🌐 **Multilingual note:** the EN/中/日 switch is client-side on a single URL, so search engines index the English (default) version. For full multilingual SEO (separate ranking per language), serve each language on its own URL path (e.g. `/en/`, `/zh/`, `/ja/`) and add `hreflang` alternate tags — a larger architectural change worth doing before launch if non-English organic traffic matters.

---

## 🚀 Run it

Open `index.html` directly, or serve the folder (recommended so the URL params
for the PDP behave naturally):

```bash
# from inside the jp-wholesale-demo folder
python -m http.server 8765
# visit http://localhost:8765
```

Try it:
- Click a product → PDP; change the language pill (top-right) → whole site flips EN/中/日
- **Products** → filter / search / sort; **Add to cart** → drawer opens, MOQ progress updates

---

## 🎨 Design system

Warm "washi paper + sumi ink" palette (deliberately unlike red/blue templates):

| Token | Value | Use |
|-------|-------|-----|
| Paper | `#F4EFE4` | Page background |
| Ink | `#20211C` | Body text |
| Sumi (primary) | `#21463D` | Buttons, nav, footers |
| Clay (accent) | `#BE5A38` | CTAs, eyebrows |
| Gold | `#BE9B4A` | Stats, stars |
| Serif | Noto Serif JP | Headings |
| Sans | Inter | Body / UI |
| Mono | JetBrains Mono | Labels, codes |

All tokens are CSS custom properties at the top of
[`assets/css/style.css`](assets/css/style.css) — change once to re-skin.

---

## 🛠️ Make it yours

1. **Brand & contact** — `SITE` object at the top of [`assets/js/app.js`](assets/js/app.js).
2. **Logo** — replace the `開` kanji in the header/footer builders + hero, or
   drop a logo image into `.brand .mark`.
3. **Catalog** — edit `CATEGORIES`, `BRANDS`, `PRODUCTS` in
   [`assets/js/data.js`](assets/js/data.js). To use real photos, swap the SVG in
   `productArt()` for an `<img>`.
4. **Copy / translations** — add or edit keys in all three of `L.en / L.zh / L.ja`
   in [`assets/js/i18n.js`](assets/js/i18n.js). Use `data-i18n="key"` on any new
   HTML element to make it translatable.
5. **Colours / fonts** — tweak the `:root` variables in
   [`assets/css/style.css`](assets/css/style.css).

---

## 📁 Structure

```
jp-wholesale-demo/
├─ index.html              # home
├─ products.html           # catalog + filters
├─ product.html            # product detail (PDP)
├─ brands.html             # brands A–Z
├─ how-to-order.html       # process, discount, shipping, request form
├─ faq.html                # accordion FAQ
├─ README.md
└─ assets/
   ├─ css/style.css        # design system + components
   └─ js/
      ├─ data.js           # catalog (edit this)
      ├─ i18n.js           # EN/ZH/JA dictionary + engine
      └─ app.js            # header, footer, cart, art, PDP, filtering
```

---

© Demo only. Design and code written from scratch for demonstration purposes.
```
