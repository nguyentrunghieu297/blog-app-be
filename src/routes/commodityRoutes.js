const express = require('express');
const commodityCtrl = require('../controllers/commodity.js');

const router = express.Router();

router.get('/', commodityCtrl.getAll);
router.get('/:type/:region', commodityCtrl.getByRegion);

module.exports = router;
