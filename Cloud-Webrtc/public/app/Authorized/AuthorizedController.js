/**
 * Created by timoskorres on 21/6/2017.
 */

var MainPage = angular.module('MainPage', ['ngRoute', 'ngResource', 'ngMaterial','nvd3']);

MainPage.service('BiosignalsService',function(){
   var services ={};
   var Users = [];
   services.getTarget = function(username){
       for(var i =0;i<Users.length;i++){
           if(Users[i].username === username){
               return Users[i];
           }
       }
       return null;
   };
   services.addNewUser = function(username,blood,heart){
       var user = {
            username:username,
            heart_rate:[],
            blood_saturation:[]
       };
       for(var i=0;i<heart.length;i++){
           var mes = {
               x: heart[i][1],
               y: heart[i][0]
           };
           user.heart_rate.push(mes);
       }
       for(var j=0;j<blood.length;j++){
           var mes1 = {
               x: blood[j][1],
               y: blood[j][0]
           };
           user.blood_saturation.push(mes1);
       }
       for(var k=0;k<Users.length;k++){
           if(Users[k].username === user.username){
               Users[k] = user;
               return;
           }
       }
       Users.push(user);
   };
   services.removeUser = function(username){
       for(var k=0;k<Users.length;k++){
           if(Users[k].username === username){
               Users.splice(k,1);
               return;
           }
       }
   };
   return services;
});


