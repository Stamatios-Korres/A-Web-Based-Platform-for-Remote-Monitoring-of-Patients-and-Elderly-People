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
           // console.log('Set values to :' + newUser.username);
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
                   // console.log("Changing state ...");
                }
                // console.log(i);
            }
        },
        removefromlist:function(element){
            for(var i = 0; i < friends.length; i++) {
                if (friends[i].username === element) {
                 //   console.log("removed it");
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
    services.PendingRequests = function (callback) {
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
            callback();
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
    var SDPCandiates;
    var MyPeerConnection;
    var configuration = {
        iceServers: [
            {'urls': 'stun:stun.l.google.com:19302'},
            {'urls': 'turn:test.menychtas.com:3478', 'username': 'bioassistclient', 'credential': 'b10cl13nt'}
        ]
    };

    // Names of the users in call
    var target;
    var myself;

    //Flags used for making sure Video Calls use cases
    var PeerDisconnectedWhileInCall = false;
    var PeerCancelledCall = false;
    var MuteFlag = false;
    var Incall = false;

    //Should get rid of those
    var i = 0;
    var flag = false;
    var j =1;

    // Functions needed by WebRTC PeerConnection ( Object's Fucntion )

    function handleICECandidateEvent(event) {
        if (event.candidate) {
            console.log("Sending Candidate number: " + j );
            j++;
            var message = {
                type: "new-ice-candidate",
                target: target,
                candidate: event.candidate
            };
            ws.send(JSON.stringify(message));
        }
    }
    function closePeer(){
        MyPeerConnection.close();
          MyPeerConnection = null;
        //reset flags
        PeerDisconnectedWhileInCall = false;
        PeerCancelledCall = false;
        MuteFlag = false;
        Incall = false;
        target = null;
        myself = null;
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
                    source: myself,
                    target: target,
                    sdp: MyPeerConnection.localDescription
                };
                ws.send(JSON.stringify(message));
            })
        //.catch(error);
    }
    function CloseVideo (){
        var remoteVideo = document.getElementById("received_video");
        var localVideo = document.getElementById("local_video");
        if (MyPeerConnection) {
            if (remoteVideo.srcObject) {
                remoteVideo.srcObject.getTracks()[1].stop();
                remoteVideo.srcObject.getTracks()[0].stop();
                remoteVideo.srcObject = null;
            }
            if (localVideo.srcObject) {
                localVideo.srcObject.getTracks()[0].stop();
                localVideo.srcObject.getTracks()[1].stop();
                localVideo.srcObject = null;
            }
            closePeer();
        }
    }
    function handleAddStreamEvent(event) {
        console.log("Received incoming stream");
        document.getElementById("received_video").srcObject = event.stream;
        //document.getElementById("hangup-button").disabled = false;
    }
    function handleGetUserMediaError(e) {
        switch (e.name) {
            case "NotFoundError":
                alert("Unable to open your call because no camera and/or microphone" +
                    "were found.");
                break;
            case "SecurityError":
            case "PermissionDeniedError":
                // Do nothing; this is the same as the user canceling the call.
                break;
            default:
                alert("Error opening your camera and/or microphone: " + e.message);
                break;
        }
        VideoServices.closeVideo();
        //define later what close Video is
    }
    function handleICEConnectionStateChangeEvent(event) {
        switch(MyPeerConnection.iceConnectionState) {
            //
            case "closed":
              // console.log('case closed');
                MyPeerConnection = null;
                break;
            case "failed":
                // console.log('case failed');
                break;
            case "disconnected":
                MyPeerConnection = null;

                console.log('case disconnected');
                break;
        }
    }

    // Visible to the outside word function in order to set the object
    services = {};
    services.incall = function(){return Incall};
    services.closeVideo = function(){
        console.log('ready to close video');
        CloseVideo();
    };
    services.addIceCandiate = function(IceCandidate){
        MyPeerConnection.addIceCandidate(IceCandidate);
    };
    services.getPeer = function () {
        if(MyPeerConnection)
            return true;
        else
            return false;
        //return MyPeerConnection
    };
    services.setPeer = function (string) {
        Incall = true;
        MyPeerConnection = new RTCPeerConnection(configuration);
        MyPeerConnection.onicecandidate = handleICECandidateEvent;
        MyPeerConnection.onaddstream = handleAddStreamEvent;
        // myPeerConnection.onremovestream = handleRemoveStreamEvent;
      //  MyPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
        // myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
        // myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
        MyPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;

        //Set the stream based on what state you have been called
        switch(string){
            case  'Caller' :
                navigator.mediaDevices.getUserMedia(mediaConstraints)
                    .then(function (localStream) {
                        document.getElementById("local_video").srcObject = localStream;
                        MyPeerConnection.addStream(localStream);
                    })
                    .catch(handleGetUserMediaError);
                break;
            case 'Callee':
                var desc = new RTCSessionDescription(SDPCandiates);

                MyPeerConnection.setRemoteDescription(desc).then(function () {
                    return navigator.mediaDevices.getUserMedia(mediaConstraints);
                })
                    .then(function (stream) {
                        localStream = stream;
                        document.getElementById("local_video").srcObject = localStream;
                        return MyPeerConnection.addStream(localStream);
                    })
                    .then(function () {
                        return MyPeerConnection.createAnswer();
                    })
                    .then(function (answer) {
                        return MyPeerConnection.setLocalDescription(answer);
                    })
                    .then(function () {
                        var msg = {
                            source: myself,
                            target: target,
                            type: "video-answer",
                            sdp: MyPeerConnection.localDescription
                        };
                        ws.send(JSON.stringify(msg));
                    })
                    .catch(handleGetUserMediaError);
                break;
            default :
                console.log('Wring type of parameter');

        }
    };
    services.SetSdp = function (sdp) {
        SDPCandiates = sdp;
    };
    services.Response = function () {
        return response;
    };
    services.SetResponse = function (answer) {
        flag = true;
        response = answer;
    };
    services.setUsers = function(user1,user2){
        console.log('The two Peers were set');
        target = user1;
        myself = user2;
    };
    services.SetAnswer= function (){
        var desc = new RTCSessionDescription(SDPCandiates);
        MyPeerConnection.setRemoteDescription(desc).then(function () {
            return navigator.mediaDevices.getUserMedia(mediaConstraints);
        })
            .then(function (stream) {
                document.getElementById("received_video").srcObject = stream;
                return MyPeerConnection.addStream(stream);
            })
    };
    services.Interupted= function(){return PeerDisconnectedWhileInCall};

    //Cases that must be iterrupted -> User goes Offline,Rejects,Busy,UserA cancel the call

    //User who we were speaking with got offline
    services.checkifUsed = function(name){
        if(name === target) {
            PeerDisconnectedWhileInCall = true;
            console.log('Video has to close');
        }
    };

    //Global Variables of the call
    services.getTarget= function(){
        return target;
    };
    services.yourself= function(){
        return myself;
    };


    return services;
});

