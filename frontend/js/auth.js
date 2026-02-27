// ============================================================
//  js/auth.js — Authentification (inscription / connexion)
// ============================================================

// ── Basculer entre les deux formulaires ──────────────────────

function toggleAuth(mode) {
  const login    = document.getElementById('loginForm');
  const register = document.getElementById('registerForm');
  if (mode === 'register') {
    login.classList.add('hidden');
    register.classList.remove('hidden');
  } else {
    register.classList.add('hidden');
    login.classList.remove('hidden');
  }
}

// ── Afficher/cacher un message ────────────────────────────────

function showMsg(id, text, type = 'error') {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className   = `msg ${type}`;
  el.classList.remove('hidden');
}
function hideMsg(id) {
  document.getElementById(id).classList.add('hidden');
}

// ── Inscription ───────────────────────────────────────────────

async function register() {
  hideMsg('regError');
  hideMsg('regSuccess');

  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  // Validation côté client (le serveur revalide aussi)
  if (!name || !email || !password) {
    return showMsg('regError', 'Tous les champs sont obligatoires.');
  }
  if (password.length < 6) {
    return showMsg('regError', 'Le mot de passe doit contenir au moins 6 caractères.');
  }

  try {
    const data = await apiRegister(name, email, password);

    // Sauvegarder le token et les infos utilisateur
    localStorage.setItem('lumiere_token', data.token);
    localStorage.setItem('lumiere_user', JSON.stringify(data.user));

    showMsg('regSuccess', 'Compte créé ! Redirection...', 'success');
    updateNavLoggedIn(data.user);

    setTimeout(() => showPage('home'), 1200);

  } catch (err) {
    showMsg('regError', err.message);
  }
}

// ── Connexion ─────────────────────────────────────────────────

async function login() {
  hideMsg('loginError');

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    return showMsg('loginError', 'Veuillez remplir tous les champs.');
  }

  try {
    const data = await apiLogin(email, password);

    // Sauvegarder le token et les infos utilisateur
    localStorage.setItem('lumiere_token', data.token);
    localStorage.setItem('lumiere_user', JSON.stringify(data.user));

    updateNavLoggedIn(data.user);
    showToast(data.message);
    showPage('home');

  } catch (err) {
    showMsg('loginError', err.message);
  }
}

// ── Déconnexion ───────────────────────────────────────────────

function logout() {
  localStorage.removeItem('lumiere_token');
  localStorage.removeItem('lumiere_user');
  clearCart();
  updateNavLoggedOut();
  showToast('Déconnecté(e) avec succès.');
  showPage('home');
}

// ── Mettre à jour le menu de navigation ───────────────────────

function updateNavLoggedIn(user) {
  document.getElementById('nav-login').classList.add('hidden');
  document.getElementById('nav-account').classList.remove('hidden');
  document.getElementById('nav-logout').classList.remove('hidden');
  document.getElementById('nav-logout').textContent = `👤 ${user.name}`;
}

function updateNavLoggedOut() {
  document.getElementById('nav-login').classList.remove('hidden');
  document.getElementById('nav-account').classList.add('hidden');
  document.getElementById('nav-logout').classList.add('hidden');
}

// ── Page "Mon Compte" ─────────────────────────────────────────

async function loadAccount() {
  const user = JSON.parse(localStorage.getItem('lumiere_user') || 'null');
  if (!user) return showPage('login');

  // Infos utilisateur
  document.getElementById('accountInfo').innerHTML = `
    <strong>Nom :</strong> ${user.name}<br/>
    <strong>E-mail :</strong> ${user.email}
  `;

  // Historique des commandes
  const hist = document.getElementById('orderHistory');
  hist.innerHTML = '<div class="loading">Chargement...</div>';
  try {
    const orders = await apiGetMyOrders();
    if (orders.length === 0) {
      hist.innerHTML = '<p style="color:var(--muted); font-size:14px;">Aucune commande pour le moment.</p>';
      return;
    }
    hist.innerHTML = orders.reverse().map(o => `
      <div class="order-card">
        <div class="order-card-header">
          <span class="order-id">${o.id}</span>
          <span class="order-badge">${o.status}</span>
        </div>
        <div style="color:var(--muted); margin-bottom:10px; font-size:12px;">
          ${new Date(o.createdAt).toLocaleDateString('fr-FR', { dateStyle:'long' })}
          — ${o.address}
        </div>
        ${o.items.map(i => `<div>${i.icon} ${i.name} × ${i.qty}</div>`).join('')}
        <div class="order-total" style="margin-top:12px;">${o.total.toFixed(2)} € TTC</div>
      </div>
    `).join('');
  } catch {
    hist.innerHTML = '<p style="color:var(--error-txt);">Erreur lors du chargement.</p>';
  }
}
