/**
 * Created by timoskorres on 9/5/2017.
 */
// var mainApp = angular.module("myApp",['ngRoute','ngResource']);

mainApp.controller('LoginController',function($scope,$http,$window){
    $scope.login = {
        username: '',
        password: '',
        message:'',
        getUsername: function(){
            return $scope.login.username;
        },
        getPassword: function (){
            return $scope.login.password;
        },
        ShowReason: function(reason){
            if(reason == 404)
                $scope.login.message = "Wrong Username or Password"
        },
        SendRequest: function(){
            $http({
                method: 'post',
                url: '',
                data:{grant_type:'password',client_id:'myApp',client_secret:'hmmy1994',username:$scope.login.getUsername(),password:$scope.login.getPassword()}
            }).then(function succesCallback(response){
               console.log(response.data);
               localStorage.setItem('token',response.data.access_token);
               $window.location.href = '/success';
            })
            ,function errorCallback(response){
                $scope.login.ShowReason(response.status);
                console.log(response)
            };
        }
    }
});


mainApp.controller('SubscribeController',function($scope,$http,$window){
    $scope.subscribe = {
        username: '',
        password: '',
        message:'',

        getUsername: function(){
            return $scope.subscribe.username + '';
        },
        getPassword: function (){
            return $scope.subscribe.password;
        },
        ShowReason: function(reason){
            console.log(reason);
            if(reason == 11000 || reason =='exists')
                $scope.subscribe.message = "Invalid Username , already in use "
        },
        SendRequest: function(){
            console.log('here');
            $http({
                method: 'post',
                url: '/subscribe',
                data:{grant_type:'password',client_id:'myApp',client_secret:'hmmy1994',username:$scope.subscribe.getUsername(),password:$scope.subscribe.getPassword()}
            }).then(function succesCallback(response) {
                console.log(response.data);
                if (response.data.code == 11000)
                    $scope.subscribe.ShowReason(response.data.code);
                else {
                    localStorage.setItem('token', response.data.access_token);
                    $window.location.href = '/success';
                }
            },function errorCallback(response){
                $scope.subscribe.ShowReason('exists');

            });
        }
    }
});

mainApp.config(['$routeProvider',
    function($routeProvider){
        $routeProvider.

        when('/subscribe',{
            templateUrl:"subscribe.htm",
            controller: 'SubscribeController'
        }).
        when('/login',{
            templateUrl:"login.htm",
            controller: 'LoginController'
        }).
        otherwise({
            redirectTo: '/login'
        });

    }])
