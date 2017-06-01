/**
 * Created by timoskorres on 10/5/2017.
 */

var server = require('../bin/www').server;
var Wss = require('websocket').server;
var user = require('../models/user');
var token = require('../models/token');
var relationship = require('../models/friends');


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
            } catch (e) {
                console.log("Invalid Input");
            }
            // console.log(data);
            switch (data.type) {
                case 'init': {
                    findbyToken(data.token,
                        function (result) {
                            onlineList.push(result, connection);
                            onlineList.friendsOnline(result, function (result2) {
                                // console.log(result2);
                                var message = {type: 'onlineUsers', online: result2};
                                // console.log(message);
                                connection.send(JSON.stringify(message)); // for each online user send that this particular user has come online
                            });
                        });
                    break;
                }
                case 'video-start':{
                    onlineList.Send(data);
                    break;
                }
                case 'video-response': {
                    onlineList.Send(data);
                    break;
                }
                case 'video-offer':{
                    onlineList.Send(data);
                    break;
                }
                case 'video-answer':{
                    onlineList.Send(data);
                    break;
                }
                case 'new-ice-candidate':
                    onlineList.Send(data);
                    console.log('Candidate Received');
                    break;
                case 'hang-up':
                    onlineList.Send(data);
                    console.log('Call is ended');
                    break;
                default :
                    console.log("unknown type");
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
                        }
                        else if (!user_found) {
                        }
                        else {
                            result = user_found.username;
                            callback(result);
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

OnlineList.prototype.push = function (username, portIp) {
    var message = {
        username: username,
        PortIp: portIp
    };
    console.log(message.username + ' is now Online');
    return this.list.push(message);
};
OnlineList.prototype.Send= function(message) {
    console.log(message.target);
    for (var i = 0; i < this.list.length; i++) {
        if(this.list[i].username === message.target){
            this.list[i].PortIp.send(JSON.stringify(message));
            // console.log('message was sentee');
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
    //console.log(this.list.length);
    for (var i = 0; i < this.list.length; i++) {
        if (this.list[i].PortIp === connection) {
            userLeft = this.list[i].username;
            //Remove user from Online
            this.list.splice(i,1);
            break;
        }
    }
    console.log(userLeft + ' is now offline');
    var _this = this;
    relationship.findOne({user: userLeft}, function (err, result) {
        //results = All friends of user who left
        if (err) {
        }
        //Find which of user's friends are online
        for (var i = 0; i < _this.list.length; i++) {
            for (var j = 0; j < result.friends.length; j++) {
                if (_this.list[i].username === result.friends[j] && _this.list[i].username !== userLeft) {
                    _this.list[i].PortIp.send(JSON.stringify({type: 'UserGotOffLine', name: userLeft}));
                }
            }
        }
    });
};
OnlineList.prototype.friendsOnline = function (username, callback) {
    var _this = this; // this is the online user's list ,why return jojo ?
    relationship.findOne({user: username}, function (err, result) {
        if (err)
            callback([]);
        results = [];
        if (!result)
            callback([]);
        _this.printList();
        console.log(result.friends.length);
        console.log(_this.list.length);
        for (var j = 0; j < result.friends.length; j++) {
            for (var i = 0; i < _this.list.length; i++) {
                if (_this.list[i].username === result.friends[j] && _this.list[i].username !== username) {
                    results.push(result.friends[j]);
                    console.log('sending to : ' + result.friends[j]);
                    _this.list[i].PortIp.send(JSON.stringify({type: 'UserGotOnline', name: username}));
                }
            }
        };
        console.log('Ready to send these :');
        callback(results)
    });
};
