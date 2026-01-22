const express = require('express');
const router = express.Router();

// TODO: Implement order routes
router.get('/', (req, res) => {
  res.json({ message: 'Order routes - Coming soon' });
});

module.exports = router;
