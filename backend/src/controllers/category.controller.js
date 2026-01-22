const { Category, Merchant, Product } = require('../models');
const logger = require('../utils/logger');

/**
 * Generate unique slug from category name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// @route   GET /api/categories
// @desc    Get all categories (optionally filter by merchant)
// @access  Public
exports.getAllCategories = async (req, res) => {
  try {
    const { merchant_id } = req.query;

    const where = { is_active: true };
    if (merchant_id) {
      where.merchant_id = merchant_id;
    }

    const categories = await Category.findAll({
      where,
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      include: [
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'business_name', 'slug']
        }
      ]
    });

    res.json({ categories });

  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get categories'
    });
  }
};

// @route   GET /api/categories/:id
// @desc    Get category by ID with products
// @access  Public
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'business_name', 'slug']
        },
        {
          model: Product,
          as: 'products',
          where: { is_active: true, is_available: true },
          required: false,
          order: [['sort_order', 'ASC'], ['name', 'ASC']]
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Category not found'
      });
    }

    res.json({ category });

  } catch (error) {
    logger.error('Get category error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get category'
    });
  }
};

// @route   POST /api/categories
// @desc    Create category
// @access  Private (merchant_admin)
exports.createCategory = async (req, res) => {
  try {
    const { merchant_id, name, description, emoji, image_url, sort_order } = req.body;

    // Validation
    if (!name || !merchant_id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Name and merchant_id are required'
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
        message: 'You do not have permission to create categories for this merchant'
      });
    }

    // Generate slug
    const slug = generateSlug(name);

    // Create category
    const category = await Category.create({
      merchant_id,
      name,
      slug,
      description,
      emoji,
      image_url,
      sort_order: sort_order || 0,
      is_active: true
    });

    logger.info(`Category created: ${category.name} for merchant ${merchant_id}`);

    res.status(201).json({
      message: 'Category created successfully',
      category
    });

  } catch (error) {
    logger.error('Create category error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create category'
    });
  }
};

// @route   PATCH /api/categories/:id
// @desc    Update category
// @access  Private (merchant owner or admin)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!category) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Category not found'
      });
    }

    // Check permission
    const isOwner = category.merchant.owner_id === req.userId;
    const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this category'
      });
    }

    // Fields that can be updated
    const allowedFields = ['name', 'description', 'emoji', 'image_url', 'sort_order', 'is_active'];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Update slug if name changed
    if (req.body.name) {
      updates.slug = generateSlug(req.body.name);
    }

    await category.update(updates);

    logger.info(`Category updated: ${category.id} by user ${req.userId}`);

    res.json({
      message: 'Category updated successfully',
      category
    });

  } catch (error) {
    logger.error('Update category error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update category'
    });
  }
};

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (merchant owner or admin)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!category) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Category not found'
      });
    }

    // Check permission
    const isOwner = category.merchant.owner_id === req.userId;
    const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this category'
      });
    }

    // Check if category has products
    const productCount = await Product.count({
      where: { category_id: id }
    });

    if (productCount > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Cannot delete category with ${productCount} products. Please reassign or delete products first.`
      });
    }

    await category.destroy();

    logger.info(`Category deleted: ${category.id} by user ${req.userId}`);

    res.json({
      message: 'Category deleted successfully'
    });

  } catch (error) {
    logger.error('Delete category error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete category'
    });
  }
};

// @route   PATCH /api/categories/reorder
// @desc    Reorder categories
// @access  Private (merchant owner)
exports.reorderCategories = async (req, res) => {
  try {
    const { merchant_id, categories } = req.body;

    if (!merchant_id || !Array.isArray(categories)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'merchant_id and categories array are required'
      });
    }

    // Check merchant permission
    const merchant = await Merchant.findByPk(merchant_id);

    if (!merchant) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Merchant not found'
      });
    }

    const isOwner = merchant.owner_id === req.userId;

    if (!isOwner) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to reorder categories for this merchant'
      });
    }

    // Update sort_order for each category
    const updates = categories.map((item, index) => {
      return Category.update(
        { sort_order: index },
        { where: { id: item.id, merchant_id } }
      );
    });

    await Promise.all(updates);

    logger.info(`Categories reordered for merchant ${merchant_id}`);

    res.json({
      message: 'Categories reordered successfully'
    });

  } catch (error) {
    logger.error('Reorder categories error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to reorder categories'
    });
  }
};

module.exports = exports;
