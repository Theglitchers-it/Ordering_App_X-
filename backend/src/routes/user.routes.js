const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.middleware');

// TODO: Implement user routes
router.get('/me', authMiddleware, (req, res) => {
  res.json({ message: 'User routes - Coming soon' });
});

module.exports = router;
