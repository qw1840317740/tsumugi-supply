/* =========================================================
   KAISEI SANGYOU — Authentication + User Dashboard
   Vercel API + Neon PG. Self-contained i18n (EN / 中文 / 日本語).
   ========================================================= */

const TOKEN_KEY = 'kaisei_token';
const USER_KEY  = 'kaisei_user';
const _closeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M6 6l12 12M18 6 6 18"/></svg>';

/* ---------- Auth i18n ---------- */
const AUTH_I18N = {
  en: {
    signin:'Sign In', register:'Register',
    emailPh:'Email', passwordPh:'Password', companyPh:'Company / Shop name', passwordHint:'Password (min 6 characters)',
    signinBtn:'Sign In', registerBtn:'Create Account', signingIn:'Signing in…', creating:'Creating…',
    welcomeBack:'Welcome back!', welcomeNew:'Account created — welcome!', signedOut:'Signed out',
    signOutBtn:'Sign Out', closeBtn:'Close',
    // account panel tabs
    tabOverview:'Overview', tabOrders:'My Orders', tabWishlist:'Wishlist', tabSecurity:'Security',
    changePwd:'Change Password', currentPwd:'Current password', newPwd:'New password', confirmPwd:'Confirm new password',
    changePwdBtn:'Update Password', pwdChanged:'Password updated successfully!', wrongPwd:'Current password is incorrect.',
    pwdMismatch:'Passwords do not match.', noOrders:'No orders yet. Your quote requests will appear here.',
    orderTitle:'Order', orderTotal:'Total', orderStatus:'Status', orderDate:'Date', orderItems:'items',
    noWishlist:'No saved items yet. Click the heart on any product to save it here.',
    removeBtn:'Remove', statusQuote:'Quote Requested', statusPending:'Processing', statusShipped:'Shipped',
    err:{ EMAIL_TAKEN:'This email is already registered.', INVALID_CREDENTIALS:'Invalid email or password.',
      MISSING_FIELDS:'Please fill in all fields.', SHORT_PASSWORD:'Password must be at least 6 characters.',
      SERVER_ERROR:'Something went wrong. Please try again.', NETWORK_ERROR:'Cannot reach server. Please try again later.',
      NOT_AUTHENTICATED:'Please sign in first.', WRONG_PASSWORD:'Current password is incorrect.', EMPTY_CART:'Your cart is empty.' }
  },
  zh: {
    signin:'登录', register:'注册',
    emailPh:'邮箱', passwordPh:'密码', companyPh:'公司 / 店铺名', passwordHint:'密码（至少 6 个字符）',
    signinBtn:'登录', registerBtn:'创建账户', signingIn:'登录中…', creating:'创建中…',
    welcomeBack:'欢迎回来！', welcomeNew:'账户已创建 — 欢迎！', signedOut:'已退出登录',
    signOutBtn:'退出登录', closeBtn:'关闭',
    tabOverview:'概览', tabOrders:'我的订单', tabWishlist:'收藏夹', tabSecurity:'安全设置',
    changePwd:'修改密码', currentPwd:'当前密码', newPwd:'新密码', confirmPwd:'确认新密码',
    changePwdBtn:'更新密码', pwdChanged:'密码修改成功！', wrongPwd:'当前密码不正确。',
    pwdMismatch:'两次密码不一致。', noOrders:'暂无订单。你的报价请求会显示在这里。',
    orderTitle:'订单', orderTotal:'总计', orderStatus:'状态', orderDate:'日期', orderItems:'件商品',
    noWishlist:'暂无收藏。点击商品上的心形图标即可收藏。',
    removeBtn:'移除', statusQuote:'已请求报价', statusPending:'处理中', statusShipped:'已发货',
    err:{ EMAIL_TAKEN:'该邮箱已被注册。', INVALID_CREDENTIALS:'邮箱或密码错误。',
      MISSING_FIELDS:'请填写所有字段。', SHORT_PASSWORD:'密码至少需要 6 个字符。',
      SERVER_ERROR:'出错了，请重试。', NETWORK_ERROR:'无法连接服务器，请稍后再试。',
      NOT_AUTHENTICATED:'请先登录。', WRONG_PASSWORD:'当前密码不正确。', EMPTY_CART:'购物车是空的。' }
  },
  ja: {
    signin:'サインイン', register:'登録',
    emailPh:'メール', passwordPh:'パスワード', companyPh:'会社名・店舗名', passwordHint:'パスワード（6文字以上）',
    signinBtn:'サインイン', registerBtn:'アカウント作成', signingIn:'サインイン中…', creating:'作成中…',
    welcomeBack:'おかえりなさい！', welcomeNew:'アカウント作成完了 — ようこそ！', signedOut:'サインアウトしました',
    signOutBtn:'サインアウト', closeBtn:'閉じる',
    tabOverview:'概要', tabOrders:'注文履歴', tabWishlist:'お気に入り', tabSecurity:'セキュリティ',
    changePwd:'パスワード変更', currentPwd:'現在のパスワード', newPwd:'新しいパスワード', confirmPwd:'パスワード確認',
    changePwdBtn:'パスワード更新', pwdChanged:'パスワードを変更しました！', wrongPwd:'現在のパスワードが正しくありません。',
    pwdMismatch:'パスワードが一致しません。', noOrders:'注文はまだありません。見積依頼がここに表示されます。',
    orderTitle:'注文', orderTotal:'合計', orderStatus:'ステータス', orderDate:'日付', orderItems:'点',
    noWishlist:'お気に入りはまだありません。商品のハートをクリックして保存できます。',
    removeBtn:'削除', statusQuote:'見積依頼済み', statusPending:'処理中', statusShipped:'出荷済み',
    err:{ EMAIL_TAKEN:'このメールアドレスは既に登録されています。', INVALID_CREDENTIALS:'メールアドレスまたはパスワードが正しくありません。',
      MISSING_FIELDS:'すべての項目を入力してください。', SHORT_PASSWORD:'パスワードは6文字以上で入力してください。',
      SERVER_ERROR:'エラーが発生しました。もう一度お試しください。', NETWORK_ERROR:'サーバーに接続できません。しばらくしてからお試しください。',
      NOT_AUTHENTICATED:'サインインしてください。', WRONG_PASSWORD:'現在のパスワードが正しくありません。', EMPTY_CART:'カートは空です。' }
  },
};
function curLang(){ return (typeof getLang === 'function') ? getLang() : 'en'; }
function ai18n(key){
  const dict = AUTH_I18N[curLang()] || AUTH_I18N.en;
  return dict[key] !== undefined ? dict[key] : (AUTH_I18N.en[key] || key);
}
function authErrMsg(code){
  const dict = AUTH_I18N[curLang()] || AUTH_I18N.en;
  return (dict.err && dict.err[code]) || (AUTH_I18N.en.err[code]) || code;
}
function authToken(){ return localStorage.getItem(TOKEN_KEY) || ''; }
function authHeaders(){ return { 'Content-Type':'application/json', Authorization:'Bearer '+authToken() }; }

