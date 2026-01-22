const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes - Merchant Admin
router.post('/',
  authMiddleware,
  checkRole('merchant_admin', 'super_admin', 'admin_ops'),
  productController.createProduct
);

router.patch('/:id',
  authMiddleware,
  productController.updateProduct
);

router.delete('/:id',
  authMiddleware,
  productController.deleteProduct
);

router.patch('/:id/toggle-availability',
  authMiddleware,
  checkRole('merchant_admin'),
  productController.toggleAvailability
);

router.post('/bulk-import',
  authMiddleware,
  checkRole('merchant_admin', 'super_admin', 'admin_ops'),
  productController.bulkImport
);

module.exports = router;
