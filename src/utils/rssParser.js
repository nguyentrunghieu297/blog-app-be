const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const sanitizeHtml = require('sanitize-html');
const he = require('he');

const parser = new Parser({
  defaultRSS: 2.0,
  timeout: 15000, // ✅ Giảm từ 10s xuống 8s
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

// ✅ Tăng cache TTL lên 15 phút (RSS không thay đổi liên tục)
const cache = new NodeCache({
  stdTTL: 900, // 15 phút
  checkperiod: 180,
  useClones: false,
  maxKeys: 200, // ✅ Limit số keys trong cache
});

const pendingRequests = new Map();

// ✅ Thêm cache cho processed results
const processedCache = new NodeCache({
  stdTTL: 300, // 5 phút cho processed results
  checkperiod: 60,
  useClones: false,
});

function isImageUrl(url) {
  if (!url || typeof url !== 'string') return false;

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif'];

  const extensionPattern = new RegExp(`\\.(${imageExtensions.join('|')})($|\\?)`, 'i');
  if (extensionPattern.test(url)) return true;

  const vietnameseDomains = [
    'vnecdn\\.net',
    'vietnamnet\\.vn',
    'vgcloud\\.vn',
    'znews-photo',
    'kenh14cdn\\.com',
    'afamilycdn\\.com',
    'dantri\\.com\\.vn',
    'thanhnien\\.vn',
  ];

  const domainPattern = new RegExp(`(${vietnameseDomains.join('|')})`, 'i');
  return domainPattern.test(url);
}

function extractImage(item) {
  const mediaUrl = item.mediaContent?.url || item.mediaThumbnail?.url || item.enclosure?.url;
  if (mediaUrl && isImageUrl(mediaUrl)) return mediaUrl;

  const html = item.contentEncoded || item.content || item.description || '';

  // ✅ Chỉ dùng 2 patterns phổ biến nhất
  const imagePatterns = [
    /<img[^>]+src=["']?([^"'>\s]+)["']?/i,
    /<img[^>]+data-src=["']?([^"'>\s]+)["']?/i,
  ];

  for (const pattern of imagePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const imageUrl = match[1].trim();
      if (isImageUrl(imageUrl)) return imageUrl;
    }
  }

  return null;
}

function cleanDescription(desc) {
  if (!desc) return '';
  desc = desc.replace(/]]>/g, '');
  desc = sanitizeHtml(desc, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return desc.replace(/\s+/g, ' ').trim().substring(0, 300); // ✅ Limit 300 chars
}

function parsePubDate(dateString) {
  if (!dateString) return new Date();
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) return new Date();
  return parsed;
}

const fetchRSS = async (url) => {
  try {
    const cachedData = cache.get(url);
    if (cachedData) return cachedData;

    if (pendingRequests.has(url)) {
      return await pendingRequests.get(url);
    }

    const fetchPromise = (async () => {
      try {
        const feed = await parser.parseURL(url);

        // ✅ Chỉ lấy 30 items mới nhất từ mỗi feed
        const recentItems = feed.items.slice(0, 30);

        const items = recentItems.map((item) => {
          const rawDesc = item.contentSnippet || item.description || '';

          return {
            title: he.decode(item.title?.trim() || '').substring(0, 200), // ✅ Limit title
            description: cleanDescription(he.decode(rawDesc)),
            link: item.link,
            pubDate: parsePubDate(item.pubDate),
            featuredImage: extractImage(item),
          };
        });

        cache.set(url, items);
        return items;
      } finally {
        pendingRequests.delete(url);
      }
    })();

    pendingRequests.set(url, fetchPromise);
    return await fetchPromise;
  } catch (error) {
    pendingRequests.delete(url);
    console.warn(`⚠️ Failed to fetch ${url}`);
    return [];
  }
};

// ✅ Tăng concurrency lên 20 và thêm timeout
const fetchRSSBatch = async (urls, concurrency = 20) => {
  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);

    // ✅ Thêm timeout cho mỗi batch
    const batchPromise = Promise.allSettled(
      batch.map((url) =>
        Promise.race([
          fetchRSS(url),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000)),
        ])
      )
    );

    const batchResults = await batchPromise;

    results.push(
      ...batchResults.map((result, idx) => ({
        url: batch[idx],
        data: result.status === 'fulfilled' ? result.value : [],
        error: result.status === 'rejected' ? result.reason : null,
      }))
    );

    // ✅ Log progress
    if (i % 20 === 0) {
      console.log(
        `📊 Processed ${i + batch.length}/${urls.length} feeds (${Date.now() - startTime}ms)`
      );
    }
  }

  console.log(`✅ Total fetch time: ${Date.now() - startTime}ms`);
  return results;
};

// ✅ Export cache stats cho monitoring
const getCacheStats = () => {
  return {
    rss: cache.getStats(),
    processed: processedCache.getStats(),
  };
};

module.exports = { fetchRSS, fetchRSSBatch, processedCache, getCacheStats };
