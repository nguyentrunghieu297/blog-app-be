const { rssSources } = require('../constants/rssSources');
const { fetchRSS } = require('../utils/rssParser.js');
const { categoryMapping, frontendCategories } = require('../constants/categoryMapping');

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
          // Kiểm tra xem category.name có nằm trong danh sách targetCategories không
          const isMatch = targetCategories.some(
            (target) =>
              category.name.toLowerCase().includes(target.toLowerCase()) ||
              target.toLowerCase().includes(category.name.toLowerCase())
          );

          if (!isMatch) {
            continue;
          }
        }

        try {
          const items = await fetchRSS(category.url);

          allNews.push(
            ...items.map((i) => ({
              title: i.title,
              description: i.description || '',
              link: i.link,
              pubDate: i.pubDate ? new Date(i.pubDate) : null,
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

    // Sắp xếp tin mới nhất lên đầu
    const sorted = allNews.sort((a, b) => {
      const dateA = a.pubDate ? a.pubDate.getTime() : 0;
      const dateB = b.pubDate ? b.pubDate.getTime() : 0;
      return dateB - dateA;
    });

    res.json({
      success: true,
      count: sorted.length,
      data: sorted.slice(0, limit),
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
