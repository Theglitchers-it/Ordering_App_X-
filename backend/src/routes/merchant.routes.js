const express = require('express');
const router = express.Router();

// TODO: Implement merchant routes
router.get('/', (req, res) => {
  res.json({ message: 'Merchant routes - Coming soon' });
});

module.exports = router;
