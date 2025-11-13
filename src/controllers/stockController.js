const axios = require('axios');
const { cache } = require('../utils/cache');

/**
 * Controller xử lý dữ liệu chứng khoán
 */

// Lấy danh sách cổ phiếu từ VNStock API (sử dụng API công khai)
exports.getStockList = async (req, res) => {
  try {
    const cacheKey = 'stock_list';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    // API công khai từ VNStock hoặc các nguồn mở
    const response = await axios.get(
      'https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/list-top-market-cap',
      {
        params: {
          market: 'ALL',
          size: 50,
        },
        timeout: 10000,
      }
    );

    const data = response.data;
    cache.set(cacheKey, data, 300); // Cache 5 phút

    res.json({
      success: true,
      source: 'api',
      data: data,
    });
  } catch (error) {
    console.error('Error fetching stock list:', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy dữ liệu chứng khoán',
      error: error.message,
    });
  }
};

// Lấy thông tin chi tiết cổ phiếu
exports.getStockDetail = async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã cổ phiếu',
      });
    }

    const cacheKey = `stock_detail_${symbol.toUpperCase()}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    // Lấy thông tin từ TCBS API
    const response = await axios.get(
      `https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/${symbol.toUpperCase()}/overview`,
      {
        timeout: 10000,
      }
    );

    const data = response.data;
    cache.set(cacheKey, data, 60); // Cache 1 phút

    res.json({
      success: true,
      source: 'api',
      data: data,
    });
  } catch (error) {
    console.error('Error fetching stock detail:', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin cổ phiếu',
      error: error.message,
    });
  }
};

// Lấy giá realtime
exports.getStockPrice = async (req, res) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã cổ phiếu',
      });
    }

    const cacheKey = `stock_price_${symbol.toUpperCase()}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    const response = await axios.get(
      `https://apipubaws.tcbs.com.vn/stock-insight/v1/intraday/${symbol.toUpperCase()}/his/pul`,
      {
        timeout: 10000,
      }
    );

    const data = response.data;
    cache.set(cacheKey, data, 10); // Cache 10 giây

    res.json({
      success: true,
      source: 'api',
      data: data,
    });
  } catch (error) {
    console.error('Error fetching stock price:', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy giá cổ phiếu',
      error: error.message,
    });
  }
};