MainPage.controller('ToolbarController', function (ChatServices, $mdToast, $timeout, $location, $scope,VideoServices, FriendsAndState, WebsocketService, AjaxServices) {
    if (token !== undefined) {

        $scope.username = my_name;


        //Hit the logout button
        $scope.logout = {
            clean: function () {
                localStorage.clear();
                token = undefined;
                ws.close();
                FriendsAndState.clean();
                VideoServices.reset();
                $location.path('login');
                ws=undefined;                       //Active websocket which connect Client - Server
                my_name=undefined;                  // User's username
                requests = [];            // Requests that the user hasn't still answered
                Pending = [];             // Requests that the user has send and haven't been accepted or rejected
                MultpleUsersResult=undefined;
                ChatUser = '';            // Every Time one User will be available for sending messages. ChatUser defines the Username of this Users
                Myid=undefined;
                ChatServices.reset();

            }
        };

        $scope.removeClass = function(){
            document.getElementById('RequestInfo').classList.remove('md-warn');
        }; // Function which updates the requests colour


        //The requests the user has sent - received
        $scope.RequestsSent = {

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
        WebsocketService.UpdateRequest($scope,function(){
            $scope.RequestsReceived.Received = requests;
            $scope.RequestsSent.sent = Pending;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        });
        //Check for Unanswered Friend Requests
        function deamon() {
            if (token !== undefined) {
                $scope.RequestsSent.checkPending();
                $scope.RequestsReceived.checkRequests();

            }
        }
        deamon();
    }
});

MainPage.controller('AuthorizedController', function (BiosignalsService,$mdToast,$rootScope, $scope, $mdDialog, $timeout, $location, FriendsAndState, WebsocketService, AjaxServices) {
    if (token === undefined)
        $location.path('login');
    else {
        $scope.mainPageInfo = {
            Searching: '',
            Selected: '',
            friends: []
        };
        $scope.showResult= function (string) {
            string = string.toUpperCase();
            $mdToast.show(
                $mdToast.simple()
                    .textContent(string)
                    .capsule(true)
                    .position('top left')
            )
        };
        //Does take consideration into friends coming online
        WebsocketService.ShowView($scope,function(){
            $scope.mainPageInfo.friends = FriendsAndState.getfriends();
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        });

        $scope.SelectedUser = function (username) {
                FriendsAndState.messageRead(username);
                $scope.mainPageInfo.friends = FriendsAndState.getfriends();
                $scope.mainPageInfo.Selected = username;
                ChatUser = username;
                $scope.Biosignals.target = username;
                $rootScope.$emit('NewMessage');
                $scope.Biosignals.showdata();
        };
        $scope.delete = function () {
            var status;
            var confirm = $mdDialog.confirm()
                .clickOutsideToClose(true)
                .title('Confirm')
                .textContent('Are you sure you want to delete ' + $scope.mainPageInfo.Selected + ' ? ')
                .ariaLabel()
                .openFrom('#left')
                .closeTo(angular.element(document.querySelector('#right')))
                .ok('Yes I am ')
                .cancel('No');

            $mdDialog.show(confirm).then(
                function () {
                    //Delete users
                    AjaxServices.services.DeleteFriends($scope.mainPageInfo.Selected, function (result) {
                        if(result.data.message === 'Ok') {
                            for (var i = 0; i < $scope.mainPageInfo.friends.length; i++) {
                                console.log($scope.mainPageInfo.friends[i].username);
                                if ($scope.mainPageInfo.friends[i].username === $scope.mainPageInfo.Selected) {
                                    console.log('deleted ' + $scope.mainPageInfo.Selected);
                                    $scope.mainPageInfo.friends.splice(i, 1);
                                    break;
                                }
                            }
                            $scope.mainPageInfo.Selected = '';
                        }
                    })
                },
                function () {
                    //Nothing happened, users cancelled his request
                });

        };

        //Update the users state -> Async Function

        WebsocketService.refresh($scope, function () {
            $scope.mainPageInfo.friends = FriendsAndState.getfriends();
            if(!FriendsAndState.memeber($scope.mainPageInfo.Selected)){
                $scope.mainPageInfo.Selected='';
            }
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        });



        $scope.Biosignals = {
            hide:false,
            Requesting:false,
            target:null,
            range:24,
            local:null,
            dataArrived:false,
            refresh:function() {
                if (!$scope.Biosignals.Requesting) {
                    if ($scope.Biosignals.range === $scope.Biosignals.local)         //Only request of User has changed the range
                        return;
                    $scope.Biosignals.local = $scope.Biosignals.range;
                    var message = {
                        type: 'RequestBiosignals',
                        target: $scope.mainPageInfo.Selected,
                        source: my_name,
                        range: $scope.Biosignals.range
                    };
                    $scope.Biosignals.Requesting = true;
                    ws.send(JSON.stringify(message));
                    $timeout(function(){
                            $scope.Biosignals.Requesting = false;
                        },
                        5000)

                }
            },
            clearArea:function(username){
                    BiosignalsService.removeUser(username);
                    $scope.Biosignals.dataArrived = false;
                    $scope.Biosignals.showdata();
            },      // Remove Biosignals are reset flags
            showdata:function(){

                // Set New title and Subtile
                var User = BiosignalsService.getTarget($scope.Biosignals.target);
                if(User) {
                    $scope.chart.options.subtitle.enable = false;
                    $scope.chart.options.title.text = 'Biosignals from: ' + $scope.Biosignals.target;
                    $scope.Biosignals.dataArrived = true;
                    //Ask and show the data you received
                    $scope.chart.data[1].values = User.heart_rate;
                    $scope.chart.data[0].values = User.blood_saturation;
                    $scope.chart.api.refresh();
                    // User can now ask for more data
                    $scope.Biosignals.Requesting = false;
                }
                else{
                    $scope.chart.data[1].values = [];
                    $scope.chart.data[0].values = [];
                    $scope.chart.api.refresh();
                    $scope.Biosignals.dataArrived = false;
                    $scope.Biosignals.Requesting = false;
                    $scope.Biosignals.local = null;
                    $scope.chart.options.title.text =  'Chart Area';
                    $scope.chart.options.subtitle.text = 'No data received -Press the button and ask for data ';
                    $scope.chart.options.subtitle.enable = true;
                    $scope.chart.options.title.enable = true;
                }
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
             }
        };


        WebsocketService.BiosignalAnswer($scope,$scope.Biosignals.showdata);
        $scope.requestBiosignals = function(username){
            if(!$scope.Biosignals.Requesting) {                 //Be sure user is not waiting for an answer
                $scope.Biosignals.Requesting = true;
                if ($scope.Biosignals.range === $scope.Biosignals.local) {
                    $scope.Biosignals.Requesting = false;
                    return;
                }
                $scope.Biosignals.local = $scope.Biosignals.range;
                if (FriendsAndState.getSate(username) === 'active') {
                    AjaxServices.services.GetBiosignals(username, function (response) {
                        // $scope.Biosignals.target = username;
                        if (response.message !== 'Ok') {
                            $scope.showResult(response.message);
                            $scope.Biosignals.Requesting = false;
                        }
                        else { // Throught Websockets request the raspberry User about the Biosignal request
                            $scope.showResult('Request has been sent ');
                            $scope.chart.options.subtitle.text = 'Please wait. Asking data from ' + username;
                            var message = {
                                type: 'RequestBiosignals',
                                target: username,
                                source: my_name,
                                sourceId: null,
                                range: $scope.Biosignals.range
                            };
                            ws.send(JSON.stringify(message));
                        }
                        $timeout(function () {
                                $scope.Biosignals.Requesting = false;
                                $scope.Biosignals.local = null;
                            },
                            5000)       //If no answer comes in 3 seconds allow user to send again the request
                    });
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
                else{
                    $scope.showResult(username+' is currently offline, try later');
                    $scope.Biosignals.Requesting = false;
                }
            }
        };


        //The Chart which will show the result of the request
        $scope.chart = {
            callback: {},
            events: {},
            config: {visible: true},
            api:{},
            options : {
                chart: {
                    type: 'lineChart',
                    height: 350,
                    width:550,
                    padData:true,
                    forceY:([55,110]),
                    margin : {
                        top: 100,
                        right: 20,
                        bottom: 40,
                        left: 55
                    },
                    x: function(d){ return d.x; },
                    y: function(d){ return d.y; },
                    useInteractiveGuideline: false,
                    dispatch: {
                        stateChange: function(e){ console.log("stateChange"); },
                        changeState: function(e){ console.log("changeState"); },
                        tooltipShow: function(e){ console.log("tooltipShow"); },
                        tooltipHide: function(e){ console.log("tooltipHide"); }
                    },
                    xAxis: {
                        axisLabel: 'Time',
                        tickFormat:function(d) {
                            return d3.time.format('%b %d %H:%M')(new Date(d));
                        }
                    },
                    yAxis: {
                        axisLabel: '',
                        tickFormat: function(d){
                            return d3.format('.02f')(d);
                        },
                        axisLabelDistance: -10
                    },
                    callback: function(chart){
                        // console.log("!!! lineChart callback !!!");
                    },
                    "zoom": {
                        "enabled": true,
                        "scaleExtent": [
                            1,
                            10
                        ],
                        "useFixedDomain": false,
                        "useNiceScale": false,
                        "horizontalOff": false,
                        "verticalOff": true,
                        "unzoomEventType": "dblclick.zoom"
                    }
                },
                title: {
                    enable: true,
                    text: 'Chart Area'
                },
                subtitle: {
                    enable: true,
                    text:   'No data received  - Press the button and ask for data '  ,
                    css: {
                        'text-align': 'center',
                        'margin': '10px 13px 0px 7px'
                    }
                },
                caption: {
                    enable: false,
                    html: '<b>Figure 1.</b> Lorem ipsum dolor sit amet, at eam blandit sadipscing, <span style="text-decoration: underline;">vim adhuc sanctus disputando ex</span>, cu usu affert alienum urbanitas. <i>Cum in purto erat, mea ne nominavi persecuti reformidans.</i> Docendi blandit abhorreant ea has, minim tantas alterum pro eu. <span style="color: darkred;">Exerci graeci ad vix, elit tacimates ea duo</span>. Id mel eruditi fuisset. Stet vidit patrioque in pro, eum ex veri verterem abhorreant, id unum oportere intellegam nec<sup>[1, <a href="https://github.com/krispo/angular-nvd3" target="_blank">2</a>, 3]</sup>.',
                    css: {
                        'text-align': 'justify',
                        'margin': '10px 13px 0px 7px'
                    }
                }
            },
            data:[
                {
                    key:'Blood Saturation',
                    values:[],
                    color: 'blue'

                },
                {
                    key:'Heart Rate',
                    values:[],
                    color:'red'
                }

            ]
        };

    }
});



MainPage.controller('Video-Controller', function (RealTimeService,$rootScope, VideoServices, WebsocketService, $scope, $timeout) {



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
            console.log(message);
            $scope.videoInfo.message = '';
            ws.send(JSON.stringify(message));
            $scope.videoInfo.InCall = true;
        },
        rejectCall: function () {
            console.log(VideoServices.getTarget());
            var message = {
                type: 'busy',
                target: VideoServices.getTarget(),
                source: my_name,
                sourceId: VideoServices.getMyid(),
                targetId: VideoServices.getTargetid()
                // No User Id here we want to inform all users
            };
            ws.send(JSON.stringify(message));
            console.log('Target was set to null');
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
            ws.send(JSON.stringify(message));
        },
        hangUp: function () {

            console.log('Ok with Video closing');
            //Send message to other Peer to inform screen
            var message = {
                type: 'hang-up',
                target: VideoServices.getTarget(),
                sourceId: VideoServices.getMyid(),
                targetId: VideoServices.getTargetid()
            };
            ws.send(JSON.stringify(message));
            VideoServices.closeVideo();
            closeScreen();
        }
    };  // Information shown in Video View
    $scope.RealTime ={
        blood:0,
        heart:0,
        show:false,
        hide:function(){
            $scope.RealTime.show = false;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        }
    };

    //Event handlers when new message arrives from Websockets

    $rootScope.$on('close-video', function () {
        console.log('The other peer closed');
        $scope.videoInfo.Type = 'Closed';
        $scope.videoInfo.InCall = false;
        $scope.RealTime.show = false;
        $scope.videoInfo.message = 'Call Ended ';
        VideoServices.closeVideo();
        if (!$scope.$$phase) {
            $scope.$apply();
        }
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
        $scope.RealTime.show = false;

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
        $scope.RealTime.show = false;

        $scope.$apply();
        console.log('Target was set to null because of cancelled call ');
        VideoServices.ResetTarget();
        $timeout(closeScreen, 3000);
    });
    $rootScope.$on('Offline', function () {
        console.log('Oops users seems to be disconnected');
        $scope.videoInfo.Type = 'Closed';
        $scope.RealTime.show = false;

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

        $scope.$apply();
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
            $scope.$apply();
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
    function closeScreen() {
        $scope.videoInfo.HowVideoWasClosedFlag = false;
        $scope.videoInfo.status = 'Closed';  // Next time call is began do not show buttons by default
        $scope.videoInfo.Type = null;
        $scope.videoInfo.InCall = false;
        $scope.videoInfo.target = '';
        $scope.RealTime.show = false;
    }

    // Handles Real Time Measurement
    WebsocketService.RealTime($scope,function(){
        var mes = RealTimeService.getMeasurement();
        $scope.RealTime.blood = mes.blood.y;
        $scope.RealTime.heart = mes.heart.y;
        $scope.RealTime.show = true;
        if (!$scope.$$phase) {
            $scope.$apply();
        }

    });

});

MainPage.controller('ChatController', function ($mdDialog,AjaxServices, ChatServices, $timeout, $scope) {

    //Trial Chat Controller
    $scope.messages = {
        currentMessage: '',
        arrayofMessages: [],
        SelectedUser: '',
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
                ws.send(JSON.stringify(message));
            }
            $scope.scrollDown();
            $scope.messages.currentMessage = '';
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
        }
    };

    $scope.scrollDown = function(){
        var mydiv =$('#mydiv');
        mydiv.stop().animate({
            scrollTop: mydiv[0].scrollHeight
        }, 100);
    };

    $scope.scrollDown();


    ChatServices.refresh($scope, function () {
        $scope.messages.arrayofMessages = ChatServices.SelectUser(ChatUser);
        //Ask from Server if empty array
        if ($scope.messages.arrayofMessages) {
            if (ChatServices.getFlag(ChatUser) ===false  ) {
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

    $(document).ready(function(){
        $('#TextBoxId').keypress(function(e){
            if(e.keyCode===13) {
                $('#linkadd').click();
            }
        });
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

});

//Some global functions
function deleteFromList(list, element) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] === element) {
            console.log('deleted ' + element);
            list.splice(i, 1);
            break;
        }
    }
    console.log(list);
    return list;
}

