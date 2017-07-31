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
    notification.find({},function(err,result){
        if(err)
            res.send({message:err});
        else{
            var Result = [];
            for(var i=0;i<result.length;i++){
                if(result[i].date.getTime() >= new Date().getTime()){
                    var msg = {
                        description: result[i].description,
                        date : convertToString(result[i].date)
                    };
                    Result.push(msg);
                }
            }
        }
        res.send({message:'Ok',Result:Result});
    })
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

function convertToString(date){
    var hours = date.getHours();
    if( hours < 10)
        hours = 0 +''+hours;
    var min = date.getMinutes();
    if( min < 10)
        min = 0 +''+min;
    var String1 = hours + ':' + min;
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var String2 = day+'/'+month +'/'+year;
    return  String2  +' '+ String1 ;
}
