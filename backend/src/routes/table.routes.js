const express = require('express');
const router = express.Router();

// TODO: Implement table routes
router.get('/', (req, res) => {
  res.json({ message: 'Table routes - Coming soon' });
});

module.exports = router;
