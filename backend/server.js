// ============================================================
//  server.js — Serveur principal Express
//  Lance avec : node server.js  ou  npm run dev
// ============================================================

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const authRoutes    = require('./routes/auth');
const orderRoutes   = require('./routes/orders');
const productRoutes = require('./routes/products');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Détection du dossier frontend ───────────────────────────
const FRONTEND_SRC = fs.existsSync(path.join(__dirname, '../frontend'))
  ? path.join(__dirname, '../frontend')
  : path.join(__dirname, 'public');

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(FRONTEND_SRC));

// ── Routes API ──────────────────────────────────────────────
app.use('/api/auth',     authRoutes);     // /api/auth/register  /api/auth/login
app.use('/api/orders',   orderRoutes);    // /api/orders/create  /api/orders/mine
app.use('/api/products', productRoutes);  // /api/products

// ── Route fallback : renvoie index.html pour toutes les pages ─
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_SRC, 'index.html'));
});

// ── Démarrage du serveur ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Serveur démarré sur http://localhost:${PORT}`);
  console.log(`   → API disponible sur http://localhost:${PORT}/api`);
  console.log(`   → Frontend sur      http://localhost:${PORT}\n`);
});
