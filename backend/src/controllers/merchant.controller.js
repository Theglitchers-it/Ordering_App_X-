const { Merchant, User, Product, Category, Order, Table } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Generate unique slug from business name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') +
    '-' + Math.random().toString(36).substring(2, 7);
};

// @route   POST /api/merchants
// @desc    Register new merchant
// @access  Private (merchant_admin role)
exports.createMerchant = async (req, res) => {
  try {
    const {
      business_name,
      description,
      email,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country,
      subscription_plan
    } = req.body;

    // Validation
    if (!business_name) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Business name is required'
      });
    }

    // Generate slug
    const slug = generateSlug(business_name);

    // Create merchant
    const merchant = await Merchant.create({
      owner_id: req.userId,
      business_name,
      slug,
      description,
      email,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      country: country || 'IT',
      subscription_plan: subscription_plan || 'free',
      status: 'pending_approval',
      commission_rate: 0.10 // 10% default
    });

    logger.info(`New merchant created: ${merchant.business_name} by user ${req.userId}`);

    // Send welcome email
    const user = await User.findByPk(req.userId);
    const emailService = require('../services/email.service');
    await emailService.sendMerchantWelcome(merchant, user);

    res.status(201).json({
      message: 'Merchant registered successfully',
      merchant
    });

  } catch (error) {
    logger.error('Create merchant error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create merchant'
    });
  }
};

// @route   GET /api/merchants
// @desc    Get all merchants (public - only active)
// @access  Public
exports.getAllMerchants = async (req, res) => {
  try {
    const { status, city, search, page = 1, limit = 20 } = req.query;

    // Build query
    const where = {};

    // Public access: only active merchants
    if (!req.userRole || req.userRole === 'user') {
      where.status = 'active';
    } else if (status) {
      where.status = status;
    }

    // Filters
    if (city) {
      where.city = { [Op.like]: `%${city}%` };
    }

    if (search) {
      where[Op.or] = [
        { business_name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: merchants } = await Merchant.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['uuid', 'email', 'first_name', 'last_name']
        }
      ]
    });

    res.json({
      merchants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Get merchants error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get merchants'
    });
  }
};

// @route   GET /api/merchants/:slug
// @desc    Get merchant by slug
// @access  Public
exports.getMerchantBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const merchant = await Merchant.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['uuid', 'email', 'first_name', 'last_name']
        }
      ]
    });

    if (!merchant) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Merchant not found'
      });
    }

    // Only show active merchants to public
    if (merchant.status !== 'active' && (!req.userRole || req.userRole === 'user')) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Merchant not found'
      });
    }

    res.json({ merchant });

  } catch (error) {
    logger.error('Get merchant error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get merchant'
    });
  }
};

// @route   GET /api/merchants/me
// @desc    Get current user's merchant
// @access  Private (merchant_admin)
exports.getMyMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.findOne({
      where: { owner_id: req.userId },
      include: [
        {
          model: Product,
          as: 'products',
          limit: 5,
          order: [['created_at', 'DESC']]
        },
        {
          model: Order,
          as: 'orders',
          limit: 5,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!merchant) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No merchant found for this user'
      });
    }

    res.json({ merchant });

  } catch (error) {
    logger.error('Get my merchant error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get merchant'
    });
  }
};

// @route   PATCH /api/merchants/:id
// @desc    Update merchant
// @access  Private (owner or admin)
exports.updateMerchant = async (req, res) => {
  try {
    const { id } = req.params;

    const merchant = await Merchant.findByPk(id);

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
        message: 'You do not have permission to update this merchant'
      });
    }

    // Fields that can be updated
    const allowedFields = [
      'business_name',
      'description',
      'email',
      'phone',
      'website',
      'address_line1',
      'address_line2',
      'city',
      'state',
      'postal_code',
      'country',
      'latitude',
      'longitude',
      'business_hours',
      'logo_url',
      'cover_image_url',
      'settings'
    ];

    // Admin-only fields
    if (isAdmin) {
      allowedFields.push('commission_rate', 'subscription_plan', 'subscription_price');
    }

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await merchant.update(updates);

    logger.info(`Merchant updated: ${merchant.id} by user ${req.userId}`);

    res.json({
      message: 'Merchant updated successfully',
      merchant
    });

  } catch (error) {
    logger.error('Update merchant error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update merchant'
    });
  }
};

