// Home Controller
const getHome = (req, res) => {
  res.json({
    message: 'Chào mừng đến với API Express.js + MongoDB!',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      about: '/about',
    },
    timestamp: new Date().toISOString(),
  });
};

const getAbout = (req, res) => {
  res.json({
    message: 'Đây là API được xây dựng với Express.js và MongoDB',
    version: '1.0.0',
    author: 'Your Name',
    technologies: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose'],
    features: ['RESTful API', 'MongoDB Integration', 'Error Handling', 'Structured Architecture'],
  });
};

module.exports = {
  getHome,
  getAbout,
};
