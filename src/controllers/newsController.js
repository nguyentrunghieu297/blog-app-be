const { rssSources } = require('../constants/rssSources');
const { fetchRSS } = require('../utils/rssParser.js');

const getAllNews = async (req, res) => {
  try {
    const { source: sourceQuery, category: categoryQuery, limit = 30 } = req.query;
    let selectedSources = rssSources;

    // Nếu có query source thì lọc
    if (sourceQuery) {
      selectedSources = rssSources.filter(
        (s) => s.name.toLowerCase() === sourceQuery.toLowerCase()
      );
    }

    const allNews = [];

    for (const source of selectedSources) {
      const categories = source.categories || [];

      for (const category of categories) {
        // Nếu có query category thì chỉ lấy danh mục đó
        if (categoryQuery && category.name.toLowerCase() !== categoryQuery.toLowerCase()) {
          continue;
        }

        try {
          const items = await fetchRSS(category.url);

          allNews.push(
            ...items.map((i) => ({
              title: i.title,
              description: i.description || i.contentSnippet || i.content || '',
              link: i.link,
              pubDate: i.pubDate ? new Date(i.pubDate) : null,
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
    const sorted = allNews.sort((a, b) => b.pubDate - a.pubDate);

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

module.exports = {
  getAllNews,
};
