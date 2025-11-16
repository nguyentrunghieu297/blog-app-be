const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const sanitizeHtml = require('sanitize-html');
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
  // ✅ Fix: Hỗ trợ cả single quote và không có quote
  const imgMatch = html.match(/<img[^>]+src=["']?([^"'>]+)["']?/i);
  if (imgMatch && imgMatch[1]) {
    // Validate URL có phải là ảnh không
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(imgMatch[1])) {
      return imgMatch[1];
    }
  }

  // 3️⃣ Nếu không có, trả về null
  return null;
}

/**
 * Làm sạch description bằng cách loại bỏ HTML và các phần thừa
 */
function cleanDescription(desc) {
  if (!desc) return '';

  // 1) Xóa phần đóng CDATA dư (]]>)
  desc = desc.replace(/]]>/g, '');

  // 2) Loại toàn bộ HTML, giữ text thuần
  desc = sanitizeHtml(desc, {
    allowedTags: [],
    allowedAttributes: {},
  });

  // 3) Xóa khoảng trắng thừa và trim
  desc = desc.replace(/\s+/g, ' ').trim();

  return desc;
}

/**
 * Validate và parse pubDate an toàn
 */
function parsePubDate(dateString) {
  if (!dateString) return new Date(); // Fallback về hiện tại
  const parsed = new Date(dateString);
  // Kiểm tra xem date có hợp lệ không
  if (isNaN(parsed.getTime())) {
    console.warn(`⚠️ Invalid date format: ${dateString}`);
    return new Date(); // Fallback về hiện tại
  }
  return parsed;
}

/**
 * Fetch RSS feed từ URL, có caching và decode HTML entity
 */
const fetchRSS = async (url) => {
  try {
    const cachedData = cache.get(url);
    if (cachedData) return cachedData;

    const feed = await parser.parseURL(url);

    const items = feed.items.map((item) => {
      const rawDesc =
        item.contentSnippet || item.contentEncoded || item.content || item.description || '';

      return {
        title: he.decode(item.title?.trim() || ''),
        // ✅ Fix: Gọi cleanDescription để xóa ]]> và HTML
        description: cleanDescription(he.decode(rawDesc)),
        link: item.link,
        // ✅ Fix: Validate pubDate trước khi parse
        pubDate: parsePubDate(item.pubDate),
        featuredImage: extractImage(item),
      };
    });

    cache.set(url, items);
    return items;
  } catch (error) {
    console.warn(`⚠️ Lỗi khi parser RSS từ ${url}:`, error.message);
    return [];
  }
};

module.exports = { fetchRSS };
