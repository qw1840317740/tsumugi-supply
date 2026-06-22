/* =========================================================
   KAISEI SANGYOU — Authentication module (Supabase)
   Handles login / register / logout / session state.
   Requires: Supabase CDN, supabase-config.js, app.js (for ICON/toast)
   ========================================================= */

let _sb = null;
let _session = null;
const _closeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M6 6l12 12M18 6 6 18"/></svg>';

function initAuth(){
  if(!AUTH_CONFIGURED || typeof supabase === 'undefined') return;
  _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  _sb.auth.getSession().then(({ data }) => { _session = data.session; updateAuthUI(); });
  _sb.auth.onAuthStateChange((_evt, s) => { _session = s; updateAuthUI(); });
}

/* ---------- Modal ---------- */
function buildAuthModal(){
  const notReady = `
    <div class="auth-card">
      <button class="auth-close" onclick="closeAuthModal()">${_closeSvg}</button>
      <div style="text-align:center;padding:20px 0">
        <h2 style="margin-bottom:12px">Setup Required</h2>
        <p class="muted" style="max-width:280px;margin:0 auto 20px">To enable user accounts, create a free Supabase project and add your keys to <code>assets/js/supabase-config.js</code>.</p>
        <a class="btn btn-primary" href="https://supabase.com/dashboard" target="_blank" rel="noopener">Create Supabase Project →</a>
      </div>
    </div>`;
  const ready = `
    <div class="auth-card">
      <button class="auth-close" onclick="closeAuthModal()">${_closeSvg}</button>
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login" type="button" onclick="authTab('login')">Sign In</button>
        <button class="auth-tab" data-tab="register" type="button" onclick="authTab('register')">Register</button>
      </div>
      <form class="auth-form" id="loginForm" onsubmit="return handleSignIn(event)">
        <div class="auth-field"><input type="email" id="loginEmail" required placeholder="Email" autocomplete="email"></div>
        <div class="auth-field"><input type="password" id="loginPassword" required placeholder="Password" autocomplete="current-password"></div>
        <p class="auth-error" id="loginError"></p>
        <button class="btn btn-primary btn-block btn-lg" type="submit" id="loginBtn">Sign In</button>
      </form>
      <form class="auth-form auth-hidden" id="registerForm" onsubmit="return handleRegister(event)">
        <div class="auth-field"><input type="email" id="regEmail" required placeholder="Email" autocomplete="email"></div>
        <div class="auth-field"><input id="regCompany" required placeholder="Company / Shop name"></div>
        <div class="auth-field"><input type="password" id="regPassword" required minlength="6" placeholder="Password (min 6 characters)" autocomplete="new-password"></div>
        <p class="auth-error" id="regError"></p>
        <button class="btn btn-primary btn-block btn-lg" type="submit" id="regBtn">Create Account</button>
      </form>
    </div>`;
  return `<div class="auth-overlay" id="authOverlay">${AUTH_CONFIGURED ? ready : notReady}</div>`;
}

function openAuthModal(tab){
  if(tab === undefined) tab = 'login';
  if(!document.getElementById('authOverlay')) document.body.insertAdjacentHTML('beforeend', buildAuthModal());
  const overlay = document.getElementById('authOverlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  if(AUTH_CONFIGURED) authTab(tab);
  // close on backdrop click / Esc
  overlay.addEventListener('click', e => { if(e.target === overlay) closeAuthModal(); });
}
function closeAuthModal(){
  const el = document.getElementById('authOverlay');
  if(el) el.classList.remove('open');
  document.body.style.overflow = '';
}
function authTab(tab){
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  const lf = document.getElementById('loginForm');    if(lf) lf.classList.toggle('auth-hidden', tab !== 'login');
  const rf = document.getElementById('registerForm'); if(rf) rf.classList.toggle('auth-hidden', tab !== 'register');
}

/* ---------- Auth actions ---------- */
async function handleSignIn(e){
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const err = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');
  err.textContent = ''; err.style.color = '';
  btn.textContent = 'Signing in…'; btn.disabled = true;
  const { error } = await _sb.auth.signInWithPassword({ email, password });
  btn.textContent = 'Sign In'; btn.disabled = false;
  if(error){ err.textContent = error.message; return false; }
  closeAuthModal();
  if(typeof toast === 'function') toast('Welcome back!');
  return false;
}

async function handleRegister(e){
  e.preventDefault();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const company = document.getElementById('regCompany').value.trim();
  const err = document.getElementById('regError');
  const btn = document.getElementById('regBtn');
  err.textContent = ''; err.style.color = '';
  btn.textContent = 'Creating…'; btn.disabled = true;
  const { data, error } = await _sb.auth.signUp({ email, password, options: { data: { company } } });
  btn.textContent = 'Create Account'; btn.disabled = false;
  if(error){ err.textContent = error.message; return false; }
  if(data.user && !data.session){
    err.style.color = 'var(--ok)';
    err.textContent = '✓ Account created. Check your email to confirm, then sign in.';
    return false;
  }
  closeAuthModal();
  if(typeof toast === 'function') toast('Account created — welcome!');
  return false;
}

async function handleSignOut(){
  if(_sb) await _sb.auth.signOut();
  _session = null;
  updateAuthUI();
  if(typeof toast === 'function') toast('Signed out');
}

/* ---------- Header integration ---------- */
function updateAuthUI(){
  const btn = document.getElementById('accountBtn');
  if(!btn) return;
  if(_session){
    const email = _session.user.email || '';
    const initial = email.charAt(0).toUpperCase() || 'U';
    btn.innerHTML = `<span class="user-avatar">${initial}</span>`;
    btn.classList.add('logged-in');
    btn.title = email;
    btn.setAttribute('aria-label', 'Account: ' + email);
    btn.onclick = () => {
      if(confirm('Signed in as:\n' + email + '\n\nClick OK to sign out.')) handleSignOut();
    };
  } else {
    const ICON = (typeof window !== 'undefined' && window.ICON) || {};
    btn.innerHTML = ICON.user || '👤';
    btn.classList.remove('logged-in');
    btn.title = 'Account';
    btn.setAttribute('aria-label', 'Account');
    btn.onclick = () => openAuthModal('login');
  }
}
