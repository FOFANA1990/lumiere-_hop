// ============================================================
//  middleware/auth.js — Vérifie le token JWT
//  Utilisé pour protéger les routes qui nécessitent une connexion
// ============================================================

const jwt = require('jsonwebtoken');

const SECRET = 'lumiere_secret_2025_clé_privée'; // En production : mettez dans .env

function authMiddleware(req, res, next) {
  // Récupérer le token depuis le header : Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Accès refusé. Vous devez être connecté.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;  // { id, name, email }
    next();              // Passer à la route suivante
  } catch (err) {
    return res.status(403).json({ error: 'Token invalide ou expiré. Reconnectez-vous.' });
  }
}

module.exports = { authMiddleware, SECRET };
