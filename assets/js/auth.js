/* =========================================================
   KAISEI SANGYOU — Authentication (Vercel API + Neon PG)
   Self-contained i18n for the auth modal (EN / 中文 / 日本語).
   ========================================================= */

const TOKEN_KEY = 'kaisei_token';
const USER_KEY  = 'kaisei_user';
const _closeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M6 6l12 12M18 6 6 18"/></svg>';

/* ---------- Auth i18n (follows site language) ---------- */
const AUTH_I18N = {
  en: {
    signin:'Sign In', register:'Register',
    emailPh:'Email', passwordPh:'Password', companyPh:'Company / Shop name', passwordHint:'Password (min 6 characters)',
    signinBtn:'Sign In', registerBtn:'Create Account', signingIn:'Signing in…', creating:'Creating…',
    welcomeBack:'Welcome back!', welcomeNew:'Account created — welcome!', signedOut:'Signed out',
    signOutConfirm:'Signed in as:\n{EMAIL}\n\nClick OK to sign out.',
    err:{ EMAIL_TAKEN:'This email is already registered.', INVALID_CREDENTIALS:'Invalid email or password.',
      MISSING_FIELDS:'Email and password are required.', SHORT_PASSWORD:'Password must be at least 6 characters.',
      SERVER_ERROR:'Something went wrong. Please try again.', NETWORK_ERROR:'Cannot reach server. Please try again later.' }
  },
  zh: {
    signin:'登录', register:'注册',
    emailPh:'邮箱', passwordPh:'密码', companyPh:'公司 / 店铺名', passwordHint:'密码（至少 6 个字符）',
    signinBtn:'登录', registerBtn:'创建账户', signingIn:'登录中…', creating:'创建中…',
    welcomeBack:'欢迎回来！', welcomeNew:'账户已创建 — 欢迎！', signedOut:'已退出登录',
    signOutConfirm:'已登录：\n{EMAIL}\n\n点击「确定」退出登录。',
    err:{ EMAIL_TAKEN:'该邮箱已被注册。', INVALID_CREDENTIALS:'邮箱或密码错误。',
      MISSING_FIELDS:'请填写邮箱和密码。', SHORT_PASSWORD:'密码至少需要 6 个字符。',
      SERVER_ERROR:'出错了，请重试。', NETWORK_ERROR:'无法连接服务器，请稍后再试。' }
  },
  ja: {
    signin:'サインイン', register:'登録',
    emailPh:'メール', passwordPh:'パスワード', companyPh:'会社名・店舗名', passwordHint:'パスワード（6文字以上）',
    signinBtn:'サインイン', registerBtn:'アカウント作成', signingIn:'サインイン中…', creating:'作成中…',
    welcomeBack:'おかえりなさい！', welcomeNew:'アカウント作成完了 — ようこそ！', signedOut:'サインアウトしました',
    signOutConfirm:'サインイン中：\n{EMAIL}\n\nOKでサインアウトします。',
    err:{ EMAIL_TAKEN:'このメールアドレスは既に登録されています。', INVALID_CREDENTIALS:'メールアドレスまたはパスワードが正しくありません。',
      MISSING_FIELDS:'メールアドレスとパスワードを入力してください。', SHORT_PASSWORD:'パスワードは6文字以上で入力してください。',
      SERVER_ERROR:'エラーが発生しました。もう一度お試しください。', NETWORK_ERROR:'サーバーに接続できません。しばらくしてからお試しください。' }
  },
};
function _lang(){ return (typeof getLang === 'function') ? getLang() : 'en'; }
function ai18n(key){
  const dict = AUTH_I18N[_lang()] || AUTH_I18N.en;
  return dict[key] !== undefined ? dict[key] : (AUTH_I18N.en[key] || key);
}
function authErrMsg(code){
  const dict = AUTH_I18N[_lang()] || AUTH_I18N.en;
  return (dict.err && dict.err[code]) || (AUTH_I18N.en.err[code]) || code;
}

