// ============================================================
//  routes/auth.js — Inscription & Connexion
//
//  POST /api/auth/register  → créer un compte
//  POST /api/auth/login     → se connecter, reçoit un token JWT
//  GET  /api/auth/me        → infos du compte connecté
// ============================================================

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const router  = express.Router();

const { findUserByEmail, findUserById, createUser } = require('../data/db');
const { authMiddleware, SECRET } = require('../middleware/auth');

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Adresse e-mail invalide.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    if (findUserByEmail(email)) {
      return res.status(409).json({ error: 'Un compte avec cet e-mail existe déjà.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = createUser({ name, email, password: hashedPassword });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Compte créé avec succès !',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('Erreur register:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail et mot de passe requis.' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou mot de passe incorrect.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'E-mail ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: `Bienvenue, ${user.name} !`,
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── GET /api/auth/me (route protégée) ─────────────────────────
router.get('/me', authMiddleware, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
  res.json({ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt });
});

module.exports = router;
