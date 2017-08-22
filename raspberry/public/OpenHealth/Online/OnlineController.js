/**
 * Created by timos on 25/7/2017.
 */

var Online = angular.module('Online',[]);

angular.module('Online').service('FriendsAndState',function(){
    var friends = [];
    var Selected= null;
    return {
        getfriends: function () {
            return friends;
        },
        messageRead: function(username){
            for ( i = 0; i < friends.length; i++) {
                if(friends[i].username === username){
                    friends[i].unread =0;
                    break;
                }
            }
        },
        addfriends: function (name, state,unread) {
            var newUser = {
                username: name,
                state: state,
                unread: unread,
                category:null
            };
            friends.push(newUser);
        },
        newmessage:function(name){
            var i;
            for ( i = 0; i < friends.length; i++) {
                if(friends[i].username === name){
                    var times = friends[i].unread;
                    if(typeof times === 'number'){
                        times++;
                        friends[i].unread = times;
                    }
                    break;
                }
            }
        },
        printFriends: function () {
            for (var i = 0; i < friends.length; i++) {
                console.log(friends[i].username);
                console.log(friends[i].state);
            }
        },
        changeState: function (name, state) {

            for (var i = 0; i < friends.length; i++) {
                if (friends[i].username === name) {
                    friends[i].state = state;
                    break;
                }
            }
        },
        removefromlist:function(element){
            for(var i = 0; i < friends.length; i++) {
                if (friends[i].username === element) {
                    friends.splice(i, 1);
                    break;
                }
            }
            return friends;
        },
        memeber:function(name){
            for(var j = 0;j<friends.length;j++) {
                if (friends[j].username === name){
                    return true;
                }
            }
            return false;
        },
        getSelected:function(){
            return Selected;
        },
        setSelected:function(name){
            Selected = name;
        },
        clean: function () {
            friends = [];
        }
    }
});

