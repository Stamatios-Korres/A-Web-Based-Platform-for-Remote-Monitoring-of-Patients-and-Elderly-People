var express = require('express');
var ble = require('../Sensor/Sensor');
var path = require('path');


var router = express.Router();

router.get('/',function(req,res,next){
    res.sendFile('Biosignals.html', {root: path.join(__dirname, '../public/OpenHealth/Biosignals')})
});
/* GET bio listing. */
router.get('/data', function (req, res, next) {
    console.log('data is found');
    res.send(ble.getData());
});

module.exports = router;