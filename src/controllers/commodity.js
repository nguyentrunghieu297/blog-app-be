const Commodity = require('../models/Commodity.js');

exports.getAll = async (req, res) => {
  const { type } = req.query;
  const filter = type ? { type } : {};
  const data = await Commodity.find(filter).sort({ date: -1 }).limit(10);
  res.json(data);
};

exports.getByRegion = async (req, res) => {
  const { type, region } = req.params;
  const latest = await Commodity.findOne({ type }).sort({ date: -1 });
  if (!latest) return res.status(404).json({ message: 'No data' });

  const regionData = latest.regions.find((r) => r.region.toLowerCase() === region.toLowerCase());
  if (!regionData) return res.status(404).json({ message: `Region ${region} not found` });

  res.json({ date: latest.date, ...regionData });
};
