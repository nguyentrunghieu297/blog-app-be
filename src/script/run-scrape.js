// scripts/run-scrape.js
require('dotenv').config();
const mongoose = require('mongoose');
const { scrapeAllCommodities } = require('./scrapeCommodity');

(async () => {
  try {
    console.log('🚜 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🌾 Starting manual commodity scraping...');
    await scrapeAllCommodities();

    console.log('✅ Done scraping all commodities.');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
