// ============================================================
//  routes/orders.js — Gestion des commandes
//
//  POST /api/orders/create  → créer une commande (connecté requis)
//  GET  /api/orders/mine    → mes commandes (connecté requis)
//  GET  /api/orders/:id     → détail d'une commande
// ============================================================

const express = require('express');
const router  = express.Router();

const { createOrder, getOrdersByUserId, getOrders } = require('../data/db');
const { authMiddleware } = require('../middleware/auth');

// ── POST /api/orders/create ──────────────────────────────────
// Toutes les routes ici nécessitent d'être connecté
router.post('/create', authMiddleware, (req, res) => {
  try {
    const { items, address, cardName } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Le panier est vide.' });
    }
    if (!address) {
      return res.status(400).json({ error: "L'adresse de livraison est requise." });
    }
    if (!cardName) {
      return res.status(400).json({ error: 'Les informations de paiement sont incomplètes.' });
    }

    // Calculer les totaux côté serveur (sécurité : ne pas faire confiance au client)
    const subtotal = parseFloat(
      items.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)
    );
    const tax   = parseFloat((subtotal * 0.20).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    // Créer la commande
    const order = createOrder({
      userId:    req.user.id,
      userName:  req.user.name,
      userEmail: req.user.email,
      address,
      items,
      subtotal,
      tax,
      total
    });

    res.status(201).json({
      message: 'Commande créée avec succès !',
      order
    });

  } catch (err) {
    console.error('Erreur create order:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de la commande.' });
  }
});

// ── GET /api/orders/mine ─────────────────────────────────────
router.get('/mine', authMiddleware, (req, res) => {
  const orders = getOrdersByUserId(req.user.id);
  res.json(orders);
});

// ── GET /api/orders/:id ──────────────────────────────────────
router.get('/:id', authMiddleware, (req, res) => {
  const orders = getOrders();
  const order  = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Commande introuvable.' });
  // Vérifier que la commande appartient à l'utilisateur connecté
  if (order.userId !== req.user.id) return res.status(403).json({ error: 'Accès interdit.' });
  res.json(order);
});

module.exports = router;
