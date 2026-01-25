const { Review, User, Merchant, Product, Order } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// @route   GET /api/reviews
// @desc    Get reviews with filters
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const {
      merchant_id,
      product_id,
      user_id,
      min_rating,
      max_rating,
      is_approved = 'true',
      page = 1,
      limit = 20,
      sort = 'newest'
    } = req.query;

    const where = {};

    if (merchant_id) where.merchant_id = merchant_id;
    if (product_id) where.product_id = product_id;
    if (user_id) where.user_id = user_id;

    if (min_rating || max_rating) {
      where.rating = {};
      if (min_rating) where.rating[Op.gte] = parseInt(min_rating);
      if (max_rating) where.rating[Op.lte] = parseInt(max_rating);
    }

    // Only show approved reviews publicly
    if (is_approved === 'true') {
      where.is_approved = true;
    }

    // Sorting
    let order = [['created_at', 'DESC']];
    if (sort === 'oldest') order = [['created_at', 'ASC']];
    if (sort === 'highest') order = [['rating', 'DESC'], ['created_at', 'DESC']];
    if (sort === 'lowest') order = [['rating', 'ASC'], ['created_at', 'DESC']];

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'image_url']
        },
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'business_name', 'slug']
        }
      ]
    });

    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    logger.error('Get reviews error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get reviews'
    });
  }
};

// @route   GET /api/reviews/:id
// @desc    Get single review by ID
// @access  Public
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug', 'image_url']
        },
        {
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'business_name', 'slug']
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number', 'total', 'created_at']
        }
      ]
    });

    if (!review) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Review not found'
      });
    }

    res.json({ review });

  } catch (error) {
    logger.error('Get review error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get review'
    });
  }
};

// @route   GET /api/reviews/stats/:type/:id
// @desc    Get review statistics for merchant or product
// @access  Public
exports.getReviewStats = async (req, res) => {
  try {
    const { type, id } = req.params;

    let where = { is_approved: true };

    if (type === 'merchant') {
      where.merchant_id = id;
    } else if (type === 'product') {
      where.product_id = id;
    } else {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Type must be "merchant" or "product"'
      });
    }

    // Get aggregate stats
    const stats = await Review.findOne({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_reviews'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 5 THEN 1 ELSE 0 END')), 'five_star'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 4 THEN 1 ELSE 0 END')), 'four_star'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 3 THEN 1 ELSE 0 END')), 'three_star'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 2 THEN 1 ELSE 0 END')), 'two_star'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN rating = 1 THEN 1 ELSE 0 END')), 'one_star']
      ],
      raw: true
    });

    res.json({
      stats: {
        total_reviews: parseInt(stats.total_reviews) || 0,
        average_rating: parseFloat(stats.average_rating)?.toFixed(1) || '0.0',
        rating_distribution: {
          5: parseInt(stats.five_star) || 0,
          4: parseInt(stats.four_star) || 0,
          3: parseInt(stats.three_star) || 0,
          2: parseInt(stats.two_star) || 0,
          1: parseInt(stats.one_star) || 0
        }
      }
    });

  } catch (error) {
    logger.error('Get review stats error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get review statistics'
    });
  }
};

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private (authenticated users)
exports.createReview = async (req, res) => {
  try {
    const {
      merchant_id,
      product_id,
      order_id,
      rating,
      title,
      comment,
      images
    } = req.body;

    // Validation
    if (!order_id || !rating) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'order_id and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Rating must be between 1 and 5'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findByPk(order_id);

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Check if user has already reviewed this order
    const existingReview = await Review.findOne({
      where: {
        order_id,
        user_id: req.userId
      }
    });

    if (existingReview) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'You have already reviewed this order'
      });
    }

    // Verify order is completed
    if (!['completed', 'delivered'].includes(order.order_status)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Can only review completed orders'
      });
    }

    // Create review
    const review = await Review.create({
      merchant_id: merchant_id || order.merchant_id,
      product_id: product_id || null,
      order_id,
      user_id: req.userId,
      rating,
      title,
      comment,
      images: images || null,
      is_verified: true, // User has made a real order
      is_approved: true // Auto-approve for now
    });

    // Update merchant/product rating
    await updateAverageRating(merchant_id || order.merchant_id, product_id);

    logger.info(`Review created: ${review.id} for order ${order_id}`);

    res.status(201).json({
      message: 'Review created successfully',
      review
    });

  } catch (error) {
    logger.error('Create review error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to create review'
    });
  }
};

