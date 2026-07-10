const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const AppError = require('./utils/appError');
const errorHandler = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 1. Global Middlewares
// Set security HTTP headers (customized to allow image loading)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Enable CORS
app.use(cors());

// Parse incoming request JSON bodies
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static files (Fallback local storage path for hotel images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiter to prevent brute force / DoS attacks
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes.'
});
app.use('/api', limiter);

// 2. Health Check Endpoint (Required for ALB)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 3. Application API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);

// 4. Undefined Route Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 5. Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
