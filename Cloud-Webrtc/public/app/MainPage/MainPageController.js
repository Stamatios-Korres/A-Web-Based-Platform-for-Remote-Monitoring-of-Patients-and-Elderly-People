/**
 * Created by timoskorres on 21/6/2017.
 */

var MainPage = angular.module('MainPage',['ngRoute', 'ngResource', 'ngMaterial']);


MainPage.controller('MainPageController',function($scope,$location,FriendsAndState, WebsocketService, AjaxServices, $timeout){
        if (token === undefined)
            $location.path('login');
        else {
        $scope.mainPageInfo = {
        Searching:'',
        Selected:'',
        friends:[]
        };
        $scope.init= function(){
            console.log('here we are');
            $scope.mainPageInfo.friends = FriendsAndState.getfriends();
        };
        $scope.SelectedUser = function(username){
            $scope.mainPageInfo.Selected = username;
        };
        $scope.init();
        }

    WebsocketService.refresh($scope,function () {
        $scope.mainPageInfo.friends = FriendsAndState.getfriends();
        console.log($scope.mainPageInfo.friends);
        $scope.$apply();
    });
    }
);

MainPage.controller('ToolbarController',function($location,$scope,FriendsAndState,WebsocketService){
    $scope.logout = {
        clean: function () {
            localStorage.clear();
            ws.close();
            FriendsAndState.clean();
            $location.path('login');

        }
    }
});

MainPage.controller('ChatController',function($scope,FriendAndSate,WebsocketService){

});

MainPage.controller('Video-Controller', function ($rootScope,VideoServices, WebsocketService, $scope, $timeout) {
    function closeScreen(){
        // Next time call is began do not show buttons by default
        $scope.videoInfo.status = 'closed';
        $scope.videoInfo.Type = false;
        $scope.videoInfo.Total = true;
        $scope.videoInfo.Incall = false;
    }
    // information shown in Video View
    $scope.videoInfo = {
        target: '',
        status: 'closed',
        message: '',
        Type:false, //button flags
        Total:true,
        Incall:false,
        call: function (username) {
            $scope.videoInfo.target = username; // Keep this info avaialable through calling proccess :)
            VideoServices.setUsers(username,my_name);
            var message = {
                type: 'video-start',
                source: my_name,
                target: username
            };
            WebsocketService.makeVideoCall(message);
            $scope.videoInfo.status = 'open';
            $scope.videoInfo.message = 'Calling ' + username + " ...";

        }, //Definfe Functions of each button -> In total 5 buttons
        acceptCall: function () {
            var message = {
                type: 'video-response',
                target:  VideoServices.getTarget(),
                source: my_name,
                answer: 'yes'
            };
            console.log(message);
            ws.send(JSON.stringify(message));
            $scope.videoInfo.Incall=true;
            $scope.videoInfo.Type = false;
        },
        rejectCall: function () {
            var message = {
                type: 'busy',
                target: VideoServices.getTarget(),
                source: my_name
            };
            closeScreen();
            ws.send(JSON.stringify(message));
        },
        cancelCall:function(){
            var message = {
                type: 'cancel',
                target:VideoServices.getTarget(),
                source: my_name
            };
            closeScreen();
            ws.send(JSON.stringify(message));
        },
        hangUp:function(){
            VideoServices.closeVideo();
            closeScreen();
            //Send message to other Peer to inform screen
            var message = {
                type: 'hang-up',
                target: $scope.videoInfo.target
            };
            ws.send(JSON.stringify(message));
        }
    };

    //Event handlers when new message arrives from Websockets

    //Peer has already been reset from Websockets
    $rootScope.$on('close-video',function(){
        console.log('The other peer closed');
        $scope.videoInfo.status = 'closed';
    }) ;
    $rootScope.$on('busy',function(){
        $scope.videoInfo.message =  $scope.videoInfo.target + ' is busy';
        $timeout(function(){$scope.videoInfo.status = 'closed'},5000);
    });
    $rootScope.$on('cancel',function(){
        $scope.videoInfo.Total = false;
        $scope.videoInfo.message =  VideoServices.getTarget() + ' has closed his phone';
        $timeout(closeScreen,3000);
    });

    //User disconnected from Server
    $rootScope.$on('Offline',function(){
        console.log('Oops users seems to be disconnected');
        VideoServices.closeVideo();
        $scope.videoInfo.message = VideoServices.getTarget() + " was disconected";
        $timeout($scope.videoInfo.status = 'closed',5000);
    });

    //define a dialog to promt user to answer or reject and then hide it
    WebsocketService.videostart($scope, function () {
        var video = document.getElementById('draggable');
        //User already is on a call
        if(VideoServices.getPeer()){
            var message ={
                type:'busy',
                target:VideoServices.getTarget()
            };
            ws.send(JSON.stringify(message));
        }
        $scope.videoInfo.Type = true; // Only show accept-reject buttons if the user is receiving data
        $scope.videoInfo.status = 'open';
        $scope.videoInfo.message = VideoServices.getTarget() + " is calling";
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
            //Video start here
            if (VideoServices.getPeer())
                alert("Can't start a new video during a call");
            else {
                //Let the service know the two User calling each other
                VideoServices.setPeer('Caller');
                $scope.videoInfo.Incall=true;
            }
        }
    });
    WebsocketService.videoAnswer($scope, function () {
        VideoServices.SetAnswer();
    });
    WebsocketService.videoOffer($scope, function () {
        VideoServices.setPeer('Callee');
        $scope.videoInfo.Incall=true;

    });


});



