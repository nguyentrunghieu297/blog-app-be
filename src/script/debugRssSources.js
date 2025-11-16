/**
 * Script để debug và kiểm tra RSS sources
 * Chạy: node debug-rss-sources.js
 */

const { rssSources } = require('../constants/rssSources.js');
const { fetchRSS } = require('../utils/rssParser.js');

async function debugRSSSources() {
  console.log('🔍 Checking RSS Sources Configuration...\n');

  // 1. Kiểm tra số lượng sources
  console.log(`📊 Total sources: ${rssSources.length}`);
  console.log(`Sources: ${rssSources.map((s) => s.name).join(', ')}\n`);

  // 2. Kiểm tra categories per source
  rssSources.forEach((source) => {
    console.log(`\n📰 ${source.name}:`);
    console.log(`   Categories: ${source.categories.length}`);
    source.categories.forEach((cat) => {
      console.log(`   - ${cat.name}: ${cat.url}`);
    });
  });

  // 3. Test fetch từng source
  console.log('\n\n🧪 Testing RSS Fetching...\n');

  const results = [];

  for (const source of rssSources) {
    for (const category of source.categories) {
      console.log(`Fetching: ${source.name} - ${category.name}...`);

      try {
        const startTime = Date.now();
        const items = await fetchRSS(category.url);
        const duration = Date.now() - startTime;

        const result = {
          source: source.name,
          category: category.name,
          url: category.url,
          itemCount: items.length,
          duration: `${duration}ms`,
          success: true,
          firstItem: items[0]
            ? {
                title: items[0].title?.substring(0, 50) + '...',
                hasImage: !!items[0].featuredImage,
              }
            : null,
        };

        results.push(result);
        console.log(`  ✅ ${items.length} items (${duration}ms)`);
      } catch (error) {
        const result = {
          source: source.name,
          category: category.name,
          url: category.url,
          success: false,
          error: error.message,
        };

        results.push(result);
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
  }

  // 4. Summary
  console.log('\n\n📊 SUMMARY:\n');

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  console.log(`Total feeds: ${results.length}`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);

  if (failCount > 0) {
    console.log('\n❌ Failed Feeds:');
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.source} / ${r.category}`);
        console.log(`    URL: ${r.url}`);
        console.log(`    Error: ${r.error}\n`);
      });
  }

  // 5. Items per source
  console.log('\n📈 Items per Source:');
  const sourceStats = {};
  results.forEach((r) => {
    if (r.success) {
      if (!sourceStats[r.source]) {
        sourceStats[r.source] = { count: 0, items: 0 };
      }
      sourceStats[r.source].count++;
      sourceStats[r.source].items += r.itemCount;
    }
  });

  Object.entries(sourceStats).forEach(([source, stats]) => {
    console.log(`  ${source}: ${stats.items} items (${stats.count} feeds)`);
  });

  // 6. Export results
  const fs = require('fs');
  fs.writeFileSync('rss-debug-results.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Results saved to: rss-debug-results.json');
}

// Run the debug
debugRSSSources().catch(console.error);
