/**
 * Created by timoskorres on 1/5/2017.
 */

var express = require('express');
var router = express.Router();
var user = require('../models/user');
var relationship = require('../models/friends');
var getToken = require('../controllers/oauth2orize').token;
/* GET home page. */


router.post('/', function (req, res, next) {
    console.log('Successfully received subscribe');
        var newUser = new user(
            {
                username: req.body.username,
                password: req.body.password
            });
        var Relationship = new relationship({
            user: req.body.username
        });
        newUser.save(function (err) {
            if (err) {
                res.send(err);
            }
            else
                {
                    Relationship.save(function (err, result) {
                        if (err) {
                            res.send(err);
                            return;
                        }
                        next();
                    })
                }
            });
        console.log('Ready to create Token ');
        }
    ,getToken);


module.exports = router;
