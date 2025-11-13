const axios = require('axios');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const Commodity = require('../models/Commodity.js');

const SOURCES = {
  coffee: 'https://giacaphe.com/gia-ca-phe-noi-dia/',
  pepper: 'https://giatieu.com/',
  cashew: 'https://thitruongnongnghiep.vn/gia-hat-dieu/',
  rubber: 'https://giacaosu.com/',
};

async function scrapePage(type, url) {
  const { data: html } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AgriScraper/1.0)' },
  });

  const $ = cheerio.load(html);

  // ✅ Xác định ngày
  const dateMatch = $('h1, h2, h3, p')
    .text()
    .match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
  const dateISO = dateMatch
    ? dayjs(dateMatch[1], 'D/M/YYYY').format('YYYY-MM-DD')
    : dayjs().format('YYYY-MM-DD');

  // ✅ Cào bảng giá
  const regions = [];
  $('table tbody tr').each((_, el) => {
    const tds = $(el).find('td');
    if (tds.length >= 2) {
      const region = $(tds[0]).text().trim();
      const priceText = $(tds[1]).text().trim();
      const price = Number(priceText.replace(/[^\d]/g, ''));
      if (region && price) regions.push({ region, price, raw: priceText });
    }
  });

  // ✅ Tính giá trung bình
  const avg =
    regions.length > 0
      ? Math.round(regions.reduce((s, r) => s + r.price, 0) / regions.length)
      : null;

  const doc = {
    type,
    source: url,
    date: dateISO,
    scraped_at: new Date(),
    average: avg,
    regions,
  };

  await Commodity.updateOne({ type, date: dateISO }, { $set: doc }, { upsert: true });

  console.log(`✅ [${type}] scraped ${regions.length} regions on ${dateISO}`);
  return doc;
}

async function scrapeAllCommodities() {
  for (const [type, url] of Object.entries(SOURCES)) {
    try {
      await scrapePage(type, url);
    } catch (err) {
      console.error(`❌ Failed scraping ${type}:`, err.message);
    }
  }
}

module.exports = { scrapeAllCommodities, scrapePage };
