const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findOne({
      where: { uuid: decoded.sub, status: 'active' }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    // Attach user to request
    req.user = decoded;
    req.userId = user.id;
    req.userUuid = user.uuid;
    req.userRole = user.role;

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findOne({
        where: { uuid: decoded.sub, status: 'active' }
      });

      if (user) {
        req.user = decoded;
        req.userId = user.id;
        req.userUuid = user.uuid;
        req.userRole = user.role;
      }
    }

    next();

  } catch (error) {
    // Silently fail - optional auth
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuth
};
