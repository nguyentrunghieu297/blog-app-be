const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware
 * Giới hạn số lượng request để tránh spam
 */

// Rate limit cho API chung
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Tối đa 100 requests
  message: {
    success: false,
    message: 'Quá nhiều request từ IP này, vui lòng thử lại sau 15 phút',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit nghiêm ngặt hơn cho các endpoint nhạy cảm
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Quá nhiều request, vui lòng thử lại sau',
  },
});

module.exports = {
  apiLimiter,
  strictLimiter,
};