angular.module('Online').service('AjaxServices',function(FriendsAndState, $http){
    var services = {};

    services.CancelRequest = function (name, callback) {
        var string = 'Bearer ' + token;
        $http({
            headers: {
                'Authorization': string
            },
            method: 'post',
            url: CloudHttpUrl+'/CancelRequest',
            data: {Cancelfrom: name}
        }).then(function successCallback(response) {
            callback(response.data);
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
            url: CloudHttpUrl+'/Pending'
        }).then(function successCallback(response) {
            // console.log(response.data);
            Pending = response.data;
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
            url: CloudHttpUrl+'/friendRequest',
            data: {message: message}
        }).then(function successCallback(response) {
            // console.log(response.data);
            callback(response.data.answer);
        },function errorCallback(response){
            console.log(response);
        })
    };
    services.GetRequests = function (callback) {
        var string = 'Bearer ' + token;
        $http({
            headers: {
                'Authorization': string
            },
            method: 'get',
            url: CloudHttpUrl+'/GetRequests'
        }).then(function succesCallback(response) {
            //   console.log(response.data);
            requests = response.data;
            callback();

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
            console.log(response.data)
        }
    };
    services.requestReply = function (name, type, callback) {
        var string = 'Bearer ' + token;
        var message = {
            sender: my_name,
            target: name,
            type: type
        };
        console.log(message);
        $http({
            headers: {
                'Authorization': string
            },
            method: 'post',
            url: CloudHttpUrl+'/requestReply',
            data: {message: message}
        }).then(function successCallback(response) {
            console.log(response.data);
            callback(response.data.message);
        })
    };
    services.GetFriends = function (callback) {
        var string = 'Bearer ' + token;
        $http({
            headers: {
                'Authorization': string
            },
            method: 'get',
            url: CloudHttpUrl+'/GetFriends'
        }).then(function successCallback(response) {
            callback(response.data);
        });
    };
    services.DeleteFriends = function(name,callback){
        var string = 'Bearer ' + token;
        $http({
            headers: {
                'Authorization': string
            },
            method: 'post',
            url: CloudHttpUrl+'/DeleteFriendship',
            data:{target:name}
        }).then(function successCallback(response) {
            console.log(response);
            callback(response);
        });
    };
    services.GetChat = function(username,callback){
        var string = 'Bearer ' + token;
        $http({
            headers: {
                'Authorization': string
            },
            method: 'get',
            url: CloudHttpUrl+'/messages',
            params:{target:username}
        }).then(function successCallback(response) {
            console.log(response);
            callback(response);
        });
    };
    services.DeleteMessage = function(uuid,target,callback){
        var string = 'Bearer ' + token;
        $http({
            headers: {
                'Authorization': string
            },
            method: 'delete',
            url: CloudHttpUrl+'/messages',
            params:{uuidUser:Myid,uuid:uuid,target:target}
        }).then(function successCallback(response) {
            console.log(response);
            callback(response);
        });
    };

    return {services: services};
});

angular.module('Online').service('VideoServices',function($rootScope){
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

    var target;  // Names of the users in call
    var myself;
    var target_id = -1; // Unique Id's to distinct multiple User's logged in the same Account
    var mine_id = -1;

    var MuteFlag = false;  //Flags used for making sure Video Calls use cases
    var Incall = false;
    var PeerDisconnectedWhileInCall = false;
    var busy ='';

    //Should get rid of those -> Problem with spd !!
    var i = 0;
    var flag = false;
    var j =1;
    var bufferIcecandidates =[];


    function handleICECandidateEvent(event) {
        if(!event || ! event.candidate || !MyPeerConnection )
            return;
        if (event.candidate || MyPeerConnection.Remo) {
            var message = {
                type: "new-ice-candidate",
                sourceId:mine_id,
                targetId: target_id,
                target: target,
                candidate: event.candidate
            };
            wsCloud.send(JSON.stringify(message));
        }
    }  // Functions needed by WebRTC PeerConnection ( Object's Fucntion )
    function closePeer(){
        target_id = -1; // Unique Id's to distinct multiple User's logged in the same Account
        mine_id = -1;
        if (MyPeerConnection)
            MyPeerConnection.close();
        MyPeerConnection = null;
        SDPCandiates = null;
        //reset flags
        PeerDisconnectedWhileInCall = false;
        PeerCancelledCall = false;
        MuteFlag = false;
        Incall = false;
        target = null;
        flag=false;
        i=0;
    }
    function handleNegotiationNeededEvent() {

        //Had a problem with multiple Video - offers -> Dirty way to hide it

        if ((flag === false) || i >= 1){
            console.log("In need for " + i);
            return;
        }
        i = i + 1;
        MyPeerConnection.createOffer().then(function (offer) {
            return MyPeerConnection.setLocalDescription(offer);
        })
            .then(function () {
                var  message = {
                    type: "video-offer",
                    source: myself,
                    target: target,
                    sourceId: mine_id,
                    targetId: target_id,
                    sdp: MyPeerConnection.localDescription
                };
                console.log(message);

                wsCloud.send(JSON.stringify(message));
            })
        //.catch(error);
    }
    function CloseVideo (){
        var remoteVideo = document.getElementById("received_video");
        var localVideo = document.getElementById("local_video");
        if (remoteVideo.srcObject) {
            console.log('Remote is killed');
            remoteVideo.srcObject.getAudioTracks()[0].stop();
            remoteVideo.srcObject.getVideoTracks()[0].stop();
            remoteVideo.srcObject.getTracks()[1].stop();
            remoteVideo.srcObject.getTracks()[0].stop();
            remoteVideo.srcObject = null;
        }
        if (localVideo.srcObject) {
            console.log('Local is killed');
            localVideo.srcObject.getAudioTracks()[0].stop();
            localVideo.srcObject.getVideoTracks()[0].stop();
            localVideo.srcObject.getTracks()[0].stop();
            localVideo.srcObject.getTracks()[1].stop();
            localVideo.srcObject = null;
        }
        closePeer();
        console.log('Ok video is closed');
    }
    function handleAddStreamEvent(event) { // It is called only when remote stream has arrived
        document.getElementById("received_video").srcObject = event.stream;
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
        CloseVideo();
        //define later what close Video is
    }
    function handleICEConnectionStateChangeEvent(event) {
        console.log('Ice Connection Change of State');
        if(MyPeerConnection) {
            switch (MyPeerConnection.iceConnectionState) {
                case "closed":
                    console.log('Closed State');
                    break;
                case "failed":
                    console.log('Failed State');
                    break;
                case "disconnected":
                    console.log('Disconnected State');
                    //CloseVideo();
                    $rootScope.$emit('Offline');

                    break;
            }
        }
    }



    services = {};   // Visible to the outside word function in order to set the object
    services.reset = function(){
        response=null;
        SDPCandiates=null;
        MyPeerConnection=null;
        var target=null;  // Names of the users in call
        var myself=null;
        target_id = -1; // Unique Id's to distinct multiple User's logged in the same Account
        mine_id = -1;
        MuteFlag = false;  //Flags used for making sure Video Calls use cases
        Incall = false;
        PeerDisconnectedWhileInCall = false;
        busy ='';
        i = 0;
        flag = false;
        j =1;
    };
    services.closeVideo = function(){
        console.log('ready to close video');
        CloseVideo();
    };
    services.addIceCandiate = function(IceCandidate) {
        if (MyPeerConnection.remoteDescription) {
            if (bufferIcecandidates.length > 0) { // Make sure Remote and Local Description have been set
                for (var candidates = 0; candidates < bufferIcecandidates.length; candidates++) {
                    MyPeerConnection.addIceCandidate(bufferIcecandidates[candidates]);
                    bufferIcecandidates.splice(candidates, 1);
                }
                MyPeerConnection.addIceCandidate(IceCandidate);
            }
            else {
                // alert(bufferIcecandidates.length);
                MyPeerConnection.addIceCandidate(IceCandidate);
            }
        }
        else {
            bufferIcecandidates.push(IceCandidate);
        }
    };
    services.IsInCall = function() {
        return Incall;
    };
    services.getPeer = function () {
        return !!MyPeerConnection; // Auto Changed by compiler
    };
    services.setPeer = function (string) {
        Incall = true;
        MyPeerConnection = null;
        MyPeerConnection = new RTCPeerConnection(configuration);
        //Set the stream based on what state you have been called
        switch(string) {
            case  'Caller' :
                navigator.mediaDevices.getUserMedia(mediaConstraints)
                    .then(function (localStream) {
                        document.getElementById("local_video").srcObject = localStream;
                        MyPeerConnection.addStream(localStream);
                    })
                    .catch(handleGetUserMediaError);
                break;
            case 'Callee':
                var localStream = null;
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
                            sourceId: mine_id,
                            targetId: target_id,
                            sdp: MyPeerConnection.localDescription
                        };
                        wsCloud.send(JSON.stringify(msg));
                    })
                    .catch(handleGetUserMediaError);
                break;
            default :
                console.log('Wrong type of parameter');
        }
        MyPeerConnection.onicecandidate = handleICECandidateEvent;
        MyPeerConnection.onaddstream = handleAddStreamEvent;
        // myPeerConnection.onremovestream = handleRemoveStreamEvent;
        MyPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
        //myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
        // myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
        MyPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    };
    services.SetSdp = function (sdp) {
        console.log('Spd was set');
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
    };
    services.ResetTarget = function(){
        target = null;
        target_id=-1;
        mine_id =-1;
    };
    services.setTargetId = function(CallerId){
        target_id = CallerId;
    };
    services.getTargetid = function(){
        return target_id;
    };
    services.setMyId = function(CallerId){
        mine_id = CallerId;
    };
    services.getMyid = function(){
        return mine_id;
    };
    services.setBusy = function(Busy){
        busy=Busy;
    };
    services.getBusy = function(){
        return busy;
    };

    //Cases that must be iterrupted -> User goes Offline,Rejects,Busy,UserA cancel the call

    services.checkifUsed = function(name){
        if(name === target) {
            PeerDisconnectedWhileInCall = true;
            console.log('Video has to close');
        }
        return PeerDisconnectedWhileInCall;
    };  //User who we were speaking with got offline
    services.getTarget= function(){   //Global Variables of the call
        return target;
    };
    services.yourself= function(){
        return myself;
    };

    return services;
});