// @route   PATCH /api/reviews/:id
// @desc    Update a review
// @access  Private (author only)
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Review not found'
      });
    }

    // Check permission
    if (review.user_id !== req.userId && !['super_admin', 'admin_ops'].includes(req.userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only edit your own reviews'
      });
    }

    const { rating, title, comment, images } = req.body;

    const updates = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Rating must be between 1 and 5'
        });
      }
      updates.rating = rating;
    }
    if (title !== undefined) updates.title = title;
    if (comment !== undefined) updates.comment = comment;
    if (images !== undefined) updates.images = images;

    await review.update(updates);

    // Update average rating
    await updateAverageRating(review.merchant_id, review.product_id);

    logger.info(`Review updated: ${review.id} by user ${req.userId}`);

    res.json({
      message: 'Review updated successfully',
      review
    });

  } catch (error) {
    logger.error('Update review error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update review'
    });
  }
};

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (author or admin)
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Review not found'
      });
    }

    // Check permission
    if (review.user_id !== req.userId && !['super_admin', 'admin_ops'].includes(req.userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own reviews'
      });
    }

    const merchantId = review.merchant_id;
    const productId = review.product_id;

    await review.destroy();

    // Update average rating
    await updateAverageRating(merchantId, productId);

    logger.info(`Review deleted: ${id} by user ${req.userId}`);

    res.json({
      message: 'Review deleted successfully'
    });

  } catch (error) {
    logger.error('Delete review error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to delete review'
    });
  }
};

// @route   POST /api/reviews/:id/respond
// @desc    Merchant responds to a review
// @access  Private (merchant owner)
exports.respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Response text is required'
      });
    }

    const review = await Review.findByPk(id, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!review) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Review not found'
      });
    }

    // Check permission
    const isOwner = review.merchant?.owner_id === req.userId;
    const isAdmin = ['super_admin', 'admin_ops'].includes(req.userRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the merchant can respond to reviews'
      });
    }

    await review.update({
      merchant_response: response.trim(),
      merchant_responded_at: new Date()
    });

    logger.info(`Merchant responded to review: ${id}`);

    res.json({
      message: 'Response added successfully',
      review
    });

  } catch (error) {
    logger.error('Respond to review error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to respond to review'
    });
  }
};

// @route   PATCH /api/reviews/:id/approve
// @desc    Approve or reject a review (admin)
// @access  Private (admin)
exports.moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_approved } = req.body;

    if (is_approved === undefined) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'is_approved is required'
      });
    }

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Review not found'
      });
    }

    await review.update({ is_approved });

    // Update average rating
    await updateAverageRating(review.merchant_id, review.product_id);

    logger.info(`Review ${is_approved ? 'approved' : 'rejected'}: ${id}`);

    res.json({
      message: `Review ${is_approved ? 'approved' : 'rejected'} successfully`,
      review
    });

  } catch (error) {
    logger.error('Moderate review error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to moderate review'
    });
  }
};

// Helper function to update average rating
async function updateAverageRating(merchantId, productId) {
  try {
    // Update merchant rating
    if (merchantId) {
      const merchantStats = await Review.findOne({
        where: { merchant_id: merchantId, is_approved: true },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        raw: true
      });

      await Merchant.update(
        {
          avg_rating: merchantStats.avg_rating || 0,
          review_count: parseInt(merchantStats.count) || 0
        },
        { where: { id: merchantId } }
      );
    }

    // Update product rating
    if (productId) {
      const productStats = await Review.findOne({
        where: { product_id: productId, is_approved: true },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        raw: true
      });

      await Product.update(
        {
          rating: productStats.avg_rating || 0,
          review_count: parseInt(productStats.count) || 0
        },
        { where: { id: productId } }
      );
    }
  } catch (error) {
    logger.error('Update average rating error:', error);
  }
}

module.exports = exports;
