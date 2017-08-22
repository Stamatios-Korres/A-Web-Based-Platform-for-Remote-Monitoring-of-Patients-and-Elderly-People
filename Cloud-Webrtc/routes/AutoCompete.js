var express = require('express');
var router = express.Router();
var user = require('../models/user');
var passport = require('passport');

router.post('/',function(req,res,next){
    var subsrting = req.body.input;
        user.find({},function(err,result){
            if(err)
                res.send({message:err});
            else{
                var Result = [];
                for(var i=0;i<result.length;i++){
                        if(result[i].username.indexOf(subsrting)!==-1)
                            Result.push(result[i].username);
                }
                res.send({message:'Ok',Result:Result});
            }
    })

});

module.exports = router;