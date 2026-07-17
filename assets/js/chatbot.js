/* =========================================================
   Chatbot widget — rule-based FAQ
   100% client-side, no AI, no external runtime requests
   ========================================================= */
(function(){
  'use strict';
  if (window.__cbMounted) return;
  window.__cbMounted = true;

  const KB_URL = 'assets/data/chatbot.json';
  const LS_KEY = 'cb_kb_cache_v1';
  const LANG_KEY = 'cb_lang';
  const SITE_LANG_KEY = 'tsumugi_lang';
  // Read from both keys (site's tsumugi_lang takes precedence; fall back to
  // cb_lang for back-compat). Without this, the chatbot always sees 'en'
  // and matches English keywords only — Japanese / Chinese queries all
  // miss and fall back to the "I don't understand" reply.
  function readLang(){
    const site = (localStorage.getItem(SITE_LANG_KEY) || '').slice(0,2);
    const cb   = (localStorage.getItem(LANG_KEY)        || '').slice(0,2);
    const doc  = (document.documentElement.lang      || '').slice(0,2);
    const raw  = site || cb || doc || 'en';
    return ['en','zh','ja'].includes(raw) ? raw : 'en';
  }
  let lang = readLang();

  let KB = null;       // knowledge base
  let state = null;    // { awaitingCountry, awaitingProductQuery, lastIntent }
  let open = false;
  let messageCount = 0;
  let countryMap = null; // alt names for country lookup

  /* ---------- I18N mini (re-uses t() from i18n.js if present) ---------- */
  function t(key, vars){
    if (window.t && typeof window.t === 'function'){
      try { return window.t(key, vars); } catch (e){}
    }
    return key;
  }
  function t2(key, vars){
    if (window.t2 && typeof window.t2 === 'function'){
      try { return window.t2(key, vars); } catch (e){ return key; }
    }
    return key;
  }
  function pickLang(){
    return readLang();
  }
  function setLang(l){
    if (!['en','zh','ja'].includes(l)) return;
    lang = l;
    // Keep BOTH keys in sync so any future read sees the latest.
    try { localStorage.setItem(SITE_LANG_KEY, l); } catch(e){}
    try { localStorage.setItem(LANG_KEY, l); } catch(e){}
    renderHeader();
    renderQuickChipsForLastBot();
    refreshInputPlaceholder();
  }

  /* ---------- KNOWLEDGE BASE LOAD ---------- */
  async function loadKB(){
    if (KB) return KB;
    try {
      const cached = sessionStorage.getItem(LS_KEY);
      if (cached) { KB = JSON.parse(cached); return KB; }
    } catch(e){}
    try {
      const r = await fetch(KB_URL, { cache: 'force-cache' });
      if (!r.ok) throw new Error('http '+r.status);
      KB = await r.json();
      try { sessionStorage.setItem(LS_KEY, JSON.stringify(KB)); } catch(e){}
      return KB;
    } catch (e){
      console.warn('chatbot: failed to load KB', e);
      return null;
    }
  }

  /* ---------- COUNTRY MAP (alt names for fuzzy lookup) ---------- */
  function buildCountryMap(){
    if (countryMap || !KB) return;
    countryMap = {};
    const fullNames = KB.countryNames;
    for (const code of KB.shipCountries){
      countryMap[code] = code;
      const en = (fullNames.en && fullNames.en[code] || '').toLowerCase();
      const zh = (fullNames.zh && fullNames.zh[code] || '');
      const ja = (fullNames.ja && fullNames.ja[code] || '');
      // en common short forms
      const enShort = ({
        'US':['usa','america','united states','u.s.','u.s.a'],
        'GB':['uk','united kingdom','britain','england','u.k.'],
        'AE':['uae','emirates','dubai'],
        'NZ':['new zealand'],
        'AU':['australia'],
        'CA':['canada'],
        'JP':['japan','日本'],
        'CN':['china','中国','大陆'],
        'HK':['hong kong','香港'],
        'TW':['taiwan','台湾'],
        'KR':['korea','韩国','south korea'],
        'SG':['singapore','新加坡'],
        'MY':['malaysia','马来西亚'],
        'TH':['thailand','泰国'],
        'PH':['philippines','菲律宾'],
        'VN':['vietnam','越南'],
        'ID':['indonesia','印尼'],
        'DE':['germany','德国'],
        'FR':['france','法国'],
        'IT':['italy','意大利'],
        'ES':['spain','西班牙'],
        'NL':['netherlands','holland','荷兰'],
        'SE':['sweden','瑞典'],
        'BR':['brazil','巴西'],
        'MX':['mexico','墨西哥'],
        'SA':['saudi arabia','saudi','沙特'],
        'ZA':['south africa','南非'],
        'EG':['egypt','埃及']
      })[code] || [];
      enShort.forEach(n => countryMap[n] = code);
      if (en) countryMap[en] = code;
      if (zh) countryMap[zh] = code;
      if (ja) countryMap[ja] = code;
    }
  }
  function lookupCountry(text){
    if (!countryMap) buildCountryMap();
    const t = text.toLowerCase().trim();
    // exact match
    if (countryMap[t]) return countryMap[t];
    // substring match
    for (const k of Object.keys(countryMap)){
      if (t.includes(k) || k.includes(t)) return countryMap[k];
    }
    return null;
  }

  /* ---------- MATCHING ---------- */
  function match(userText, lg){
    if (!KB) return null;
    const lower = userText.toLowerCase();
    const tokens = lower.replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter(w => w.length >= 2);
    let best = null, bestScore = 0, bestPhrase = 0;
    for (const entry of KB.entries){
      if (entry.id === 'fallback') continue;
      const keywords = (entry.keywords && entry.keywords[lg]) || [];
      const phrases = (entry.phrases && entry.phrases[lg]) || [];
      let kw = 0;
      for (const t of tokens){ if (keywords.indexOf(t) !== -1) kw++; }
      let ph = 0;
      for (const p of phrases){ if (p && lower.indexOf(p) !== -1) ph++; }
      const score = kw + ph * 2;
      // Prefer higher score; if tied, prefer more phrase hits; if still tied, prefer higher kw hits
      if (score > bestScore ||
          (score === bestScore && ph > bestPhrase) ||
          (score === bestScore && ph === bestPhrase && kw > (best && best._kw || 0))){
        bestScore = score; bestPhrase = ph; best = entry;
        if (best) best._kw = kw;
      }
    }
    if (bestScore >= 1 || bestPhrase >= 1) return best;
    return KB.entries.find(e => e.id === 'fallback') || null;
  }

  /* ---------- RENDER: message bubbles ---------- */
  function escHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function fmt(text){
    // Support {{var}} substitution via t2; allow inline <b>, <a>
    return text;
  }
  function nowHHMM(){
    const d = new Date();
    return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }

  function appendMsg(html, who){
    const body = document.getElementById('cb-body');
    if (!body) return;
    const wrap = document.createElement('div');
    wrap.className = 'cb-msg cb-msg--' + (who || 'bot');
    wrap.innerHTML = html;
    body.appendChild(wrap);
    body.scrollTop = body.scrollHeight;
    messageCount++;
  }

  function bubbleHtml(contentHtml, opts){
    const cta = (opts && opts.links && opts.links.length)
      ? '<div class="cb-cta-row">' + opts.links.map(l => {
          const lbl = escHtml(t(l.labelKey));
          return '<a class="cb-cta" href="' + escHtml(l.href) + '" target="_self">' + lbl + '</a>';
        }).join('') + '</div>'
      : '';
    return '<div class="cb-bubble">' + contentHtml + cta + '</div><time class="cb-time">' + nowHHMM() + '</time>';
  }

  function botMsg(entry, opts){
    let html = t(entry.answerKey, opts && opts.vars);
    if (opts && opts.countryCode && entry.id === 'shipping' && state.awaitingCountry){
      const cname = (KB.countryNames[lang] && KB.countryNames[lang][opts.countryCode]) || opts.countryCode;
      html = t('cb.a.shipTo', { country: cname });
    }
    const chips = (opts && opts.chips) || (entry.followUps ? entry.followUps.slice(0,3) : []);
    const chipsHtml = chips.length
      ? '<div class="cb-chips">' + chips.map(id => {
          const e = KB.entries.find(x => x.id === id);
          if (!e) return '';
          return '<button class="cb-chip" data-q="' + escHtml(e.id) + '">' + escHtml(t('cb.q.chip.' + e.id)) + '</button>';
        }).join('') + '</div>'
      : '';
    const html2 = bubbleHtml(html, { links: entry.links || [] });
    appendMsg(html2 + chipsHtml, 'bot');
  }

  function userMsg(text){
    appendMsg(bubbleHtml(escHtml(text), {}), 'user');
  }

  function typingMsg(){
    const body = document.getElementById('cb-body');
    if (!body) return null;
    const w = document.createElement('div');
    w.className = 'cb-msg cb-msg--bot';
    w.innerHTML = '<div class="cb-bubble cb-bubble--typing"><span></span><span></span><span></span></div>';
    body.appendChild(w);
    body.scrollTop = body.scrollHeight;
    return w;
  }

  /* ---------- ROUTING / MULTI-TURN ---------- */
  function handleUserSend(rawText){
    if (!KB) return;
    const text = (rawText || '').trim();
    if (!text) return;
    userMsg(text);
    state = state || { awaitingCountry: false, awaitingProductQuery: false, lastIntent: null };

    // Multi-turn: awaiting country
    if (state.awaitingCountry){
      const c = lookupCountry(text);
      const typer = typingMsg();
      setTimeout(() => {
        if (typer) typer.remove();
        if (c){
          const cn = (KB.countryNames[lang] && KB.countryNames[lang][c]) || c;
          botMsg({ answerKey: 'cb.a.shipTo', followUps: ['leadtime','moq','quote'], links: [{labelKey:'cb.lnk.howto', href:'how-to-order.html#shipping'}] }, { countryCode: c, vars: { country: cn } });
        } else {
          // not a known country
          botMsg({ answerKey: 'cb.a.countries', followUps: ['shipping','moq','contact'], links: [] });
        }
        state.awaitingCountry = false;
        state.lastIntent = null;
      }, 450);
      return;
    }

    // Multi-turn: awaiting product query
    if (state.awaitingProductQuery){
      const typer = typingMsg();
      setTimeout(() => {
        if (typer) typer.remove();
        const q = encodeURIComponent(text);
        botMsg({ answerKey: 'cb.a.search', followUps: ['catalog','quote','contact'], links: [{labelKey:'cb.lnk.products', href:'products.html?q=' + q}] });
        state.awaitingProductQuery = false;
        state.lastIntent = null;
      }, 450);
      return;
    }

    // First-turn match
    const entry = match(text, lang);
    if (!entry){
      fallback();
      return;
    }
    const typer = typingMsg();
    setTimeout(() => {
      if (typer) typer.remove();
      botMsg(entry);

      // Set up follow-up multi-turn state
      if (entry.asksCountry){
        state.awaitingCountry = true;
        state.lastIntent = 'shipping';
      } else if (entry.asksProductQuery){
        state.awaitingProductQuery = true;
        state.lastIntent = 'search';
      }
    }, 450);
  }

  function fallback(){
    const entry = KB.entries.find(e => e.id === 'fallback');
    if (!entry) return;
    botMsg(entry);
  }

  /* ---------- RENDER: header & UI ---------- */
  function renderHeader(){
    const nameEl = document.getElementById('cb-name');
    const subEl = document.getElementById('cb-sub');
    if (nameEl) nameEl.textContent = t('cb.name');
    if (subEl) subEl.textContent = t('cb.sub');
    // Lang pill active state
    document.querySelectorAll('.cb-lang button').forEach(b => {
      b.setAttribute('aria-selected', String(b.dataset.lang === lang));
    });
  }

  function refreshInputPlaceholder(){
    const inp = document.getElementById('cb-input');
    if (inp) inp.placeholder = t('cb.ph');
  }

  function renderQuickChipsForLastBot(){
    // If user changes language mid-chat, re-render last bot chips
    const body = document.getElementById('cb-body');
    if (!body) return;
    const lastBotChips = body.querySelectorAll('.cb-msg--bot:last-child .cb-chips');
    // Skip — chips already rendered, they'll still be in old lang. That's fine.
  }

  function greeting(){
    appendMsg(bubbleHtml(escHtml(t('cb.greet')), {}), 'bot');
    // Initial quick-reply chips
    const body = document.getElementById('cb-body');
    if (!body) return;
    const w = document.createElement('div');
    w.className = 'cb-msg cb-msg--bot';
    w.innerHTML = '<div class="cb-chips">' + [
      'shipping','moq','quote','howto','payment','contact'
    ].map(id => '<button class="cb-chip" data-q="' + id + '">' + escHtml(t('cb.q.chip.' + id)) + '</button>').join('') + '</div>';
    body.appendChild(w);
    body.scrollTop = body.scrollHeight;
  }

  /* ---------- MOUNT ---------- */
  function mount(){
    if (document.getElementById('cb-fab')) return;

    // Bubble button
    const fab = document.createElement('button');
    fab.className = 'cb-fab';
    fab.id = 'cb-fab';
    fab.setAttribute('aria-label', t('cb.name'));
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    document.body.appendChild(fab);

    // Panel
    const panel = document.createElement('aside');
    panel.className = 'cb-panel';
    panel.id = 'cb-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML =
      '<header class="cb-head">' +
        (window.matchMedia('(max-width:680px)').matches ? '<div class="cb-handle"></div>' : '') +
        '<div class="cb-head-top">' +
          '<div class="cb-avatar">K</div>' +
          '<div class="cb-titles">' +
            '<div class="cb-name" id="cb-name">Kaisei Assistant</div>' +
            '<div class="cb-sub" id="cb-sub">Replies instantly</div>' +
          '</div>' +
          '<div class="cb-lang" role="tablist" aria-label="Language">' +
            '<button data-lang="en" role="tab" aria-selected="true">EN</button>' +
            '<button data-lang="zh" role="tab">中</button>' +
            '<button data-lang="ja" role="tab">日</button>' +
          '</div>' +
          '<button class="cb-close" id="cb-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
        '</div>' +
      '</header>' +
      '<div class="cb-body" id="cb-body" aria-live="polite"></div>' +
      '<footer class="cb-foot">' +
        '<input class="cb-input" id="cb-input" type="text" autocomplete="off" />' +
        '<button class="cb-send" id="cb-send" aria-label="Send" disabled><svg viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></button>' +
      '</footer>';
    document.body.appendChild(panel);

    // Wire events
    fab.addEventListener('click', toggle);
    document.getElementById('cb-close').addEventListener('click', close);

    // Language switch
    panel.querySelectorAll('.cb-lang button').forEach(b => {
      b.addEventListener('click', () => setLang(b.dataset.lang));
    });

    // Quick-reply chip delegation
    panel.addEventListener('click', e => {
      const chip = e.target.closest('.cb-chip');
      if (!chip) return;
      const q = chip.dataset.q;
      if (!q) return;
      handleUserSend(q);
    });

    // Input + send
    const inp = document.getElementById('cb-input');
    const send = document.getElementById('cb-send');
    function refreshSend(){
      send.disabled = !inp.value.trim();
    }
    inp.addEventListener('input', refreshSend);
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        const v = inp.value.trim();
        if (!v) return;
        inp.value = '';
        refreshSend();
        handleUserSend(v);
      }
    });
    send.addEventListener('click', () => {
      const v = inp.value.trim();
      if (!v) return;
      inp.value = '';
      refreshSend();
      handleUserSend(v);
    });
    refreshInputPlaceholder();
    renderHeader();

    // Close on click outside
    document.addEventListener('click', e => {
      if (!open) return;
      if (panel.contains(e.target)) return;
      if (fab.contains(e.target)) return;
      close();
    });

    // Esc to close
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && open) close();
    });

    // Reset lang picker on global language change
    window.addEventListener('cb:lang-changed', () => {
      lang = pickLang();
      renderHeader();
    });
  }

  function toggle(){
    if (open) close(); else openPanel();
  }
  function openPanel(){
    if (open) return;
    open = true;
    state = state || { awaitingCountry: false, awaitingProductQuery: false, lastIntent: null };
    const panel = document.getElementById('cb-panel');
    const fab = document.getElementById('cb-fab');
    if (!panel) return;
    panel.setAttribute('data-open', 'true');
    panel.setAttribute('aria-hidden', 'false');
    fab.setAttribute('aria-expanded', 'true');
    fab.setAttribute('data-open', 'true');
    if (window.innerWidth <= 680) document.body.classList.add('cb-open');
    if (messageCount === 0) {
      loadKB().then(() => {
        if (KB) {
          buildCountryMap();
          greeting();
        } else {
          appendMsg(bubbleHtml('Sorry, the knowledge base failed to load. Please refresh and try again.', {}), 'bot');
        }
      });
    }
    setTimeout(() => {
      const inp = document.getElementById('cb-input');
      if (inp) inp.focus();
    }, 50);
  }
  function close(){
    if (!open) return;
    open = false;
    const panel = document.getElementById('cb-panel');
    const fab = document.getElementById('cb-fab');
    if (panel){
      panel.setAttribute('data-open', 'false');
      panel.setAttribute('aria-hidden', 'true');
    }
    if (fab){
      fab.setAttribute('aria-expanded', 'false');
      fab.setAttribute('data-open', 'false');
    }
    document.body.classList.remove('cb-open');
  }

  /* ---------- BOOT ---------- */
  function boot(){
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', boot);
      return;
    }
    lang = pickLang();
    mount();
  }
  // expose a tiny hook so other scripts can sync language
  window.cbSetLang = (l) => { if (['en','zh','ja'].includes(l)) setLang(l); };

  // Hook into site-level language changes (window.setLang is exposed by i18n.js)
  // Patch setLang so we re-render when the user picks a language elsewhere on the page.
  function patchSiteLang(){
    if (typeof window.setLang !== 'function' || window.setLang.__cbPatched) return;
    const orig = window.setLang;
    window.setLang = function(l){
      const r = orig.apply(this, arguments);
      try { setLang(l); } catch(e){}
      return r;
    };
    window.setLang.__cbPatched = true;
  }
  patchSiteLang();
  // Re-attempt after i18n.js loads
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', patchSiteLang);
  } else {
    setTimeout(patchSiteLang, 0);
    setTimeout(patchSiteLang, 100);
  }

  boot();
})();
