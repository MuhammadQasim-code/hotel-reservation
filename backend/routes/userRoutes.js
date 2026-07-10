const express = require('express');
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin-only routes for user database management
router.use(verifyToken);
router.use(isAdmin);

router.get('/', userController.getUsers);
router.delete('/:id', userController.deleteUser);

module.exports = router;
