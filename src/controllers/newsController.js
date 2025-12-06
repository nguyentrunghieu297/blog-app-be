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

// ✅ Optimized interleave - giảm operations
function interleaveBySource(sourceGroups, targetCount) {
  const sources = Array.from(sourceGroups.keys());
  if (sources.length === 0) return [];

  const result = [];
  const indices = new Map();

  // Pre-sort và init indices
  for (const sourceName of sources) {
    const items = sourceGroups.get(sourceName);
    items.sort((a, b) => b.pubDate?.getTime() - a.pubDate?.getTime());
    indices.set(sourceName, 0);
  }

  const minItemsPerSource = Math.max(1, Math.floor(targetCount / sources.length));

  // Phase 1: Round-robin minimum
  for (let i = 0; i < minItemsPerSource; i++) {
    for (const sourceName of sources) {
      if (result.length >= targetCount) break;

      const items = sourceGroups.get(sourceName);
      const idx = indices.get(sourceName);

      if (idx < items.length) {
        result.push(items[idx]);
        indices.set(sourceName, idx + 1);
      }
    }
  }

  // Phase 2: Fill remaining
  let sourceIdx = 0;
  while (result.length < targetCount) {
    const sourceName = sources[sourceIdx % sources.length];
    const items = sourceGroups.get(sourceName);
    const idx = indices.get(sourceName);

    if (idx < items.length) {
      result.push(items[idx]);
      indices.set(sourceName, idx + 1);
    }

    sourceIdx++;

    // Safety break nếu không còn items
    if (sourceIdx > sources.length * 100) break;
  }

  return result;
}

// ✅ Process results song song
function processResults(results, urlMetadata) {
  const sourceGroups = new Map();

  for (const result of results) {
    if (result.error || !result.data?.length) continue;

    const metadata = urlMetadata.get(result.url);
    if (!metadata) continue;

    const sourceName = metadata.sourceName;

    if (!sourceGroups.has(sourceName)) {
      sourceGroups.set(sourceName, []);
    }

    // ✅ Push trực tiếp thay vì loop
    const items = result.data.map((item) => ({
      ...item,
      sourceName: metadata.sourceName,
      sourceIcon: metadata.sourceIcon,
      domain: metadata.domain,
      category: metadata.categoryName,
    }));

    sourceGroups.get(sourceName).push(...items);
  }

  return sourceGroups;
}

const getAllNews = async (req, res) => {
  try {
    const { source: sourceQuery, category: categoryKey, limit = 30 } = req.query;
    const parsedLimit = Math.min(Math.max(1, parseInt(limit) || 30), 100);

    let selectedSources = rssSources;

    if (sourceQuery) {
      selectedSources = rssSources.filter(
        (s) => s.name.toLowerCase() === sourceQuery.toLowerCase()
      );
    }

    const targetCategories = categoryKey ? categoryMapping[categoryKey] : null;

    // ✅ Thu thập URLs - optimize loop
    const urlsToFetch = [];
    const urlMetadata = new Map();

    for (const source of selectedSources) {
      const categories = source.categories || [];

      for (const category of categories) {
        // Skip early nếu không match category
        if (targetCategories && !isCategoryMatch(category.name, targetCategories)) {
          continue;
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

    // ✅ Fetch với concurrency cao hơn (từ 10 lên 12)
    const results = await fetchRSSBatch(urlsToFetch, 12);

    // ✅ Process kết quả song song
    const sourceGroups = processResults(results, urlMetadata);

    // Log distribution
    console.log(`📊 Sources collected:`);
    sourceGroups.forEach((items, sourceName) => {
      console.log(`  ${sourceName}: ${items.length} items`);
    });

    // ✅ Interleave với buffer lớn hơn để có nhiều lựa chọn sort
    const interleavedNews = interleaveBySource(sourceGroups, parsedLimit * 1.5);

    // ✅ Sort final - sử dụng Intl.Collator nếu cần
    const sorted = interleavedNews.sort(
      (a, b) => (b.pubDate?.getTime() || 0) - (a.pubDate?.getTime() || 0)
    );

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
