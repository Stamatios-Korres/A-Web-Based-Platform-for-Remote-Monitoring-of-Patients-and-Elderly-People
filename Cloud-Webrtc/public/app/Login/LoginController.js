/**
 * Created by timoskorres on 1/6/2017.
 */


//var mainApp = angular.module("Openhealth", ['ngRoute', 'ngResource', 'ngMaterial']);
angular.module('Openhealth').controller('LoginController', function (FriendsAndState, WebsocketService, AjaxServices, $scope, $http, $window, $location, $timeout) {
    $scope.login = {
        username: '',
        password: '',
        message: '',
        getUsername: function () {
            return $scope.login.username;
        },
        getPassword: function () {
            return $scope.login.password;
        },
        ShowReason: function (reason) {
            $scope.login.message = "Wrong Username or Password";
            $timeout(function () {
                $scope.login.message = ''
            }, 2000);
        },
        SendRequest: function () {
            $http({
                method: 'post',
                url: '',
                data: {
                    grant_type: 'password',
                    client_id: 'myApp',
                    client_secret: 'hmmy1994',
                    username: $scope.login.getUsername(),
                    password: $scope.login.getPassword()
                }
            })
                .success(function succesCallback(response) {
                    console.log(response);
                    console.log("Login setting localStorage");
                    // Global Variables Probably unseen by my controller
                    localStorage.setItem('token', response.access_token);
                    token = localStorage.getItem('token');
                    my_name = $scope.login.getUsername();
                    AjaxServices.services.GetRequests();
                    AjaxServices.services.PendingRequests();
                    ws = new WebSocket('wss://healthcloud.menychtas.com/sockets');
                    // ws = new WebSocket('ws:localhost:3000');
                    AjaxServices.services.GetFriends(function (response) {
                        for (var i = 0; i < response.length; i++) {
                            FriendsAndState.addfriends(response[i], 'inactive');
                        }
                    WebsocketService.InitWebsocket();
                    });
                    ws.onopen = function InitWebsocket(e) {
                        console.log('Setting online: ' + my_name);
                        message = {
                            type: 'init',
                            token: localStorage.getItem('token')
                        };
                        message = JSON.stringify(message);
                        ws.send(message);
                    };
                    $location.path('index');
                })
                .error(function errorCallback(response) {
                    console.log(response);
                    $scope.login.ShowReason(response.status);
                    console.log(response)
                });
        }
    }
});