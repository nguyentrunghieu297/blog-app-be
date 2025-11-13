const NodeCache = require('node-cache');

/**
 * Cache utility để tối ưu hiệu suất API
 * TTL mặc định: 300 giây (5 phút)
 */
const cache = new NodeCache({
  stdTTL: 300, // 5 phút
  checkperiod: 60, // Kiểm tra mỗi 60 giây
  useClones: false,
});

// Events
cache.on('set', (key, value) => {
  console.log(`[Cache] Set key: ${key}`);
});

cache.on('expired', (key, value) => {
  console.log(`[Cache] Expired key: ${key}`);
});

// Helper functions
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      console.log(`[Cache] Hit for: ${key}`);
      return res.json(cachedResponse);
    }

    console.log(`[Cache] Miss for: ${key}`);
    res.originalJson = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.originalJson(body);
    };
    next();
  };
};

// Clear cache by pattern
const clearCacheByPattern = (pattern) => {
  const keys = cache.keys();
  const matchedKeys = keys.filter((key) => key.includes(pattern));

  matchedKeys.forEach((key) => {
    cache.del(key);
  });

  return matchedKeys.length;
};

// Get cache stats
const getCacheStats = () => {
  return {
    keys: cache.keys(),
    stats: cache.getStats(),
    size: cache.keys().length,
  };
};

module.exports = {
  cache,
  cacheMiddleware,
  clearCacheByPattern,
  getCacheStats,
};
