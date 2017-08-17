/**
 * Created by timoskorres on 1/5/2017.
 */

var express = require('express');
var router = express.Router();
var user = require('../models/user');
var passport = require('passport');

var getToken = require('../controllers/oauth2orize').token;
var path = require('path');
var login = require('../controllers/Strategies').login;
var relationship = require('../models/friends');
var message = require('../models/messages');
var conversation = require('../models/conversation');
const uuidv1 = require('uuid/v1');
var wwsSentRequest = require('../WebSocketServer/WebsocketServer').SentRequest;
var wwsCancelRequest = require('../WebSocketServer/WebsocketServer').CancelRequest;
var wwsRequestReply = require('../WebSocketServer/WebsocketServer').RequestReply;
var wwsFriendsDelete = require('../WebSocketServer/WebsocketServer').FriendsDelete;

//Main page of my SPA
router.get('/login', function (req, res, next) {
    res.sendFile('success.html', {root: path.join(__dirname, '../public/app')})
});

//Return name based on token
router.get('/getName', passport.authenticate('bearer', {session: false}), function (req, res, next) {
        res.send({username: req.user.username});
    }
);

//Save friend requests users make
router.post('/friendRequest', passport.authenticate('bearer', {session: false}), function (req, res, next) {
    //console.log(req.body);
    SaveRequest(req.body.message.sender, req.body.message.target, function (result) {
        res.send(result);
    })
});

//return Requests send to user
router.get('/GetRequests', passport.authenticate('bearer', {session: false}), function (req, res, next) {
    SendRequests(req.user.username, function (friendRequests) {
        res.send(friendRequests)
    })
});

//User replied to request previously sent to him
router.post('/requestReply', passport.authenticate('bearer', {session: false}), function (req, res, next) {
        RequestResult(req.body.message.sender, req.body.message.target, req.body.message.type, function (results) {
                res.send(results)
            }
        );
    }
);

//Return friends of user
router.get('/GetFriends', passport.authenticate('bearer', {session: false}), function (req, res, next) {
    relationship.findOne({user: req.user.username}, function (err, result) {
        if (err)
            res.send({'message': err});
        else {
            // var friendsCategory = FindCategoryForEachFriend(result.friends);
            res.send(result.friends);
        }

    });
});

//User gives credential and I return a bearer token
router.post('/login',getToken);

//Send back to user the requests he has not got any answer
router.get('/Pending', passport.authenticate('bearer', {session: false}), function (req, res, next) {
    findPending(req.user.username, function (result) {
        res.send(result);
    });
});

//Cancel a request a user has made
router.post('/CancelRequest', passport.authenticate('bearer', {session: false}), function (req, res, next) {
    console.log(req.user.username);
    console.log(req.body.Cancelfrom);
    cancelRequest(req.user.username, req.body.Cancelfrom, function (result) {

        console.log(result);
        res.send(result);
    });
});

//A user decides to delete a friend of his
router.post('/DeleteFriendship', passport.authenticate('bearer', {session: false}), function (req, res, next) {
    var sender = req.user.username;
    var target = req.body.target;
    console.log(sender);
    console.log(target);
    deleteFriendship(sender, target, function (result) {
        res.send(result);
    })
});


