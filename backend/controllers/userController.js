const User = require('../models/User');
const AppError = require('../utils/appError');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.getAll();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Prevent deleting self
    if (parseInt(userId, 10) === req.user.id) {
      return next(new AppError('You cannot delete your own admin account.', 400));
    }

    const deleted = await User.delete(userId);
    if (!deleted) {
      return next(new AppError('No user found with that ID.', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'User account deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
