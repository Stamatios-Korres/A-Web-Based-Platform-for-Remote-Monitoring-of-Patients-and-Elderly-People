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
var onlineList = new OnlineList();
exports.delete = function(source,Userid,uuid,target){
    var message1 ={
        type:"messageToBeDeleted",
        uuid: uuid,
        target:target,
        User:source         // This is sent to real target => User is source
    };
    onlineList.SendtoAll(message1); // Send to all other Users on the same account
    var message2 ={
        type:"messageToBeDeleted",
        uuid: uuid,
        target:source,
        User:target,
        targetId:Userid
    };
    onlineList.sendAllOthers(message2);
}; // Delete a Chat message Realt time
exports.initialize = function (server) {
    wss = new Wss({ httpServer: server });
    console.log("creating new list");
    wss.on('request', function (request) {
        var connection = request.accept(null, request.origin);
        console.log((new Date()) + ' Connection accepted ');
        connection.on('message', function (message) {
            var data = message.utf8Data;
            try {
                data = JSON.parse(data);
                console.log('Websocket received ' + data.type);
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
                                    var id = onlineList.push(result.username, connection, data.token,result.category); // Save (1) User (2) Ip (3) Token to distinct the users
                                    onlineList.friendsOnline(result.username, 'yes', function (error, result2) {
                                        if (error) {
                                            console.log('Error occured');
                                            connection.send(JSON.stringify({message: error}));
                                        }
                                        else {
                                            var message = {type: 'onlineUsers',id:id,online: result2};
                                            console.log('I did send the Online Users');
                                            connection.send(JSON.stringify(message)); // for each online user send that this particular user has come online
                                        }
                                    });
                                }
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
                        break;
                    case 'hang-up':
                        onlineList.SendBasedonId(data);
                        break;
                    case 'busy':
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
                            var SenderId = onlineList.findUser(connection);
                            // Actions to be taken (1) Inform Sender about Uuid (2) Send message to other user logged in (3) Send to all B's account
                            onlineList.SendtoAll(data);
                            var msg = {           // Give back to User a unique UUID so he ca delete it in Near Future
                                type:'updateUuid',
                                info:data.data,
                                target:data.source,
                                User:data.target,
                                uuid:uuid,
                                targetId:SenderId
                            };
                            onlineList.SendBasedonId(msg); // Update User
                            //Change type of message and send it
                            msg.type = 'NewMessageFromOtherAccount';
                            onlineList.sendAllOthers(msg);
                        });
                        break;
                    }

                    //Biosignals - messages

                    case 'RequestBiosignals':
                        data.sourceId = onlineList.findUser(connection);
                        onlineList.Send(data);
                        break;
                    case'BiosingalAnswer':
                        onlineList.SendBasedonId(data);
                        break;
                    case 'RealTime':
                        onlineList.SendBasedonId(data);
                        break;
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
exports.SentRequest = function(sender,target){
    var msg ={
        type:'NewRequest',
        source: sender,
        target:target
    };
    onlineList.SendtoAll(msg);
};
exports.RequestReply = function(target,source,decision){ // Must be sent to all online Users, so we are in need of name only
        if(decision === 'accept'){

            var stateSource = onlineList.CheckState(source);
            var stateTarget = onlineList.CheckState(target);
            var msgTarget ={
                type:'RequestReply',
                target:target,
                source:source,
                decision:decision,
                state:stateSource
            };
            var msgSource ={
                type:'NewFriend',
                target:source,
                source:target,
                decision:decision,
                state:stateTarget
            };
            onlineList.SendtoAll(msgTarget);
            onlineList.SendtoAll(msgSource);
        }
        else if(decision === 'reject'){
            var msg ={
                type:'RequestReply',
                target:target,
                source:source,
                decision:decision
            };
            onlineList.SendtoAll(msg);
        }
};
exports.CancelRequest = function(sender,target){
    var msg ={
        type:'RequestCancelled',
        source:sender,
        target:target
    };
    onlineList.SendtoAll(msg);
};
exports.FriendsDelete =function(source,target){
    var msg = {
        type:'FriendDelete',
        source:source,
        target:target
    };
    onlineList.SendtoAll(msg);
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
                            result ={username:user_found.username,category:user_found.category};
                            callback(null, result);
                            console.log(result.username + ' is now Online');
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
        var ConvId = result.ConversationId;
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
            else {
                callback(uuid);
            }
        })
    })
} // Requires the message with a UUID and saves is to the database

OnlineList.prototype.findUser = function (connection) {
    var User;
    for (var i = 0; i < this.list.length; i++) {
        if (this.list[i].PortIp === connection) {
            User = this.list[i];
            break;
        }
    }
    return User.Id;
};
OnlineList.prototype.SendResultToAll = function (connection, forwardedMessage) {
    var userAnswered;
    var Username;
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
            message.targetId = this.list[i].Id; // Add the Uuid of the Specific user
            this.list[i].PortIp.send(JSON.stringify(message));
        }
    }
};                                  // Video-offer is sent to all devices which are logged in as the same User
OnlineList.prototype.push = function (username, portIp, token,category) {
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
        Id: id,
        category:category
    };
    this.list.push(OnlineUser);
    return id;

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
            if(userLeft) {
                Username = userLeft.username;
                this.list.splice(i, 1);
            }
            else{
                return;
            }
            break;
        }
    }
    if(Username) {  // Special Case if error occur during disconnection of Users
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
            console.log('Only 1 user was online');
            relationship.findOne({user: Username}, function (err, result) {
                //results = All friends of user who left
                if (err) {
                    console.log('Could not remove user,Error')
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
OnlineList.prototype.sendAllOthers = function(message){
    var UniqueId = message.targetId;
    var username = message.target;
    for (var j = 0; j < this.list.length; j++) {
        if(this.list[j].username === username && this.list[j].Id !== UniqueId)
            this.list[j].PortIp.send(JSON.stringify(message));
    }
};
OnlineList.prototype.CheckState = function(name){
    var flag = 'inactive';
    for(var i=0;i<this.list.length;i++){
        if(this.list[i].username === name) {
            flag = 'active';
            break;
        }
    }
    return flag;
};



