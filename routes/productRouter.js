'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');
const cardController = require('../controllers/cardController');

router.get('/', controller.getData, controller.show);
router.get('/cart', cardController.show);
router.get('/:id', controller.getData, controller.showDetails);

router.post('/cart', cardController.add);
router.put('/cart', cardController.update);
router.delete('/cart', cardController.remove);
router.delete('/cart/all', cardController.clear);
module.exports = router;