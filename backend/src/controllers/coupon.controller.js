const { Coupon, CouponUsage, Merchant, User, Order } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// @route   GET /api/coupons
// @desc    Get all coupons (with filters)
// @access  Private (admin, merchant)
exports.getAllCoupons = async (req, res) => {
  try {
    const {
      merchant_id,
      is_active,
      discount_type,
      search,
      page = 1,
      limit = 20,
      include_expired = 'false'
    } = req.query;

    // Build query
    const where = {};

    // Filter by merchant
    if (merchant_id) {
      where.merchant_id = merchant_id;
    } else if (req.userRole === 'merchant_admin') {
      // Merchant can only see their own coupons + global
      const merchant = await Merchant.findOne({ where: { owner_id: req.userId } });
      if (merchant) {
        where[Op.or] = [
          { merchant_id: merchant.id },
          { merchant_id: null }
        ];
      }
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    if (discount_type) {
      where.discount_type = discount_type;
    }

    if (search) {
      where[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } }
      ];
    }

    // Exclude expired unless requested
    if (include_expired !== 'true') {
      where.valid_until = { [Op.gte]: new Date() };
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: coupons } = await Coupon.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [
        ['is_active', 'DESC'],
        ['valid_until', 'ASC'],
        ['created_at', 'DESC']
      ],
      include: [
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'business_name', 'slug']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.json({
      coupons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Get coupons error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get coupons'
    });
  }
};

// @route   GET /api/coupons/available
// @desc    Get available coupons for customer (public)
// @access  Public
exports.getAvailableCoupons = async (req, res) => {
  try {
    const { merchant_id } = req.query;

    const now = new Date();
    const where = {
      is_active: true,
      valid_from: { [Op.lte]: now },
      valid_until: { [Op.gte]: now },
      [Op.or]: [
        { max_uses: null },
        { times_used: { [Op.lt]: sequelize.col('max_uses') } }
      ]
    };

    // Include global coupons + merchant-specific
    if (merchant_id) {
      where[Op.or] = [
        { merchant_id: merchant_id },
        { merchant_id: null }
      ];
    } else {
      where.merchant_id = null; // Only global coupons
    }

    const coupons = await Coupon.findAll({
      where,
      attributes: [
        'id', 'code', 'title', 'description', 'discount_type',
        'discount_value', 'max_discount_amount', 'min_order_amount',
        'valid_from', 'valid_until', 'merchant_id'
      ],
      order: [['discount_value', 'DESC']]
    });

    res.json({ coupons });

  } catch (error) {
    logger.error('Get available coupons error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get available coupons'
    });
  }
};

// @route   GET /api/coupons/:id
// @desc    Get coupon by ID
// @access  Private (admin, merchant owner)
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id, {
      include: [
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'business_name', 'slug']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: CouponUsage,
          as: 'usages',
          limit: 10,
          order: [['created_at', 'DESC']],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'first_name', 'last_name', 'email']
            }
          ]
        }
      ]
    });

    if (!coupon) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Coupon not found'
      });
    }

    // Check permission for non-admin
    if (!['super_admin', 'admin_ops'].includes(req.userRole)) {
      if (coupon.merchant_id) {
        const merchant = await Merchant.findByPk(coupon.merchant_id);
        if (merchant.owner_id !== req.userId) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'You do not have permission to view this coupon'
          });
        }
      }
    }

    res.json({ coupon });

  } catch (error) {
    logger.error('Get coupon error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get coupon'
    });
  }
};

