var express = require('express');
var router = express.Router();
const uuidv1 = require('uuid/v1');
var notification = require('../models/NotificationModel');

router.post('/',function(req,res,next){
   console.log(req.body);
   var date = converttoDate(req.body.time,req.body.date);
   var uuid = uuidv1();
   var newNotification = new notification({
       description: req.body.description,
       date: date,
       uniqueId:uuid,
       show:'yes',
       remindFlag: false,
       remindDate: new Date()
   });
   newNotification.save(function(err,result){
       if(err)
           res.send({message:err});
       else {
           res.send({message: 'Ok', uniqueId: uuid, date: convertToString(date)});
       }
   })
});
router.get('/',function(req,res,next){
    notification.find({},function(err,result){
        if(err)
            res.send({message:err});
        else{

            var Result = [];
            for(var i=0;i<result.length;i++) {
                if (result[i].date.getTime() >= new Date().getTime() && result[i].show === 'yes') {
                    var msg = {
                        description: result[i].description,
                        date: convertToString(result[i].date),
                        uniqueId: result[i].uniqueId,
                        remindDate:null,
                        reminder: false
                    };
                    Result.push(msg);
                }
                else if (result[i].remindDate && result[i].remindDate.getTime() >= new Date().getTime() && result[i].remindFlag === true) {
                    console.log('we are in here');
                    var msgUpdate = {
                        description: result[i].description,
                        date: convertToString(result[i].date),
                        uniqueId: result[i].uniqueId,
                        remindDate:convertToString(result[i].remindDate),
                        reminder: true
                    };
                    Result.push(msgUpdate);
                }
            }
        }
        res.send({message:'Ok',Result:Result});
    })
});


router.put('/',function(req,res,next){
    console.log(req.body);
    switch (req.body.field){
        case 'date':
            console.log('updating Date');
            var date =  new Date(new Date().getTime() +6000000);
            notification.update({uniqueId:req.body.id},{remindDate:date, show:'yes',remindFlag:true},function(err,result){
                if(err)
                    res.send({message:err});
                else {
                    console.log(result);
                    res.send({message: 'Ok'})
                }
            });
            break;
        default:
            console.log('Uknown option');
    }
});




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


module.exports = router