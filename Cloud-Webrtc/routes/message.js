/**
 * Created by timos on 19/7/2017.
 */


var express = require('express');
var router = express.Router();
var passport = require('passport');
var message = require('../models/messages');
var conversation = require('../models/conversation');
var Wssdelete = require('../WebSocketServer/WebsocketServer').delete;


router.get('/',passport.authenticate('bearer', {session: false}),function(req,res,next) { // Get messages from Server with a particular friend
        var UserFound = req.user;
        var target =req.query.target;
        var Array = [target,UserFound.username];
        try {
            conversation.findOne({Participants: {$all: Array}}, function (err, result1) {
                if (err)
                    console.log(err);
                else {
                    var ConvId = result1.ConversationId;
                    message.findOne({ConvesrationId: ConvId}, function (err, result2) {
                        if (err)
                            console.log(err);
                        else if(result2) {
                            var Result = [];
                            var messages = result2.message;
                            for(var i=0;i<messages.length;i++){
                                var data = messages[i].data;
                                var direction ;
                                if(messages[i].from !== UserFound.username)
                                    direction=target;
                                else
                                    direction = 'me';
                                var msg = {
                                    message:data,
                                    direction: direction,
                                    uuid:messages[i].uniqueId
                                };
                                Result.push(msg);
                            }
                            res.send({message: Result});
                        }
                        else{
                            res.send({message: []});
                        }
                    })
                }
            })
        }
        catch(e){
            console.log(e);
            res.send({message:'Please try again'});
        }

});


 router.delete('/',passport.authenticate('bearer', {session: false}),function(req,res,next){ // We have to delete message from database
    var uuid =req.query.uuid;
     var Userid =req.query.uuidUser;
    var Array=[req.query.target,req.user.username];
    conversation.findOne({Participants:{$all:Array}},function(err,result){
        if(err)
            res.send({message:err});
        else{
            var ConvId = result.ConversationId;
            message.update({ConvesrationId:ConvId},{$pull:{message:{uniqueId:uuid}}},function(err,result){
                if(err)
                    res.send({message:err});

                else{
                    console.log(result);
                    res.send({message:'Message was deleted'});
                }
            })
        }
        Wssdelete(req.user.username,Userid,uuid,req.query.target);
    });
});


module.exports = router;
