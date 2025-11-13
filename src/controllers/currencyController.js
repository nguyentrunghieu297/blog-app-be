const axios = require('axios');
const xml2js = require('xml2js');
const { cache } = require('../utils/cache');

/**
 * Controller xử lý dữ liệu ngoại tệ
 */

// Lấy tỷ giá từ Vietcombank
exports.getExchangeRateVCB = async (req, res) => {
  try {
    const cacheKey = 'exchange_rate_vcb';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    // API Vietcombank (XML format)
    const response = await axios.get(
      'https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx',
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    // Parse XML to JSON
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);

    const exchangeData = result.ExrateList.Exrate;
    const processedData = Array.isArray(exchangeData) ? exchangeData : [exchangeData];

    // Format dữ liệu
    const formattedData = processedData.map((item) => ({
      currency: item.$.CurrencyCode,
      name: item.$.CurrencyName,
      buy: parseFloat(item.$.Buy?.replace(/,/g, '') || 0),
      transfer: parseFloat(item.$.Transfer?.replace(/,/g, '') || 0),
      sell: parseFloat(item.$.Sell?.replace(/,/g, '') || 0),
    }));

    cache.set(cacheKey, formattedData, 600); // Cache 10 phút

    res.json({
      success: true,
      source: 'api',
      bank: 'Vietcombank',
      data: formattedData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching VCB exchange rate:', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy tỷ giá Vietcombank',
      error: error.message,
    });
  }
};

// Lấy tỷ giá từ nhiều ngân hàng
exports.getExchangeRateAll = async (req, res) => {
  try {
    const cacheKey = 'exchange_rate_all';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    // Lấy từ API tygia.com (hỗ trợ nhiều ngân hàng)
    const response = await axios.get('https://tygia.com/json.php?src=vietcombank&date=now', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const data = response.data;
    cache.set(cacheKey, data, 600); // Cache 10 phút

    res.json({
      success: true,
      source: 'api',
      data: data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching all exchange rates:', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy tỷ giá',
      error: error.message,
    });
  }
};

// Lấy tỷ giá một ngoại tệ cụ thể
exports.getSpecificCurrency = async (req, res) => {
  try {
    const { currency } = req.params;

    if (!currency) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã ngoại tệ (VD: USD, EUR, JPY)',
      });
    }

    const cacheKey = `exchange_rate_${currency.toUpperCase()}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    // Lấy tất cả tỷ giá
    const response = await axios.get(
      'https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx',
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);

    const exchangeData = result.ExrateList.Exrate;
    const exchangeList = Array.isArray(exchangeData) ? exchangeData : [exchangeData];

    // Tìm ngoại tệ cụ thể
    const specificCurrency = exchangeList.find(
      (item) => item.$.CurrencyCode === currency.toUpperCase()
    );

    if (!specificCurrency) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy tỷ giá cho ${currency.toUpperCase()}`,
      });
    }

    const formattedData = {
      currency: specificCurrency.$.CurrencyCode,
      name: specificCurrency.$.CurrencyName,
      buy: parseFloat(specificCurrency.$.Buy?.replace(/,/g, '') || 0),
      transfer: parseFloat(specificCurrency.$.Transfer?.replace(/,/g, '') || 0),
      sell: parseFloat(specificCurrency.$.Sell?.replace(/,/g, '') || 0),
    };

    cache.set(cacheKey, formattedData, 600); // Cache 10 phút

    res.json({
      success: true,
      source: 'api',
      data: formattedData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching specific currency:', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy tỷ giá ngoại tệ',
      error: error.message,
    });
  }
};
