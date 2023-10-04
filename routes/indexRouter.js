'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/indexController');

// routes
router.get('/createTables', (req, res) => {
    let model = require('./models');

    model.sequelize.sync().then(() => {
        res.send('Tables created!');
    })
}  );
router.get('/', controller.showHomepage);

router.get('/:page', controller.showPage);

module.exports = router;