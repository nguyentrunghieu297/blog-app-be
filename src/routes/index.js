const express = require('express');
const { getHome, getAbout } = require('../controllers/homeController');
const userRoutes = require('./userRoutes');
const blogRoutes = require('./blogRoutes');
const newsRoutes = require('./newsRoutes');
const marketRoutes = require('./marketRoutes');
const commodityRoute = require('./commodityRoutes');

const router = express.Router();

// Home routes
router.get('/', getHome);
router.get('/about', getAbout);

// API routes
router.use('/api/users', userRoutes);
router.use('/api/blogs', blogRoutes);
router.use('/api/news', newsRoutes);
router.use('/api/market', marketRoutes);
router.use('/api/commodity', commodityRoute);

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
