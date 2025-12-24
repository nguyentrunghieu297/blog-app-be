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

function interleaveBySource(sourceGroups, targetCount) {
  const sources = Array.from(sourceGroups.keys());
  if (sources.length === 0) return [];

  const result = [];
  const indices = new Map();

  for (const sourceName of sources) {
    const items = sourceGroups.get(sourceName);
    items.sort((a, b) => b.pubDate?.getTime() - a.pubDate?.getTime());
    indices.set(sourceName, 0);
  }

  const minItemsPerSource = Math.max(1, Math.floor(targetCount / sources.length));

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
    if (sourceIdx > sources.length * 100) break;
  }

  return result;
}

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

    // 🚀 OPTIMIZATION 1: Pre-filter sources nếu user chỉ request 1 category
    // → Giảm số feeds phải fetch
    if (categoryKey && categoryKey !== 'tong-quan') {
      selectedSources = selectedSources
        .map((source) => ({
          ...source,
          categories: source.categories.filter((cat) =>
            isCategoryMatch(cat.name, targetCategories)
          ),
        }))
        .filter((source) => source.categories.length > 0);

      console.log(
        `🎯 Category filter: ${categoryKey} → ${
          selectedSources.length
        } sources, ${selectedSources.reduce((sum, s) => sum + s.categories.length, 0)} feeds`
      );
    }

    const urlsToFetch = [];
    const urlMetadata = new Map();

    for (const source of selectedSources) {
      for (const category of source.categories) {
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

    // 🚀 OPTIMIZATION 2: Tăng concurrency lên 15 (từ 12)
    // Với 18 feeds → chỉ cần 2 batches thay vì 3
    const results = await fetchRSSBatch(urlsToFetch, 15);

    const sourceGroups = processResults(results, urlMetadata);

    console.log(`📊 Sources collected:`);
    sourceGroups.forEach((items, sourceName) => {
      console.log(`  ${sourceName}: ${items.length} items`);
    });

    // 🚀 OPTIMIZATION 3: Giảm buffer từ 1.5x xuống 1.2x
    // → Sort ít items hơn
    const interleavedNews = interleaveBySource(sourceGroups, Math.ceil(parsedLimit * 1.2));

    const sorted = interleavedNews.sort(
      (a, b) => (b.pubDate?.getTime() || 0) - (a.pubDate?.getTime() || 0)
    );

    const finalData = sorted.slice(0, parsedLimit);

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