angular.module('Openhealth').service('WebsocketService', function (VideoServices, $timeout, $rootScope, FriendsAndState, $window) {
    var services = {};


    services.makeVideoCall = function (message) {
        message = JSON.stringify(message);
        ws.send(message);
    };
    services.InitWebsocket = function (){
            ws.onmessage = function (event) {
            //I have new message , change FriendsAndState service and inform about the cange
            try {
                var data = JSON.parse(event.data);
                console.log('Received Websocket message type ' + data.type);

                switch (data.type) {
                    case 'onlineUsers':
                        //console.log('my online friends are : ');
                        console.log(data.online);
                        for (var ii = 0; ii < data.online.length; ii++) {
                            console.log("Setting " + data.online[ii] + " to active");
                            FriendsAndState.changeState(data.online[ii], 'active');
                        }
                        break;
                    case 'UserGotOnline':
                        console.log('User joined : ' + data.name);
                        FriendsAndState.changeState(data.name, 'active');
                        // FriendsAndState.printFriends();
                        break;
                    case 'UserGotOffLine':
                        console.log('he left us : ' + data.name);
                        FriendsAndState.changeState(data.name, 'inactive');
                        VideoServices.checkifUsed(data.name);
                        $rootScope.$emit('Offline');
                        break;

                    //Cases for Video - WebRTC
                    case 'video-start':
                        VideoServices.setUsers(data.source, my_name);
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
                    case 'hang-up':

                        $rootScope.$emit('close-video');
                        VideoServices.closeVideo();
                        break;
                    case 'busy':
                        $rootScope.$emit('busy');
                        break;
                    case 'cancel':
                        $rootScope.$emit('cancel');
                        break;
                    default:
                        console.log('Unkown message');
                }
                $rootScope.$emit('WebsocketNews');
            }
            catch(e){
                console.log('error on Webserver');
            }
        }; };

    //Services responsible for event handling for Video functions

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

