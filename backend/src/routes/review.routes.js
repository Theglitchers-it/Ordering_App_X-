const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authMiddleware, optionalAuth } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');

// ============================================
// PUBLIC ROUTES
// ============================================

// Get reviews (with filters)
router.get('/', reviewController.getReviews);

// Get review by ID
router.get('/:id', reviewController.getReviewById);

// Get review statistics for merchant or product
router.get('/stats/:type/:id', reviewController.getReviewStats);

// ============================================
// PROTECTED ROUTES - Require Authentication
// ============================================

// Create a new review
router.post('/',
  authMiddleware,
  reviewController.createReview
);

// Update a review (author only)
router.patch('/:id',
  authMiddleware,
  reviewController.updateReview
);

// Delete a review (author or admin)
router.delete('/:id',
  authMiddleware,
  reviewController.deleteReview
);

// Merchant responds to a review
router.post('/:id/respond',
  authMiddleware,
  checkRole('merchant_admin', 'super_admin', 'admin_ops'),
  reviewController.respondToReview
);

// Moderate review (approve/reject) - Admin only
router.patch('/:id/approve',
  authMiddleware,
  checkRole('super_admin', 'admin_ops'),
  reviewController.moderateReview
);

module.exports = router;
