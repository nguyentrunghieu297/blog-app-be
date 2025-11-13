const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/database');
const routes = require('./routes');
const { scrapeAllCommodities } = require('./script/scrapeCommodity');

const { requestLogger, notFound, errorHandler } = require('./middleware/errorHandler');

// Tải biến môi trường
require('dotenv').config();

// Kết nối MongoDB
connectDB();

// Tạo Express app
const app = express();

// Middleware cơ bản
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Routes
app.use('/', routes);

// Chạy mỗi 6 giờ (6h, 12h, 18h, 24h)
cron.schedule('0 */6 * * *', async () => {
  console.log('🌾 Running commodity price scrape...');
  await scrapeAllCommodities();
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
