const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_hotel_reservation';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

exports.signup = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, password, confirmPassword } = req.body;

    // 1. Validation checks
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      return next(new AppError('All fields are required.', 400));
    }

    if (password.length < 8) {
      return next(new AppError('Password must be at least 8 characters long.', 400));
    }

    if (password !== confirmPassword) {
      return next(new AppError('Passwords do not match.', 400));
    }

    // 2. Check if email already exists (for fast response, database unique constraint also guards this)
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(new AppError('Email address is already registered.', 409));
    }

    // Check if phone number already exists
    const existingPhone = await User.findByPhone(phoneNumber);
    if (existingPhone) {
      return next(new AppError('Phone number is already registered.', 409));
    }

    // 3. Encrypt password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create user (Default role: user)
    // First user registered can be set to admin for convenience, or we seed an admin.
    // Let's make first user register as Admin if there are no users, otherwise standard user.
    const totalUsers = await User.countAll();
    const role = totalUsers === 0 ? 'admin' : 'user';

    const userId = await User.create({
      fullName,
      email,
      phoneNumber,
      passwordHash,
      role
    });

    const user = { id: userId, fullName, email, phoneNumber, role };
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password.', 400));
    }

    // 1. Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // 2. Validate password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // 3. Generate token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phoneNumber: user.phone_number,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber } = req.body;

    if (!fullName || !email || !phoneNumber) {
      return next(new AppError('All profile fields are required.', 400));
    }

    // Verify phone/email isn't already taken by someone else
    const emailUser = await User.findByEmail(email);
    if (emailUser && emailUser.id !== req.user.id) {
      return next(new AppError('Email address is already in use by another user.', 409));
    }

    const phoneUser = await User.findByPhone(phoneNumber);
    if (phoneUser && phoneUser.id !== req.user.id) {
      return next(new AppError('Phone number is already in use by another user.', 409));
    }

    const updated = await User.updateProfile(req.user.id, { fullName, email, phoneNumber });
    if (!updated) {
      return next(new AppError('Profile update failed or no changes made.', 400));
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};