/* ---------- Init ---------- */
function initAuth(){
  const token = localStorage.getItem(TOKEN_KEY);
  if(!token){ updateAuthUI(); return; }
  fetch('/api/me', { headers:{ Authorization:'Bearer '+token } })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => { localStorage.setItem(USER_KEY, JSON.stringify(data.user)); updateAuthUI(); })
    .catch(() => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); updateAuthUI(); });
}

/* ---------- Auth Modal ---------- */
function buildAuthModal(){
  return `<div class="auth-overlay" id="authOverlay">
    <div class="auth-card">
      <button class="auth-close" onclick="closeAuthModal()">${_closeSvg}</button>
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login" type="button" onclick="authTab('login')">${ai18n('signin')}</button>
        <button class="auth-tab" data-tab="register" type="button" onclick="authTab('register')">${ai18n('register')}</button>
      </div>
      <form class="auth-form" id="loginForm" novalidate onsubmit="return handleSignIn(event)">
        <div class="auth-field"><input type="email" id="loginEmail" placeholder="${ai18n('emailPh')}" autocomplete="email"></div>
        <div class="auth-field"><input type="password" id="loginPassword" placeholder="${ai18n('passwordPh')}" autocomplete="current-password"></div>
        <p class="auth-error" id="loginError"></p>
        <button class="btn btn-primary btn-block btn-lg" type="submit" id="loginBtn">${ai18n('signinBtn')}</button>
      </form>
      <form class="auth-form auth-hidden" id="registerForm" novalidate onsubmit="return handleRegister(event)">
        <div class="auth-field"><input type="email" id="regEmail" placeholder="${ai18n('emailPh')}" autocomplete="email"></div>
        <div class="auth-field"><input id="regCompany" placeholder="${ai18n('companyPh')}"></div>
        <div class="auth-field"><input type="password" id="regPassword" placeholder="${ai18n('passwordHint')}" autocomplete="new-password"></div>
        <p class="auth-error" id="regError"></p>
        <button class="btn btn-primary btn-block btn-lg" type="submit" id="regBtn">${ai18n('registerBtn')}</button>
      </form>
    </div>
  </div>`;
}
function openAuthModal(tab){
  if(tab===undefined) tab='login';
  const old=document.getElementById('authOverlay'); if(old) old.remove();
  document.body.insertAdjacentHTML('beforeend', buildAuthModal());
  const ov=document.getElementById('authOverlay');
  ov.classList.add('open'); document.body.style.overflow='hidden'; authTab(tab);
  ov.addEventListener('click', e=>{ if(e.target===ov) closeAuthModal(); });
}
function closeAuthModal(){ document.getElementById('authOverlay')?.classList.remove('open'); document.body.style.overflow=''; }
function authTab(tab){
  document.querySelectorAll('.auth-tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab));
  document.getElementById('loginForm')?.classList.toggle('auth-hidden', tab!=='login');
  document.getElementById('registerForm')?.classList.toggle('auth-hidden', tab!=='register');
}

/* ---------- Sign In / Register ---------- */
async function handleSignIn(e){
  e.preventDefault();
  const email=getValue('loginEmail'), password=getValue('loginPassword');
  const errEl=document.getElementById('loginError'), btn=document.getElementById('loginBtn');
  errEl.textContent='';
  if(!email || !password){ errEl.textContent=authErrMsg('MISSING_FIELDS'); return false; }
  btn.textContent=ai18n('signingIn'); btn.disabled=true;
  try{
    const resp=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
    const data=await resp.json();
    btn.textContent=ai18n('signinBtn'); btn.disabled=false;
    if(!resp.ok){ errEl.textContent=authErrMsg(data.error); return false; }
    localStorage.setItem(TOKEN_KEY,data.token); localStorage.setItem(USER_KEY,JSON.stringify(data.user));
    closeAuthModal(); toast(ai18n('welcomeBack')); updateAuthUI();
  }catch{ btn.textContent=ai18n('signinBtn'); btn.disabled=false; errEl.textContent=authErrMsg('NETWORK_ERROR'); }
  return false;
}
async function handleRegister(e){
  e.preventDefault();
  const email=getValue('regEmail'), password=getValue('regPassword'), company=getValue('regCompany');
  const errEl=document.getElementById('regError'), btn=document.getElementById('regBtn');
  errEl.textContent='';
  if(!email || !password || !company){ errEl.textContent=authErrMsg('MISSING_FIELDS'); return false; }
  if(password.length < 6){ errEl.textContent=authErrMsg('SHORT_PASSWORD'); return false; }
  btn.textContent=ai18n('creating'); btn.disabled=true;
  try{
    const resp=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,company})});
    const data=await resp.json();
    btn.textContent=ai18n('registerBtn'); btn.disabled=false;
    if(!resp.ok){ errEl.textContent=authErrMsg(data.error); return false; }
    localStorage.setItem(TOKEN_KEY,data.token); localStorage.setItem(USER_KEY,JSON.stringify(data.user));
    closeAuthModal(); toast(ai18n('welcomeNew')); updateAuthUI();
  }catch{ btn.textContent=ai18n('registerBtn'); btn.disabled=false; errEl.textContent=authErrMsg('NETWORK_ERROR'); }
  return false;
}
function handleSignOut(){
  localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY);
  closeAccountPanel(); updateAuthUI(); toast(ai18n('signedOut'));
}

