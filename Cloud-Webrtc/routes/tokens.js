/**
 * Created by timoskorres on 1/5/2017.
 */

var express = require('express');
var router = express.Router();
var passport = require('passport');

router.post('/', function(req, res, next) {
    console.log(req.body);
    passport.authenticate('bearer',{session:false});
    next();},
    function(req,res,next) {
        res.send({message:'congratz , you have accesed sensitive data'});
        //res.render('index', { title: 'Express' });
    });

module.exports = router;