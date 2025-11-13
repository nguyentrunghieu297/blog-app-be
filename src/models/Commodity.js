const mongoose = require('mongoose');

const RegionSchema = new mongoose.Schema({
  region: String,
  price: Number,
  change: Number,
  raw: String,
});

const CommoditySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['coffee', 'pepper', 'cashew', 'rubber'], // cà phê, tiêu, điều, cao su
    required: true,
  },
  source: String,
  date: String, // YYYY-MM-DD
  scraped_at: Date,
  average: Number,
  regions: [RegionSchema],
});

module.exports = mongoose.model('Commodity', CommoditySchema);