/* ---------- Account Panel (full dashboard) ---------- */
function openAccountPanel(tab){
  if(tab===undefined) tab='overview';
  let user = {};
  try{ user = JSON.parse(localStorage.getItem(USER_KEY)) || {}; }catch{}
  const initial = (user.email||'U').charAt(0).toUpperCase();
  const old=document.getElementById('accountPanel'); if(old) old.remove();
  document.body.insertAdjacentHTML('beforeend', `
    <div class="auth-overlay" id="accountPanel" onclick="if(event.target===this) closeAccountPanel()">
      <div class="auth-card acct-dashboard" style="max-width:460px">
        <button class="auth-close" onclick="closeAccountPanel()">${_closeSvg}</button>
        <div class="acct-header">
          <div class="user-avatar" style="width:48px;height:48px;font-size:1.3rem;flex:none">${initial}</div>
          <div style="min-width:0">
            <div style="font-family:var(--f-serif);font-size:1.05rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${user.email||''}</div>
            ${user.company ? `<div class="muted" style="font-size:.84rem">${user.company}</div>` : ''}
          </div>
        </div>
        <div class="acct-tabs" id="acctTabs">
          <button class="acct-tab ${tab==='overview'?'active':''}" data-t="overview" onclick="acctTab('overview')">${ai18n('tabOverview')}</button>
          <button class="acct-tab ${tab==='orders'?'active':''}" data-t="orders" onclick="acctTab('orders')">${ai18n('tabOrders')}</button>
          <button class="acct-tab ${tab==='wishlist'?'active':''}" data-t="wishlist" onclick="acctTab('wishlist')">${ai18n('tabWishlist')}</button>
          <button class="acct-tab ${tab==='security'?'active':''}" data-t="security" onclick="acctTab('security')">${ai18n('tabSecurity')}</button>
        </div>
        <div class="acct-body" id="acctBody"></div>
        <div style="border-top:1px solid var(--line-soft);padding-top:14px;margin-top:6px">
          <button class="btn btn-clay btn-block" onclick="handleSignOut()">${ai18n('signOutBtn')}</button>
        </div>
      </div>
    </div>`);
  document.getElementById('accountPanel').classList.add('open');
  document.body.style.overflow = 'hidden';
  acctTab(tab);
}
function closeAccountPanel(){
  document.getElementById('accountPanel')?.classList.remove('open');
  document.body.style.overflow = '';
}
function acctTab(tab){
  document.querySelectorAll('#acctTabs .acct-tab').forEach(t=>t.classList.toggle('active', t.dataset.t===tab));
  const body=document.getElementById('acctBody');
  if(!body) return;
  if(tab==='overview') renderOverview(body);
  if(tab==='orders') renderOrders(body);
  if(tab==='wishlist') renderWishlist(body);
  if(tab==='security') renderSecurity(body);
}

