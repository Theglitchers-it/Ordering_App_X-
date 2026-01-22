const express = require('express');
const router = express.Router();

// TODO: Implement category routes
router.get('/', (req, res) => {
  res.json({ message: 'Category routes - Coming soon' });
});

module.exports = router;
