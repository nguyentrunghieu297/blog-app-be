const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const sanitizeHtml = require('sanitize-html');
const he = require('he');

const parser = new Parser({
  defaultRSS: 2.0,
  timeout: 20000, // ✅ Tăng lên 20s cho server nước ngoài
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
  // ✅ Thêm headers để tránh bị block
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
    'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
  },
});

// ✅ Tăng cache TTL lên 30 phút (RSS VN update chậm)
const cache = new NodeCache({
  stdTTL: 1800, // 30 phút
  checkperiod: 300,
  useClones: false,
  maxKeys: 200,
});

const pendingRequests = new Map();

const processedCache = new NodeCache({
  stdTTL: 600, // 10 phút
  checkperiod: 120,
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

function decodeText(text) {
  if (!text) return '';
  let decoded = he.decode(text);
  decoded = he.decode(decoded); // decode lần 2
  return decoded.replace(/&apos;/g, "'"); // fallback
}

function cleanDescription(desc) {
  if (!desc) return '';
  desc = desc.replace(/]]>/g, '');
  desc = sanitizeHtml(desc, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return desc.replace(/\s+/g, ' ').trim().substring(0, 300);
}

function parsePubDate(dateString) {
  if (!dateString) return new Date();
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) return new Date();
  return parsed;
}

// ✅ Thêm retry logic
const fetchRSS = async (url, retries = 2) => {
  try {
    const cachedData = cache.get(url);
    if (cachedData) {
      console.log(`✅ Cache hit: ${url}`);
      return cachedData;
    }

    if (pendingRequests.has(url)) {
      return await pendingRequests.get(url);
    }

    const fetchPromise = (async () => {
      let lastError;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          console.log(`🔄 Fetching ${url} (attempt ${attempt + 1}/${retries + 1})`);

          const feed = await parser.parseURL(url);

          const recentItems = feed.items.slice(0, 30);

          const items = recentItems.map((item) => {
            const rawDesc = item.contentSnippet || item.description || '';

            return {
              title: decodeText(item.title?.trim() || '').substring(0, 200),
              description: cleanDescription(he.decode(rawDesc)),
              link: item.link,
              pubDate: parsePubDate(item.pubDate),
              featuredImage: extractImage(item),
            };
          });

          cache.set(url, items);
          console.log(`✅ Successfully fetched ${url}: ${items.length} items`);
          return items;
        } catch (error) {
          lastError = error;
          console.warn(`⚠️ Attempt ${attempt + 1} failed for ${url}: ${error.message}`);

          if (attempt < retries) {
            // Đợi 1-2 giây trước khi retry
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
      }

      throw lastError;
    })();

    pendingRequests.set(url, fetchPromise);

    try {
      return await fetchPromise;
    } finally {
      pendingRequests.delete(url);
    }
  } catch (error) {
    pendingRequests.delete(url);
    console.error(`❌ Failed to fetch ${url} after ${retries + 1} attempts:`, error.message);
    return [];
  }
};

// ✅ Giảm concurrency xuống 5 cho kết nối từ server nước ngoài
const fetchRSSBatch = async (urls, concurrency = 5) => {
  const results = [];
  const startTime = Date.now();

  console.log(`📊 Starting batch fetch: ${urls.length} URLs, concurrency: ${concurrency}`);

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);

    // ✅ Timeout 25s cho mỗi request
    const batchPromise = Promise.allSettled(
      batch.map((url) =>
        Promise.race([
          fetchRSS(url),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout after 25s')), 25000)
          ),
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

    const successCount = batchResults.filter((r) => r.status === 'fulfilled').length;
    console.log(
      `📊 Batch ${Math.floor(i / concurrency) + 1}: ${successCount}/${batch.length} successful (${
        Date.now() - startTime
      }ms)`
    );

    // ✅ Thêm delay giữa các batch để tránh rate limit
    if (i + concurrency < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  const totalSuccess = results.filter((r) => r.data.length > 0).length;
  console.log(
    `✅ Total fetch time: ${Date.now() - startTime}ms - Success: ${totalSuccess}/${urls.length}`
  );

  return results;
};

const getCacheStats = () => {
  return {
    rss: cache.getStats(),
    processed: processedCache.getStats(),
  };
};

module.exports = { fetchRSS, fetchRSSBatch, processedCache, getCacheStats };
