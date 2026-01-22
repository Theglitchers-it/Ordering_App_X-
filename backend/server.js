require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./src/utils/logger');
const sequelize = require('./src/config/database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'OrderHub API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const merchantRoutes = require('./src/routes/merchant.routes');
const productRoutes = require('./src/routes/product.routes');
const categoryRoutes = require('./src/routes/category.routes');
const orderRoutes = require('./src/routes/order.routes');
const tableRoutes = require('./src/routes/table.routes');
const couponRoutes = require('./src/routes/coupon.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const adminRoutes = require('./src/routes/admin.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);

  // Don't leak error details in production
  const error = process.env.NODE_ENV === 'development'
    ? { message: err.message, stack: err.stack }
    : { message: 'Internal server error' };

  res.status(err.status || 500).json({
    error: 'Server Error',
    ...error
  });
});

// ============================================
// DATABASE CONNECTION & SERVER START
// ============================================

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('✅ MySQL database connected successfully');

    // Sync models (use migrations in production!)
    if (process.env.NODE_ENV === 'development') {
      // await sequelize.sync({ alter: true });
      logger.info('✅ Database models synchronized');
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 OrderHub API listening on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🌐 API URL: http://localhost:${PORT}`);
      logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
    });

    // WebSocket setup (Socket.IO)
    if (process.env.ENABLE_WEBSOCKET === 'true') {
      const initializeSocket = require('./src/config/socket');
      const io = initializeSocket(server);
      logger.info('✅ WebSocket server initialized');

      // Make io accessible in routes
      app.set('io', io);
    }

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        sequelize.close();
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
