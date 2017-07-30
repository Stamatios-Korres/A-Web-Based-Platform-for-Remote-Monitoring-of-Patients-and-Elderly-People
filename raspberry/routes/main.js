/**
 * Created by timos on 24/7/2017.
 */
var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */

router.get('/', function (req, res, next) {
    res.sendFile('MainPage.html', {root: path.join(__dirname, '../public/OpenHealth/MainPage')})
});

module.exports = router;
