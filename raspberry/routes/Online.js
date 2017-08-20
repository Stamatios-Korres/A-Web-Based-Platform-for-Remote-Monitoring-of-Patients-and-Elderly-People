var express = require('express');
var router = express.Router();
const uuidv1 = require('uuid/v1');
var user = require('../models/OnlineUserModel');
var request = require('request');

router.get('/',function(req,res,next){
    user.find(function(err,result){
        if(err)
            res.send({message:err});
        else if(result.length===0)
            res.send({message:'No username has been set'});
        else{
            console.log(result);
            res.send({message:'Ok',user:result[0]});
        }
    })
});

router.post('/',function(req,res,next){    // res = response
   var Credential = new user({
    Username:req.body.username,
    Password:req.body.password,
    WayOfLogin:req.body.way
   });
    Credential.save(function(err,result){
      if(err)
          res.send({message:err});
      else
          res.send({message:'Ok'});
    })
});

router.put('/',function(req,res,next){
        var area = req.body.change;
        console.log(req.body);
        var myself = req.body.myself;
        var newValue = req.body[area];
        switch (area){
            case 'WayOfLogin':
                user.update({Username:myself},{WayOfLogin:newValue},function(err,result){
                    if(err){
                        console.log(err);
                        res.send({message:err})
                    }
                    else {
                        console.log(result);
                        res.send({message:'Ok'});
                    }
                });
                break;
            case 'Password':
                user.update({Username:myself},{Password:newValue},function(err,result){
                   if(err){
                       console.log(err);
                       res.send({message:err});
                   }
                   else{
                       console.log(result);
                       res.send({message:'Ok'});
                   }
                });
                break;
        }

});

module.exports = router;