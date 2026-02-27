// ============================================================
//  js/api.js — Couche de communication avec le backend
//  Toutes les requêtes HTTP passent par ce fichier
// ============================================================

const API = ((typeof window !== 'undefined' && window.location && window.location.origin)
  ? window.location.origin
  : 'http://localhost:3000') + '/api';

// ── Helpers ──────────────────────────────────────────────────

// Récupérer le token JWT stocké dans localStorage
function getToken() {
  return localStorage.getItem('lumiere_token');
}

// Construire les headers avec ou sans authentification
function headers(withAuth = false) {
  const h = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = getToken();
    if (token) h['Authorization'] = 'Bearer ' + token;
  }
  return h;
}

// Fonction générique pour faire des requêtes
async function request(method, endpoint, body = null, auth = false) {
  const options = {
    method,
    headers: headers(auth)
  };
  if (body) options.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(API + endpoint, options);
  } catch (e) {
    throw new Error('Impossible de contacter le serveur.');
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error((data && data.error) || 'Erreur serveur');
    }
    if (data == null) {
      throw new Error('Réponse JSON invalide du serveur.');
    }
    return data;
  } else {
    const text = await res.text();
    const snippet = text.slice(0, 120).replace(/\s+/g, ' ');
    throw new Error(`Réponse inattendue du serveur: "${snippet}"`);
  }
}

// ── Fonctions API Auth ────────────────────────────────────────

async function apiRegister(name, email, password) {
  return request('POST', '/auth/register', { name, email, password });
}

async function apiLogin(email, password) {
  return request('POST', '/auth/login', { email, password });
}

async function apiGetMe() {
  return request('GET', '/auth/me', null, true);
}

// ── Fonctions API Produits ────────────────────────────────────

async function apiGetProducts() {
  return request('GET', '/products');
}

// ── Fonctions API Commandes ───────────────────────────────────

async function apiCreateOrder(items, address, cardName) {
  return request('POST', '/orders/create', { items, address, cardName }, true);
}

async function apiGetMyOrders() {
  return request('GET', '/orders/mine', null, true);
}
