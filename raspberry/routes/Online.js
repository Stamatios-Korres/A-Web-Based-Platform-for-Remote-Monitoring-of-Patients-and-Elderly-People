var express = require('express');
var router = express.Router();
const uuidv1 = require('uuid/v1');
var user = require('../models/OnlineUserModel');
var request = require('request');
var http = require('http');
var querystring = require('querystring');


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
    Password:req.body.password
   });
    Credential.save(function(err,result){
      if(err)
          res.send({message:err});
      else
          res.send({message:'Ok'});
    })
});
module.exports = router;