const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authMiddleware, optionalAuth } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/rbac.middleware');

// Create payment intent (can be public or authenticated)
router.post('/create-intent',
  optionalAuth,
  paymentController.createPaymentIntent
);

// Confirm payment (public, used after Stripe.js confirms)
router.post('/confirm',
  paymentController.confirmPayment
);

// Stripe webhook (public, called by Stripe)
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

// Protected routes
router.get('/:orderId/status',
  authMiddleware,
  paymentController.getPaymentStatus
);

router.post('/:orderId/refund',
  authMiddleware,
  checkRole('merchant_admin', 'super_admin', 'admin_ops', 'finance'),
  paymentController.refundPayment
);

module.exports = router;
