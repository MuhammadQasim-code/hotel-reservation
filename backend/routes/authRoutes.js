const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.use(verifyToken);
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);

module.exports = router;
