
angular.module('Openhealth').service('FriendsAndState',function(){
    var friends = [];
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
            console.log(unread+' messages from: '+name);
            var newUser = {
                username: name,
                state: state,
                unread: unread
            };
            console.log(typeof newUser.unread);
            friends.push(newUser);
        },
        newmessage:function(name){
            var i;
            console.log("Let's see the problem");
            for ( i = 0; i < friends.length; i++) {
                if(friends[i].username === name){
                    console.log("Ok found the User");
                    var times = friends[i].unread;
                    console.log(typeof times);
                        if(typeof times === 'number'){
                            console.log('Ok it has increased since then');
                            times++;
                            friends[i].unread = times;
                        }
                    break;
                }
            }
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
            for (var i = 0; i < friends.length; i++) {
                if (friends[i].username === name) {
                    friends[i].state = state;
                }
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
        memeber:function(name){
            for(var j = 0;j<friends.length;j++) {
                if (friends[j].username === name){
                    return true;
                }
            }
                return false;
        },
        clean: function () {
            friends = [];
        }
    }
});

angular.module('Openhealth').service('AjaxServices',function(FriendsAndState, $http){
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
            url: 'Pending'
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
            url: 'friendRequest',
            data: {message: message}
        }).then(function successCallback(response) {
            console.log(response.data);
            callback(response.data.answer);
        })
    };
    services.GetRequests = function (callback) {
        var string = 'Bearer ' + token;
        $http({
            headers: {
                'Authorization': string
            },
            method: 'get',
            url: 'GetRequests'
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
            url: 'requestReply',
            data: {message: message}
        }).then(function successCallback(response) {
            console.log(response.data);
            callback(response.data.message);
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
        }).then(function successCallback(response) {
            console.log("Friends of User are  : " + response.data);
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
            url: 'DeleteFriendship',
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
            url: 'messages',
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
            url: 'messages',
            params:{uuidUser:Myid,uuid:uuid,target:target}
        }).then(function successCallback(response) {
            console.log(response);
            callback(response);
        });
    };

    return {services: services, requests: requests};
});

angular.module('Openhealth').service('VideoServices',function($rootScope){
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

    function handleICECandidateEvent(event) {
        if (event.candidate) {
            j++;
            var message = {
                type: "new-ice-candidate",
                sourceId:mine_id,
                targetId: target_id,
                target: target,
                candidate: event.candidate
            };
            ws.send(JSON.stringify(message));
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
        console.log('Sending negotiation Messages');
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

                ws.send(JSON.stringify(message));
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
        console.log("Received incoming stream");
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
    services.addIceCandiate = function(IceCandidate){
        MyPeerConnection.addIceCandidate(IceCandidate);
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
                        ws.send(JSON.stringify(msg));
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

angular.module('Openhealth').service('ChatServices',function($rootScope,FriendsAndState){

    var services = {};
    var ArraysofTexts= [];
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
        console.log('New friend was added');
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
                if(Sender  !== 'me')
                    console.log(msg);
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
        console.log(  ArraysofTexts[index].Chat[ArraysofTexts[index].Chat.length-1]);
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

angular.module('Openhealth').service('WebsocketService',function($mdToast,VideoServices,ChatServices, $timeout, $rootScope, FriendsAndState, $window){
    var services = {};
    services.makeVideoCall = function (message) {
        message = JSON.stringify(message);
        ws.send(message);
    };
    services.InitWebsocket = function (){
            ws.onmessage = function (event) {
            try {
                var data = JSON.parse(event.data);
                if(data.type !== 'update')
                    console.log('Received Websocket message type ' + data.type);
                switch (data.type) {

                    //General Purpose(Friend Requests -

                    case 'onlineUsers':
                        console.log('Online Users : ');
                        console.log(data.online);
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
                        console.log('he left us : ' + data.name);
                        FriendsAndState.changeState(data.name, 'inative');
                        var IstheTargetDisconnected = VideoServices.checkifUsed(data.name);                        //User got disconnected while still in call
                        if(IstheTargetDisconnected)
                            $rootScope.$emit('Offline');
                        $rootScope.$emit('WebsocketNews');
                        break;


                    // Friends and Requests Messages so we are in no need of polling

                    case 'NewRequest':{
                        console.log(data);
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
                        $rootScope.$emit('UpdateRequest');
                        break;
                    }
                    case 'RequestReply':{
                        if(data.decision === 'reject') {
                            console.log(data);
                            var k=0;
                            for (k = 0; k < Pending.length; k++) {
                                if (Pending[k] === data.source)
                                    break;
                            }
                            Pending.splice(k, 1);
                            $rootScope.$emit('UpdateRequest');
                        }
                        else if (data.decision === 'accept') {
                            var string = data.source + ' has accepted your Request';
                            showReason(string);
                            //Friend&State & Chat Room
                            console.log('new friend is in state: '+ data.state);
                            ChatServices.newfriend(data.source);
                            FriendsAndState.addfriends(data.source,data.state,0);
                            $rootScope.$emit('WebsocketNews');
                        }
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
                        console.log(data);
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
                                console.log('User has already a received call waiting');
                                ws.send(JSON.stringify(message));
                            }
                            else {
                                VideoServices.setUsers(data.source, my_name);
                                VideoServices.setTargetId(data.sourceId);
                                VideoServices.setMyId(data.targetId);
                                console.log('Signal emmited');
                                $rootScope.$emit('Video-Start');
                            }
                        }
                        else {
                            console.log('New Call arrived while in call ');
                            ws.send(JSON.stringify(message));
                        }
                        break;
                    case 'video-response': // With video response we define if we accept call or reject it
                        console.log("Answer is:");
                        console.log(data);
                        VideoServices.setTargetId(data.sourceId);
                        VideoServices.setMyId(data.targetId);
                        //console.log('his response was ' + data.answer);
                        VideoServices.SetResponse(data.answer);
                        $rootScope.$emit('Video-Response');
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
                        if(VideoServices.getTarget() === data.source) { // Just for safety reasons

                                console.log('Ok we are here ');
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
                        console.log('Message was added and signal was emmited');
                        break;

                    }
                    case 'updateUuid':{
                        console.log(data);
                        ChatServices.updateUuid(data.uuid,data.User);
                        break;
                    }
                    case 'NewMessageFromOtherAccount':{
                        ChatServices.NewMessage(data.User,data.info,'me',data.uuid);
                        console.log('new message was succesfully added');
                        $rootScope.$emit('NewMessage');
                        break;
                    }
                    case "messageToBeDeleted" :{
                        ChatServices.Delete(data.User,data.uuid);
                        $rootScope.$emit('NewMessage');
                        break;
                    }
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
    return services;
});