angular.module('Online').service('WebsocketService',function(BiosignalService,BiosignalsOnlineServices,$mdToast,VideoServices,ChatServices, $timeout, $rootScope, FriendsAndState, $window){
    var services = {};
    services.makeVideoCall = function (message) {
        message = JSON.stringify(message);
        wsCloud.send(message);
    };
    services.InitWebsocket = function (){
        wsCloud.onmessage = function (event) {
            try {
                var data = JSON.parse(event.data);
                console.log('Received Websocket message type ' + data.type);
                switch (data.type) {

                    //General Purpose(Friend Requests -

                    case 'onlineUsers':
                        Myid = data.id;
                        for (var ii = 0; ii < data.online.length; ii++) {
                            FriendsAndState.changeState(data.online[ii], 'active');
                        }
                        $rootScope.$emit('WebsocketNews');
                        $rootScope.$emit('ShowView');
                        break;
                    case 'UserGotOnline':
                        FriendsAndState.changeState(data.name, 'active');
                        $rootScope.$emit('WebsocketNews');
                        break;
                    case 'UserGotOffLine':
                        FriendsAndState.changeState(data.name, 'inative');
                        var IstheTargetDisconnected = VideoServices.checkifUsed(data.name);                        //User got disconnected while still in call
                        if(IstheTargetDisconnected)
                            $rootScope.$emit('Offline');
                        $rootScope.$emit('WebsocketNews');
                        break;

                    // Friends and Requests Messages so we are in no need of polling

                    case 'NewRequest':{
                        requests.push(data.source);
                        $rootScope.$emit('UpdateRequest');
                        document.getElementById("RequestInfo").classList.add('md-warn');
                        break;
                    }
                    case 'RequestCancelled':{ // Get global Variable requests and remove this particular user
                        var i;
                        for(i=0;i<requests.length;i++){
                            if(requests[i] === data.source)
                                break;
                        }
                        requests.splice(i,1);
                        if(requests.length === 0)
                            document.getElementById("RequestInfo").classList.remove('md-warn');
                        $rootScope.$emit('UpdateRequest');
                        break;
                    }
                    case 'RequestReply':{
                        if(data.decision === 'reject') {
                        }
                        else if (data.decision === 'accept') {
                            var string = data.source + ' has accepted your Request';
                            showReason(string);
                            ChatServices.newfriend(data.source);                                        //Friend&State & Chat Room
                            FriendsAndState.addfriends(data.source,data.state,0);
                            $rootScope.$emit('WebsocketNews');
                        }
                        for (k = 0; k < Pending.length; k++) {
                            if (Pending[k] === data.source)
                                break;
                        }
                        Pending.splice(k, 1);
                        $rootScope.$emit('UpdateRequest');
                        break;
                    }
                    case 'NewFriend':{

                        ChatServices.newfriend(data.source);
                        FriendsAndState.addfriends(data.source,data.state,0);
                        $rootScope.$emit('WebsocketNews');
                        return;
                    }
                    case 'FriendDelete':{
                        FriendsAndState.removefromlist(data.source);
                        $rootScope.$emit('WebsocketNews');
                        break;
                    }

                    //Cases for Video - WebRTC

                    case 'video-start':
                        var peer = VideoServices.getPeer();
                        var message = {
                            type: 'busy',
                            target: data.source,
                            source: data.target,
                            sourceId: VideoServices.getMyid(),
                            targetId: data.sourceId
                        };
                        if(!peer) {
                            if(VideoServices.getTarget()) {
                                ws.send(JSON.stringify(message));
                            }
                            else {
                                VideoServices.setUsers(data.source, my_name);
                                VideoServices.setTargetId(data.sourceId);
                                VideoServices.setMyId(data.targetId);
                                $rootScope.$emit('Video-Start');
                            }
                        }
                        else {
                            ws.send(JSON.stringify(message));
                        }
                        break;
                    case 'video-response': // With video response we define if we accept call or reject it
                        VideoServices.setTargetId(data.sourceId);
                        VideoServices.setMyId(data.targetId);
                        VideoServices.SetResponse(data.answer);
                        $rootScope.$emit('Video-Response');
                        break;
                    case 'video-offer':
                        VideoServices.SetSdp(data.sdp);
                        $rootScope.$emit('Video-offer');
                        break;
                    case 'new-ice-candidate':
                        var candidate = new RTCIceCandidate(data.candidate);
                        VideoServices.addIceCandiate(candidate);

                        //Unhandled error
                        break;
                    case 'video-answer':   //Set SDP- candidates answer
                        VideoServices.SetSdp(data.sdp);
                        $rootScope.$emit('Video-answer');
                        break;
                    case 'hang-up':
                        $rootScope.$emit('close-video');
                        break;
                    case 'busy':
                        $rootScope.$emit('busy');
                        break;
                    case 'cancel':
                        if(!VideoServices.IsInCall() && VideoServices.getTarget() === data.source){
                            $rootScope.$emit('cancel');
                        }
                        else if(VideoServices.getTargetid() === data.sourceId){ // Just for safety reasons
                            $rootScope.$emit('cancel');
                        }
                        break;
                    case 'multipleUsers':{
                        MultpleUsersResult = data.result;
                        $rootScope.$emit('multipleUsers');
                        break;
                    }

                    // Chat App

                    case 'Chat' :{
                        ChatServices.NewMessage(data.source,data.data,data.source,data.uuid); // Username of Friend/Message/and Direction
                        FriendsAndState.newmessage(data.source);
                        $rootScope.$emit('NewMessage');
                        break;

                    }
                    case 'updateUuid':{
                        ChatServices.updateUuid(data.uuid,data.User);
                        break;
                    }
                    case 'NewMessageFromOtherAccount':{
                        ChatServices.NewMessage(data.User,data.info,'me',data.uuid);
                        $rootScope.$emit('NewMessage');
                        break;
                    }
                    case "messageToBeDeleted" :{
                        ChatServices.Delete(data.User,data.uuid);
                        $rootScope.$emit('NewMessage');
                        break;
                    }

                    case 'RequestBiosignals':
                        BiosignalsOnlineServices.setRequester(data.source,data.sourceId,data.range);
                        $rootScope.$emit('RequestBiosignals');
                        break;
                    default:
                        console.log('Unkown message');
                }
            }
            catch(e){
                console.log(e);
            }
        }; };


    function showReason(string){
        string = string.toUpperCase();
        $mdToast.show(
            $mdToast.simple()
                .textContent(string)
                .capsule(true)
                .position('top left')
        );
    }

    //Services responsible for event handling for Video functions

    services.RequestBiosignals = function($scope,callback){
        var handler = $rootScope.$on('RequestBiosignals',callback);
        $scope.$on('$destroy', handler);
    };
    services.UpdateRequest =function($scope,callback){
        var handler = $rootScope.$on('UpdateRequest',callback);
        $scope.$on('$destroy', handler);
    };
    services.ShowView =function($scope,callback){
        var handler = $rootScope.$on('ShowView',callback);
        $scope.$on('$destroy', handler);
    };
    services.Multiple = function($scope,callback){
        var handler = $rootScope.$on('multipleUsers',callback);
        $scope.$on('$destroy', handler);
    };
    services.refresh =       function (scope, callback) {
        var handler = $rootScope.$on('WebsocketNews', callback);
        scope.$on('$destroy', handler);

    };
    services.videostart =    function (scope, callback) {
        var handler = $rootScope.$on('Video-Start', callback);
        scope.$on('$destroy', handler);
    };
    services.videoresponse = function (scope, callback) {
        var handler = $rootScope.$on('Video-Response', callback);
        scope.$on('$destroy', handler);
    };
    services.videoOffer =    function (scope, callback) {
        var handler = $rootScope.$on('Video-offer', callback);
        scope.$on('$destroy', handler);
    };
    services.videoAnswer =   function (scope, callback) {
        var handler = $rootScope.$on('Video-answer', callback);
        scope.$on('$destroy', handler);
    };

    //Some functions frequently asked and must be implemented by Websocket

    services.sendData = function(Requester){
        var heartArray = [];
        var BloodArray = [];
        BiosignalService.OnlineServices.getHeart(Requester.range,function (result) {
            if (result.message === 'Ok') {
                heartArray = result.Result;
                BiosignalService.OnlineServices.getBloodSaturation(Requester.range,function(result){
                    if(result.message === 'Ok') {
                        BloodArray = result.Result;
                        var message = {
                            type: 'BiosingalAnswer',
                            target: Requester.requester,
                            source:my_name,
                            data:{
                                heart_rate:heartArray,
                                blood_saturation:BloodArray
                            },
                            targetId:Requester.Id
                        };
                        wsCloud.send(JSON.stringify(message))
                    }
                })
            }
        })
    };
    return services;
});

