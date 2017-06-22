/**
 * Created by timoskorres on 1/6/2017.
 */

angular.module('Openhealth').controller('WelcomePageController', function (FriendsAndState,$mdToast,$mdDialog, WebsocketService, AjaxServices, $scope, $http, $window, $location, $timeout) {
    $scope.login = {
        username: '',
        password: '',
        message: '',
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
                    username: $scope.login.username,
                    password: $scope.login.password
                }
            }).then(function (response) {
                console.log("Setting Token");
                // Global Variables Probably unseen by my controller
                localStorage.setItem('token', response.data.access_token);
                token = localStorage.getItem('token');
                my_name = $scope.login.username;
                AjaxServices.services.GetRequests();
                // ws = new WebSocket('wss://healthcloud.menychtas.com/sockets');
                ws = new WebSocket('ws:localhost:3000');
                AjaxServices.services.GetFriends(function (response) {
                    for (var i = 0; i < response.length; i++) {
                        FriendsAndState.addfriends(response[i], 'inactive');
                    }
                    WebsocketService.InitWebsocket();
                });
                ws.onopen = function InitWebsocket(e) {
                    console.log('Initializing Connection with Server ' + my_name);
                    message = {
                        type: 'init',
                        token: localStorage.getItem('token')
                    };
                    message = JSON.stringify(message);
                    ws.send(message);
                };
                $location.path('main-page');
            }, function errorCallback(response) {
                console.log(response);
                $scope.openFromLeft();
            })
        }
    };
    $scope.openToast = function() {
        var toast = $mdToast.simple()
            .textContent('Username Exists')
            .action('Ok')
            .highlightAction(true)
            .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
            .position('bottom left');
        $mdToast.show(toast)
        // Could also do $mdToast.showSimple('Hello');
    };
    $scope.openFromLeft = function() {
        $mdDialog.show(
            $mdDialog.alert()
                .clickOutsideToClose(true)
                .title('Wrong Username/Password')
                .textContent('Please try Again')
                .ariaLabel()
                .ok('Ok!')
                // You can specify either sting with query selector
                .openFrom('#left')
                // or an element
                .closeTo(angular.element(document.querySelector('#right')))
        );
    };

    $scope.subscribe = {
        username: '',
        password: '',
        message: '',
        ShowReason: function (reason) {
            console.log(reason);
            if (reason === 11000 || reason === 'exists')
                $scope.subscribe.message = "Invalid Username , already in use "
        },
        SendRequest: function () {
            console.log('Request should have been sent here');
            console.log($scope.subscribe.username);
            console.log($scope.subscribe.password);
            $http({
                method: 'post',
                url: 'subscribe',
                data: {
                    grant_type: 'password',
                    client_id: 'myApp',
                    client_secret: 'hmmy1994',
                    username: $scope.subscribe.username,
                    password: $scope.subscribe.password
                }
            }).then(function succesCallback(response) {
                console.log(response);
                if (response.data.errors)
                    $scope.openToast();                else {
                    console.log("Subsrcibe setting localStorage");
                    localStorage.setItem('token', response.access_token);
                    token = localStorage.getItem('token');
                    my_name = $scope.subscribe.username;
                    AjaxServices.services.GetRequests();
                    // ws = new WebSocket('wss://healthcloud.menychtas.com/sockets');
                    ws = new WebSocket('ws:localhost:3000');
                    AjaxServices.services.GetFriends(function (response) {
                        for (var i = 0; i < response.length; i++) {
                            FriendsAndState.addfriends(response[i], 'inactive');
                        }
                        WebsocketService.InitWebsocket();
                    });
                    //$location.path('index');

                }
            },function errorCallback(response) {
                    console.log(response);
                });
        }
    }
});