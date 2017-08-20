var express = require('express');
var router = express.Router();
var user = require('../models/user');
var passport = require('passport');


router.put('/', passport.authenticate('bearer', {session: false}), function (req, res, next) {
    var username = req.body.username;
    var type = req.body.change;
    switch (type) {
        case 'Password':
            var OldPassword = req.body[type];
            var NewPassword = req.body.NewPassword;
            user.findOne({username: username}, function (err, user_found) {
                if (err) {
                    console.log(err);
                    res.send({message: err});
                }
                else if (user_found) {
                    user_found.verifyPassword(OldPassword, function (err, isMatch) {
                        if (isMatch) {
                            user.update({
                                query:{
                                    username: username
                                },
                                update:{
                                    password: NewPassword
                                }
                            },function (err, result) {
                                if (err) {
                                    console.log(err);
                                    res.send({message: err});
                                }
                                else {
                                    res.send({
                                        message: 'Ok'
                                    })
                                }
                            })
                        }                 //Passwords match

                    })
                }
            });
            break;
    }
});


module.exports = router;