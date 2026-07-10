const AppError = require('../utils/appError');

function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log all errors to console for CloudWatch log aggregation
  console.error('ERROR 💥:', err);

  // MySQL Duplicate Entry (Error Number 1062)
  if (err.errno === 1062 || err.code === 'ER_DUP_ENTRY') {
    const message = err.message || '';
    let duplicateField = 'value';
    
    if (message.includes('email')) {
      duplicateField = 'Email address';
    } else if (message.includes('phone_number')) {
      duplicateField = 'Phone number';
    }
    
    error = new AppError(`${duplicateField} is already registered. Please use another one.`, 409);
  }

  // MySQL Foreign Key Constraint Fail (Error Number 1452)
  if (err.errno === 1452 || err.code === 'ER_NO_REFERENCED_ROW_2') {
    error = new AppError('Invalid referencing data (foreign key violation).', 400);
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: status,
    message: message,
    // Include stack trace only in local development
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorHandler;