/* ---- Overview ---- */
function renderOverview(el){
  let user={}; try{user=JSON.parse(localStorage.getItem(USER_KEY))||{};}catch{}
  el.innerHTML=`
    <div style="display:flex;flex-direction:column;gap:12px;padding:4px 0">
      <div class="acct-stat"><span>ID</span><b style="font-family:var(--f-mono);font-size:.92rem">${user.customer_code || 'KS-' + String(user.id||0).padStart(5,'0')}</b></div>
      <div class="acct-stat"><span>Email</span><b style="font-size:.88rem">${user.email||''}</b></div>
      <div class="acct-stat"><span>Company</span><b>${user.company||'—'}</b></div>
    </div>`;
}

/* ---- Orders ---- */
async function renderOrders(el){
  el.innerHTML=`<div style="text-align:center;padding:20px;color:var(--ink-3)">…</div>`;
  try{
    const r=await fetch('/api/orders',{headers:authHeaders()});
    if(!r.ok){ el.innerHTML=`<div style="text-align:center;padding:20px;color:var(--ink-3)">${ai18n('noOrders')}</div>`; return; }
    const data=await r.json();
    const orders=data.orders||[];
    if(!orders.length){ el.innerHTML=`<div style="text-align:center;padding:20px;color:var(--ink-3)">${ai18n('noOrders')}</div>`; return; }
    el.innerHTML=orders.map(o=>`
      <div class="acct-order">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
          <b style="font-family:var(--f-mono);font-size:.92rem">${o.order_code || 'ORD-' + String(o.id).padStart(5,'0')}</b>
          <span class="acct-status">${ai18n('status'+o.status.charAt(0).toUpperCase()+o.status.slice(1).replace(/_/g,''))}</span>
        </div>
        <div class="muted" style="font-size:.8rem">${new Date(o.created_at).toLocaleDateString()} · ${(o.items||[]).length} ${ai18n('orderItems')}</div>
        <div style="margin-top:4px"><b>${(o.currency||'JPY')==='JPY'?'¥':'$'}${(o.total_jpy||0).toLocaleString()}</b></div>
      </div>`).join('');
  }catch{ el.innerHTML=`<div style="text-align:center;padding:20px;color:var(--ink-3)">${ai18n('noOrders')}</div>`; }
}