// @route   POST /api/coupons/validate
// @desc    Validate and calculate discount for a coupon
// @access  Public
exports.validateCoupon = async (req, res) => {
  try {
    const { code, order_total, merchant_id, user_id } = req.body;

    if (!code || order_total === undefined) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Coupon code and order total are required'
      });
    }

    const coupon = await Coupon.findOne({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return res.status(404).json({
        valid: false,
        error: 'Invalid Code',
        message: 'Codice coupon non valido'
      });
    }

    // Check if coupon is active
    if (!coupon.is_active) {
      return res.status(400).json({
        valid: false,
        error: 'Inactive',
        message: 'Questo coupon non è attivo'
      });
    }

    // Check validity dates
    const now = new Date();
    if (now < new Date(coupon.valid_from)) {
      return res.status(400).json({
        valid: false,
        error: 'Not Yet Valid',
        message: 'Questo coupon non è ancora valido'
      });
    }

    if (now > new Date(coupon.valid_until)) {
      return res.status(400).json({
        valid: false,
        error: 'Expired',
        message: 'Questo coupon è scaduto'
      });
    }

    // Check usage limit
    if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
      return res.status(400).json({
        valid: false,
        error: 'Fully Used',
        message: 'Questo coupon ha raggiunto il limite di utilizzi'
      });
    }

    // Check minimum order
    if (parseFloat(order_total) < parseFloat(coupon.min_order_amount)) {
      return res.status(400).json({
        valid: false,
        error: 'Minimum Not Met',
        message: `Ordine minimo: €${coupon.min_order_amount}`
      });
    }

    // Check merchant restriction
    if (coupon.merchant_id && merchant_id) {
      if (parseInt(coupon.merchant_id) !== parseInt(merchant_id)) {
        return res.status(400).json({
          valid: false,
          error: 'Wrong Merchant',
          message: 'Questo coupon non è valido per questo ristorante'
        });
      }
    }

    // Check per-user usage limit
    if (user_id && coupon.max_uses_per_user) {
      const userUsageCount = await CouponUsage.count({
        where: {
          coupon_id: coupon.id,
          user_id: user_id
        }
      });

      if (userUsageCount >= coupon.max_uses_per_user) {
        return res.status(400).json({
          valid: false,
          error: 'User Limit Reached',
          message: 'Hai già utilizzato questo coupon il numero massimo di volte'
        });
      }
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(parseFloat(order_total));

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        max_discount_amount: coupon.max_discount_amount
      },
      discount_amount: discount,
      new_total: Math.max(0, parseFloat(order_total) - discount)
    });

  } catch (error) {
    logger.error('Validate coupon error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to validate coupon'
    });
  }
};

// @route   POST /api/coupons
// @desc    Create coupon
// @access  Private (admin, merchant_admin)
exports.createCoupon = async (req, res) => {
  try {
    const {
      merchant_id,
      code,
      title,
      description,
      discount_type,
      discount_value,
      max_discount_amount,
      min_order_amount,
      max_uses,
      max_uses_per_user,
      applicable_products,
      applicable_categories,
      valid_from,
      valid_until
    } = req.body;

    // Validation
    if (!code || !discount_type || discount_value === undefined || !valid_from || !valid_until) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Code, discount_type, discount_value, valid_from, and valid_until are required'
      });
    }

    // Check code uniqueness
    const existingCoupon = await Coupon.findOne({
      where: { code: code.toUpperCase() }
    });

    if (existingCoupon) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A coupon with this code already exists'
      });
    }

    // Merchant permission check
    if (merchant_id) {
      const merchant = await Merchant.findByPk(merchant_id);

      if (!merchant) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Merchant not found'
        });
      }

      // Check permission
      const isOwner = merchant.owner_id === req.userId;
      const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to create coupons for this merchant'
        });
      }
    } else {
      // Global coupon - only admins can create
      if (!['super_admin', 'admin_ops'].includes(req.userRole)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only admins can create global coupons'
        });
      }
    }

    // Create coupon
    const coupon = await Coupon.create({
      merchant_id: merchant_id || null,
      code: code.toUpperCase(),
      title,
      description,
      discount_type,
      discount_value: parseFloat(discount_value),
      max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : null,
      min_order_amount: min_order_amount ? parseFloat(min_order_amount) : 0,
      max_uses: max_uses || null,
      max_uses_per_user: max_uses_per_user || 1,
      applicable_products: applicable_products || null,
      applicable_categories: applicable_categories || null,
      valid_from: new Date(valid_from),
      valid_until: new Date(valid_until),
      is_active: true,
      created_by: req.userId
    });

    logger.info(`Coupon created: ${coupon.code} by user ${req.userId}`);

    res.status(201).json({
      message: 'Coupon created successfully',
      coupon
    });

  } catch (error) {
    logger.error('Create coupon error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create coupon'
    });
  }
};

// @route   PATCH /api/coupons/:id
// @desc    Update coupon
// @access  Private (admin, merchant owner)
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!coupon) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Coupon not found'
      });
    }

    // Check permission
    const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);
    let isOwner = false;

    if (coupon.merchant) {
      isOwner = coupon.merchant.owner_id === req.userId;
    }

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this coupon'
      });
    }

    // Fields that can be updated
    const allowedFields = [
      'title',
      'description',
      'discount_value',
      'max_discount_amount',
      'min_order_amount',
      'max_uses',
      'max_uses_per_user',
      'applicable_products',
      'applicable_categories',
      'valid_from',
      'valid_until',
      'is_active'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (['valid_from', 'valid_until'].includes(field)) {
          updates[field] = new Date(req.body[field]);
        } else if (['discount_value', 'max_discount_amount', 'min_order_amount'].includes(field)) {
          updates[field] = req.body[field] ? parseFloat(req.body[field]) : null;
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    await coupon.update(updates);

    logger.info(`Coupon updated: ${coupon.id} by user ${req.userId}`);

    res.json({
      message: 'Coupon updated successfully',
      coupon
    });

  } catch (error) {
    logger.error('Update coupon error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update coupon'
    });
  }
};

