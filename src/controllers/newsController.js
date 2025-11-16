const { rssSources } = require('../constants/rssSources');
const { fetchRSS } = require('../utils/rssParser.js');
const { categoryMapping, frontendCategories } = require('../constants/categoryMapping');

/**
 * Normalize string để so sánh category
 */
function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
    .trim();
}

/**
 * Kiểm tra xem category có match với target không
 */
function isCategoryMatch(categoryName, targetCategories) {
  const normalizedCategory = normalizeString(categoryName);

  return targetCategories.some((target) => {
    const normalizedTarget = normalizeString(target);

    // Exact match hoặc category chứa target (hoặc ngược lại)
    return (
      normalizedCategory === normalizedTarget ||
      normalizedCategory.includes(normalizedTarget) ||
      normalizedTarget.includes(normalizedCategory)
    );
  });
}

const getAllNews = async (req, res) => {
  try {
    const { source: sourceQuery, category: categoryKey, limit = 30 } = req.query;
    let selectedSources = rssSources;

    // Lọc theo source nếu có
    if (sourceQuery) {
      selectedSources = rssSources.filter(
        (s) => s.name.toLowerCase() === sourceQuery.toLowerCase()
      );
    }

    const allNews = [];

    // Lấy danh sách category names từ category key
    const targetCategories = categoryKey ? categoryMapping[categoryKey] : null;

    for (const source of selectedSources) {
      const categories = source.categories || [];

      for (const category of categories) {
        // Nếu có category key và không phải "tong-quan"
        if (targetCategories !== null && targetCategories !== undefined) {
          // ✅ Fix: Dùng hàm normalize để match chính xác hơn
          if (!isCategoryMatch(category.name, targetCategories)) {
            continue;
          }
        }

        try {
          const items = await fetchRSS(category.url);

          allNews.push(
            ...items.map((i) => ({
              title: i.title,
              // ✅ Fix: Đơn giản hóa, không cần fallback vì đã xử lý trong parser
              description: i.description || '',
              link: i.link,
              pubDate: i.pubDate, // ✅ Đã được validate trong parser
              featuredImage: i.featuredImage || null,
              sourceName: source.name,
              sourceIcon: source.icon,
              domain: source.domain,
              category: category.name,
            }))
          );
        } catch (err) {
          console.warn(`⚠️ Lỗi khi fetch RSS từ ${category.url}:`, err.message);
        }
      }
    }

    // ✅ Fix: Sắp xếp an toàn hơn với null dates
    const sorted = allNews.sort((a, b) => {
      const dateA = a.pubDate ? a.pubDate.getTime() : 0;
      const dateB = b.pubDate ? b.pubDate.getTime() : 0;
      return dateB - dateA;
    });

    // Parse limit thành số và validate
    const parsedLimit = Math.max(1, parseInt(limit) || 30);

    res.json({
      success: true,
      count: sorted.length,
      data: sorted.slice(0, parsedLimit),
    });
  } catch (error) {
    console.error('❌ Lỗi khi tải RSS:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải RSS' });
  }
};

// Endpoint mới để lấy danh sách categories
const getCategories = async (req, res) => {
  try {
    res.json({
      success: true,
      data: frontendCategories,
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy categories:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy categories' });
  }
};

module.exports = {
  getAllNews,
  getCategories,
};
