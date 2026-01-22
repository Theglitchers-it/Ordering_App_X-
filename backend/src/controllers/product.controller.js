const { Product, Merchant, Category } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Generate unique slug from product name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') +
    '-' + Math.random().toString(36).substring(2, 7);
};

// @route   GET /api/products
// @desc    Get all products (with filters)
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const {
      merchant_id,
      category_id,
      is_featured,
      search,
      min_price,
      max_price,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const where = { is_active: true, is_available: true };

    if (merchant_id) where.merchant_id = merchant_id;
    if (category_id) where.category_id = category_id;
    if (is_featured) where.is_featured = is_featured === 'true';

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = parseFloat(min_price);
      if (max_price) where.price[Op.lte] = parseFloat(max_price);
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [
        ['is_featured', 'DESC'],
        ['sort_order', 'ASC'],
        ['created_at', 'DESC']
      ],
      include: [
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'business_name', 'slug']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'emoji']
        }
      ]
    });

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get products'
    });
  }
};

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'business_name', 'slug', 'phone', 'address_line1', 'city']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'emoji']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found'
      });
    }

    // Increment view count (optional analytics)
    // await product.increment('view_count');

    res.json({ product });

  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get product'
    });
  }
};

// @route   POST /api/products
// @desc    Create product
// @access  Private (merchant_admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      merchant_id,
      category_id,
      name,
      description,
      long_description,
      price,
      original_price,
      image_url,
      preparation_time,
      calories,
      allergens,
      is_featured,
      options
    } = req.body;

    // Validation
    if (!name || !price || !merchant_id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name, price, and merchant_id are required'
      });
    }

    // Check merchant exists and user has permission
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
        message: 'You do not have permission to create products for this merchant'
      });
    }

    // Generate slug
    const slug = generateSlug(name);

    // Create product
    const product = await Product.create({
      merchant_id,
      category_id,
      name,
      slug,
      description,
      long_description,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      image_url,
      preparation_time: preparation_time || 15,
      calories,
      allergens,
      is_featured: is_featured || false,
      options: options || null,
      is_active: true,
      is_available: true
    });

    logger.info(`Product created: ${product.name} for merchant ${merchant_id}`);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create product'
    });
  }
};

// @route   PATCH /api/products/:id
// @desc    Update product
// @access  Private (merchant owner or admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found'
      });
    }

    // Check permission
    const isOwner = product.merchant.owner_id === req.userId;
    const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this product'
      });
    }

    // Fields that can be updated
    const allowedFields = [
      'name',
      'description',
      'long_description',
      'price',
      'original_price',
      'category_id',
      'image_url',
      'images',
      'preparation_time',
      'calories',
      'allergens',
      'is_featured',
      'is_active',
      'is_available',
      'options',
      'sort_order',
      'stock_quantity',
      'track_inventory',
      'low_stock_threshold'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await product.update(updates);

    logger.info(`Product updated: ${product.id} by user ${req.userId}`);

    res.json({
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update product'
    });
  }
};

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete)
// @access  Private (merchant owner or admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found'
      });
    }

    // Check permission
    const isOwner = product.merchant.owner_id === req.userId;
    const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this product'
      });
    }

    // Soft delete
    await product.destroy();

    logger.info(`Product deleted: ${product.id} by user ${req.userId}`);

    res.json({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete product'
    });
  }
};

// @route   PATCH /api/products/:id/toggle-availability
// @desc    Toggle product availability
// @access  Private (merchant owner)
exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found'
      });
    }

    // Check permission
    const isOwner = product.merchant.owner_id === req.userId;

    if (!isOwner) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to modify this product'
      });
    }

    await product.update({
      is_available: !product.is_available
    });

    logger.info(`Product availability toggled: ${product.id} - now ${product.is_available}`);

    res.json({
      message: `Product ${product.is_available ? 'enabled' : 'disabled'} successfully`,
      product
    });

  } catch (error) {
    logger.error('Toggle availability error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to toggle availability'
    });
  }
};

// @route   POST /api/products/bulk-import
// @desc    Bulk import products (CSV)
// @access  Private (merchant owner or admin)
exports.bulkImport = async (req, res) => {
  try {
    const { merchant_id, products } = req.body;

    if (!merchant_id || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'merchant_id and products array are required'
      });
    }

    // Check merchant exists and permission
    const merchant = await Merchant.findByPk(merchant_id);

    if (!merchant) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Merchant not found'
      });
    }

    const isOwner = merchant.owner_id === req.userId;
    const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to import products for this merchant'
      });
    }

    const imported = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      try {
        const item = products[i];

        if (!item.name || !item.price) {
          errors.push({
            row: i + 1,
            error: 'Missing required fields (name, price)'
          });
          continue;
        }

        const product = await Product.create({
          merchant_id,
          category_id: item.category_id || null,
          name: item.name,
          slug: generateSlug(item.name),
          description: item.description || null,
          price: parseFloat(item.price),
          image_url: item.image_url || null,
          is_active: true,
          is_available: true
        });

        imported.push(product);

      } catch (err) {
        errors.push({
          row: i + 1,
          error: err.message
        });
      }
    }

    logger.info(`Bulk import: ${imported.length} products imported, ${errors.length} errors`);

    res.json({
      message: `Successfully imported ${imported.length} products`,
      imported: imported.length,
      errors: errors.length,
      errorDetails: errors
    });

  } catch (error) {
    logger.error('Bulk import error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to bulk import products'
    });
  }
};

module.exports = exports;
