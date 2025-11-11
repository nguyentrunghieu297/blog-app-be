const { rssSources } = require('../constants/rssSources');

const getAllSources = (req, res) => {
  const sources = rssSources.map((s) => ({
    name: s.name,
    domain: s.domain,
    icon: s.icon,
    categories: s.categories.map((c) => c.name),
  }));

  res.json({
    success: true,
    count: sources.length,
    data: sources,
  });
};

module.exports = { getAllSources };
