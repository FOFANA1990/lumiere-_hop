// ============================================================
//  routes/products.js — Catalogue produits
//
//  GET /api/products        → liste tous les produits
//  GET /api/products/:id    → un produit par ID
// ============================================================

const express = require('express');
const router  = express.Router();

// Catalogue de produits (en production : lire depuis une BDD)
const products = [
  { id: 1, name: "Sérum Éclat Doré",       category: "Soin Visage",  price: 89.90, icon: "✨", desc: "Formule concentrée à l'or 24k et à l'acide hyaluronique pour un teint lumineux.",   badge: "Bestseller" },
  { id: 2, name: "Crème Rose Éternelle",    category: "Hydratation",  price: 65.00, icon: "🌹", desc: "Riche en extraits de rose de Damas, hydratation intense 24h.",                      badge: null },
  { id: 3, name: "Rouge à Lèvres Velours",  category: "Maquillage",   price: 34.50, icon: "💋", desc: "Tenue 12h, couleur intense, confort exceptionnel.",                                 badge: "Nouveau" },
  { id: 4, name: "Fond de Teint Poudre",    category: "Maquillage",   price: 48.00, icon: "🪞", desc: "Couvrance modulable, fini naturel bonne mine.",                                     badge: null },
  { id: 5, name: "Huile Précieuse Corps",   category: "Soin Corps",   price: 72.00, icon: "🫙", desc: "Mélange d'huiles d'argan, jojoba et rose musquée.",                                badge: "Exclusif" },
  { id: 6, name: "Palette Yeux Chic",       category: "Maquillage",   price: 58.00, icon: "🎨", desc: "12 teintes magnétiques, du nude au smoky sophistiqué.",                            badge: null },
  { id: 7, name: "Masque Nuit Régénérant",  category: "Soin Visage",  price: 55.00, icon: "🌙", desc: "Répare et régénère la peau pendant le sommeil.",                                   badge: null },
  { id: 8, name: "Eau Micellaire Luxe",     category: "Démaquillant", price: 28.00, icon: "💧", desc: "Démaquille en douceur même le maquillage waterproof.",                             badge: null },
];

// GET /api/products
router.get('/', (req, res) => {
  res.json(products);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Produit introuvable.' });
  res.json(product);
});

module.exports = router;
