/**
 * Created by timoskorres on 1/6/2017.
 */

angular.module('Openhealth').controller('SubscribeController', function (WebsocketService, AjaxServices, $location, $scope, $http, $window) {
    $scope.subscribe = {
        username: '',
        password: '',
        message: '',

        getUsername: function () {
            return $scope.subscribe.username + '';
        },
        getPassword: function () {
            return $scope.subscribe.password;
        },
        ShowReason: function (reason) {
            console.log(reason);
            if (reason === 11000 || reason === 'exists')
                $scope.subscribe.message = "Invalid Username , already in use "
        },
        SendRequest: function () {
            console.log('Request should have been sent here');
            $http({
                method: 'post',
                url: 'subscribe',
                data: {
                    grant_type: 'password',
                    client_id: 'myApp',
                    client_secret: 'hmmy1994',
                    username: $scope.subscribe.getUsername(),
                    password: $scope.subscribe.getPassword()
                }
            }).success(function succesCallback(response) {
                console.log(response);
                if (response.code === 11000)
                    $scope.subscribe.ShowReason(response.code);
                else {
                    console.log("Subsrcibe setting localStorage");
                    localStorage.setItem('token', response.access_token);
                    token = localStorage.getItem('token');
                    my_name = $scope.subscribe.getUsername();
                    AjaxServices.services.GetRequests();
                    // ws = new WebSocket('wss://healthcloud.menychtas.com/sockets');
                    ws = new WebSocket('ws:localhost:3000');
                    AjaxServices.services.GetFriends(function (response) {
                        for (var i = 0; i < response.length; i++) {
                            FriendsAndState.addfriends(response[i], 'inactive');
                        }
                        WebsocketService.InitWebsocket();
                    });
                    $location.path('index');
                }
            })
                .error(function errorCallback(response) {
                    $scope.subscribe.ShowReason('exists');
                });
        }
    }
});

