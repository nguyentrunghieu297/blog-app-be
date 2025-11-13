const express = require('express');
const { getAllNews } = require('../controllers/newsController.js');
const { getAllSources } = require('../controllers/sourcesController.js');
const { getCategories } = require('../controllers/newsController.js');

const router = express.Router();

router.get('/', getAllNews);
router.get('/sources', getAllSources);
router.get('/categories', getCategories);

module.exports = router;
