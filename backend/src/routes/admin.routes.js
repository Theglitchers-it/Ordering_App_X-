const express = require('express');
const router = express.Router();
const { User, Merchant, Order, Product } = require('../models');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

// All admin routes require authentication + admin role
router.use(authMiddleware);
router.use(checkRole('super_admin', 'admin_ops'));

// ============================================
// DASHBOARD STATS
// ============================================

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalMerchants,
      activeMerchants,
      pendingMerchants,
      totalOrders,
      totalProducts
    ] = await Promise.all([
      User.count({ where: { role: 'user' } }),
      Merchant.count(),
      Merchant.count({ where: { status: 'active' } }),
      Merchant.count({ where: { status: 'pending_approval' } }),
      Order.count(),
      Product.count()
    ]);

    // Revenue stats
    const revenueResult = await Order.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue'],
        [sequelize.fn('AVG', sequelize.col('total_amount')), 'avg_order_value']
      ],
      where: { status: { [Op.notIn]: ['cancelled'] } },
      raw: true
    });

    // Monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyRevenue = await Order.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
      ],
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo },
        status: { [Op.notIn]: ['cancelled'] }
      },
      raw: true
    });

    res.json({
      stats: {
        users: {
          total: totalUsers
        },
        merchants: {
          total: totalMerchants,
          active: activeMerchants,
          pending: pendingMerchants
        },
        orders: {
          total: totalOrders
        },
        products: {
          total: totalProducts
        },
        revenue: {
          total: parseFloat(revenueResult[0]?.total_revenue) || 0,
          average_order: parseFloat(revenueResult[0]?.avg_order_value) || 0,
          monthly: parseFloat(monthlyRevenue[0]?.revenue) || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// ============================================
// ORDERS MANAGEMENT
// ============================================

// GET /api/admin/orders - List all orders with filters
router.get('/orders', async (req, res) => {
  try {
    const { status, merchant_id, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (merchant_id) where.merchant_id = merchant_id;

    if (search) {
      where[Op.or] = [
        { order_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Order.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'customer', attributes: ['id', 'first_name', 'last_name', 'email'] },
        { model: Merchant, as: 'merchant', attributes: ['id', 'business_name'] }
      ]
    });

    res.json({
      orders: rows,
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
});

// PATCH /api/admin/orders/:id/status - Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.update({ status });

    res.json({ order, message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// ============================================
// REPORTS
// ============================================

// GET /api/admin/reports/sales - Sales report
router.get('/reports/sales', async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {
      status: { [Op.notIn]: ['cancelled'] }
    };

    if (from) where.created_at = { ...where.created_at, [Op.gte]: new Date(from) };
    if (to) where.created_at = { ...where.created_at, [Op.lte]: new Date(to) };

    const orders = await Order.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    const totalRevenue = orders.reduce((sum, d) => sum + parseFloat(d.revenue || 0), 0);
    const totalOrders = orders.reduce((sum, d) => sum + parseInt(d.orders || 0), 0);

    res.json({
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          period: { from, to }
        },
        daily: orders.map(d => ({
          date: d.date,
          orders: parseInt(d.orders),
          revenue: parseFloat(d.revenue)
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

module.exports = router;
