const express = require('express');
const router = express.Router();
const tableController = require('../controllers/table.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');

// Public routes
router.get('/', tableController.getTables);
router.get('/:id', tableController.getTableById);

// Protected routes - Merchant Admin
router.post('/',
  authMiddleware,
  checkRole('merchant_admin', 'super_admin', 'admin_ops'),
  tableController.createTable
);

router.patch('/:id',
  authMiddleware,
  tableController.updateTable
);

router.delete('/:id',
  authMiddleware,
  tableController.deleteTable
);

router.post('/:id/regenerate-qr',
  authMiddleware,
  checkRole('merchant_admin'),
  tableController.regenerateQR
);

router.get('/:id/qr-download',
  authMiddleware,
  checkRole('merchant_admin'),
  tableController.downloadQR
);

router.patch('/:id/status',
  authMiddleware,
  checkRole('merchant_admin'),
  tableController.updateTableStatus
);

module.exports = router;
