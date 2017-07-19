/**
 * Created by timoskorres on 10/5/2017.
 */

var server = require('../bin/www').server;
var Wss = require('websocket').server;
var user = require('../models/user');
var token = require('../models/token');
var relationship = require('../models/friends');
const uuidv4 = require('uuid/v4');
const uuidv1 = require('uuid/v1');
var message = require('../models/messages');
var conversation = require('../models/conversation');


var wss;
exports.initialize = function (server) {
    wss = new Wss({
        httpServer: server
    });
    console.log("creating new list");
    var onlineList = new OnlineList();
    wss.on('request', function (request) {
        var connection = request.accept(null, request.origin);
        console.log((new Date()) + ' Connection accepted ');
        connection.on('message', function (message) {
            var data = message.utf8Data;
            try {
                data = JSON.parse(data);
                console.log(' Websocket received ' + data.type);
                switch (data.type) {

                    //General Perspose Websocket's Job
                    case 'init': {
                        findbyToken(data.token,
                            function (err, result) {
                                //Something went wrong with the user - Disconnect User
                                if (err) {
                                    console.log('Some error finding the user');
                                }
                                else {
                                    onlineList.push(result, connection, data.token); // Save (1) User (2) Ip (3) Token to distinct the users
                                    onlineList.friendsOnline(result, 'yes', function (error, result2) {
                                        if (error) {
                                            console.log('Error occured');
                                            connection.send(JSON.stringify({message: error}));
                                        }
                                        else {
                                            console.log('Result outside Callback :');
                                            console.log(result2);
                                            var message = {type: 'onlineUsers', online: result2};
                                            message = JSON.stringify(message);
                                            connection.send(message); // for each online user send that this particular user has come online
                                            console.log('sent');
                                        }
                                    });
                                }
                            });
                        break;
                    }
                    case 'update': {  // User asks frequently about State of users
                        findbyToken(data.token,
                            function (err, result) {
                                //Something went wrong with the user - Disconnect User
                                if (err) {
                                    console.log('Some error finding the user');
                                }
                                //Side effect of the friendsOnline function is that update also the other users -> Do I want this ??
                                onlineList.friendsOnline(result, 'no', function (error, result2) {
                                    if (error) {
                                        console.log('Error occured');
                                        connection.send(JSON.stringify({message: error}));
                                    }
                                    else {
                                        console.log(result2);
                                        relationship.findOne({user: data.source}, function (err, result) {
                                            if (err)
                                                connection.send(JSON.stringify({message: err}));
                                            else {
                                                var message = {
                                                    type: 'update',
                                                    online: result2,
                                                    friends: result.friends
                                                };
                                                connection.send(JSON.stringify(message)); // for each online user send that this particular user has come online
                                            }

                                        });

                                    }
                                });
                            });
                        break;
                    }

                    // About Video Calls
                    case 'video-start': {
                        data.sourceId = onlineList.findUser(connection);
                        console.log(data);
                        onlineList.SendtoAll(data);
                        break;
                    }
                    case 'video-response': {
                        //data.sourceId = onlineList.findUser(connection);
                        onlineList.SendBasedonId(data); // Sends data back to the original target
                        onlineList.SendResultToAll(connection, data); // Send result to possible duplicates Users
                        break;
                    }
                    case 'video-offer': {
                        onlineList.SendBasedonId(data);
                        break;
                    }
                    case 'video-answer': {
                        onlineList.SendBasedonId(data);
                        break;
                    }
                    case 'new-ice-candidate':
                        onlineList.SendBasedonId(data);
                        console.log('Candidate Received');
                        break;
                    case 'hang-up':
                        onlineList.SendBasedonId(data);
                        console.log('Call is ended');
                        break;
                    case 'busy':
                        console.log('Change has been confirmed');
                        onlineList.SendResultToAll(connection, data);
                        onlineList.SendBasedonId(data);
                        break;
                    case 'cancel':
                        onlineList.SendtoAll(data); // Inform all Devices logged in as the same User
                        break;

                    //Chat - messages

                    case 'Chat': {
                        SaveMessage(data.source, data.target, data.data,function(uuid){
                            data.uuid = uuid;
                            onlineList.SendtoAll(data);
                            console.log(data);

                            var msg = {           // Give back to User a unique UUID so he ca delete it in Near Future
                                type:'updateUuid',
                                info:data.data,
                                target:data.source,
                                User:data.target,
                                uuid:uuid
                            };
                            onlineList.Send(msg);
                        });
                        break;
                    }
                    default :
                        console.log("unknown type");


                }
            } catch (e) {
                console.log(e);
            }
        });

        connection.on('close', function () {
            onlineList.Removeuser(connection);
        })
    })
};


function findbyToken(id, callback) {
    var result;
    token.findOne({value: id},
        function (err, token_found) {
            if (err || !token_found) {
            }
            else {
                user.findOne({_id: token_found.userId}, function (err, user_found) {
                        if (err) {
                            callback(err, null);
                        }
                        else if (!user_found) {
                            callback({reason: 'NoUser'}, null)
                        }
                        else {
                            result = user_found.username;
                            callback(null, result);
                            console.log(result + ' is now Online');
                        }
                    }
                );
            }
        }
    )
}
function OnlineList() {
    this.list = []; // Empty List upon creation
}
function SaveMessage(source, target, info,callback) {
    conversation.findOne({Participants:{$all:[source,target]}},function(err,result){
        if(err)
            console.log(err);
        console.log('Conversation found: '+ result);
        var ConvId = result.ConversationId;
        console.log(ConvId);
        var uuid = uuidv1();
        var newmessage={
            data:info,
            from:source,
            to:target,
            timestamp: new Date(),
            uniqueId:uuid
        };
        message.update({ConvesrationId:ConvId},{$push:{message:newmessage}},function(err,result){
            if(err)
                console.log(err);
            else
                callback(uuid);
        })
    })
}

