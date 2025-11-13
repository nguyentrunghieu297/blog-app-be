const express = require('express');
const router = express.Router();

// Import controllers
const stockController = require('../controllers/stockController');
const goldController = require('../controllers/goldController');
const currencyController = require('../controllers/currencyController');
const commodityController = require('../controllers/commodityController');

/**
 * API Routes cho dữ liệu thị trường Việt Nam
 */

// ==================== CHỨNG KHOÁN ====================
// GET /api/stocks - Lấy danh sách cổ phiếu
router.get('/stocks', stockController.getStockList);

// GET /api/stocks/:symbol - Lấy thông tin chi tiết cổ phiếu
router.get('/stocks/:symbol', stockController.getStockDetail);

// GET /api/stocks/:symbol/price - Lấy giá realtime
router.get('/stocks/:symbol/price', stockController.getStockPrice);

// ==================== VÀNG ====================
// GET /api/gold/sjc - Giá vàng SJC
router.get('/gold/sjc', goldController.getGoldPriceSJC);

// GET /api/gold/all - Giá vàng từ nhiều nguồn
router.get('/gold/all', goldController.getGoldPriceAll);

// GET /api/gold/world - Giá vàng thế giới
router.get('/gold/world', goldController.getGoldPriceWorld);

// ==================== NGOẠI TỆ ====================
// GET /api/currency/vcb - Tỷ giá Vietcombank
router.get('/currency/vcb', currencyController.getExchangeRateVCB);

// GET /api/currency/all - Tỷ giá từ nhiều ngân hàng
router.get('/currency/all', currencyController.getExchangeRateAll);

// GET /api/currency/:currency - Tỷ giá một ngoại tệ cụ thể (VD: USD, EUR)
router.get('/currency/:currency', currencyController.getSpecificCurrency);

// ==================== NÔNG SẢN TÂY NGUYÊN ====================
// GET /api/commodity/coffee - Giá cà phê
router.get('/commodity/coffee', commodityController.getCoffeePrice);

// GET /api/commodity/pepper - Giá tiêu
router.get('/commodity/pepper', commodityController.getPepperPrice);

// GET /api/commodity/cashew - Giá điều
router.get('/commodity/cashew', commodityController.getCashewPrice);

// GET /api/commodity/rubber - Giá cao su
router.get('/commodity/rubber', commodityController.getRubberPrice);

// GET /api/commodity/all - Tất cả nông sản
router.get('/commodity/all', commodityController.getAllCommodities);

module.exports = router;
