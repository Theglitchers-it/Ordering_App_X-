const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');

// ============================================
// PUBLIC ROUTES
// ============================================

// Get available coupons for customers
router.get('/available', couponController.getAvailableCoupons);

// Validate coupon code
router.post('/validate', couponController.validateCoupon);

// ============================================
// PROTECTED ROUTES - Require Authentication
// ============================================

// Get all coupons (admin/merchant view)
router.get('/',
  authMiddleware,
  checkRole('super_admin', 'admin_ops', 'merchant_admin'),
  couponController.getAllCoupons
);

// Get coupon by ID
router.get('/:id',
  authMiddleware,
  checkRole('super_admin', 'admin_ops', 'merchant_admin'),
  couponController.getCouponById
);

// Get coupon statistics
router.get('/:id/stats',
  authMiddleware,
  checkRole('super_admin', 'admin_ops', 'merchant_admin'),
  couponController.getCouponStats
);

// Create new coupon
router.post('/',
  authMiddleware,
  checkRole('super_admin', 'admin_ops', 'merchant_admin'),
  couponController.createCoupon
);

// Update coupon
router.patch('/:id',
  authMiddleware,
  checkRole('super_admin', 'admin_ops', 'merchant_admin'),
  couponController.updateCoupon
);

// Toggle coupon active status
router.patch('/:id/toggle',
  authMiddleware,
  checkRole('super_admin', 'admin_ops', 'merchant_admin'),
  couponController.toggleCouponStatus
);

// Delete coupon
router.delete('/:id',
  authMiddleware,
  checkRole('super_admin', 'admin_ops', 'merchant_admin'),
  couponController.deleteCoupon
);

// Apply coupon to order (record usage)
router.post('/:id/apply',
  authMiddleware,
  couponController.applyCouponToOrder
);

module.exports = router;
