const express = require('express');
const hotelController = require('../controllers/hotelController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { upload } = require('../services/s3Service');

const router = express.Router();

// Public routes
router.get('/', hotelController.getHotels);
router.get('/:id', hotelController.getHotelById);

// Admin-only routes
router.post(
  '/',
  verifyToken,
  isAdmin,
  upload.single('image'),
  hotelController.createHotel
);

router.put(
  '/:id',
  verifyToken,
  isAdmin,
  upload.single('image'),
  hotelController.updateHotel
);

router.delete(
  '/:id',
  verifyToken,
  isAdmin,
  hotelController.deleteHotel
);

module.exports = router;
