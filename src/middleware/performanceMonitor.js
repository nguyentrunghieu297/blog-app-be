/**
 * Middleware để monitor performance của API
 * Thêm vào routes: app.use('/api/news', performanceMonitor, newsRoutes)
 */

const performanceMonitor = (req, res, next) => {
  const start = Date.now();

  // Override res.json để capture response
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - start;

    // Log performance metrics
    console.log({
      method: req.method,
      path: req.path,
      query: req.query,
      duration: `${duration}ms`,
      status: res.statusCode,
      itemsReturned: data?.count || 0,
      timestamp: new Date().toISOString(),
    });

    // Thêm header performance
    res.setHeader('X-Response-Time', `${duration}ms`);

    // Warning nếu quá chậm
    if (duration > 10000) {
      console.warn(`⚠️ SLOW REQUEST: ${req.path} took ${duration}ms`);
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Health check endpoint
 */
const NodeCache = require('node-cache');
const cache = new NodeCache(); // Import cache từ rssParser

const healthCheck = (req, res) => {
  const stats = cache.getStats();

  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB',
    },
    cache: {
      keys: stats.keys,
      hits: stats.hits,
      misses: stats.misses,
      hitRate: stats.hits / (stats.hits + stats.misses) || 0,
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = { performanceMonitor, healthCheck };
