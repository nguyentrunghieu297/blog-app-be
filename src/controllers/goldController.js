const axios = require('axios');
const xml2js = require('xml2js');
const { cache } = require('../utils/cache');

/**
 * Controller xử lý dữ liệu giá vàng
 */

// Lấy giá vàng SJC
exports.getGoldPriceSJC = async (req, res) => {
  try {
    const cacheKey = 'gold_price_sjc';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    // API SJC (XML format)
    const response = await axios.get('https://sjc.com.vn/xml/tygiavang.xml', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    // Parse XML to JSON
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);

    const goldData = result.root.ratelist.city;
    const processedData = Array.isArray(goldData) ? goldData : [goldData];

    cache.set(cacheKey, processedData, 300); // Cache 5 phút

    res.json({
      success: true,
      source: 'api',
      data: processedData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching SJC gold price:', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy giá vàng SJC',
      error: error.message,
    });
  }
};

// Lấy giá vàng từ nhiều nguồn (tygia.com)
exports.getGoldPriceAll = async (req, res) => {
  try {
    const cacheKey = 'gold_price_all';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    // API từ tygia.com (JSON)
    const response = await axios.get('https://www.tygia.com/json.php?b=1&src=api', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const data = response.data;
    cache.set(cacheKey, data, 300); // Cache 5 phút

    res.json({
      success: true,
      source: 'api',
      data: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching gold prices:', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy giá vàng',
      error: error.message,
    });
  }
};

// Lấy giá vàng thế giới
exports.getGoldPriceWorld = async (req, res) => {
  try {
    const cacheKey = 'gold_price_world';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    // API giá vàng thế giới
    const response = await axios.get('https://www.goldapi.io/api/XAU/USD', {
      timeout: 10000,
      headers: {
        'x-access-token': process.env.GOLD_API_KEY || 'goldapi-demo-key',
      },
    });

    const data = response.data;
    cache.set(cacheKey, data, 300); // Cache 5 phút

    res.json({
      success: true,
      source: 'api',
      data: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching world gold price:', error.message);

    // Fallback: trả về dữ liệu từ nguồn khác
    try {
      const fallbackResponse = await axios.get('https://www.tygia.com/json.php?b=1&src=api', {
        timeout: 10000,
      });

      res.json({
        success: true,
        source: 'fallback',
        data: fallbackResponse.data,
        message: 'Sử dụng nguồn dữ liệu dự phòng',
      });
    } catch (fallbackError) {
      res.status(500).json({
        success: false,
        message: 'Không thể lấy giá vàng thế giới',
        error: error.message,
      });
    }
  }
};
