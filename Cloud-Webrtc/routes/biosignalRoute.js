var express = require('express');
var router = express.Router();
var user = require('../models/user');
var passport = require('passport');
var relationship = require('../models/friends');

router.get('/', passport.authenticate('bearer', {session: false}),function (req, res, next) {
    var target =req.query.target;
    var source =req.query.sender;
    //(1) Check Users are friends
    relationship.findOne({user:source,friends: {$in: [target]}},function(err,result){
        if(err) {
            console.log(err);
            res.send({message: err});
        }
        else if(!result){
            console.log('No result has been returned');
            res.send({message:"You are not currently friends"})
        }
        else {  // They are friends you can precceed && Check Target is a Raspberry User
            user.findOne({username:target},function(err,result){
                if(err)
                    res.send({message: err});
                else if(!result)
                    console.log('That is wiered');
                else{
                    if(result.category === 'RaspberryUser')
                        res.send({message:"Ok"});
                    else
                        res.send({message:'Not availabe Service'})
                }
            });
        }
    })
});


module.exports = router;