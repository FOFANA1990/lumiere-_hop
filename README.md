# LUMIÈRE — Application E-commerce Cosmétiques

Application web complète de vente de cosmétiques en ligne.
- **Backend** : Node.js + Express
- **Frontend** : HTML / CSS / JavaScript vanilla
- **Base de données** : Fichiers JSON (aucune installation de BDD requise)
- **Auth** : JWT + bcrypt

---

## STRUCTURE DU PROJET

```
lumiere-shop/
│
├── backend/
│   ├── server.js               ← Point d'entrée du serveur
│   ├── package.json            ← Dépendances Node.js
│   │
│   ├── data/
│   │   ├── db.js               ← Base de données JSON (lecture/écriture)
│   │   ├── users.json          ← Créé automatiquement au 1er inscription
│   │   └── orders.json         ← Créé automatiquement à la 1ère commande
│   │
│   ├── middleware/
│   │   └── auth.js             ← Vérification du token JWT
│   │
│   └── routes/
│       ├── auth.js             ← /api/auth/register  /api/auth/login
│       ├── products.js         ← /api/products
│       └── orders.js           ← /api/orders/create  /api/orders/mine
│
└── frontend/
    ├── index.html              ← Page principale (SPA)
    │
    ├── css/
    │   └── style.css           ← Tous les styles
    │
    └── js/
        ├── api.js              ← Requêtes HTTP vers le backend
        ├── auth.js             ← Inscription / Connexion / Déconnexion
        ├── cart.js             ← Gestion du panier
        └── app.js              ← Logique principale (produits, paiement, facture)
```

---

## INSTALLATION ET DÉMARRAGE

### Étape 1 — Ouvrir VS Code

```
Fichier → Ouvrir le dossier → sélectionner "lumiere-shop"
```

### Étape 2 — Installer les dépendances

Ouvrir le terminal VS Code (`Ctrl + ù` ou `Terminal → Nouveau terminal`) puis :

```bash
cd backend
npm install
```

### Étape 3 — Lancer le serveur

```bash
npm run dev
```

Vous devriez voir :
```
✅  Serveur démarré sur http://localhost:3000
   → API disponible sur http://localhost:3000/api
   → Frontend sur      http://localhost:3000
```

### Étape 4 — Ouvrir l'application

Ouvrez votre navigateur et allez sur :
```
http://localhost:3000
```

---

## ROUTES API

| Méthode | Endpoint               | Auth ? | Description                    |
|---------|------------------------|--------|--------------------------------|
| POST    | /api/auth/register     | Non    | Créer un compte                |
| POST    | /api/auth/login        | Non    | Se connecter                   |
| GET     | /api/auth/me           | Oui    | Infos du compte connecté       |
| GET     | /api/products          | Non    | Liste tous les produits        |
| GET     | /api/products/:id      | Non    | Un produit par ID              |
| POST    | /api/orders/create     | Oui    | Créer une commande             |
| GET     | /api/orders/mine       | Oui    | Mes commandes                  |
| GET     | /api/orders/:id        | Oui    | Détail d'une commande          |

---

## COMMENT ÇA MARCHE (flux complet)

```
1. L'utilisateur visite http://localhost:3000
2. Le backend sert index.html + les fichiers CSS/JS
3. JS charge les produits via GET /api/products
4. Pour ajouter au panier → vérification du token JWT
5. Si non connecté → redirection vers la page de connexion
6. POST /api/auth/login → le backend retourne un token JWT
7. Le token est stocké dans localStorage
8. Ajout au panier (stocké localStorage)
9. Page paiement → validation des champs
10. POST /api/orders/create (avec token JWT dans le header)
11. Le backend crée la commande dans orders.json
12. La facture est générée et affichée
13. window.print() → l'utilisateur sauvegarde en PDF
```

---

## POUR ALLER EN PRODUCTION

| Besoin          | Solution recommandée     |
|-----------------|--------------------------|
| Vraie BDD       | MongoDB Atlas (gratuit)  |
| Vrai paiement   | Stripe API               |
| Hébergement     | Railway, Render, Vercel  |
| Variables ENV   | Créer un fichier .env    |
| PDF serveur     | Puppeteer ou PDFKit      |
