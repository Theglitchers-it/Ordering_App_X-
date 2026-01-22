const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected routes - Merchant Admin
router.post('/',
  authMiddleware,
  checkRole('merchant_admin', 'super_admin', 'admin_ops'),
  categoryController.createCategory
);

router.patch('/:id',
  authMiddleware,
  categoryController.updateCategory
);

router.delete('/:id',
  authMiddleware,
  categoryController.deleteCategory
);

router.patch('/reorder',
  authMiddleware,
  checkRole('merchant_admin'),
  categoryController.reorderCategories
);

module.exports = router;
