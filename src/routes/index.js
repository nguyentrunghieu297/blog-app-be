const express = require('express');
const { getHome, getAbout } = require('../controllers/homeController');
const userRoutes = require('./userRoutes');

const router = express.Router();

// Home routes
router.get('/', getHome);
router.get('/about', getAbout);

// API routes
router.use('/api/users', userRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Server đang hoạt động bình thường',
  });
});

module.exports = router;
