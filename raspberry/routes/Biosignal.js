var express = require('express');
var router = express.Router();
var biosignal = require('../models/biosignal');
const uuidv1 = require('uuid/v1');


router.post('/heartUpdate',function(req,res,next){
    console.log(req.body.value);
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

router.get('/heartbiosignals',function(req,res,next){
    var Result = [];
    try {
        biosignal.find({type: 'heart_rate'}, function (err, result) {
            if(err)
                res.send({message:err});
            else {
                if(!result){
                    res.send({message:'Empty Db'});
                }
                else {
                    for (var i = 0; i < result.length; i++) {
                        Result.push([result[i].measurement.value, result[i].date_taken.getTime(),result[i].uniqueId, result[i].source]);
                    }
                    res.send({message: 'Ok', Result: Result});
                }
            }
        })
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

router.get('/bloodSaturationbiosignals',function(req,res,next){
    var Result = [];
    try {
        biosignal.find({type: 'blood_saturation'}, function (err, result) {
            if(err)
                res.send({message:err});
            else {
                if(!result){
                    res.send({message:'Empty Db'});
                }
                else {
                    for (var i = 0; i < result.length; i++) {
                        Result.push([result[i].measurement.value, result[i].date_taken.getTime(),result[i].uniqueId, result[i].source]);
                    }
                    res.send({message: 'Ok', Result: Result});
                }
            }
        })
    }
    catch(e){
        console.log(e);
    }
});
module.exports = router;
