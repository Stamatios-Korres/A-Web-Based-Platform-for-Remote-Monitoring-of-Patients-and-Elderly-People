/**
 * Created by timoskorres on 1/6/2017.
 */


angular.module('Openhealth').service('FriendsAndState', function () {
    var friends = [];
    return {
        getfriends: function () {
            return friends;
        }
        ,
        addfriends: function (name, state) {
            var newUser = {
                username: name,
                state: state
            };
            console.log('Set values to :' + newUser.username);
            friends.push(newUser);
            //Data was indeed refreshed !!!
        }
        ,
        printFriends: function () {
            for (var i = 0; i < friends.length; i++) {
                console.log(friends[i].username);
                console.log(friends[i].state);
            }
        }
        ,
        changeState: function (name, state) {
            // console.log('I received the following data: ' + name +' '+state);
            for (var i = 0; i < friends.length; i++) {
                if (friends[i].username === name) {
                    friends[i].state = state;
                    console.log("Changing state ...");
                }
                // console.log(i);
            }
        },
        removefromlist:function(element){
            for(var i = 0; i < friends.length; i++) {
                if (friends[i].username === element) {
                    console.log("removed it")
                    friends.splice(i, 1);
                    break;
                }
            }
            return friends;
        },
        clean: function () {
            friends = [];
        }
    }
});

angular.module('Openhealth').service('AjaxServices', function (FriendsAndState, $http) {
    var services = {};

    services.CancelRequest = function (name, callback) {
        var string = 'Bearer ' + token;
        $http({
            headers: {
                'Authorization': string
            },
            method: 'post',
            url: 'CancelRequest',
            data: {Cancelfrom: name}
        }).success(function (response) {
            callback(response);
        })
    };
    services.PendingRequests = function () {
        // token is initialized inside otherwise it get's undefined
        var string = 'Bearer ' + token;
        $http({
            headers: {
                'Authorization': string
            },
            method: 'get',
            url: 'Pending'
        }).success(function (response) {
            console.log(response);
            Pending = response;
        })
    };
    services.FriendRequest = function (name, callback) {
        var string = 'Bearer ' + token;
        var message = {
            sender: my_name,
            target: name
        };
        $http({
            headers: {
                'Authorization': string
            },
            method: 'post',
            url: 'friendRequest',
            data: {message: message}
        }).success(function (response) {
            console.log(response);
            callback(response.answer);
        })
    };
    services.GetRequests = function () {
        var string = 'Bearer ' + token;
        $http({
            headers: {
                'Authorization': string
            },
            method: 'get',
            url: 'GetRequests'
        }).success(function (response) {
            requests = response;

        });
    };
    services.GetInfo = function (callback) {
        $http({
            headers: {
                'Authorization': string
            },
            method: 'get',
            url: 'getName'
        }).then(function succesCallback(response) {
            console.log(response.data.username);
            my_name = response.data.username;
        });
        function errorCallback(response) {
            console.log(response)
        }
    };
    services.requestReply = function (name, type, callback) {
        var string = 'Bearer ' + token;
        var message = {
            sender: my_name,
            target: name,
            type: type
        };
        $http({
            headers: {
                'Authorization': string
            },
            method: 'post',
            url: 'requestReply',
            data: {message: message}
        }).success(function (response) {
            console.log(response);
            callback(response.message);
        })
    };
    services.GetFriends = function (callback) {
        var string = 'Bearer ' + token;
        var message = {
            sender: my_name
        };

        $http({
            headers: {
                'Authorization': string
            },
            method: 'get',
            url: 'GetFriends'
        }).success(function (response) {
            console.log("Adding friends : " + response);
            callback(response);
        });
    };
    services.DeleteFriends = function(name,callback){
        var string = 'Bearer ' + token;
        $http({
            headers: {
                'Authorization': string
            },
            method: 'post',
            url: 'DeleteFriendship',
            data:{target:name}
        }).success(function (response) {
            console.log(response);
            callback(response);
        });
    };

    return {services: services, requests: requests};
});

angular.module('Openhealth').service('VideoServices', function () {
    var response;
    var mediaConstraints = {
        audio: true, // We want an audio track
        video: true // ...and we want a video track
    };
    var IceCandidates;
    var SDPCandiates;

    var MyPeerConnection;
    var configuration = {
        iceServers: [
            {'urls': 'stun:stun.l.google.com:19302'},
            {'urls': 'turn:test.menychtas.com:3478', 'username': 'bioassistclient', 'credential': 'b10cl13nt'}
        ]
    };
    var i = 0;
    var flag = false;
    var j =1;
    function handleICECandidateEvent(event) {
        if (event.candidate) {
            console.log("Sending Candidate number: " + j );
            j++;
            var message = {
                type: "new-ice-candidate",
                target: caller,
                candidate: event.candidate
            };
            ws.send(JSON.stringify(message));
        }
    }

    function handleNegotiationNeededEvent() {

        if (flag !== true || i >= 1)
            return;
        i = i + 1;
        console.log('Sending negotiation Messages');
        MyPeerConnection.createOffer().then(function (offer) {
            return MyPeerConnection.setLocalDescription(offer);
        })
            .then(function () {
                message = {
                    type: "video-offer",
                    source: my_name,
                    target: caller,
                    sdp: MyPeerConnection.localDescription
                };
                ws.send(JSON.stringify(message));
            })
        //.catch(error);
    }

    function handleAddStreamEvent(event) {
        console.log("This is added too");
        document.getElementById("received_video").srcObject = event.stream;
        //document.getElementById("hangup-button").disabled = false;
    }

    services = {};
    services.addIceCandiate = function(IceCandidate){
        MyPeerConnection.addIceCandidate(IceCandidate);
    }
    services.getMedia = function () {
        return mediaConstraints
    };
    services.getPeer = function () {
        return MyPeerConnection
    };
    services.setPeer = function () {
        MyPeerConnection = new RTCPeerConnection(configuration);
        MyPeerConnection.onicecandidate = handleICECandidateEvent;
        MyPeerConnection.onaddstream = handleAddStreamEvent;
        // myPeerConnection.onremovestream = handleRemoveStreamEvent;
        // myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
        // myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
        // myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
        MyPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
        return MyPeerConnection;
    };
    services.SetSdp = function (sdp) {
        SDPCandiates = sdp;
    };
    services.GetSdp = function () {
        return SDPCandiates;
    };
    services.RefreshPeer = function (myPeer) {
        MyPeerConnection = myPeer;
    };
    services.Response = function () {
        return response;
    };
    services.SetResponse = function (answer) {
        flag = true;
        response = answer;
    };
    return services;
});

