// Middleware để log requests
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
};

// Middleware xử lý route không tồn tại
const notFound = (req, res, next) => {
  const error = new Error(`Route không tồn tại - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware xử lý lỗi tổng quát
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log lỗi
  console.error(`Error: ${err.message}`);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource không tồn tại';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Dữ liệu đã tồn tại';
    error = { message, statusCode: 409 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token không hợp lệ';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token đã hết hạn';
    error = { message, statusCode: 401 };
  }

  const statusCode = error.statusCode || res.statusCode || 500;
  const message = error.message || 'Lỗi server';

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
};

module.exports = {
  requestLogger,
  notFound,
  errorHandler,
};
