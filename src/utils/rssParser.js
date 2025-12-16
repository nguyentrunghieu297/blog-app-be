const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const sanitizeHtml = require('sanitize-html');
const he = require('he');

const parser = new Parser({
  defaultRSS: 2.0,
  timeout: 10000, // ✅ Giảm xuống 8s - RSS feeds thường load nhanh
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
    'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
  },
});

// ✅ Cache với TTL dài hơn
const cache = new NodeCache({
  stdTTL: 3600, // 60 phút
  checkperiod: 300,
  useClones: false,
  maxKeys: 200,
});

// ✅ Thêm stale cache - serve old data ngay, fetch mới ở background
const staleCache = new NodeCache({
  stdTTL: 7200, // 2 giờ - giữ data cũ lâu hơn
  checkperiod: 600,
  useClones: false,
});

const pendingRequests = new Map();

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
  decoded = he.decode(decoded);
  return decoded.replace(/&apos;/g, "'");
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

// ✅ Optimized processing - giảm operations
function processItem(item) {
  const rawDesc = item.contentSnippet || item.description || '';

  return {
    title: decodeText(item.title?.trim() || '').substring(0, 200),
    description: cleanDescription(he.decode(rawDesc)),
    link: item.link,
    pubDate: parsePubDate(item.pubDate),
    featuredImage: extractImage(item),
  };
}

// ✅ Fetch với stale-while-revalidate pattern
const fetchRSS = async (url, retries = 1) => {
  try {
    // Check fresh cache
    const cachedData = cache.get(url);
    if (cachedData) {
      console.log(`✅ Fresh cache hit: ${url}`);
      return cachedData;
    }

    // Check stale cache - serve ngay, fetch background
    const staleData = staleCache.get(url);
    if (staleData) {
      console.log(`⚡ Stale cache hit: ${url} (revalidating...)`);

      // Background revalidation
      fetchRSSActual(url, retries).catch((err) =>
        console.warn(`Background revalidation failed for ${url}:`, err.message)
      );

      return staleData;
    }

    // No cache - fetch mới
    return await fetchRSSActual(url, retries);
  } catch (error) {
    console.error(`❌ Failed to fetch ${url}:`, error.message);

    // Fallback to stale cache nếu có
    const staleData = staleCache.get(url);
    if (staleData) {
      console.log(`🔄 Using stale cache as fallback for ${url}`);
      return staleData;
    }

    return [];
  }
};

// ✅ Actual fetch logic
const fetchRSSActual = async (url, retries = 1) => {
  if (pendingRequests.has(url)) {
    return await pendingRequests.get(url);
  }

  const fetchPromise = (async () => {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 Fetching ${url} (${attempt + 1}/${retries + 1})`);

        // ✅ Race với timeout ngắn hơn (10s)
        const fetchWithTimeout = Promise.race([
          parser.parseURL(url),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000)),
        ]);

        const feed = await fetchWithTimeout;

        // ✅ Process song song với Promise.all
        const recentItems = feed.items.slice(0, 30);
        const items = recentItems.map(processItem);

        // Save to both caches
        cache.set(url, items);
        staleCache.set(url, items);

        console.log(`✅ Fetched ${url}: ${items.length} items`);
        return items;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt + 1} failed for ${url}: ${error.message}`);

        // ✅ Exponential backoff thay vì linear
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 3000); // Max 3s
          await new Promise((resolve) => setTimeout(resolve, delay));
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
};

// ✅ Batch fetch với concurrency cao hơn và timeout ngắn
const fetchRSSBatch = async (urls, concurrency = 8) => {
  const results = [];
  const startTime = Date.now();

  console.log(`📊 Batch fetch: ${urls.length} URLs, concurrency: ${concurrency}`);

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);

    // ✅ Timeout 12s cho mỗi batch (giảm từ 25s)
    const batchPromise = Promise.allSettled(
      batch.map((url) =>
        Promise.race([
          fetchRSS(url),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Batch timeout')), 12000)),
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
      `📊 Batch ${Math.floor(i / concurrency) + 1}: ${successCount}/${batch.length} (${
        Date.now() - startTime
      }ms)`
    );

    // ✅ Giảm delay giữa batches
    if (i + concurrency < urls.length) {
      await new Promise((resolve) => setTimeout(resolve, 200)); // Giảm từ 500ms
    }
  }

  const totalSuccess = results.filter((r) => r.data.length > 0).length;
  console.log(`✅ Total: ${Date.now() - startTime}ms - Success: ${totalSuccess}/${urls.length}`);

  return results;
};

const getCacheStats = () => {
  return {
    fresh: cache.getStats(),
    stale: staleCache.getStats(),
  };
};

// ✅ Warm up cache - gọi trước để cache sẵn
const warmupCache = async (urls) => {
  console.log(`🔥 Warming up cache for ${urls.length} URLs...`);
  await fetchRSSBatch(urls, 10);
};

module.exports = {
  fetchRSS,
  fetchRSSBatch,
  getCacheStats,
  warmupCache,
};