/* ---------- Init ---------- */
function initAuth(){
  const token = localStorage.getItem(TOKEN_KEY);
  if(!token){ updateAuthUI(); return; }
  fetch('/api/me', { headers:{ Authorization:'Bearer '+token } })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => { localStorage.setItem(USER_KEY, JSON.stringify(data.user)); updateAuthUI(); })
    .catch(() => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); updateAuthUI(); });
}

/* ---------- Modal ---------- */
function buildAuthModal(){
  return `<div class="auth-overlay" id="authOverlay">
    <div class="auth-card">
      <button class="auth-close" onclick="closeAuthModal()">${_closeSvg}</button>
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login" type="button" onclick="authTab('login')">${ai18n('signin')}</button>
        <button class="auth-tab" data-tab="register" type="button" onclick="authTab('register')">${ai18n('register')}</button>
      </div>
      <form class="auth-form" id="loginForm" onsubmit="return handleSignIn(event)">
        <div class="auth-field"><input type="email" id="loginEmail" required placeholder="${ai18n('emailPh')}" autocomplete="email"></div>
        <div class="auth-field"><input type="password" id="loginPassword" required placeholder="${ai18n('passwordPh')}" autocomplete="current-password"></div>
        <p class="auth-error" id="loginError"></p>
        <button class="btn btn-primary btn-block btn-lg" type="submit" id="loginBtn">${ai18n('signinBtn')}</button>
      </form>
      <form class="auth-form auth-hidden" id="registerForm" onsubmit="return handleRegister(event)">
        <div class="auth-field"><input type="email" id="regEmail" required placeholder="${ai18n('emailPh')}" autocomplete="email"></div>
        <div class="auth-field"><input id="regCompany" required placeholder="${ai18n('companyPh')}"></div>
        <div class="auth-field"><input type="password" id="regPassword" required minlength="6" placeholder="${ai18n('passwordHint')}" autocomplete="new-password"></div>
        <p class="auth-error" id="regError"></p>
        <button class="btn btn-primary btn-block btn-lg" type="submit" id="regBtn">${ai18n('registerBtn')}</button>
      </form>
    </div>
  </div>`;
}
function openAuthModal(tab){
  if(tab===undefined) tab='login';
  if(!document.getElementById('authOverlay')) document.body.insertAdjacentHTML('beforeend', buildAuthModal());
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

/* ---------- Actions ---------- */
async function handleSignIn(e){
  e.preventDefault();
  const email=getValue('loginEmail'), password=getValue('loginPassword');
  const errEl=document.getElementById('loginError'), btn=document.getElementById('loginBtn');
  errEl.textContent=''; btn.textContent=ai18n('signingIn'); btn.disabled=true;
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
  errEl.textContent=''; btn.textContent=ai18n('creating'); btn.disabled=true;
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
  updateAuthUI(); toast(ai18n('signedOut'));
}

/* ---------- Header ---------- */
function updateAuthUI(){
  const btn=document.getElementById('accountBtn'); if(!btn) return;
  try{
    const user=JSON.parse(localStorage.getItem(USER_KEY));
    if(user && user.email){
      const initial=(user.email.charAt(0)||'U').toUpperCase();
      btn.innerHTML=`<span class="user-avatar">${initial}</span>`;
      btn.classList.add('logged-in'); btn.title=user.email;
      btn.setAttribute('aria-label','Account: '+user.email);
      btn.onclick=()=>{ if(confirm(ai18n('signOutConfirm').replace('{EMAIL}',user.email))) handleSignOut(); };
      return;
    }
  }catch{}
  const ICON=(typeof window!=='undefined'&&window.ICON)||{};
  btn.innerHTML=ICON.user||'👤'; btn.classList.remove('logged-in');
  btn.title='Account'; btn.setAttribute('aria-label','Account');
  btn.onclick=()=>openAuthModal('login');
}
function getValue(id){ const el=document.getElementById(id); return el?el.value.trim():''; }