angular.module('Online').service('ChatServices',function($rootScope,FriendsAndState){

    var services = {};
    var ArraysofTexts= [];
    services.GetLength = function(username){
        var i;
      for(i=0;i<ArraysofTexts.length;i++) {
          if (ArraysofTexts[i].name === username) { // Find the particular User and save the Index
              break;
          }
      }
      var lenght =0;
      for(var j=0;j<ArraysofTexts[i].Chat.length;j++) {
          lenght++;
      }
    return lenght;
    };
    services.createArray = function() {
        var friends = FriendsAndState.getfriends();
        for (var i = 0; i < friends.length; i++) {
            var object = {
                name: friends[i].username,
                askedServer: false,
                Chat: []
            };
            ArraysofTexts.push(object);

        }
    };
    services.newfriend = function(username){
        var object = {
            name: username,
            Chat: []
        };

        ArraysofTexts.push(object);
    };
    services.SelectUser = function(username,callback){
        for(var i=0;i<ArraysofTexts.length;i++){
            if(ArraysofTexts[i].name === username) {
                return ArraysofTexts[i].Chat;
            }
        }
    };
    services.setFlag= function(username){
        for(var i=0;i<ArraysofTexts.length;i++){
            if(ArraysofTexts[i].name === username) {
                ArraysofTexts[i].askedServer = true;
                break;
            }
        }
    };
    services.getFlag= function(username){
        for(var i=0;i<ArraysofTexts.length;i++){
            if(ArraysofTexts[i].name === username) {
                return ArraysofTexts[i].askedServer;
            }
        }
    };
    services.Delete= function(username,uuid){
        var i;
        for(i=0;i<ArraysofTexts.length;i++) {
            if (ArraysofTexts[i].name === username) {
                break;
            }
        }
        for(var j=0;j<ArraysofTexts[i].Chat.length;j++){
            if(ArraysofTexts[i].Chat[j].uuid === uuid){
                ArraysofTexts[i].Chat.splice(j,1);
                break;
            }
        }
    };
    services.NewMessage = function(username,message,Sender,uuid){
        for(var i=0;i<ArraysofTexts.length;i++){
            if(ArraysofTexts[i].name === username) {
                var msg = {
                    message:message,
                    direction:Sender,
                    uuid:uuid
                };
                ArraysofTexts[i].Chat.push(msg);
                break;
            }
        }
    };
    services.updateUuid = function(uuid,username){
        var index;
        for(var i=0;i<ArraysofTexts.length;i++){
            if(ArraysofTexts[i].name === username) {
                index = i;
            }
        }
        ArraysofTexts[index].Chat[ArraysofTexts[index].Chat.length-1].uuid = uuid;

    };
    services.refresh =function (scope, callback) {
        var handler = $rootScope.$on('NewMessage', callback);
        scope.$on('$destroy', handler);

    };
    services.reset= function(){
        ArraysofTexts = [];
    };
    return services;
});

