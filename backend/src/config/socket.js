const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Initialize Socket.IO server
 */
const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.sub;
      socket.userRole = decoded.role;
      socket.userEmail = decoded.email;

      next();
    } catch (err) {
      logger.error('Socket auth error:', err);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.userId} (${socket.userEmail})`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join merchant room if merchant admin
    if (socket.handshake.auth.merchantId) {
      socket.join(`merchant:${socket.handshake.auth.merchantId}`);
      logger.info(`User joined merchant room: merchant:${socket.handshake.auth.merchantId}`);
    }

    // Handle custom events
    socket.on('join-order', (orderId) => {
      socket.join(`order:${orderId}`);
      logger.info(`User joined order room: order:${orderId}`);
    });

    socket.on('leave-order', (orderId) => {
      socket.leave(`order:${orderId}`);
      logger.info(`User left order room: order:${orderId}`);
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.userId}`);
    });
  });

  return io;
};

/**
 * Emit event to specific user
 */
const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
  logger.debug(`Emitted ${event} to user:${userId}`);
};

/**
 * Emit event to merchant
 */
const emitToMerchant = (io, merchantId, event, data) => {
  io.to(`merchant:${merchantId}`).emit(event, data);
  logger.debug(`Emitted ${event} to merchant:${merchantId}`);
};

/**
 * Emit event to order room
 */
const emitToOrder = (io, orderId, event, data) => {
  io.to(`order:${orderId}`).emit(event, data);
  logger.debug(`Emitted ${event} to order:${orderId}`);
};

module.exports = initializeSocket;
module.exports.emitToUser = emitToUser;
module.exports.emitToMerchant = emitToMerchant;
module.exports.emitToOrder = emitToOrder;
