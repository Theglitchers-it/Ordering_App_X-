const express = require('express');
const router = express.Router();

// TODO: Implement payment routes
router.get('/', (req, res) => {
  res.json({ message: 'Payment routes - Coming soon' });
});

module.exports = router;
