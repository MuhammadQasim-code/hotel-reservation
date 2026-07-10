const Reservation = require('../models/Reservation');
const Hotel = require('../models/Hotel');
const AppError = require('../utils/appError');

exports.createReservation = async (req, res, next) => {
  try {
    const {
      hotelId,
      customerName,
      phoneNumber,
      reservationDate,
      reservationDay,
      numberOfPersons,
      mealPreference,
      stayType,
      specialNotes
    } = req.body;

    const userId = req.user.id;

    // 1. Basic validation
    if (!hotelId || !customerName || !phoneNumber || !reservationDate || !reservationDay || !numberOfPersons || !mealPreference || !stayType) {
      return next(new AppError('Please provide all required reservation fields.', 400));
    }

    const numPersons = parseInt(numberOfPersons, 10);
    if (isNaN(numPersons) || numPersons <= 0) {
      return next(new AppError('Number of persons must be greater than zero.', 400));
    }

    // 2. Validate date is not in the past (comparing dates set to midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(reservationDate);
    bookingDate.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return next(new AppError('Reservation date cannot be in the past.', 400));
    }

    // 3. Verify hotel capacity
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return next(new AppError('Hotel not found.', 404));
    }

    if (numPersons > hotel.maximum_capacity) {
      return next(new AppError(`Number of persons exceeds the hotel's maximum capacity of ${hotel.maximum_capacity}.`, 400));
    }

    // 4. Create reservation
    const reservationId = await Reservation.create({
      userId,
      hotelId,
      customerName,
      phoneNumber,
      reservationDate,
      reservationDay,
      numberOfPersons: numPersons,
      mealPreference,
      stayType,
      specialNotes
    });

    const reservation = await Reservation.findById(reservationId);

    res.status(201).json({
      status: 'success',
      data: { reservation }
    });
  } catch (error) {
    next(error);
  }
};

exports.getReservations = async (req, res, next) => {
  try {
    let reservations;
    
    // Admins see everything, users see only their own
    if (req.user.role === 'admin') {
      reservations = await Reservation.findAll();
    } else {
      reservations = await Reservation.findByUserId(req.user.id);
    }

    res.status(200).json({
      status: 'success',
      results: reservations.length,
      data: { reservations }
    });
  } catch (error) {
    next(error);
  }
};

exports.getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return next(new AppError('No reservation found with that ID.', 404));
    }

    // Enforce ownership check: Users can only view their own reservations
    if (req.user.role !== 'admin' && reservation.user_id !== req.user.id) {
      return next(new AppError('You do not have permission to view this reservation.', 403));
    }

    res.status(200).json({
      status: 'success',
      data: { reservation }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReservation = async (req, res, next) => {
  try {
    const {
      customerName,
      phoneNumber,
      reservationDate,
      reservationDay,
      numberOfPersons,
      mealPreference,
      stayType,
      specialNotes
    } = req.body;

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return next(new AppError('No reservation found with that ID.', 404));
    }

    // Enforce ownership check
    if (req.user.role !== 'admin' && reservation.user_id !== req.user.id) {
      return next(new AppError('You do not have permission to edit this reservation.', 403));
    }

    // Check status is Pending
    if (reservation.status !== 'Pending') {
      return next(new AppError('Reservations can only be edited when status is Pending.', 400));
    }

    const numPersons = numberOfPersons ? parseInt(numberOfPersons, 10) : reservation.number_of_persons;
    if (numberOfPersons && (isNaN(numPersons) || numPersons <= 0)) {
      return next(new AppError('Number of persons must be greater than zero.', 400));
    }

    // Validate date is not in the past
    if (reservationDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bookingDate = new Date(reservationDate);
      bookingDate.setHours(0, 0, 0, 0);

      if (bookingDate < today) {
        return next(new AppError('Reservation date cannot be in the past.', 400));
      }
    }

    // Verify capacity
    const hotel = await Hotel.findById(reservation.hotel_id);
    if (numPersons > hotel.maximum_capacity) {
      return next(new AppError(`Number of persons exceeds the hotel's maximum capacity of ${hotel.maximum_capacity}.`, 400));
    }

    const updated = await Reservation.update(req.params.id, {
      customerName: customerName || reservation.customer_name,
      phoneNumber: phoneNumber || reservation.phone_number,
      reservationDate: reservationDate || reservation.reservation_date,
      reservationDay: reservationDay || reservation.reservation_day,
      numberOfPersons: numPersons,
      mealPreference: mealPreference || reservation.meal_preference,
      stayType: stayType || reservation.stay_type,
      specialNotes: specialNotes !== undefined ? specialNotes : reservation.special_notes
    });

    if (!updated) {
      return next(new AppError('Reservation update failed.', 400));
    }

    const updatedReservation = await Reservation.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { reservation: updatedReservation }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return next(new AppError('No reservation found with that ID.', 404));
    }

    // Enforce ownership
    if (req.user.role !== 'admin' && reservation.user_id !== req.user.id) {
      return next(new AppError('You do not have permission to cancel this reservation.', 403));
    }

    // Check status is Pending
    if (reservation.status !== 'Pending') {
      return next(new AppError('Reservations can only be cancelled when status is Pending.', 400));
    }

    const cancelled = await Reservation.delete(req.params.id);
    if (!cancelled) {
      return next(new AppError('Failed to cancel reservation.', 400));
    }

    res.status(200).json({
      status: 'success',
      message: 'Reservation cancelled successfully.'
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['Approved', 'Rejected', 'Completed'].includes(status)) {
      return next(new AppError('Please provide a valid status: Approved, Rejected, or Completed.', 400));
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return next(new AppError('No reservation found with that ID.', 404));
    }

    const updated = await Reservation.updateStatus(req.params.id, status);
    if (!updated) {
      return next(new AppError('Failed to update reservation status.', 400));
    }

    res.status(200).json({
      status: 'success',
      message: `Reservation status updated to ${status}.`
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminStats = async (req, res, next) => {
  try {
    const totalHotels = await Hotel.countAll();
    const totalUsers = await User.countAll();
    const reservationStats = await Reservation.getStats();

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalHotels,
        totalReservations: reservationStats.total,
        pendingReservations: reservationStats.pending,
        approvedReservations: reservationStats.approved,
        rejectedReservations: reservationStats.rejected,
        completedReservations: reservationStats.completed
      }
    });
  } catch (error) {
    next(error);
  }
};

