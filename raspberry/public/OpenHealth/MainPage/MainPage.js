/**
 * Created by timos on 24/7/2017.
 */

//Global Variables of my App

var ws = new WebSocket('ws:localhost:4000'); //Websocket connections with the Local Server
var Pulse  ;
var SpO2 ;
var status = "";
var stable = 'No';
var notification = [] ;
var Activenotification ='';

var requests = [];            // Requests that the user hasn't still answered
var Pending = [];             // Requests that the user has send and haven't been accepted or rejected
var MultpleUsersResult;
var ChatUser = '';            // Every Time one User will be available for sending messages. ChatUser defines the Username of this Users
var Myid;
var token = null;
var my_name;
var wsCloud;

// A global socket URL
var CloudWebsocketUrl = 'wss://healthcloud.menychtas.com/sockets';
// var CloudWebsocketUrl = 'ws:localhost:3000';

// A global Https URL
var CloudHttpUrl = 'https://healthcloud.menychtas.com/node';

// var CloudHttpUrl = 'http://localhost:3000';



var myApp = angular.module("Openhealth", ['Online','AngularMaterial','Setting','Notification','SharedServices','ngRoute','Biosignals']);

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
                templateUrl: 'Online/Online.html'
            })
            .when('/Biosignals',{
                templateUrl: 'Biosignals/Biosignals.html',
                controller: 'BiosignalsController'
            })
            .when('/Notifications',{
                templateUrl:'Notifications/Notifications.html'
            })
            .when('/Settings',{
                templateUrl:'Settings/Settings.html'
                // controller: 'SettingController'
            })
            .otherwise({
            redirectTo: '/Settings'
        });
    }
]);

myApp.service('GlobalVariables',function(){
    var services = {};
    var username;
    var password;
    var hasSubscribed = false;
    var Isonline = false;
    var FirstTimeOnline =false;

    services.getFirstTime = function(){
        return FirstTimeOnline;
    };
    services.setFirstTime = function (flag){
            FirstTimeOnline = flag;
    };
    services.SetIsonline =function(flag){
        Isonline = flag;
    };
    services.GetIsonline = function(){
        return Isonline;
    };
    services.setSubscribe =function(flag){
        hasSubscribed = flag;
    };
    services.getSubscribe = function(){
        return hasSubscribed;
    };
    services.setUsername =function(Username){
        username = Username
    };
    services.getUsername = function(){
        return username;
    };
    services.setPassword =function(Password){
        password = Password;
    };
    services.getPassword = function(){
        return password;
    };
    return services;
});

myApp.controller('SidenavController',function(GlobalVariables,SettingService,$http,$scope,$location,$rootScope){
    $scope.Selected =1;
    $scope.OnlinePart = false;
    if($scope.Selected ===1)
        $location.path('Notifications');
    $rootScope.$on('IsOnLine',function(){
        $scope.username = my_name;
        $scope.OnlinePart=true
    });
    $scope.changeClass=function(ev){
        ev.target.style.background = 'grey'
    };
    $scope.changeNGview= function(number,string) {
        $scope.Selected = number;
        $scope.OnlinePart =(number === 4 && GlobalVariables.GetIsonline());
        $location.path(string);
    };

    //Initializing app

    $scope.username =null;
    function initApp() {
        $http({
            method: 'get',
            url: '/online'
        }).then(function successCallback(response) {
            if (response.data.message === 'Ok') {
                GlobalVariables.setFirstTime(false);
                my_name = response.data.user.Username;          //If user has subscribed Save his info for next requests
                GlobalVariables.setUsername(my_name);
                GlobalVariables.setPassword(response.data.user.Password);
                $scope.username = my_name;
                GlobalVariables.setSubscribe(true);
                if (response.data.user.WayOfLogin === 'auto') {
                    GlobalVariables.SetIsonline(true);
                    SettingService.setWayOfLogin('Automatic Login');
                    $rootScope.$broadcast('AutoLogin');

                } // Should connect the User immediatly
                else
                    SettingService.setWayOfLogin('Manual Login');
            }
            else if (response.data.message === 'No username has been set') {
                GlobalVariables.setSubscribe(false);
                GlobalVariables.setFirstTime(true);
            }
        })
    }
    initApp();
});




