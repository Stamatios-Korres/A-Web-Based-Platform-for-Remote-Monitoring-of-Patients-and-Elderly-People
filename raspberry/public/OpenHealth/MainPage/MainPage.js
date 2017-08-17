/**
 * Created by timos on 24/7/2017.
 */

//Global Variables of my App

var ws = new WebSocket('ws:localhost:4000'); //Websocket connections with the Local Server
var Pulse  ;
var SpO2 ;
var status = "";
var notification = [] ;
var Activenotification ='';
var hasSubscribed =false;


// var Username = null;
var requests = [];            // Requests that the user hasn't still answered
var Pending = [];             // Requests that the user has send and haven't been accepted or rejected
var MultpleUsersResult;
var ChatUser = '';            // Every Time one User will be available for sending messages. ChatUser defines the Username of this Users
var Myid;
var token = null;
var my_name;
var wsCloud;

// A global socket URL  //var CloudWebsocketUrl = 'wss://healthcloud.menychtas.com/sockets';
var CloudWebsocketUrl = 'ws:localhost:3000';

// A global Https URL   // var CloudHttpUrl = 'wss://healthcloud.menychtas.com/node';

var CloudHttpUrl = 'http://localhost:3000';



var myApp = angular.module("Openhealth", ['AngularMaterial','Notification','SharedServices','ngRoute','Online','Biosignals']);

myApp.run(function (Websocket) {
    Websocket.InitWebsocket();
    ws.onopen = function(){
                var message = {
                    type:'init'
                };
                ws.send(JSON.stringify(message));
    }
});


myApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/Online',{
                templateUrl: 'Online/Online.html',
                controller: 'OnlineCtrl'
            })
            .when('/Biosignals',{
                templateUrl: 'Biosignals/Biosignals.html',
                controller: 'BiosignalsController'
            })
            .when('/Notifications',{
                templateUrl:'Notifications/Notifications.html'
                // controller: 'NotificationController'
            })
            .otherwise({
            redirectTo: '/Notifications'
        });
    }
]);


myApp.controller('SidenavController',function($scope,$location,$rootScope){
    $scope.Selected =1;
    $scope.OnlinePart = false;
    $rootScope.$on('Subsribed',function(){
            console.log('summoned');
            $scope.OnlinePart = true;
        });

    if($scope.Selected ===1)
        $location.path('Notifications');

    $scope.changeClass=function(ev){
        ev.target.style.background = 'grey'
    };
    $scope.changeNGview= function(number,string) {
        $scope.Selected = number;
        $scope.OnlinePart =(number === 4 && hasSubscribed);
        $location.path(string);
    }

});


