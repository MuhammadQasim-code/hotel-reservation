const Hotel = require('../models/Hotel');
const AppError = require('../utils/appError');
const { uploadToStorage } = require('../services/s3Service');

exports.getHotels = async (req, res, next) => {
  try {
    const { search, city } = req.query;
    const hotels = await Hotel.findAll({ search, city });

    res.status(200).json({
      status: 'success',
      results: hotels.length,
      data: { hotels }
    });
  } catch (error) {
    next(error);
  }
};

exports.getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return next(new AppError('No hotel found with that ID.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { hotel }
    });
  } catch (error) {
    next(error);
  }
};

exports.createHotel = async (req, res, next) => {
  try {
    const { hotelName, city, address, description, pricePerNight, maximumCapacity, amenities } = req.body;

    if (!hotelName || !city || !address || !description || !pricePerNight || !maximumCapacity) {
      return next(new AppError('Please provide all required hotel fields.', 400));
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToStorage(req.file);
    }

    const hotelId = await Hotel.create({
      hotelName,
      city,
      address,
      description,
      pricePerNight: parseFloat(pricePerNight),
      maximumCapacity: parseInt(maximumCapacity, 10),
      amenities: amenities || '',
      imageUrl
    });

    const hotel = await Hotel.findById(hotelId);

    res.status(201).json({
      status: 'success',
      data: { hotel }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateHotel = async (req, res, next) => {
  try {
    const { hotelName, city, address, description, pricePerNight, maximumCapacity, amenities } = req.body;
    
    const existingHotel = await Hotel.findById(req.params.id);
    if (!existingHotel) {
      return next(new AppError('No hotel found with that ID.', 404));
    }

    let imageUrl = undefined; // undefined means don't update image url
    if (req.file) {
      imageUrl = await uploadToStorage(req.file);
    }

    const updated = await Hotel.update(req.params.id, {
      hotelName: hotelName || existingHotel.hotel_name,
      city: city || existingHotel.city,
      address: address || existingHotel.address,
      description: description || existingHotel.description,
      pricePerNight: pricePerNight ? parseFloat(pricePerNight) : existingHotel.price_per_night,
      maximumCapacity: maximumCapacity ? parseInt(maximumCapacity, 10) : existingHotel.maximum_capacity,
      amenities: amenities !== undefined ? amenities : existingHotel.amenities,
      imageUrl
    });

    if (!updated) {
      return next(new AppError('Hotel update failed or no changes made.', 400));
    }

    const hotel = await Hotel.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { hotel }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteHotel = async (req, res, next) => {
  try {
    const deleted = await Hotel.delete(req.params.id);
    if (!deleted) {
      return next(new AppError('No hotel found with that ID.', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Hotel deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
