// ============================================================
//  js/cart.js — Gestion du panier (stocké dans localStorage)
// ============================================================

// ── Getters / Setters ─────────────────────────────────────────

function getCart() {
  return JSON.parse(localStorage.getItem('lumiere_cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('lumiere_cart', JSON.stringify(cart));
  updateCartBadge();
}

function clearCart() {
  localStorage.removeItem('lumiere_cart');
  updateCartBadge();
}

// ── Mise à jour du badge panier dans le header ────────────────

function updateCartBadge() {
  const total = getCart().reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = total;
}

// ── Ajouter un produit ────────────────────────────────────────

function addToCart(product) {
  // Vérifie si l'utilisateur est connecté AVANT d'ajouter
  if (!getToken()) {
    showToast('Connectez-vous pour ajouter au panier');
    setTimeout(() => showPage('login'), 900);
    return;
  }

  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart(cart);
  showToast(`${product.name} ajouté ✓`);
}

// ── Modifier la quantité ──────────────────────────────────────

function changeQty(productId, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  saveCart(cart);
  renderCart();
}

// ── Supprimer un article ──────────────────────────────────────

function removeItem(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
  renderCart();
}

// ── Calculer les totaux ───────────────────────────────────────

function calcTotals(cart) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax      = subtotal * 0.20;
  const total    = subtotal + tax;
  return { subtotal, tax, total };
}

// ── Afficher le panier ────────────────────────────────────────

function renderCart() {
  const cart      = getCart();
  const container = document.getElementById('cartItems');
  const summary   = document.getElementById('cartSummary');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="big-icon">🛒</div>
        <p>Votre panier est vide</p>
        <button class="btn-primary" onclick="showPage('home')">Voir les produits</button>
      </div>`;
    summary.classList.add('hidden');
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="ci-icon">${item.icon}</div>
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-price">${item.price.toFixed(2)} € / unité</div>
      </div>
      <div class="qty-wrap">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, +1)">+</button>
      </div>
      <div class="ci-total">${(item.price * item.qty).toFixed(2)} €</div>
      <button class="rm-btn" onclick="removeItem(${item.id})" title="Supprimer">✕</button>
    </div>
  `).join('');

  const { subtotal, tax, total } = calcTotals(cart);
  document.getElementById('sSubtotal').textContent = subtotal.toFixed(2) + ' €';
  document.getElementById('sTax').textContent      = tax.toFixed(2) + ' €';
  document.getElementById('sTotal').textContent    = total.toFixed(2) + ' €';
  summary.classList.remove('hidden');
}

// ── Ouvrir le panier (appel depuis le header) ─────────────────

function openCart() {
  renderCart();
  showPage('cart');
}

// ── Aller au paiement ─────────────────────────────────────────

function goToPayment() {
  if (!getToken()) {
    showToast('Vous devez être connecté(e) pour commander.');
    setTimeout(() => showPage('login'), 900);
    return;
  }
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Votre panier est vide.');
    return;
  }

  // Pré-remplir le nom depuis la session
  const user = JSON.parse(localStorage.getItem('lumiere_user') || 'null');
  if (user) document.getElementById('cardName').value = user.name;

  // Afficher le récap dans la page paiement
  const { subtotal, tax, total } = calcTotals(cart);
  document.getElementById('payRecap').innerHTML = `
    <strong>Récapitulatif :</strong><br/>
    ${cart.map(i => `${i.icon} ${i.name} × ${i.qty} = ${(i.price * i.qty).toFixed(2)} €`).join('<br/>')}
    <br/><strong>Total TTC : ${total.toFixed(2)} €</strong>
  `;

  showPage('payment');
}