angular.module('Openhealth').service('WebsocketService', function (VideoServices, $timeout, $rootScope, FriendsAndState, $window) {
    var services = {};


    services.makeVideoCall = function (message) {
        message = JSON.stringify(message);
        ws.send(message);
    };
    services.InitWebsocket = function () {
        ws.onmessage = function (event) {
            console.log("Got new message from Websockets");
            //I have new message , change FriendsAndState service and inform about the cange
            var data = JSON.parse(event.data);
            var i = 1;
            console.log(data.type);
            switch (data.type) {
                case 'onlineUsers':
                    console.log('my online friends are : ');
                    for (var ii = 0; ii < data.online.length; ii++) {
                        console.log("Setting " + data.online[ii] + "to active");
                        FriendsAndState.changeState(data.online[ii], 'active');
                    }
                    break;
                case 'UserGotOnline':
                    console.log('User joined : ' + data.name);
                    FriendsAndState.changeState(data.name, 'active');
                    FriendsAndState.printFriends();
                    break;
                case 'UserGotOffLine':
                    console.log('he left us : ' + data.name);
                    FriendsAndState.changeState(data.name, 'inactive');
                    break;

                //Cases for Video - WebRTC
                case 'video-start':
                    //  console.log(data);
                    caller = data.source;
                    $rootScope.$emit('Video-Start');
                    break;
                case 'video-response': // Wiyh video response we define if we accept call or reject it
                    VideoServices.SetResponse(data.answer);
                    $rootScope.$emit('Video-Response');
                    // console.log(data);
                    break;
                case 'video-offer':
                    console.log(data.sdp);
                    VideoServices.SetSdp(data.sdp);
                    $rootScope.$emit('Video-offer');
                    break;
                case 'new-ice-candidate':
                    console.log("ICE Candidate number: " + i);
                    var candidate = new RTCIceCandidate(data.candidate);
                    VideoServices.addIceCandiate(candidate);

                    //Unhandled error
                    break;
                case 'video-answer':
                    console.log('Got a video-answer message');
                    //Set SDP- candidates answer
                    VideoServices.SetSdp(data.sdp);

                    $rootScope.$emit('Video-answer');
                    break;
                default:
                    // console.log(data);
                    console.log('Unkown message');
            }
            $rootScope.$emit('WebsocketNews');
        };
    };
    services.refresh = function (scope, callback) {
        var handler = $rootScope.$on('WebsocketNews', callback);
        scope.$on('$destroy', handler);

    };
    services.videostart = function (scope, callback) {
        var handler = $rootScope.$on('Video-Start', callback);
        scope.$on('$destroy', handler);
    };
    services.videoresponse = function (scope, callback) {
        var handler = $rootScope.$on('Video-Response', callback);
        scope.$on('$destroy', handler);
    };
    services.videoOffer = function (scope, callback) {
        var handler = $rootScope.$on('Video-offer', callback);
        scope.$on('$destroy', handler);
    };
    services.videoAnswer = function (scope, callback) {
        var handler = $rootScope.$on('Video-answer', callback);
        scope.$on('$destroy', handler);
    };
    return services;
});


angular.module('Openhealth').service('Webrtc',function(){
    var i =0;
    // var EventHandlers = {
        handleNegotiationNeededEvent=function(){
            console.log(this);
            console.log(i);
            i++;
            this.createOffer().then(function(offer) {
            return this.setLocalDescription(offer);
            })
            // .then(function() {
            //     sendToServer({
            //         name: myUsername,
            //         target: targetUsername,
            //         type: "video-offer",
            //         sdp: myPeerConnection.localDescription
            //     });
            // })
            // .catch(reportError);
        };
    // };
    var mediaConstraints = {
        audio: true,  // We want an audio track
        video: true   // ...and we want a video track
    };
    var configuration = {
        iceServers: [
            {'urls': 'stun:stun.l.google.com:19302'},
            {'urls': 'turn:test.menychtas.com:3478', 'username': 'bioassistclient', 'credential': 'b10cl13nt'}
        ]
    };
    var myPeerConnection;
    //Return Object
    services={};
    services.createPeerConnection= function(){
        myPeerConnection = new RTCPeerConnection(configuration);
        console.log('It was set');
        myPeerConnection.onnegotiationneeded = myPeerConnection.handleNegotiationNeededEvent;
    };

    return services;

});

