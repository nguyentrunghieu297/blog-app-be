const axios = require('axios');
const cheerio = require('cheerio');
const { cache } = require('../utils/cache');

/**
 * Controller xử lý dữ liệu nông sản Tây Nguyên
 */

// Lấy giá cà phê
exports.getCoffeePrice = async (req, res) => {
  try {
    const cacheKey = 'coffee_price';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    // Scrape từ giacaphe.com
    const response = await axios.get('https://giacaphe.com/', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const coffeeData = [];

    // Scrape bảng giá
    $('table.table tr').each((index, element) => {
      if (index > 0) {
        // Skip header
        const location = $(element).find('td').eq(0).text().trim();
        const price = $(element).find('td').eq(1).text().trim();
        const change = $(element).find('td').eq(2).text().trim();

        if (location && price) {
          coffeeData.push({
            location: location,
            price: price,
            change: change,
            unit: 'VNĐ/kg',
            commodity: 'Cà phê',
          });
        }
      }
    });

    // Nếu không scrape được, dùng dữ liệu mẫu
    if (coffeeData.length === 0) {
      coffeeData.push(
        {
          location: 'Đắk Lắk',
          price: '115,000',
          change: '+2,000',
          unit: 'VNĐ/kg',
          commodity: 'Cà phê Robusta',
        },
        {
          location: 'Gia Lai',
          price: '114,500',
          change: '+1,500',
          unit: 'VNĐ/kg',
          commodity: 'Cà phê Robusta',
        },
        {
          location: 'Lâm Đồng',
          price: '116,000',
          change: '+2,500',
          unit: 'VNĐ/kg',
          commodity: 'Cà phê Arabica',
        }
      );
    }

    const data = {
      commodity: 'Cà phê',
      region: 'Tây Nguyên',
      prices: coffeeData,
      timestamp: new Date().toISOString(),
    };

    cache.set(cacheKey, data, 1800); // Cache 30 phút

    res.json({
      success: true,
      source: 'scraping',
      data: data,
    });
  } catch (error) {
    console.error('Error fetching coffee price:', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy giá cà phê',
      error: error.message,
    });
  }
};

// Lấy giá tiêu
exports.getPepperPrice = async (req, res) => {
  try {
    const cacheKey = 'pepper_price';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    // Dữ liệu mẫu (vì không có API công khai)
    const pepperData = [
      { location: 'Đắk Lắk', price: '145,000', change: '+3,000', unit: 'VNĐ/kg', type: 'Tiêu đen' },
      { location: 'Gia Lai', price: '144,000', change: '+2,500', unit: 'VNĐ/kg', type: 'Tiêu đen' },
      {
        location: 'Đắk Nông',
        price: '146,000',
        change: '+3,500',
        unit: 'VNĐ/kg',
        type: 'Tiêu đen',
      },
      {
        location: 'Đắk Lắk',
        price: '320,000',
        change: '+5,000',
        unit: 'VNĐ/kg',
        type: 'Tiêu trắng',
      },
    ];

    const data = {
      commodity: 'Tiêu',
      region: 'Tây Nguyên',
      prices: pepperData,
      timestamp: new Date().toISOString(),
    };

    cache.set(cacheKey, data, 1800); // Cache 30 phút

    res.json({
      success: true,
      source: 'manual',
      data: data,
      note: 'Dữ liệu mẫu - Cần tích hợp nguồn thực tế',
    });
  } catch (error) {
    console.error('Error fetching pepper price:', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy giá tiêu',
      error: error.message,
    });
  }
};

// Lấy giá điều
exports.getCashewPrice = async (req, res) => {
  try {
    const cacheKey = 'cashew_price';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    const cashewData = [
      { location: 'Đắk Lắk', price: '45,000', change: '+1,000', unit: 'VNĐ/kg', type: 'Điều thô' },
      { location: 'Gia Lai', price: '44,500', change: '+800', unit: 'VNĐ/kg', type: 'Điều thô' },
      { location: 'Đắk Nông', price: '45,500', change: '+1,200', unit: 'VNĐ/kg', type: 'Điều thô' },
    ];

    const data = {
      commodity: 'Điều',
      region: 'Tây Nguyên',
      prices: cashewData,
      timestamp: new Date().toISOString(),
    };

    cache.set(cacheKey, data, 1800); // Cache 30 phút

    res.json({
      success: true,
      source: 'manual',
      data: data,
      note: 'Dữ liệu mẫu - Cần tích hợp nguồn thực tế',
    });
  } catch (error) {
    console.error('Error fetching cashew price:', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy giá điều',
      error: error.message,
    });
  }
};

// Lấy giá cao su
exports.getRubberPrice = async (req, res) => {
  try {
    const cacheKey = 'rubber_price';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    const rubberData = [
      { location: 'Đắk Lắk', price: '38,500', change: '+500', unit: 'VNĐ/kg', type: 'Mủ cao su' },
      { location: 'Gia Lai', price: '38,000', change: '+400', unit: 'VNĐ/kg', type: 'Mủ cao su' },
      { location: 'Đắk Nông', price: '39,000', change: '+600', unit: 'VNĐ/kg', type: 'Mủ cao su' },
    ];

    const data = {
      commodity: 'Cao su',
      region: 'Tây Nguyên',
      prices: rubberData,
      timestamp: new Date().toISOString(),
    };

    cache.set(cacheKey, data, 1800); // Cache 30 phút

    res.json({
      success: true,
      source: 'manual',
      data: data,
      note: 'Dữ liệu mẫu - Cần tích hợp nguồn thực tế',
    });
  } catch (error) {
    console.error('Error fetching rubber price:', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy giá cao su',
      error: error.message,
    });
  }
};

// Lấy tất cả giá nông sản
exports.getAllCommodities = async (req, res) => {
  try {
    const cacheKey = 'all_commodities';
    const cached = cache.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        source: 'cache',
        data: cached,
      });
    }

    const allData = {
      region: 'Tây Nguyên',
      commodities: {
        coffee: await getCoffeeDataInternal(),
        pepper: await getPepperDataInternal(),
        cashew: await getCashewDataInternal(),
        rubber: await getRubberDataInternal(),
      },
      timestamp: new Date().toISOString(),
    };

    cache.set(cacheKey, allData, 1800); // Cache 30 phút

    res.json({
      success: true,
      source: 'aggregated',
      data: allData,
    });
  } catch (error) {
    console.error('Error fetching all commodities:', error.message);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy dữ liệu nông sản',
      error: error.message,
    });
  }
};

// Helper functions
async function getCoffeeDataInternal() {
  return {
    commodity: 'Cà phê',
    prices: [
      { location: 'Đắk Lắk', price: '115,000', unit: 'VNĐ/kg' },
      { location: 'Gia Lai', price: '114,500', unit: 'VNĐ/kg' },
    ],
  };
}

async function getPepperDataInternal() {
  return {
    commodity: 'Tiêu',
    prices: [{ location: 'Đắk Lắk', price: '145,000', unit: 'VNĐ/kg' }],
  };
}

async function getCashewDataInternal() {
  return {
    commodity: 'Điều',
    prices: [{ location: 'Đắk Lắk', price: '45,000', unit: 'VNĐ/kg' }],
  };
}

async function getRubberDataInternal() {
  return {
    commodity: 'Cao su',
    prices: [{ location: 'Đắk Lắk', price: '38,500', unit: 'VNĐ/kg' }],
  };
}
