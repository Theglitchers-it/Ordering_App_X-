const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// Generate JWT tokens
const generateTokens = (user) => {
  const payload = {
    sub: user.uuid,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { sub: user.uuid },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: 'Registration Failed',
        message: 'Email already registered'
      });
    }

    // Hash password
    const password_hash = await User.hashPassword(password);

    // Create user
    const user = await User.create({
      email,
      password_hash,
      first_name,
      last_name,
      phone,
      role: 'user'
    });

    logger.info(`New user registered: ${user.email}`);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      accessToken,
      refreshToken
    });

  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Registration failed'
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({
      where: { email, status: 'active' }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      return res.status(423).json({
        error: 'Account Locked',
        message: 'Account is temporarily locked. Please try again later.'
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      // Increment failed attempts
      await user.update({
        failed_login_attempts: user.failed_login_attempts + 1,
        locked_until: user.failed_login_attempts >= 4
          ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
          : null
      });

      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.update({
      last_login_at: new Date(),
      last_login_ip: req.ip,
      failed_login_attempts: 0,
      locked_until: null
    });

    logger.info(`User logged in: ${user.email}`);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      accessToken,
      refreshToken
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Login failed'
    });
  }
};

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findOne({
      where: { uuid: decoded.sub, status: 'active' }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      message: 'Token refreshed successfully',
      ...tokens
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid or expired refresh token'
      });
    }

    logger.error('Refresh token error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Token refresh failed'
    });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
exports.me = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { uuid: req.user.sub }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({
      user: user.toJSON()
    });

  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get user'
    });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
exports.logout = async (req, res) => {
  try {
    // In a real app, you would invalidate the token here
    // For now, just return success (client will delete token)

    logger.info(`User logged out: ${req.user.email}`);

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Logout failed'
    });
  }
};

module.exports = exports;