angular.module('Online').service('BiosignalsOnlineServices',function($rootScope,$http){
    var AcceptedUsers = [];
    var services = {};
    var Requester = {};
    services.setUsers = function(Arr){
        for(var i=0;i<Arr.length;i++){
            AcceptedUsers.push({username:Arr[i]})
        }
    };
    services.getUsers = function(){
        return AcceptedUsers;
    };
    services.IsInAcceptedUsers = function(username){
        for(var i=0;i<AcceptedUsers.length;i++){
                if(AcceptedUsers[i].username === username)
                    return true
        }
        return false
    };
    services.DeleteUser = function(username){
        for(var k=0;k<AcceptedUsers.length;k++){
            if(AcceptedUsers[k].username === username){
                AcceptedUsers.splice(k,1);
                break;
            }
        }
    };
    services.addtoAccepted = function(username){
        var newUser = {
            username:username
        };
        AcceptedUsers.push(newUser);
    };
    services.setRequester= function(requester,Id,range){
        Requester.requester = requester;
        Requester.Id = Id;
        Requester.range = range;
    };
    services.getRequester = function(){
        return Requester;
    };
    return services;
});

Online.service('RealTimeService',function(){
    var services = {};
    var Measurement ={
        heart:null,
        blood:null
    };
    services.getMeasurement = function(){
        return Measurement;
    };
    services.setMeasurement = function(heart,blood){
        Measurement.heart = heart;
        Measurement.blood = blood;
    };
    return services;

});


