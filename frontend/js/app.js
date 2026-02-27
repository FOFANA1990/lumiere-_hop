// ============================================================
//  js/app.js — Logique principale de l'application
//  Initialisation, produits, paiement, facture
// ============================================================

// ── Navigation ────────────────────────────────────────────────

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Actions spéciales selon la page
  if (name === 'account') loadAccount();
}

// ── Toast (notification) ──────────────────────────────────────

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Chargement des produits depuis le backend ─────────────────

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  try {
    const products = await apiGetProducts();
    grid.innerHTML = products.map(p => `
      <div class="product-card">
        <div class="product-img">
          ${p.icon}
          ${p.badge ? `<div class="badge">${p.badge}</div>` : ''}
        </div>
        <div class="product-info">
          <div class="product-cat">${p.category}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-desc">${p.desc}</div>
          <div class="product-footer">
            <div class="product-price">${p.price.toFixed(2)} €</div>
            <button class="add-btn" onclick='addToCart(${JSON.stringify(p)})'>+ Ajouter</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = `<p style="color:var(--error-txt)">Erreur : ${err.message}</p>`;
  }
}

// ── Formatage des champs de carte ─────────────────────────────

function formatCard(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.match(/.{1,4}/g)?.join(' ') || v;
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
  input.value = v;
}

// ── Traitement du paiement ────────────────────────────────────

async function processPayment() {
  const cardName = document.getElementById('cardName').value.trim();
  const cardNum  = document.getElementById('cardNumber').value.trim();
  const expiry   = document.getElementById('cardExpiry').value.trim();
  const cvv      = document.getElementById('cardCvv').value.trim();
  const address  = document.getElementById('shipAddress').value.trim();
  const errEl    = document.getElementById('payError');
  errEl.classList.add('hidden');

  // Validation locale
  if (!cardName || !cardNum || !expiry || !cvv || !address) {
    errEl.textContent = 'Veuillez remplir tous les champs.';
    errEl.classList.remove('hidden');
    return;
  }
  if (cardNum.replace(/\s/g,'').length < 16) {
    errEl.textContent = 'Numéro de carte invalide (16 chiffres requis).';
    errEl.classList.remove('hidden');
    return;
  }

  const payBtn = document.getElementById('payBtn');
  payBtn.disabled   = true;
  payBtn.textContent = '⏳ Traitement...';

  try {
    const cart  = getCart();
    // Envoyer la commande au backend (qui recalcule les totaux côté serveur)
    const result = await apiCreateOrder(cart, address, cardName);

    showToast('Paiement accepté ! ✓');
    clearCart();
    buildInvoice(result.order);

    setTimeout(() => showPage('invoice'), 600);

  } catch (err) {
    errEl.textContent = 'Erreur : ' + err.message;
    errEl.classList.remove('hidden');
  } finally {
    payBtn.disabled   = false;
    payBtn.textContent = 'Payer →';
  }
}

// ── Construction de la facture ────────────────────────────────

function buildInvoice(order) {
  const dateStr = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  document.getElementById('invNumber').textContent = 'N° ' + order.id;
  document.getElementById('invDate').textContent   = 'Date : ' + dateStr;

  document.getElementById('invClient').innerHTML = `
    <strong>${order.userName}</strong><br/>
    ${order.userEmail}<br/>
    ${order.address}
  `;

  document.getElementById('invItems').innerHTML = order.items.map(item => `
    <tr>
      <td>${item.icon} ${item.name}</td>
      <td>${item.price.toFixed(2)} €</td>
      <td>${item.qty}</td>
      <td class="right">${(item.price * item.qty).toFixed(2)} €</td>
    </tr>
  `).join('');

  document.getElementById('invHT').textContent    = order.subtotal.toFixed(2) + ' €';
  document.getElementById('invTax').textContent   = order.tax.toFixed(2) + ' €';
  document.getElementById('invTotal').textContent = order.total.toFixed(2) + ' €';
}

// ── Téléchargement de la facture ──────────────────────────────

function printInvoice() {
  showToast('Ouverture de la boîte de dialogue impression...');
  setTimeout(() => window.print(), 300);
}

// ── Initialisation au chargement de la page ───────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Charger les produits depuis le backend
  loadProducts();

  // Restaurer la session si token existant
  const user = JSON.parse(localStorage.getItem('lumiere_user') || 'null');
  if (user) {
    updateNavLoggedIn(user);
  }

  // Mettre à jour le badge panier
  updateCartBadge();
});
