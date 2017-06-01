/**
 * Created by timoskorres on 10/5/2017.
 */
var mainApp = angular.module("Openhealth", ['ngRoute', 'ngResource', 'ngMaterial']);

//Global variables
//
// var global = {
//     token:null,
//     ws:null,
//     my_name:null,
//     requests:null,
//     Pending:null,
//     caller:null
// };

var token; // Acces token given by Authorization Server
var ws; //Active websocket which connect Client - Server
var my_name; // User's username
var requests = []; // Requests that the user hasn't still answered
var Pending = []; // Requests that the user has send and haven't been accepted or rejected
var caller;


mainApp.run(function ($rootScope) {
    localStorage.clear();
});
mainApp.controller('Bar-controller', function (FriendsAndState, $scope, $window, $location) {
    if (token === undefined) {
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
mainApp.controller('Video-Controller', function ($rootScope,VideoServices, WebsocketService, $scope, $timeout) {
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
        },
        close: function(){
            console.log('pressed close');
            VideoServices.closeVideo();
            var message = {
                type:'hang-up',
                target:$scope.videoInfo.target
            };
            ws.send(JSON.stringify(message));
            $scope.videoInfo.status = 'closed';
            $scope.videoInfo.target ='';

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
        VideoServices.closeVideo();
        //define later what close Video is
    }
    $rootScope.$on('close-video',function(){
        console.log(' I am here');
        $scope.videoInfo.status = 'closed';
    }) ;

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
                document.getElementById("received_video").srcObject = stream;
                return myPeerConnection.addStream(stream);
            })
    });
    WebsocketService.videoOffer($scope, function () {
        alert('I have a video offer');
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
    });

});

mainApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.when('/index', {
            templateUrl: "Index/Index.html",
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

