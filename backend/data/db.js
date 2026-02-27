// ============================================================
//  db.js — Base de données JSON simulée (fichier en mémoire)
//  En production, remplacez par MongoDB ou PostgreSQL
// ============================================================

const fs   = require('fs');
const path = require('path');

const USERS_FILE  = path.join(__dirname, 'users.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// ── Helpers lecture/écriture JSON ────────────────────────────

function readFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function writeFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ── Utilisateurs ─────────────────────────────────────────────

function getUsers() {
  return readFile(USERS_FILE);
}

function findUserByEmail(email) {
  return getUsers().find(u => u.email === email.toLowerCase());
}

function findUserById(id) {
  return getUsers().find(u => u.id === id);
}

function createUser(userData) {
  const users = getUsers();
  const newUser = {
    id:        Date.now().toString(),
    name:      userData.name,
    email:     userData.email.toLowerCase(),
    password:  userData.password,   // déjà hashé avant l'appel
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  writeFile(USERS_FILE, users);
  return newUser;
}

// ── Commandes ─────────────────────────────────────────────────

function getOrders() {
  return readFile(ORDERS_FILE);
}

function getOrdersByUserId(userId) {
  return getOrders().filter(o => o.userId === userId);
}

function createOrder(orderData) {
  const orders = getOrders();
  const newOrder = {
    id:          'CMD-' + Date.now().toString().slice(-8),
    userId:      orderData.userId,
    userName:    orderData.userName,
    userEmail:   orderData.userEmail,
    address:     orderData.address,
    items:       orderData.items,
    subtotal:    orderData.subtotal,
    tax:         orderData.tax,
    total:       orderData.total,
    status:      'payée',
    createdAt:   new Date().toISOString()
  };
  orders.push(newOrder);
  writeFile(ORDERS_FILE, orders);
  return newOrder;
}

module.exports = {
  getUsers, findUserByEmail, findUserById, createUser,
  getOrders, getOrdersByUserId, createOrder
};
