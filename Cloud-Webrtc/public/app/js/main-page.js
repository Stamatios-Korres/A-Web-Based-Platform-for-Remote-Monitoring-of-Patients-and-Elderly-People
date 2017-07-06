/**
 * Created by timoskorres on 10/5/2017.
 */
var mainApp = angular.module("Openhealth", ['ngRoute', 'ngResource', 'ngMaterial','MainPage','AngularMaterial']);

//App variable is used for AngularUI - AngularMaterial Design

//Global variables

var token;                    // Acces token given by Authorization Server
var ws;                       //Active websocket which connect Client - Server
var my_name;                  // User's username
var requests = [];            // Requests that the user hasn't still answered
var Pending = [];             // Requests that the user has send and haven't been accepted or rejected
var MultpleUsersResult;

//This clears localStorage History -> Change when use cookies
mainApp.run(function ($rootScope) {
    localStorage.clear();
});
mainApp.controller('Bar-controller', function (FriendsAndState, $scope, $window, $location) {
    if (token === undefined) {
        $location.path('login');
    }
});

mainApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
        .when('/main-page',{
            templateUrl: 'Authorized/Authorized.html',
            controller:'AuthorizedController'
        })
        .when('/login', {
             templateUrl: "WelcomePage/WelcomePage.html",
            controller: 'WelcomePageController'

        }).otherwise({
            redirectTo: '/login'
        });
    }
]);

