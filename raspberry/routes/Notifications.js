var express = require('express');
var router = express.Router();
const uuidv1 = require('uuid/v1');
var notification = require('../models/NotificationModel');

router.post('/',function(req,res,next){
   console.log(req.body);
   var Date = converttoDate(req.body.time,req.body.date);
   var newNotification = new notification({
       description: req.body.description,
       date: Date,
       uniqueId:uuidv1()
   });
   newNotification.save(function(err,result){
       if(err)
           res.send({message:"Ok"});
       else
           res.send({message:'Ok'})
   })
});
router.get('/',function(req,res,next){
    res.send({message:'Ok'});
});

module.exports = router;

function converttoDate(time,date){
    time = new Date(time);
    date = new Date(date);
    var hours = time.getHours();
    var min = time.getMinutes();
    var sec = time.getSeconds();
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    console.log(hours+'/'+min+'/'+sec);
    console.log(year+'/'+month+'/'+day);
    return new Date(year, month, day, hours, min, sec, 0);
}
