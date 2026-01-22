const express = require('express');
const router = express.Router();

// TODO: Implement coupon routes
router.get('/', (req, res) => {
  res.json({ message: 'Coupon routes - Coming soon' });
});

module.exports = router;
