const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const he = require('he'); // <--- Dùng để decode HTML entities

const parser = new Parser({
  defaultRSS: 2.0,
  timeout: 10000,
});
const cache = new NodeCache({ stdTTL: 300 }); // Cache 5 phút

/**
 * Fetch RSS feed từ URL, có caching và decode HTML entity
 */
const fetchRSS = async (url) => {
  try {
    // Kiểm tra cache
    const cachedData = cache.get(url);
    if (cachedData) return cachedData;

    // Parse RSS feed
    const feed = await parser.parseURL(url);

    const items = feed.items.map((item) => ({
      title: he.decode(item.title?.trim() || ''), // 👈 decode tiếng Việt
      description: he.decode(item.contentSnippet || item.content || item.description || ''),
      link: item.link,
      pubDate: item.pubDate ? new Date(item.pubDate) : null,
    }));

    // Lưu cache
    cache.set(url, items);

    return items;
  } catch (error) {
    console.warn(`⚠️ Lỗi khi fetch RSS từ ${url}:`, error.message);
    return [];
  }
};

module.exports = { fetchRSS };
