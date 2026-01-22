const express = require('express');
const router = express.Router();

// TODO: Implement product routes
router.get('/', (req, res) => {
  res.json({ message: 'Product routes - Coming soon' });
});

module.exports = router;