/* ---- Wishlist ---- */
async function renderWishlist(el){
  el.innerHTML=`<div style="text-align:center;padding:20px;color:var(--ink-3)">…</div>`;
  try{
    const r=await fetch('/api/wishlist',{headers:authHeaders()});
    if(!r.ok){ el.innerHTML=`<div style="text-align:center;padding:20px;color:var(--ink-3)">${ai18n('noWishlist')}</div>`; return; }
    const data=await r.json();
    const ids=data.items||[];
    if(!ids.length){ el.innerHTML=`<div style="text-align:center;padding:20px;color:var(--ink-3)">${ai18n('noWishlist')}</div>`; return; }
    const items=ids.map(id=>(typeof PRODUCTS!=='undefined'?PRODUCTS.find(p=>p.id===id):null)).filter(Boolean);
    el.innerHTML=items.map(p=>`
      <div class="acct-wish">
        <a href="product.html?id=${p.id}" style="display:flex;gap:10px;align-items:center;flex:1;min-width:0" onclick="closeAccountPanel()">
          <div class="thumb" style="background:${p.hue};color:#fff;width:36px;height:36px;border-radius:8px;display:grid;place-items:center;font-family:var(--f-serif);font-size:.9rem;flex:none">${(typeof brandKana==='function'?brandKana(p.brand):p.brand.charAt(0))}</div>
          <div style="min-width:0"><div style="font-size:.86rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div><div class="muted" style="font-size:.76rem">¥${p.price.toLocaleString()}</div></div>
        </a>
        <button class="btn btn-ghost" style="padding:6px 10px;font-size:.78rem;flex:none" onclick="removeWish('${p.id}')">${ai18n('removeBtn')}</button>
      </div>`).join('');
  }catch{ el.innerHTML=`<div style="text-align:center;padding:20px;color:var(--ink-3)">${ai18n('noWishlist')}</div>`; }
}
async function removeWish(pid){
  try{ await fetch('/api/wishlist',{method:'POST',headers:authHeaders(),body:JSON.stringify({productId:pid,action:'remove'})}); }catch{}
  renderWishlist(document.getElementById('acctBody'));
}

/* ---- Security / Change Password ---- */
function renderSecurity(el){
  el.innerHTML=`
    <form onsubmit="return handleChangePwd(event)" style="display:flex;flex-direction:column;gap:10px;padding:4px 0" novalidate>
      <div class="auth-field"><input type="password" id="curPwd" placeholder="${ai18n('currentPwd')}"></div>
      <div class="auth-field"><input type="password" id="newPwd" placeholder="${ai18n('newPwd')}"></div>
      <div class="auth-field"><input type="password" id="confirmPwd" placeholder="${ai18n('confirmPwd')}"></div>
      <p class="auth-error" id="pwdError"></p>
      <button class="btn btn-primary btn-block" type="submit" id="pwdBtn">${ai18n('changePwdBtn')}</button>
    </form>`;
}
async function handleChangePwd(e){
  e.preventDefault();
  const cur=getValue('curPwd'), np=getValue('newPwd'), cp=getValue('confirmPwd');
  const err=document.getElementById('pwdError');
  err.textContent='';
  if(!cur||!np||!cp){ err.textContent=authErrMsg('MISSING_FIELDS'); return false; }
  if(np!==cp){ err.textContent=ai18n('pwdMismatch'); return false; }
  if(np.length<6){ err.textContent=authErrMsg('SHORT_PASSWORD'); return false; }
  const btn=document.getElementById('pwdBtn'); btn.textContent='…'; btn.disabled=true;
  try{
    const r=await fetch('/api/password',{method:'POST',headers:authHeaders(),body:JSON.stringify({currentPassword:cur,newPassword:np})});
    const data=await r.json(); btn.textContent=ai18n('changePwdBtn'); btn.disabled=false;
    if(!r.ok){ err.textContent=authErrMsg(data.error); return false; }
    toast(ai18n('pwdChanged')); renderSecurity(document.getElementById('acctBody'));
  }catch{ btn.textContent=ai18n('changePwdBtn'); btn.disabled=false; err.textContent=authErrMsg('NETWORK_ERROR'); }
  return false;
}

/* ---------- Wishlist toggle (called from product cards) ---------- */
async function toggleWishlist(productId){
  if(!authToken()){ openAuthModal('login'); return false; }
  try{
    const r=await fetch('/api/wishlist',{method:'POST',headers:authHeaders(),body:JSON.stringify({productId})});
    if(r.ok) return true;
  }catch{}
  return false;
}

/* ---------- Header integration ---------- */
function updateAuthUI(){
  const btn=document.getElementById('accountBtn'); if(!btn) return;
  try{
    const user=JSON.parse(localStorage.getItem(USER_KEY));
    if(user && user.email){
      const initial=(user.email.charAt(0)||'U').toUpperCase();
      btn.innerHTML=`<span class="user-avatar">${initial}</span>`;
      btn.classList.add('logged-in'); btn.title=user.email;
      btn.setAttribute('aria-label','Account: '+user.email);
      btn.onclick=()=>openAccountPanel('overview');
      return;
    }
  }catch{}
  const ICON=(typeof window!=='undefined'&&window.ICON)||{};
  btn.innerHTML=ICON.user||'👤'; btn.classList.remove('logged-in');
  btn.title='Account'; btn.setAttribute('aria-label','Account');
  btn.onclick=()=>openAuthModal('login');
}
function getValue(id){ const el=document.getElementById(id); return el?el.value.trim():''; }
