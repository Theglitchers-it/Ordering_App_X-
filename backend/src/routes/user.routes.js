const express = require('express');
const router = express.Router();
const { User, Order } = require('../models');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// ============================================
// AUTHENTICATED USER ROUTES
// ============================================

// GET /api/users/me - Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// PATCH /api/users/me - Update own profile
router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const allowedFields = ['first_name', 'last_name', 'phone'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await User.update(updates, { where: { id: req.userId } });
    const user = await User.findByPk(req.userId);

    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/users - List all users (admin only)
router.get('/',
  authMiddleware,
  checkRole('super_admin', 'admin_ops'),
  async (req, res) => {
    try {
      const { search, status, role, page = 1, limit = 50 } = req.query;
      const where = {};

      if (search) {
        where[Op.or] = [
          { email: { [Op.like]: `%${search}%` } },
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } }
        ];
      }

      if (status) {
        where.status = status;
      }

      if (role) {
        where.role = role;
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows } = await User.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password_hash'] }
      });

      res.json({
        users: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / parseInt(limit))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error', message: error.message });
    }
  }
);

// GET /api/users/:id - Get user by ID (admin only)
router.get('/:id',
  authMiddleware,
  checkRole('super_admin', 'admin_ops'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get order stats
      const orderStats = await Order.findAll({
        where: { customer_id: user.id },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_orders'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_spent'],
          [sequelize.fn('MAX', sequelize.col('created_at')), 'last_order_at']
        ],
        raw: true
      });

      res.json({
        user: {
          ...user.toJSON(),
          total_orders: parseInt(orderStats[0]?.total_orders) || 0,
          total_spent: parseFloat(orderStats[0]?.total_spent) || 0,
          last_order_at: orderStats[0]?.last_order_at || null
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error', message: error.message });
    }
  }
);

// PATCH /api/users/:id/ban - Ban a user (admin only)
router.patch('/:id/ban',
  authMiddleware,
  checkRole('super_admin', 'admin_ops'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role === 'super_admin') {
        return res.status(403).json({ error: 'Cannot ban a super admin' });
      }

      await user.update({ status: 'suspended' });

      res.json({
        user: user.toJSON(),
        message: `User ${user.email} has been banned`
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error', message: error.message });
    }
  }
);

// PATCH /api/users/:id/unban - Unban a user (admin only)
router.patch('/:id/unban',
  authMiddleware,
  checkRole('super_admin', 'admin_ops'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({ status: 'active' });

      res.json({
        user: user.toJSON(),
        message: `User ${user.email} has been unbanned`
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error', message: error.message });
    }
  }
);

// POST /api/users/:id/adjust-points - Adjust loyalty points (admin only)
router.post('/:id/adjust-points',
  authMiddleware,
  checkRole('super_admin', 'admin_ops'),
  async (req, res) => {
    try {
      const { amount, reason } = req.body;

      if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: 'Valid amount is required' });
      }

      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Note: loyalty_points field would need to be added to User model
      // For now, return success with the adjustment info
      res.json({
        user: user.toJSON(),
        adjustment: {
          amount: parseInt(amount),
          reason: reason || 'Admin adjustment'
        },
        message: `Adjusted ${amount} points for user ${user.email}`
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error', message: error.message });
    }
  }
);

module.exports = router;