Online.controller('OnlineCtrl',function($q,$location,GlobalVariables,SettingService,VideoServices,BiosignalsOnlineServices,FriendsAndState,ChatServices,$mdDialog,WebsocketService,AjaxServices,$scope,$http,$mdToast,$location,$rootScope,$timeout){

    $scope.ready = false ;          // Flag when everything is set up
    $scope.functions ={
        showResult: function (string) {
            string = string.toUpperCase();
            $mdToast.show(
                $mdToast.simple()
                    .textContent(string)
                    .capsule(true)
                    .position('top left')
            )
        },
        getAcceptedUsers:function(callback){
            $http({
                method:'get',
                url:'/biosignal/AcceptedUsers',
                params:{myself:my_name}
            }).then(function successCallback(response){
                if(response.data.message ==='Ok') {
                    callback(response.data.users);
                }
            })
        },
        Login: function(){
            if(GlobalVariables.getSubscribe()){
                if (!token) {
                    $scope.functions.getAcceptedUsers(function (result) {
                        BiosignalsOnlineServices.setUsers(result);

                    $http({
                        method: 'post',
                        url: CloudHttpUrl + '/login',
                        data: {
                            grant_type: 'password',
                            client_id: 'myApp',
                            client_secret: 'hmmy1994',
                            username: GlobalVariables.getUsername(),
                            password: GlobalVariables.getPassword(),
                            category: 'RaspberryUser'
                        }
                    }).then(
                        function SuccessCallback(response) {
                            if (response.data.access_token) {
                                token = response.data.access_token;
                                AjaxServices.services.GetFriends(function (response) {
                                    for (var i = 0; i < response.length; i++) {
                                        FriendsAndState.addfriends(response[i], 'inactive', 0);
                                    }
                                    ChatServices.createArray();
                                    wsCloud = new WebSocket(CloudWebsocketUrl);
                                    WebsocketService.InitWebsocket();
                                    wsCloud.onopen = function InitWebsocket(e) {
                                        message = {
                                            type: 'init',
                                            token: token
                                        };
                                        wsCloud.send(JSON.stringify(message));
                                    };
                                    deamon();
                                    GlobalVariables.SetIsonline(true);
                                    $scope.UserOnline.Online = true;
                                    $scope.ready = true;
                                });
                            }
                        },
                        function errorCallback(response) {
                            console.log(response);
                        })
                    });
                }
            }
            else
                $scope.UserInformation.FirstTimeOnline = true;
        },   // Something like Login
        SetUsername:function(username,password,callback){
            $http({
                method:'post',
                url:  CloudHttpUrl+'/subscribe',
                data :{
                    grant_type: 'password',
                    client_id: 'myApp',
                    client_secret: 'hmmy1994',
                    username: username,
                    password: password,
                    category:'RaspberryUser',
                    email:'Invalid'
                }
            }).then(function successCallback(response){
                    if (response.data.code === 11000) {
                        //Username Already exists
                        $scope.functions.showResult('Username already Exists');
                    }
                    else{               // (1) Save Username and Password
                        $http({
                            method:'post',
                            url:'/online',
                            data:{
                                username:username,
                                password:password,
                                way:'auto'
                            }
                        }).then(function successCallback(res){
                            if(res.data.message === 'Ok') {
                                if(response.data.access_token) { // We save the UserInfo && token after Saving
                                    token = response.data.access_token;
                                    my_name = username;
                                    $rootScope.$broadcast('IsOnLine');

                                    ChatServices.createArray();
                                    GlobalVariables.SetIsonline(true);
                                    $scope.UserOnline.Online = true;
                                    $scope.ready = true;
                                    wsCloud = new WebSocket(CloudWebsocketUrl); // Open a 2nd websocket to the Cloud Server
                                    WebsocketService.InitWebsocket();
                                    wsCloud.onopen = function InitWebsocket(e) {
                                        message = {
                                            type: 'init',
                                            token: token
                                        };
                                        wsCloud.send(JSON.stringify(message));
                                    };
                                    SettingService.setWayOfLogin('Automatic Login');
                                    $rootScope.$broadcast('Subsrcibed');
                                    $scope.UserInformation.FirstTimeOnline = false; // Close Subsribe page & open Normal Page
                                    GlobalVariables.setFirstTime(false);
                                }
                            }
                        },function errorCallback(res){
                            console.log(res);
                        })
                    }
                },
                function errorCallback(response) {
                    console.log(response);
                })
        } ,  // Something like Subscribe
        ManualLogin:function(){
            $rootScope.$broadcast('IsOnLine');
            GlobalVariables.SetIsonline(true);
            $scope.functions.Login();
        },
        SelectedUser :function (username) {
            FriendsAndState.messageRead(username);
            $scope.UserOnline.friends = FriendsAndState.getfriends();
            $scope.UserOnline.Selected = username;
            ChatUser = username;
            FriendsAndState.setSelected(username);
            $rootScope.$emit('NewMessage'); //?
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
    };              //General Functions
    $scope.UserInformation = {
        FirstTimeOnline:false,
        username:null,
        password:null,
        SendRequest:function(){
            if($scope.UserInformation.username && $scope.UserInformation.password){
                $scope.functions.SetUsername($scope.UserInformation.username,$scope.UserInformation.password);
            }
        }
    };      //Information About User && First Login
    $scope.delete = function () {
        var confirm = $mdDialog.confirm()
            .clickOutsideToClose(true)
            .title('Confirm')
            .textContent('Are you sure you want to delete ' + $scope.UserOnline.Selected + ' ? ')
            .ariaLabel()
            .openFrom('#left')
            .closeTo(angular.element(document.querySelector('#right')))
            .ok('Yes I am ')
            .cancel('No');

        $mdDialog.show(confirm).then(
            function () {
                //Delete users
                AjaxServices.services.DeleteFriends($scope.UserOnline.Selected, function (result) {
                    if(result.data.message === 'Ok') {
                        for (var i = 0; i < $scope.UserOnline.friends.length; i++) {
                            if ($scope.UserOnline.friends[i].username === $scope.UserOnline.Selected) {
                                $scope.UserOnline.friends.splice(i, 1);
                                break;
                            }
                        }
                        $scope.UserOnline.Selected = '';
                    }
                })
            },
            function () {
                //Nothing happened, users cancelled his request
            });

    };   // Delete a Friends
    $scope.UserOnline = {
        friends: [],
        Selected:'',
        WayOfLogin:null,
        Online: false
    };  // Friends of User And WayOfLogin selected of console
    $scope.autocomplete ={
        checkOnline:function(){
            console.log('summoned');
            var deferred = $q.defer();
            if($scope.RequestsSent.target){
                $http({
                    method:'post',
                    url: CloudHttpUrl+'/autocomplete',
                    data:{
                        input:$scope.RequestsSent.target
                    }
                }).then(function succesCallback(response){
                        if(response.data.message ==='Ok') {
                            deferred.resolve(response.data.Result);
                        }
                    },
                    function errorCallback(response){
                        deferred.reject([]);
                    })
            }
            return deferred.promise;
        }
    }; // Returns a promise which is later resolved

    // Requests functions

    $scope.removeClass= function () {
        document.getElementById('RequestInfo').classList.remove('md-warn');
    };
    $scope.RequestsSent={

        //These are about sending new requests
        target: null,
        sendRequest: function () {
            if ($scope.RequestsSent.target) {
                AjaxServices.services.FriendRequest($scope.RequestsSent.target, function (result) {
                    $scope.RequestsSent.showResult(result);
                    $scope.RequestsSent.checkPending();
                });
            }
        },
        showResult: function (string) {
            string = string.toUpperCase();
            $mdToast.show(
                $mdToast.simple()
                    .textContent(string)
                    .capsule(true)
                    .position('top left')
            )

        },

        //How to deal with requests already sent

        sent: [],
        checkPending: function () {
            AjaxServices.services.PendingRequests(function () {
                $scope.RequestsSent.sent = Pending;
            })
        },
        cancel: function (name) {
            AjaxServices.services.CancelRequest(name, function (reply) {
                if (reply.message === 'Ok') {
                    $scope.RequestsSent.sent = deleteFromList($scope.RequestsSent.sent, name);
                    Pending = $scope.RequestsSent.sent;
                }
                else {
                    $scope.RequestsSent.showResult(reply.message);

                }
            })
        }


    };
    $scope.RequestsReceived = {
        Received: [],
        checkRequests: function () {
            AjaxServices.services.GetRequests(function () {
                if(requests.length >0)
                    document.getElementById("RequestInfo").classList.add('md-warn');
                $scope.RequestsReceived.Received = requests;
            });
        },
        accept: function (name) {
            AjaxServices.services.requestReply(name, 'accept', function (reply) {
                if (reply === 'Ok') {
                    $scope.RequestsReceived.Received = deleteFromList($scope.RequestsReceived.Received, name);
                    requests = $scope.RequestsReceived.Received;
                }

            })
        },
        reject: function (name) {
            AjaxServices.services.requestReply(name, 'reject', function (reply) {
                if (reply === 'Ok') {
                    $scope.RequestsReceived.Received = deleteFromList($scope.RequestsReceived.Received, name);
                    requests = $scope.RequestsReceived.Received;
                }
            });
        }
    };
    function deamon() {
        if (token !== undefined) {
            $scope.RequestsSent.checkPending();
            $scope.RequestsReceived.checkRequests();
        }
    }

    WebsocketService.refresh($scope,function(){
        $scope.UserOnline.friends = FriendsAndState.getfriends();
        if(!FriendsAndState.memeber($scope.UserOnline.Selected)){
            $scope.UserOnline.Selected='';
        }
        if (!$scope.$$phase) {
            $scope.$apply();
        }
        //Must update now the Pending requests
    });
    WebsocketService.ShowView($scope,function(){
        $scope.UserOnline.friends = FriendsAndState.getfriends();
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    });
    WebsocketService.UpdateRequest($scope, function () {
        $scope.RequestsReceived.Received = requests;
        $scope.RequestsSent.sent = Pending;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    });
    WebsocketService.RequestBiosignals($scope,function() {
        var Requester = BiosignalsOnlineServices.getRequester();
        if (!BiosignalsOnlineServices.IsInAcceptedUsers(Requester.requester)) { // User is 'unknown'
                var confirm = $mdDialog.confirm()
                    .clickOutsideToClose(false)
                    .title('Confirm')
                    .textContent(Requester.requester + ' is requesting for your Biosignals and he is not in your List. Accept?')
                    .ariaLabel()
                    .openFrom('#left')
                    .closeTo(angular.element(document.querySelector('#right')))
                    .ok('Yes I am ')
                    .cancel('No');
                $mdDialog.show(confirm).then(
                    function () {  //(A) Save the User to db
                        $http({
                            url: '/biosignal/AcceptedUsers',
                            method: 'post',
                            data: {
                                myself: my_name,
                                user: Requester.requester
                            }
                        }).then(function successCallback(response) {
                            if (response.data.message === 'Ok') {
                                BiosignalsOnlineServices.addtoAccepted(Requester.requester);
                                $rootScope.$emit('Accepted');
                                WebsocketService.sendData(Requester);
                            }
                        }, function errorCallback(response) {

                        })
                    },
                    function () {
                        //Nothing happened, users cancelled his request
                    });
            }
            else { // User is accepted - send the data without Asking the User
                WebsocketService.sendData(Requester);
            }
    });

    function InitOnline(){
        //SUbscribed User
        if(GlobalVariables.getSubscribe()) {

            if (SettingService.getWayOfLogin() === 'Automatic Login' && !GlobalVariables.GetIsonline()) {

                $scope.functions.Login();     // Check if User has been subscribed
            }
            if (GlobalVariables.GetIsonline()) {
                $scope.UserOnline.friends = FriendsAndState.getfriends();
                if (FriendsAndState.getSelected())
                    $timeout(function () {
                        $scope.functions.SelectedUser(FriendsAndState.getSelected());
                    }, 5);
                $scope.UserOnline.Online = true;
                $scope.ready = true;
            }
            else {
                $scope.UserOnline.Online = false;
                $scope.ready = true;
            }
        }
        //Unsubscribed User
        else{
            $scope.UserInformation.FirstTimeOnline =   GlobalVariables.getFirstTime();
            $scope.ready = true;
        }

        if (!$scope.$$phase) {
            $scope.$apply();
        }
    }

    $timeout(InitOnline,10);

    $rootScope.$on('AutoLogin',$scope.functions.Login);


});

Online.controller('Video-Controller', function ($rootScope,RealTimeService, Websocket,VideoServices, WebsocketService, $scope, $timeout) {
    function closeScreen() {
        $scope.videoInfo.HowVideoWasClosedFlag = false;
        $scope.videoInfo.status = 'Closed';  // Next time call is began do not show buttons by default
        $scope.videoInfo.Type = null;
        $scope.videoInfo.InCall = false;
        $scope.videoInfo.target = '';
    }


    $scope.videoInfo = {
        HowVideoWasClosedFlag: false,   // The only use of this Flag is to determine when Video Screen must be closed
        target: '',
        status: 'Closed',
        message: '',
        Type: null, //options are icnoming,outgoing
        InCall: false,
        closeScreen: function () {
            closeScreen();
        },
        call: function (username) {
            if ($scope.videoInfo.status === 'Closed') { // Safety reason, user can't start calling while he is in a call
                $scope.videoInfo.Type = 'Outgoing';
                $scope.videoInfo.target = username; // Keep this info avaialable through calling proccess :)
                $scope.videoInfo.HowVideoWasClosedFlag = true;
                var message = {
                    type: 'video-start',
                    source: my_name,
                    target: username
                };
                WebsocketService.makeVideoCall(message);
                $scope.videoInfo.status = 'open';
                $scope.videoInfo.message = 'Calling ' + username;
            }
        },
        acceptCall: function () {
            $scope.videoInfo.message = '';
            var message = {
                type: 'video-response',
                target: VideoServices.getTarget(),
                source: my_name,
                answer: 'yes',
                sourceId: VideoServices.getMyid(),
                targetId: VideoServices.getTargetid()
            };
            $scope.videoInfo.message = '';
            wsCloud.send(JSON.stringify(message));
            $scope.videoInfo.InCall = true;
        },
        rejectCall: function () {
            var message = {
                type: 'busy',
                target: VideoServices.getTarget(),
                source: my_name,
                sourceId: VideoServices.getMyid(),
                targetId: VideoServices.getTargetid()
                // No User Id here we want to inform all users
            };
            wsCloud.send(JSON.stringify(message));
            VideoServices.ResetTarget();
            closeScreen();
        },
        cancelCall: function () {
            var message = {
                type: 'cancel',
                target: $scope.videoInfo.target,
                source: my_name
            };
            VideoServices.ResetTarget();
            closeScreen();
            wsCloud.send(JSON.stringify(message));
        },
        hangUp: function () {
            //Send message to other Peer to inform screen
            var message = {
                type: 'hang-up',
                target: VideoServices.getTarget(),
                sourceId: VideoServices.getMyid(),
                targetId: VideoServices.getTargetid()
            };
            wsCloud.send(JSON.stringify(message));
            VideoServices.closeVideo();
            closeScreen();
        }
    };  // Information shown in Video View


    //Event handlers when new message arrives from Websockets

    $rootScope.$on('close-video', function () {
        $scope.videoInfo.Type = 'Closed';
        $scope.videoInfo.InCall = false;
        $scope.videoInfo.message = 'Call Ended ';
        VideoServices.closeVideo();
        $scope.$apply();
        $timeout(function () {
                if ($scope.videoInfo.HowVideoWasClosedFlag === false)
                    closeScreen()
            }
            ,5000);
    });
    $rootScope.$on('busy', function () {
        $scope.videoInfo.message = 'Sorry ' + $scope.videoInfo.target + ' is busy!';
        $scope.videoInfo.Type = 'Closed';
        $scope.$apply();
        $scope.videoInfo.HowVideoWasClosedFlag = false;
        $timeout(function () {
                if ($scope.videoInfo.HowVideoWasClosedFlag === false)
                    closeScreen()
            }
            , 5000);
    });
    $rootScope.$on('cancel', function () {
        $scope.videoInfo.Total = false;
        $scope.videoInfo.message = VideoServices.getTarget() + ' has closed his phone';
        $scope.videoInfo.Type = 'Closed';
        $scope.$apply();
        VideoServices.ResetTarget();
        $timeout(closeScreen, 3000);
    });
    $rootScope.$on('Offline', function () {
        $scope.videoInfo.Type = 'Closed';
        $scope.videoInfo.InCall = false;
        $scope.videoInfo.message = VideoServices.getTarget() + " was disconected";
        $scope.$apply();
        VideoServices.closeVideo();
        $timeout(function () {
                if ($scope.videoInfo.HowVideoWasClosedFlag === false)
                    closeScreen()
            }
            , 5000);
    }); //User disconnected from Server


    WebsocketService.videostart($scope, function () {
        var peer = VideoServices.getPeer();
        if (!peer && $scope.videoInfo.target === '') {                                  // Extra safety it has already beeing checked
            $scope.videoInfo.Type = 'Incoming';     // Only show accept-reject buttons if the user is receiving data
            $scope.videoInfo.status = 'open';
            $scope.videoInfo.message = VideoServices.getTarget() + " is calling";
            $scope.videoInfo.HowVideoWasClosedFlag = true;

        }
        else { //User already is calling other user,inform the other user
            var message = {
                type: 'busy',
                sourceId: VideoServices.getMyid(),
                targetId: VideoServices.getTargetid(),
                target: VideoServices.getTarget(),
                source: my_name
            };
            ws.send(JSON.stringify(message));
            VideoServices.ResetTarget();
        }
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    });
    WebsocketService.videoresponse($scope, function () {
        //Video start here
        if (VideoServices.getPeer())
            alert("Can't start a new video during a call");
        else {
            VideoServices.setUsers($scope.videoInfo.target, my_name);
            //Let the service know the two User calling each other
            VideoServices.setPeer('Caller');
            $scope.videoInfo.InCall = true;
            $scope.videoInfo.message = '';
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
    });
    WebsocketService.videoAnswer($scope, function () {
        VideoServices.SetAnswer();
    });
    WebsocketService.videoOffer($scope, function () {
        VideoServices.setPeer('Callee');
        $scope.videoInfo.Incall = true;

    });
    WebsocketService.Multiple($scope, function () {
        $scope.videoInfo.Type = 'Closed';
        if (MultpleUsersResult === 'yes')
            $scope.videoInfo.message = 'Answered on another Device';
        else
            $scope.videoInfo.message = 'Cancelled by another Device';
        $scope.$apply();
        VideoServices.ResetTarget();

        $timeout(closeScreen, 4000);
    });

    //Real Time show  Measurements functions
    $scope.RealTime ={
        blood:0,
        heart:0,
        show:false,
        hide:function(){
            $scope.RealTime.show = false;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        },
        dataRefresh:function(blood,heart){
          $scope.RealTime.blood = blood.y;
          $scope.RealTime.heart = heart.y;
          $scope.RealTime.show = true;
          if (!$scope.$$phase) {
              $scope.$apply();
          }
        }
    };
    Websocket.NewMeasurement($scope,function(){
        if(VideoServices.getTarget() && VideoServices.IsInCall()) {
            var data = RealTimeService.getMeasurement();
            var message = {
                type: 'RealTime',
                source: my_name,
                targetId: VideoServices.getTargetid(),
                target:VideoServices.getTarget(),
                data: data
            };
            $scope.RealTime.dataRefresh(data.blood,data.heart);
            wsCloud.send(JSON.stringify(message));
        }
    });


});

Online.controller('ChatController', function (AjaxServices,ChatServices,$mdDialog, $timeout, $scope) {



    //Trial Chat Controller
    $scope.messages = {
        currentMessage: '',
        arrayofMessages: [],
        SelectedUser: '',
        Flag:false,
        addText: function (Someone) {
            console.log($scope.messages.currentMessage);
            $scope.messages.SelectedUser = Someone;
            if ($scope.messages.currentMessage !== '') {
                ChatServices.NewMessage(Someone, $scope.messages.currentMessage, 'me', null);
                $scope.messages.arrayofMessages = ChatServices.SelectUser(Someone);
                var message = {                                     //Send the message back to server
                    type: 'Chat',
                    target: Someone,
                    data: $scope.messages.currentMessage,
                    source: my_name
                };
                wsCloud.send(JSON.stringify(message));
            }
            $scope.messages.currentMessage = '';
            $scope.scrollDown();
        },
        show: function (uuid) {

            AjaxServices.services.DeleteMessage(uuid, ChatUser, function (response) {
                //Update the messages
                console.log(response);
                if (response.data.message === 'Message was deleted') {
                    ChatServices.Delete(ChatUser, uuid);
                    $scope.messages.arrayofMessages = ChatServices.SelectUser(ChatUser);
                }
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
                $scope.scrollDown();

            });
        },
        mouseEnter:function(uuid){

        },
        mouseLeave:function(){
        }
    };
    $scope.scrollDown = function(){
        var mydiv =$('#mydiv');
        mydiv.stop().animate({
            scrollTop: mydiv[0].scrollHeight
        }, 100);
    };
    ChatServices.refresh($scope, function () {
        console.log('Wtf?');
        $scope.messages.arrayofMessages = ChatServices.SelectUser(ChatUser);
        //Ask from Server if empty array
        if ($scope.messages.arrayofMessages) {
            if (ChatServices.getFlag(ChatUser) ===false  ) {
                console.log('Going to ask Chat from: ' + ChatUser);
                AjaxServices.services.GetChat(ChatUser, function (result) {
                    var SavedMessages = result.data.message;
                    for (var i = 0; i < SavedMessages.length; i++) {
                        ChatServices.NewMessage(ChatUser, SavedMessages[i].message, SavedMessages[i].direction, SavedMessages[i].uuid);
                    }
                    $scope.messages.arrayofMessages = ChatServices.SelectUser(ChatUser);
                    ChatServices.setFlag(ChatUser);
                    $scope.scrollDown();
                });
            }
        }

        if (!$scope.$$phase) {
            $scope.$apply();
        }
        $scope.scrollDown();
    });
    $scope.Dialog={
        status :'',
        showConfirm : function(uuid) {
        var confirm = $mdDialog.confirm()
            .title('Would you like to delete the message?')
            .textContent('If you delete the message you will not be able to recover it.')
            .ariaLabel('Lucky day')
            .ok('Yes')
            .cancel('No');

        $mdDialog.show(confirm).then(function() {
            $scope.messages.show(uuid);
        }, function() {
        });
        }
    };

    $(document).ready(function(){
        $('#TextBoxId').keypress(function(e){
            if(e.keyCode===13) {
                $('#linkadd').click();
            }
        });
    });
});

//Some global functions
function deleteFromList(list, element) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] === element) {
            list.splice(i, 1);
            break;
        }
    }
    return list;
}

