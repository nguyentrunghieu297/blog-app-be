const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const he = require('he');

const parser = new Parser({
  defaultRSS: 2.0,
  timeout: 10000,
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

const cache = new NodeCache({ stdTTL: 300 }); // Cache 5 phút

/**
 * Lấy hình ảnh từ các nguồn có thể trong item RSS
 */
function extractImage(item) {
  // 1️⃣ Ưu tiên thẻ <media:content> hoặc <media:thumbnail>
  const mediaUrl = item.mediaContent?.url || item.mediaThumbnail?.url || item.enclosure?.url;

  if (mediaUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaUrl)) {
    return mediaUrl;
  }

  // 2️⃣ Thử tìm ảnh trong content hoặc description (dạng HTML)
  const html = item.contentEncoded || item.content || item.description || '';
  const imgMatch = html.match(/<img[^>]+src="([^">]+)"/i);
  if (imgMatch) return imgMatch[1];

  // 3️⃣ Nếu không có, trả về null
  return null;
}

/**
 * Fetch RSS feed từ URL, có caching và decode HTML entity
 */
const fetchRSS = async (url) => {
  try {
    const cachedData = cache.get(url);
    if (cachedData) return cachedData;

    const feed = await parser.parseURL(url);

    const items = feed.items.map((item) => ({
      title: he.decode(item.title?.trim() || ''),
      description: he.decode(item.contentSnippet || item.content || item.description || ''),
      link: item.link,
      pubDate: item.pubDate ? new Date(item.pubDate) : null,
      featuredImage: extractImage(item), // 👈 thêm phần hình ảnh
    }));

    cache.set(url, items);
    return items;
  } catch (error) {
    console.warn(`⚠️ Lỗi khi fetch RSS từ ${url}:`, error.message);
    return [];
  }
};

module.exports = { fetchRSS };