function findPending(username, callback) {
    relationship.findOne({user: username}, function (err, friendship) {
        if (err)
            callback({message: 'An error occured try again'});
        else if (!friendship)
            callback({message: 'Something wrong with the system'});
        var response = [];
        for (var j = 0; j < friendship.RequestsSent.length; j++) {
            if (friendship.RequestsSent[j].state === 'pending') {
                response.push(friendship.RequestsSent[j].to);
            }
        }
        callback(response);
    })

}
function SendRequests(username, callback) {
    relationship.findOne({user: username}, function (err, userReturned) {
        if (err)
            callback({message: 'Internal Error'});
        else if (!userReturned)
            callback({message: 'No user'});
        else {
            var response = [];
            for (var j = 0; j < userReturned.RequestsReceived.length; j++) {
                if (userReturned.RequestsReceived[j].state === 'pending')
                    response.push(userReturned.RequestsReceived[j].from)
            }
        }
        callback(response);
    })
}
function SaveRequest(sender, target, callback) {
    if (sender === target) {
        callback({answer: "You can't send a request to yourself"});
        return;
    }
    user.findOne({username: target}, function (err, User) {
        if (err)
            callback({answer: 'Some error occured, please try again 1 '});
        else if (!User)
            callback({answer: "The User doesn't Exists"});
        else {
            var fromrequest = {
                to: target,
                state: 'pending'
            };
            var torequest = {
                from: sender,
                state: 'pending'
            };
            //Check user has not send another request already
            relationship.findOne({
                user: sender,
                RequestsSent: {$elemMatch: {state: 'pending', to: target}}
            }, function (err, SenderRecord) {
                if (err)
                    callback(err);
                else if (SenderRecord) {
                    callback({answer: 'You have already sent a request'})
                }
                else {
                    // User A can't send request to User B if User B has already sent him a request
                    relationship.findOne({
                        user: target,
                        RequestsSent: {$elemMatch: {state: 'pending', to: sender}}
                    }, function (err, Result) {
                        if (err)
                            callback(err);
                        else if (Result) {
                            callback({answer: 'A request from him has been sent, cancel it or accept it'});
                            return;
                        }
                        //check if user sends requests to user whom he is friend with
                        relationship.findOne({user: sender, friends: {$in: [target]}},
                            function (err, SenderRecord) {
                                if (err)
                                    callback(err);
                                else if (SenderRecord)
                                    callback({answer: 'You are already friends'});
                                else {
                                   console.log('Ready to update new Users ');
                                    relationship.update({user: sender}, {$push: {RequestsSent: fromrequest}}
                                        , function (err, done) {
                                            if (!done)
                                                console.log(err);
                                            //  console.log(done);
                                            if (err)
                                                callback({answer: 'Some error occured, please try again 3 '});
                                            else {
                                                console.log('login.js 185 - Sender was updated');
                                                console.log('login.js 186 ' + done);
                                                relationship.update({user: User.username}, {$push: {RequestsReceived: torequest}}, function (err, done) {
                                                    if (err)
                                                        callback({answer: 'Some error occured, please try again 4'});
                                                    else {
                                                        console.log(done);
                                                        wwsSentRequest(sender,target);
                                                        callback({answer: 'Your request has been sent '});
                                                    }
                                                })
                                            }
                                        });
                                }
                            }
                        )
                    })
                }
            })
        }
    })
}
function RequestResult(sender, target, answer, callback) {

    if (answer === 'accept') {
        console.log(sender + ' accepted the requests');
        console.log(target);
        console.log("Request has been accepted ");
        //Update state of request in Sender
        relationship.update({user: sender, RequestsReceived: {$elemMatch: {state: 'pending', from: target}}},
            {$set: {'RequestsReceived.$.state': 'accepted'}},
            function (err, res) {
                console.log(res);
                if (err)
                    callback(err);
                else if (res.n === 0) {
                    callback({message: 'Already friends or uknown friend'});
                    console.log("Probaply here");
                }
                else {
                    console.log('One request down');
                    //Update state of request in Sender

                    //Here is the problem Update wrong value
                    relationship.update({user: target, RequestsSent: {$elemMatch: {state: 'pending', to: sender}}},
                        //relationship.update({user: target, "RequestsSent.state": 'pending', "RequestsSent.to": sender},
                        {$set: {'RequestsSent.$.state': 'accepted'}}, function (err, result) {
                            console.log(result);
                            if (err)
                                callback({message: err});
                            else if (!result)
                                callback({message: target + " may have cancelled his request"});
                            else {
                                console.log(result);
                                //Update friends
                                console.log('Second request down');
                                relationship.update({user: sender}, {$push: {friends: target}}, function (err, results) {
                                    if (err)
                                        callback({message: err});
                                    else {
                                        console.log(results);
                                        relationship.update({user: target}, {$push: {friends: sender}}, function (err, results) {
                                            if (err)
                                                callback({message: err});
                                            else{                                       //Now that both Users are friends I must add a schema for their Chat
                                                CreateConversation(sender,target,answer,callback);

                                            }
                                        })
                                    }

                                })
                            }
                        })
                }
            }
        )
    }
    else if (answer === 'reject') {
        console.log("Request have been rejected ");
        relationship.update({user: sender, RequestsReceived:{$elemMatch:{state:'pending',from:target}}},
            {$set: {'RequestsReceived.$.state': 'RejectedFromReceiver'}},
            function (err, res) {
                if (err) {
                    console.log('Exit with error');
                    callback(err);
                    return;
                }
                if (res.n === 0){
                    console.log(res);
                    callback({message: 'May have cancelled friend request or Already friends'});
                }
                else {
                    console.log(res);
                    relationship.update({user:target,RequestsSent:{$elemMatch:{state:'pending',to:sender}}},
                        {$set: {'RequestsSent.$.state': 'RejectedFromReceiver'}}, function (err, result) {
                            console.log(result);
                            if (err)
                                callback({message: err});
                            if (!result)
                                callback({message: target + " may have cancelled his request"});
                            else {
                                console.log(result);
                                wwsRequestReply(target,sender,answer);
                                callback({message: 'Ok'});
                            }
                        })
                }
            })
    }
    else {
        callback({message: 'Uknown Request Reply'});
    }
}
function cancelRequest(sender, target, callback) {
    // relationship.update({user: sender, "RequestsSent.state": 'pending', "RequestsSent.to": target},
    relationship.update(
        {user: sender, RequestsSent: {$elemMatch: {state: 'pending', to: target}}},
        {
            $set: {
                'RequestsSent.$.state': 'cancelled'
            }
        }, function (err, result1) {
            if (err)
                callback(err);
            else if (!result1 || result1.n === 0)
                callback({message: target + " have probably accepted/rejected the request"});
            else {
                console.log(result1);
                console.log('One request cancelled');
                relationship.update(
                    {user: target, RequestsReceived: {$elemMatch: {state: 'pending', from: sender}}},
                    {$set: {'RequestsReceived.$.state': 'cancelled'}}, function (err, result) {
                        if (err)
                            callback(err);
                        else if (!result)
                            callback({message: target + " have probably  already accepted or rejected the request "});
                        else {
                            console.log(result);
                            wwsCancelRequest(sender,target);
                            callback({message: 'Ok'});
                        }
                    });

            }
        }
    )
}
function deleteFriendship(sender, target, callback) {
    relationship.update({user: sender}, {$pull: {friends: target}}, function (err, result1) {
        if (err) {
            callback(err);
            return;
        }
        console.log(result1);
        relationship.update({user: target}, {$pull: {friends: sender}}, function (err, result2) {
            if (err) {
                callback(err);
                return;
            }
            console.log(result2);
            wwsFriendsDelete(sender,target);
            callback({message: 'Ok'});
        })

    })
}
function CreateConversation(sender,target,answer,callback) {
    var ConvId = uuidv1();
    var Conversation = new conversation({
        ConversationId: ConvId,
        Participants: [sender, target]
    });
    Conversation.save(function (err, result) {
        if (err)
            console.log(err);
        else {
            var msg = new message({
                ConvesrationId: ConvId,
                message: []
            });
            msg.save(function (err, result) {
                if (err)
                    console.log(err);
                else {
                    callback({message: 'Ok'});
                    wwsRequestReply(target,sender,answer);
                }
            })
        }
    })
}

module.exports = router;
