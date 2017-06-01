/**
 * Created by timoskorres on 10/5/2017.
 */
var mainApp = angular.module("Openhealth", ['ngRoute', 'ngResource', 'ngMaterial']);

//Global variables

var token; // Acces token given by Authorization Server
var ws; //Active websocket which connect Client - Server
var my_name; // User's username
var requests = []; // Requests that the user hasn't still answered
var Pending = []; // Requests that the user has send and haven't been accepted or rejected
var caller;

mainApp.service('FriendsAndState', function () {
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
mainApp.service('AjaxServices', function (FriendsAndState, $http) {
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
mainApp.service('VideoServices', function () {
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

    function handleICECandidateEvent(event) {
        if (event.candidate) {
            console.log("Is the mistake here man ");
            var message = {
                type: "new-ice-candidate",
                target: caller,
                candidate: event.candidate
            };
            ws.send(JSON.stringify(message));
        }
    }

    function handleNegotiationNeededEvent(event) {

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
mainApp.service('WebsocketService', function (VideoServices, $timeout, $rootScope, FriendsAndState, $window) {
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
            console.log(data.type);
            switch (data.type) {
                case 'onlineUsers':
                    console.log('my online friends are : ');
                    // console.log(data.online);
                    // console.log(data.online.length);
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
                    console.log("ICE Candidates have began");
                    var candidate = new RTCIceCandidate(msg.candidate);
                    myPeerConnection.addIceCandidate(candidate);
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
mainApp.run(function ($rootScope) {
    localStorage.clear();
});
mainApp.controller('Bar-controller', function (FriendsAndState, $scope, $window, $location) {
    if (token == undefined) {
        $location.path('login');
    }
    else {
        $scope.go = {
            check: function () {
                window.localStorage.removeItem('token');
                localStorage.clear();
                ws.close();
                FriendsAndState.clean();
                $location.path('login');

            }
        }
    }
});
mainApp.controller('Video-Controller', function (VideoServices, WebsocketService, $scope, $timeout) {
    $scope.videoInfo = {
        target: '',
        video_lengt: '',
        video_status: '',
        status: 'closed',
        message: '',
        call: function (username) {
            $scope.videoInfo.target = username; // Keep this info avaialable through time :)
            caller = username;
            var message = {
                type: 'video-start',
                source: my_name,
                target: username
            };
            WebsocketService.makeVideoCall(message);
            $scope.videoInfo.status = 'open';
            $scope.videoInfo.message = 'Calling ' + username + " ...";
        },
        acceptCall: function (name) {
            // console.log("Accepting calls");
            $scope.videoInfo.target = name;
            var message = {
                type: 'video-response',
                target: name,
                source: my_name,
                answer: 'yes'
            };
            console.log(message);
            ws.send(JSON.stringify(message));
        },
        rejectCall: function (name) {
            // console.log("Rejecting calls");
            var message = {
                type: 'video-response',
                target: name,
                source: my_name,
                answer: 'no'
            };
            console.log(message);
            ws.send(JSON.stringify(message));
        }
    };
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
        closeVideoCall();
        //define later what close Video is
    }

    //define a dialog to promt user to answer or reject and then hide it
    WebsocketService.videostart($scope, function () {
        var video = document.getElementById('draggable');
        $scope.videoInfo.status = 'open';
        $scope.videoInfo.message = caller + "";
    });
    WebsocketService.videoresponse($scope, function () {
        var decide = VideoServices.Response();
        if (decide === 'no') {
            $scope.videoInfo.message = 'Busy ...';
            $timeout(function () {
                $scope.videoInfo.status = 'closed';
            }, 4000)
        }
        else if (decide === 'yes') {
            $scope.videoInfo.message = '';
            //Start sending candidates
            if (VideoServices.getPeer()) {
                console.log("Can't start a new video during a call");
            }
            else {
                var myPeerConnection = VideoServices.setPeer();
                navigator.mediaDevices.getUserMedia(VideoServices.getMedia())
                    .then(function (localStream) {
                        document.getElementById("local_video").srcObject = localStream;
                        myPeerConnection.addStream(localStream);
                    })
                    .catch(handleGetUserMediaError);
            }
            VideoServices.RefreshPeer(myPeerConnection);
        }
    });
    WebsocketService.videoAnswer($scope, function () {
        var myPeerConnection = VideoServices.getPeer();
        console.log(VideoServices.GetSdp());
        var desc = new RTCSessionDescription(VideoServices.GetSdp());
        myPeerConnection.setRemoteDescription(desc).then(function () {
            return navigator.mediaDevices.getUserMedia(VideoServices.getMedia());
        })
            .then(function (stream) {
                localStream = stream;
                document.getElementById("local_video").srcObject = localStream;
                return myPeerConnection.addStream(localStream);
            })

    });
    WebsocketService.videoOffer($scope, function () {
        var localStream = null;
        var myPeerConnection = VideoServices.setPeer();
        var desc = new RTCSessionDescription(VideoServices.GetSdp());

        myPeerConnection.setRemoteDescription(desc).then(function () {
            return navigator.mediaDevices.getUserMedia(VideoServices.getMedia());
        })
            .then(function (stream) {
                localStream = stream;
                document.getElementById("local_video").srcObject = localStream;
                return myPeerConnection.addStream(localStream);
            })
            .then(function () {
                return myPeerConnection.createAnswer();
            })
            .then(function (answer) {
                return myPeerConnection.setLocalDescription(answer);
            })
            .then(function () {
                var msg = {
                    source: my_name,
                    target: $scope.videoInfo.target,
                    type: "video-answer",
                    sdp: myPeerConnection.localDescription
                };
                ws.send(JSON.stringify(msg));
                //Save variable at the VideoServices
                VideoServices.RefreshPeer(myPeerConnection);
            })
            .catch(handleGetUserMediaError);
    })
});

mainApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.when('/index', {
            templateUrl: "Index/Index.html",
            controller: 'indexController'
        }).when('/add', {
            templateUrl: "Friends/Friends.html",
            controller: 'addController'
        }).when('/subscribe', {
            templateUrl: "Subscribe/Subscribe.html",
            controller: 'SubscribeController'
        })
        .when('/show', {
            templateUrl: "Requests/Requests.html",
            controller: 'RequestController'
        })
        .when('/login', {
            templateUrl: "Login/Login.html"
        }).otherwise({
        redirectTo: '/login'
    });
    }]);

