// ============================================================
//  server.js — Serveur principal Express
//  Lance avec : node server.js  ou  npm run dev
// ============================================================

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const authRoutes    = require('./routes/auth');
const orderRoutes   = require('./routes/orders');
const productRoutes = require('./routes/products');

const app  = express();
const PORT = 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());                          // Autorise les requêtes du frontend
app.use(express.json());                  // Parse le JSON des requêtes
app.use(express.static(path.join(__dirname, '../frontend'))); // Sert les fichiers HTML/CSS/JS

// ── Routes API ──────────────────────────────────────────────
app.use('/api/auth',     authRoutes);     // /api/auth/register  /api/auth/login
app.use('/api/orders',   orderRoutes);    // /api/orders/create  /api/orders/mine
app.use('/api/products', productRoutes);  // /api/products

// ── Route fallback : renvoie index.html pour toutes les pages ─
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Démarrage du serveur ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Serveur démarré sur http://localhost:${PORT}`);
  console.log(`   → API disponible sur http://localhost:${PORT}/api`);
  console.log(`   → Frontend sur      http://localhost:${PORT}\n`);
});
