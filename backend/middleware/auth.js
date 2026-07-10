const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_hotel_reservation';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains id, email, role
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
}

function isUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Access denied. Users only.' });
  }
  next();
}

module.exports = {
  verifyToken,
  isAdmin,
  isUser
};
