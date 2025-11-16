const { rssSources } = require('../constants/rssSources');
const { fetchRSSBatch } = require('../utils/rssParser.js');
const { categoryMapping, frontendCategories } = require('../constants/categoryMapping');

function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function isCategoryMatch(categoryName, targetCategories) {
  const normalizedCategory = normalizeString(categoryName);
  return targetCategories.some((target) => {
    const normalizedTarget = normalizeString(target);
    return (
      normalizedCategory === normalizedTarget ||
      normalizedCategory.includes(normalizedTarget) ||
      normalizedTarget.includes(normalizedCategory)
    );
  });
}

/**
 * ✅ Interleave items từ nhiều nguồn để cân bằng
 * Thuật toán: Lấy luân phiên từng item từ mỗi nguồn, đảm bảo đa dạng
 */
function interleaveBySource(sourceGroups, targetCount) {
  const sources = Array.from(sourceGroups.keys());
  const result = [];

  // Sort items trong mỗi nguồn theo date
  sources.forEach((sourceName) => {
    const items = sourceGroups.get(sourceName);
    items.sort((a, b) => {
      const dateA = a.pubDate ? a.pubDate.getTime() : 0;
      const dateB = b.pubDate ? b.pubDate.getTime() : 0;
      return dateB - dateA;
    });
  });

  // Tính số items tối thiểu mỗi nguồn (đảm bảo mỗi nguồn có ít nhất 1-2 bài)
  const minItemsPerSource = Math.max(1, Math.floor(targetCount / sources.length));
  const indices = new Map(sources.map((s) => [s, 0]));

  // Phase 1: Đảm bảo mỗi nguồn có ít nhất minItemsPerSource items
  for (const sourceName of sources) {
    const items = sourceGroups.get(sourceName);
    const count = Math.min(minItemsPerSource, items.length);

    for (let i = 0; i < count; i++) {
      result.push(items[i]);
      indices.set(sourceName, i + 1);
    }
  }

  // Phase 2: Round-robin cho items còn lại
  let round = 0;
  const maxRounds = targetCount * 2;

  while (result.length < targetCount && round < maxRounds) {
    let addedInRound = false;

    for (const sourceName of sources) {
      if (result.length >= targetCount) break;

      const items = sourceGroups.get(sourceName);
      const currentIdx = indices.get(sourceName);

      if (currentIdx < items.length) {
        result.push(items[currentIdx]);
        indices.set(sourceName, currentIdx + 1);
        addedInRound = true;
      }
    }

    if (!addedInRound) break; // Không còn items nào
    round++;
  }

  return result;
}

const getAllNews = async (req, res) => {
  try {
    const { source: sourceQuery, category: categoryKey, limit = 30 } = req.query;
    let selectedSources = rssSources;

    if (sourceQuery) {
      selectedSources = rssSources.filter(
        (s) => s.name.toLowerCase() === sourceQuery.toLowerCase()
      );
    }

    // ✅ Validate limit
    const parsedLimit = Math.min(Math.max(1, parseInt(limit) || 30), 100);

    const targetCategories = categoryKey ? categoryMapping[categoryKey] : null;

    // Thu thập URLs và metadata
    const urlsToFetch = [];
    const urlMetadata = new Map();

    for (const source of selectedSources) {
      const categories = source.categories || [];

      for (const category of categories) {
        if (targetCategories !== null && targetCategories !== undefined) {
          if (!isCategoryMatch(category.name, targetCategories)) {
            continue;
          }
        }

        urlsToFetch.push(category.url);
        urlMetadata.set(category.url, {
          sourceName: source.name,
          sourceIcon: source.icon,
          domain: source.domain,
          categoryName: category.name,
        });
      }
    }

    console.log(`🔄 Fetching ${urlsToFetch.length} RSS feeds...`);

    // Fetch parallel với concurrency limit
    const results = await fetchRSSBatch(urlsToFetch, 10);

    // ✅ Group items theo SOURCE (không phải URL)
    const sourceGroups = new Map();

    for (const result of results) {
      if (result.error) {
        console.warn(`⚠️ Failed to fetch ${result.url}:`, result.error.message);
        continue;
      }

      const metadata = urlMetadata.get(result.url);
      if (!metadata) continue;

      const sourceName = metadata.sourceName;

      // Khởi tạo array cho source nếu chưa có
      if (!sourceGroups.has(sourceName)) {
        sourceGroups.set(sourceName, []);
      }

      // Thêm items vào source group
      for (const item of result.data) {
        sourceGroups.get(sourceName).push({
          title: item.title,
          description: item.description || '',
          link: item.link,
          pubDate: item.pubDate,
          featuredImage: item.featuredImage || null,
          sourceName: metadata.sourceName,
          sourceIcon: metadata.sourceIcon,
          domain: metadata.domain,
          category: metadata.categoryName,
        });
      }
    }

    // Log distribution
    console.log(`📊 Sources collected:`);
    sourceGroups.forEach((items, sourceName) => {
      console.log(`  ${sourceName}: ${items.length} items`);
    });

    // ✅ Interleave để cân bằng nguồn
    const interleavedNews = interleaveBySource(sourceGroups, parsedLimit * 2);

    // Sort final result by date (giữ lại thứ tự thời gian tương đối)
    const sorted = interleavedNews.sort((a, b) => {
      const dateA = a.pubDate ? a.pubDate.getTime() : 0;
      const dateB = b.pubDate ? b.pubDate.getTime() : 0;
      return dateB - dateA;
    });

    const finalData = sorted.slice(0, parsedLimit);

    // Log final distribution
    const finalSourceCount = {};
    finalData.forEach((item) => {
      finalSourceCount[item.sourceName] = (finalSourceCount[item.sourceName] || 0) + 1;
    });

    console.log(`✅ Final distribution (${finalData.length} items):`);
    Object.entries(finalSourceCount).forEach(([source, count]) => {
      console.log(`  ${source}: ${count} items`);
    });

    res.json({
      success: true,
      count: finalData.length,
      total: interleavedNews.length,
      sources: Array.from(sourceGroups.keys()),
      distribution: finalSourceCount,
      data: finalData,
    });
  } catch (error) {
    console.error('❌ Lỗi khi tải RSS:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải RSS',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    res.json({
      success: true,
      data: frontendCategories,
    });
  } catch (error) {
    console.error('❌ Lỗi khi lấy categories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy categories',
    });
  }
};

module.exports = {
  getAllNews,
  getCategories,
};