OnlineList.prototype.findUser = function (connection) {
    var User;
    for (var i = 0; i < this.list.length; i++) {
        if (this.list[i].PortIp === connection) {
            User = this.list[i];
            break;
        }
    }
    console.log(User.Id);
    return User.Id;
};
OnlineList.prototype.SendResultToAll = function (connection, forwardedMessage) {
    var userAnswered;
    var Username;
    console.log(forwardedMessage);
    for (var i = 0; i < this.list.length; i++) {        // Find the username of User which answered
        if (this.list[i].PortIp === connection) {
            userAnswered = this.list[i];
            Username = userAnswered.username;
            break;
        }
    }
    if (userAnswered.SameAccount > 0) {
        var result;
        if (forwardedMessage.type === 'busy')
            result = 'no';
        else
            result = 'yes';
        var message = {
            type: 'multipleUsers',
            result: result,
            source: forwardedMessage.source
        };
        for (var j = 0; j < this.list.length; j++) {
            if (this.list[j].PortIp !== userAnswered.PortIp && this.list[j].username === Username) { // Inform all other Users logged in to the same account
                this.list[j].PortIp.send(JSON.stringify(message));

            }
        }
    }
};          // Call has been Answered/Rejected by another Device -> Inform others
OnlineList.prototype.SendtoAll = function (message) {   // Send to alla User's which are currently online to the same account
    console.log('Sending message to: ' + message.target);
    for (var i = 0; i < this.list.length; i++) {
        if (this.list[i].username === message.target) {
            message.targetId = this.list[i].Id;         // Add the Uuid of the Specific user
            this.list[i].PortIp.send(JSON.stringify(message));
        }
    }
};                                  // Video-offer is sent to all devices which are logged in as the same User
OnlineList.prototype.push = function (username, portIp, token) {
    var Same = 0;
    for (var j = 0; j < this.list.length; j++) {
        if (this.list[j].username === username) {
            Same++;
            this.list[j].SameAccount++; // We increase all our Users by one
        }

    }

    var id = uuidv4();      // Each online member must have a unique string which identifies him
    var OnlineUser = {
        username: username,
        PortIp: portIp,
        token: token,
        SameAccount: Same,
        Id: id
    };
    return this.list.push(OnlineUser);
};
OnlineList.prototype.Send = function (message) {
    for (var i = 0; i < this.list.length; i++) {
        if (this.list[i].username === message.target) {
            this.list[i].PortIp.send(JSON.stringify(message));  // Need to be modified when multiple hosts are allowed
            break;
        }
    }
};
OnlineList.prototype.printList = function () {
    console.log("Online users right now are : ");
    for (var i = 0; i < this.list.length; i++) {
        console.log(this.list[i].username);
    }
};
OnlineList.prototype.Removeuser = function (connection) {
    var userLeft;
    var Username;
    for (var i = 0; i < this.list.length; i++) {
        if (this.list[i].PortIp === connection) {
            userLeft = this.list[i];
            Username = userLeft.username;
            console.log('Found the user you have been asking for');
            this.list.splice(i, 1);
            break;
        }
    }
    console.log(Username + ' is now offline');
    var _this = this;
    if (userLeft.SameAccount > 0) {
        console.log('more than one users online'); // Decrease online users on the same account by 1
        for (var j = 0; j < this.list.length; j++) {
            if (Username === this.list[j].username)
                this.list[j].SameAccount--;
        }
    }
    else {                       // SameAccount is 0 , there is not another User online to the same account
        console.log('Only 1 user online');
        relationship.findOne({user: Username}, function (err, result) {
            //results = All friends of user who left
            if (err) {
                console.log('Some error occured')
            }
            //User has no current Friends
            else if (!result)
                return;
            //Find which of user's friends are online
            else {
                for (var i = 0; i < _this.list.length; i++) {
                    //this.list -> Online Users
                    //Result -> Friends of user who disconnected
                    for (var j = 0; j < result.friends.length; j++) {
                        if (_this.list[i].username === result.friends[j] && _this.list[i].username !== Username) {
                            _this.list[i].PortIp.send(JSON.stringify({type: 'UserGotOffLine', name: Username}));
                            break;
                        }
                    }
                }
            }
        });
    }
};
OnlineList.prototype.friendsOnline = function (username, option, callback) {
    var _this = this; // this is the online user's list ,why return jojo ?
    relationship.findOne({user: username}, function (err, result) {
        if (err)
            callback(err, null);
        var results = [];
        if (!result)
            callback(null, []);
        _this.printList();
        for (var j = 0; j < result.friends.length; j++) {
            for (var i = 0; i < _this.list.length; i++) {
                if (_this.list[i].username === result.friends[j] && _this.list[i].username !== username) {
                    results.push(result.friends[j]);
                    console.log('sending to : ' + result.friends[j]);
                    if (option === 'yes')
                        _this.list[i].PortIp.send(JSON.stringify({type: 'UserGotOnline', name: username}));
                }
            }
        }

        callback(null, results)
    });
};
OnlineList.prototype.SendBasedonId = function (message) {
    for (var i = 0; i < this.list.length; i++) {
        if (this.list[i].username === message.target && this.list[i].Id === message.targetId) {
            this.list[i].PortIp.send(JSON.stringify(message));  // Need to be modified when multiple hosts are allowed
            break;
        }
    }

};



