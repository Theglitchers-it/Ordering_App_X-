const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authMiddleware, optionalAuth } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');

// Create order (can be public with customer info or authenticated)
router.post('/', optionalAuth, orderController.createOrder);

// Protected routes
router.get('/',
  authMiddleware,
  orderController.getOrders
);

router.get('/:id',
  authMiddleware,
  orderController.getOrderById
);

router.patch('/:id/status',
  authMiddleware,
  checkRole('merchant_admin', 'super_admin', 'admin_ops'),
  orderController.updateOrderStatus
);

router.patch('/:id/cancel',
  authMiddleware,
  orderController.cancelOrder
);

module.exports = router;
