/**
 * Created by timos on 24/7/2017.
 */

//Global Variables of my App

var ws = new WebSocket('ws:localhost:4000'); //Websocket connections with the Server
var Pulse  ;
var SpO2 ;
var bufferPi = [];
var bufferDate = [];
var status = "";

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
                templateUrl:'Notifications/Notifications.html',
                controller: 'NotificationController'
            })
            .otherwise({
            redirectTo: '/Notifications'
        });
    }
]);


myApp.controller('SidenavController',function($scope,$location){
    $scope.Selected =1;
    if($scope.Selected ===1)
        $location.path('Notifications');

    $scope.changeClass=function(ev){
        ev.target.style.background = 'grey'
    };
    $scope.changeNGview= function(number,string){
        $scope.Selected =number;
        $location.path(string);

    }
});

