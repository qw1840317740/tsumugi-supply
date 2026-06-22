/* =========================================================
   KAISEI SANGYOU — Authentication (Vercel API + Neon PG)
   Calls /api/register, /api/login, /api/me via fetch().
   Token stored in localStorage. No third-party SDK needed.
   ========================================================= */

const TOKEN_KEY = 'kaisei_token';
const USER_KEY  = 'kaisei_user';
const _closeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M6 6l12 12M18 6 6 18"/></svg>';

function initAuth(){
  const token = localStorage.getItem(TOKEN_KEY);
  if(!token){ updateAuthUI(); return; }
  // verify token with server
  fetch('/api/me', { headers: { Authorization: 'Bearer ' + token } })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      updateAuthUI();
    })
    .catch(() => {
      // token expired or invalid — clean up
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      updateAuthUI();
    });
}

/* ---------- Modal ---------- */
function buildAuthModal(){
  return `<div class="auth-overlay" id="authOverlay">
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
    </div>
  </div>`;
}

function openAuthModal(tab){
  if(tab === undefined) tab = 'login';
  if(!document.getElementById('authOverlay')) document.body.insertAdjacentHTML('beforeend', buildAuthModal());
  const ov = document.getElementById('authOverlay');
  ov.classList.add('open');
  document.body.style.overflow = 'hidden';
  authTab(tab);
  ov.addEventListener('click', e => { if(e.target === ov) closeAuthModal(); });
  document.addEventListener('keydown', function escClose(e){ if(e.key==='Escape'){ closeAuthModal(); document.removeEventListener('keydown', escClose); } });
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
  const errEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');
  errEl.textContent = ''; errEl.style.color = '';
  btn.textContent = 'Signing in…'; btn.disabled = true;
  try {
    const resp = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await resp.json();
    btn.textContent = 'Sign In'; btn.disabled = false;
    if(!resp.ok){ errEl.textContent = data.error || 'Login failed.'; return false; }
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    closeAuthModal();
    if(typeof toast === 'function') toast('Welcome back!');
    updateAuthUI();
  } catch {
    btn.textContent = 'Sign In'; btn.disabled = false;
    errEl.textContent = 'Cannot reach server. Please try again later.';
  }
  return false;
}

async function handleRegister(e){
  e.preventDefault();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const company = document.getElementById('regCompany').value.trim();
  const errEl = document.getElementById('regError');
  const btn = document.getElementById('regBtn');
  errEl.textContent = ''; errEl.style.color = '';
  btn.textContent = 'Creating…'; btn.disabled = true;
  try {
    const resp = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, company }),
    });
    const data = await resp.json();
    btn.textContent = 'Create Account'; btn.disabled = false;
    if(!resp.ok){ errEl.textContent = data.error || 'Registration failed.'; return false; }
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    closeAuthModal();
    if(typeof toast === 'function') toast('Account created — welcome!');
    updateAuthUI();
  } catch {
    btn.textContent = 'Create Account'; btn.disabled = false;
    errEl.textContent = 'Cannot reach server. Please try again later.';
  }
  return false;
}

function handleSignOut(){
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  updateAuthUI();
  if(typeof toast === 'function') toast('Signed out');
}

/* ---------- Header integration ---------- */
function updateAuthUI(){
  const btn = document.getElementById('accountBtn');
  if(!btn) return;
  const userStr = localStorage.getItem(USER_KEY);
  if(userStr){
    try {
      const user = JSON.parse(userStr);
      const initial = (user.email || 'U').charAt(0).toUpperCase();
      btn.innerHTML = `<span class="user-avatar">${initial}</span>`;
      btn.classList.add('logged-in');
      btn.title = user.email;
      btn.setAttribute('aria-label', 'Account: ' + user.email);
      btn.onclick = () => {
        if(confirm('Signed in as:\n' + user.email + '\n\nClick OK to sign out.')) handleSignOut();
      };
      return;
    } catch {}
  }
  const ICON = (typeof window !== 'undefined' && window.ICON) || {};
  btn.innerHTML = ICON.user || '👤';
  btn.classList.remove('logged-in');
  btn.title = 'Account';
  btn.setAttribute('aria-label', 'Account');
  btn.onclick = () => openAuthModal('login');
}
