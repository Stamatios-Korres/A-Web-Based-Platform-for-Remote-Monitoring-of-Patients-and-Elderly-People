var express = require('express');
var router = express.Router();
var biosignal = require('../models/biosignal');
const uuidv1 = require('uuid/v1');
var user = require('../models/OnlineUserModel');


router.post('/heartUpdate',function(req,res,next){
    console.log(req.body.newvalue);
    var newValue = req.body.newvalue;
    var id = req.body.uniqueId;
    biosignal.update({uniqueId:id},{measurement:{value:newValue}},function(err,result){
        if(err || !result)
            res.send({message:'Error'});
        else{
            res.send({message:'Ok'})
        }
    });

});

//Manually added by User - Heart Measurement
router.post('/heartInsert',function(req,res,next){
    var message = req.body;
    var measurement = new biosignal({
        date_taken:message.Date,
        type: 'heart_rate',
        source:'self_reported',
        measurement: {
            value: message.value,
            unit: 'bpm'
        },
        uniqueId: uuidv1()
    });
    measurement.save(function(err,result){
        if(err)
            res.send({message:err});
        else{
            res.send({message:'Ok'})
        }
    });
});

router.delete('/heartdelete',function(req,res,next){
    var Id = req.body.uniqueId;
    console.log(Id);
    biosignal.remove({uniqueId:Id},function(err,result){
        if(err)
            res.send({message:'err'});
        else
            res.send({message:"Ok"})
    })
});

router.delete('/bloodSaturationdelete',function(req,res,next){
    var Id = req.body.uniqueId;
    biosignal.remove({uniqueId:Id},function(err,result){
        if(err)
            res.send({message:'err'});
        else
            res.send({message:"Ok"})
    })
});

router.get('/bloodSaturationbiosignals',function(req,res,next){
    var Result = [];
    var hours =req.query.range;
    try {
        if(isNaN(hours)) {
            biosignal.find({$query: {type: 'blood_saturation'}, $orderby: {date_taken: 1}}, function (err, result) {
                if (err) {
                    console.log('Εrror blood is ' + err);
                    res.send({message: err});
                }
                else {
                    if (!result) {
                        res.send({message: 'Empty Db'});
                    }
                    else {
                        var i;
                        for (i = 0; i < result.length; i++) {
                            Result.push([result[i].measurement.value, result[i].date_taken.getTime(), result[i].uniqueId, result[i].source]);
                        }
                        res.send({message: 'Ok', Result: Result});
                    }
                }
            })
        }
        else {
            console.log("We have number");
            var newDate = new Date().getTime();
            var acceptedValues = newDate -(parseInt(hours)  * 60000 *60);
            biosignal.find({$query: {type: 'blood_saturation',date_taken:{$gte : new Date(acceptedValues)}}, $orderby: {date_taken: 1}}, function (err, result) {
                if (err) {
                    console.log('Εrror blood is ' + err);
                    res.send({message: err});
                }
                else {
                    if (!result) {
                        res.send({message: 'Empty Db'});
                    }
                    else {
                        var i;
                        for (i = 0; i < result.length; i++) {
                            Result.push([result[i].measurement.value, result[i].date_taken.getTime(), result[i].uniqueId, result[i].source]);
                        }
                        res.send({message: 'Ok', Result: Result});
                    }
                }

            })

        }
    }
    catch(e){
        console.log(e);
    }
});

router.get('/heartbiosignals',function(req,res,next){
    var Result = [];
    var hours =req.query.range;
    console.log(hours);
    try {
        if (isNaN(hours)) {
            biosignal.find({$query: {type: 'heart_rate'}, $orderby: {date_taken: 1}}, function (err, result) {
                if (err) {
                    console.log('Εrror heart is ' + err);
                    res.send({message: err});
                }
                else {
                    if (!result) {
                        res.send({message: 'Empty Db'});
                    }
                    else {
                        for (var i = 0; i < result.length; i++) {
                            Result.push([result[i].measurement.value, result[i].date_taken.getTime(), result[i].uniqueId, result[i].source]);
                        }
                        res.send({message: 'Ok', Result: Result});
                    }
                }
            })
        }
        else {
            var newDate = new Date().getTime();
            var acceptedValues = newDate -(parseInt(hours)  * 60000 *60);
            biosignal.find({$query: {type: 'heart_rate',date_taken:{$gte : new Date(acceptedValues)}}, $orderby: {date_taken: 1}}, function (err, result) {
                if (err) {
                    console.log('Εrror heart_rate is ' + err);
                    res.send({message: err});
                }
                else {
                    if (!result) {
                        res.send({message: 'Empty Db'});
                    }
                    else {
                        var i;
                        for (i = 0; i < result.length; i++) {
                            Result.push([result[i].measurement.value, result[i].date_taken.getTime(), result[i].uniqueId, result[i].source]);
                        }
                        res.send({message: 'Ok', Result: Result});
                    }
                }

            })
        }
    }
    catch(e){
        console.log(e);
    }
});

router.post('/BloodSaturationInsert',function(req,res,next){
    var message = req.body;
    var measurement = new biosignal({
        date_taken:message.Date,
        type: 'blood_saturation',
        source:'self_reported',
        measurement: {
            value: message.value,
            unit: 'SO2'
        },
        uniqueId: uuidv1()
    });
    measurement.save(function(err,result){
        if(err)
            res.send({message:err});
        else{
            res.send({message:'Ok'})
        }
    });
});



router.put('/BloodSaturation',function(req,res,next){
    console.log(req.body.newvalue);
    var newValue = req.body.newvalue;
    var id = req.body.uniqueId;
    biosignal.update({uniqueId:id},{measurement:{value:newValue}},function(err,result){
        if(err || !result)
            res.send({message:'Error'});
        else{
            console.log(result);
            res.send({message:'Ok'})
        }
    });
});


router.post('/AcceptedUsers',function(req,res,next){
    var newUser = req.body.user;
    var me  = req.body.myself;
    user.update({Username:me},{$push: {ApprovedUsers: newUser}},function(err,result){
        if(err) {
            console.log(err);
            res.send({message:err});
        }
        else
            res.send({message:'Ok'});
    });
});

router.get('/AcceptedUsers',function(req,res,next){
    var myself =req.query.myself;
    console.log(myself);
    user.findOne({Username:myself},function(err,result){
        if(err)
            res.send({message:err});
        else if(!result)
            res.send({message:'Ok',users:[]});
        else
            res.send({message:'Ok',users:result.ApprovedUsers});
    })
});

router.delete('/AcceptedUsers',function(req,res,next){
    var myname = req.body.myself;
    var UserToDelete = req.body.user;
    console.log(UserToDelete);
    user.update({Username:myname},{ $pull: { ApprovedUsers: UserToDelete}},function(err,result){
        if(err) {
            console.log(err);
            res.send({message:err})
        }
        else if(result){
            res.send({message:'Ok'})
        }
        else{
            res.send('fail');
            console.log(result);
        }
    })
});
module.exports = router;