// @route   PATCH /api/merchants/:id/approve
// @desc    Approve merchant
// @access  Private (super_admin only)
exports.approveMerchant = async (req, res) => {
  try {
    const { id } = req.params;

    const merchant = await Merchant.findByPk(id);

    if (!merchant) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Merchant not found'
      });
    }

    if (merchant.status === 'active') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Merchant is already approved'
      });
    }

    await merchant.update({
      status: 'active',
      approved_at: new Date(),
      approved_by: req.userId
    });

    logger.info(`Merchant approved: ${merchant.id} by admin ${req.userId}`);

    // Send approval email
    const user = await User.findByPk(merchant.owner_id);
    if (user && process.env.ENABLE_EMAIL === 'true') {
      const emailService = require('../services/email.service');
      await emailService.sendEmail({
        to: user.email,
        subject: `${merchant.business_name} è stato approvato!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #22c55e;">Il tuo account è stato approvato!</h1>
            <p>Ciao ${user.first_name},</p>
            <p>Siamo lieti di comunicarti che <strong>${merchant.business_name}</strong> è stato approvato su OrderHub.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Ora puoi:</h2>
              <ol>
                <li>Configurare il tuo menu con prodotti e categorie</li>
                <li>Generare i QR code per i tuoi tavoli</li>
                <li>Iniziare a ricevere ordini dai clienti!</li>
              </ol>
            </div>
            <p>Accedi alla tua dashboard per iniziare.</p>
          </div>
        `,
        text: `Ciao ${user.first_name}, ${merchant.business_name} è stato approvato su OrderHub! Accedi alla dashboard per configurare il menu e iniziare a ricevere ordini.`
      });
    }

    res.json({
      message: 'Merchant approved successfully',
      merchant
    });

  } catch (error) {
    logger.error('Approve merchant error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to approve merchant'
    });
  }
};

// @route   PATCH /api/merchants/:id/block
// @desc    Block merchant
// @access  Private (super_admin only)
exports.blockMerchant = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const merchant = await Merchant.findByPk(id);

    if (!merchant) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Merchant not found'
      });
    }

    await merchant.update({
      status: 'blocked'
    });

    logger.warn(`Merchant blocked: ${merchant.id} by admin ${req.userId}. Reason: ${reason}`);

    res.json({
      message: 'Merchant blocked successfully',
      merchant
    });

  } catch (error) {
    logger.error('Block merchant error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to block merchant'
    });
  }
};

// @route   DELETE /api/merchants/:id
// @desc    Delete merchant (soft delete)
// @access  Private (owner or super_admin)
exports.deleteMerchant = async (req, res) => {
  try {
    const { id } = req.params;

    const merchant = await Merchant.findByPk(id);

    if (!merchant) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Merchant not found'
      });
    }

    // Check permission
    const isOwner = merchant.owner_id === req.userId;
    const isSuperAdmin = req.userRole === 'super_admin';

    if (!isOwner && !isSuperAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this merchant'
      });
    }

    // Soft delete
    await merchant.destroy();

    logger.warn(`Merchant deleted: ${merchant.id} by user ${req.userId}`);

    res.json({
      message: 'Merchant deleted successfully'
    });

  } catch (error) {
    logger.error('Delete merchant error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete merchant'
    });
  }
};

// @route   GET /api/merchants/:id/stats
// @desc    Get merchant statistics
// @access  Private (owner or admin)
exports.getMerchantStats = async (req, res) => {
  try {
    const { id } = req.params;

    const merchant = await Merchant.findByPk(id);

    if (!merchant) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Merchant not found'
      });
    }

    // Check permission
    const isOwner = merchant.owner_id === req.userId;
    const isAdmin = ['super_admin', 'admin_ops', 'finance'].includes(req.userRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this merchant stats'
      });
    }

    // Get stats
    const totalOrders = await Order.count({
      where: { merchant_id: id }
    });

    const totalRevenue = await Order.sum('total', {
      where: {
        merchant_id: id,
        payment_status: 'paid'
      }
    }) || 0;

    const totalProducts = await Product.count({
      where: { merchant_id: id, is_active: true }
    });

    const totalTables = await Table.count({
      where: { merchant_id: id, is_active: true }
    });

    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.count({
      where: {
        merchant_id: id,
        created_at: { [Op.gte]: today }
      }
    });

    const todayRevenue = await Order.sum('total', {
      where: {
        merchant_id: id,
        payment_status: 'paid',
        created_at: { [Op.gte]: today }
      }
    }) || 0;

    res.json({
      stats: {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue).toFixed(2),
        totalProducts,
        totalTables,
        todayOrders,
        todayRevenue: parseFloat(todayRevenue).toFixed(2),
        avgOrderValue: totalOrders > 0
          ? parseFloat(totalRevenue / totalOrders).toFixed(2)
          : 0
      }
    });

  } catch (error) {
    logger.error('Get merchant stats error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get merchant stats'
    });
  }
};

module.exports = exports;