// @route   DELETE /api/coupons/:id
// @desc    Delete coupon
// @access  Private (admin, merchant owner)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!coupon) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Coupon not found'
      });
    }

    // Check permission
    const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);
    let isOwner = false;

    if (coupon.merchant) {
      isOwner = coupon.merchant.owner_id === req.userId;
    }

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this coupon'
      });
    }

    // Check if coupon has been used
    const usageCount = await CouponUsage.count({ where: { coupon_id: id } });

    if (usageCount > 0) {
      // Soft disable instead of delete
      await coupon.update({ is_active: false });

      logger.info(`Coupon deactivated (has usages): ${coupon.id} by user ${req.userId}`);

      return res.json({
        message: 'Coupon has been used and cannot be deleted. It has been deactivated instead.',
        deactivated: true
      });
    }

    await coupon.destroy();

    logger.info(`Coupon deleted: ${coupon.id} by user ${req.userId}`);

    res.json({
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    logger.error('Delete coupon error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete coupon'
    });
  }
};

// @route   PATCH /api/coupons/:id/toggle
// @desc    Toggle coupon active status
// @access  Private (admin, merchant owner)
exports.toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!coupon) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Coupon not found'
      });
    }

    // Check permission
    const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);
    let isOwner = false;

    if (coupon.merchant) {
      isOwner = coupon.merchant.owner_id === req.userId;
    }

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to modify this coupon'
      });
    }

    await coupon.update({
      is_active: !coupon.is_active
    });

    logger.info(`Coupon status toggled: ${coupon.id} - now ${coupon.is_active ? 'active' : 'inactive'}`);

    res.json({
      message: `Coupon ${coupon.is_active ? 'activated' : 'deactivated'} successfully`,
      coupon
    });

  } catch (error) {
    logger.error('Toggle coupon status error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to toggle coupon status'
    });
  }
};

// @route   POST /api/coupons/:id/apply
// @desc    Apply coupon to order (record usage)
// @access  Private
exports.applyCouponToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_id, discount_amount } = req.body;

    if (!order_id || discount_amount === undefined) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'order_id and discount_amount are required'
      });
    }

    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Coupon not found'
      });
    }

    const order = await Order.findByPk(order_id);

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Record usage
    const usage = await CouponUsage.create({
      coupon_id: id,
      order_id: order_id,
      user_id: req.userId,
      discount_amount: parseFloat(discount_amount)
    });

    // Update coupon stats
    await coupon.increment('times_used');
    await coupon.increment('total_discount_given', { by: parseFloat(discount_amount) });

    logger.info(`Coupon applied to order: ${coupon.code} -> Order ${order_id}`);

    res.json({
      message: 'Coupon applied successfully',
      usage
    });

  } catch (error) {
    logger.error('Apply coupon error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to apply coupon'
    });
  }
};

// @route   GET /api/coupons/:id/stats
// @desc    Get coupon usage statistics
// @access  Private (admin, merchant owner)
exports.getCouponStats = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);

    if (!coupon) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Coupon not found'
      });
    }

    // Get usage statistics
    const usages = await CouponUsage.findAll({
      where: { coupon_id: id },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'total', 'created_at']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const stats = {
      coupon_id: coupon.id,
      code: coupon.code,
      times_used: coupon.times_used,
      max_uses: coupon.max_uses,
      usage_percentage: coupon.max_uses
        ? Math.round((coupon.times_used / coupon.max_uses) * 100)
        : null,
      total_discount_given: parseFloat(coupon.total_discount_given),
      is_active: coupon.is_active,
      is_expired: coupon.isExpired(),
      is_fully_used: coupon.isFullyUsed(),
      recent_usages: usages.slice(0, 10),
      unique_users: [...new Set(usages.map(u => u.user_id))].length
    };

    res.json({ stats });

  } catch (error) {
    logger.error('Get coupon stats error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get coupon statistics'
    });
  }
};

module.exports = exports;
