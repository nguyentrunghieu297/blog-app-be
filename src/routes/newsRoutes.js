const express = require('express');
const { getAllNews } = require('../controllers/newsController.js');
const { getAllSources } = require('../controllers/sourcesController.js');

const router = express.Router();

router.get('/', getAllNews);
router.get('/sources', getAllSources);

module.exports = router;
