const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchant.controller');
const { authMiddleware, optionalAuth } = require('../middleware/auth.middleware');
const { checkPermission, checkRole } = require('../middleware/rbac.middleware');

// Public routes
router.get('/', optionalAuth, merchantController.getAllMerchants);
router.get('/:slug', optionalAuth, merchantController.getMerchantBySlug);

// Protected routes - Merchant Admin
router.post('/',
  authMiddleware,
  checkRole('merchant_admin', 'super_admin'),
  merchantController.createMerchant
);

router.get('/me/dashboard',
  authMiddleware,
  checkRole('merchant_admin'),
  merchantController.getMyMerchant
);

router.patch('/:id',
  authMiddleware,
  merchantController.updateMerchant
);

router.get('/:id/stats',
  authMiddleware,
  merchantController.getMerchantStats
);

// Admin only routes
router.patch('/:id/approve',
  authMiddleware,
  checkRole('super_admin', 'admin_ops'),
  merchantController.approveMerchant
);

router.patch('/:id/block',
  authMiddleware,
  checkRole('super_admin'),
  merchantController.blockMerchant
);

router.delete('/:id',
  authMiddleware,
  merchantController.deleteMerchant
);

module.exports = router;
