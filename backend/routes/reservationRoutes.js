const express = require('express');
const reservationController = require('../controllers/reservationController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All reservation routes require authentication
router.use(verifyToken);

router.post('/', reservationController.createReservation);
router.get('/', reservationController.getReservations);
router.get('/admin/stats', isAdmin, reservationController.getAdminStats);
router.get('/:id', reservationController.getReservationById);
router.put('/:id', reservationController.updateReservation);
router.delete('/:id', reservationController.deleteReservation); // Cancelling


// Admin status update route
router.patch('/:id/status', isAdmin, reservationController.updateReservationStatus);

module.exports = router;
