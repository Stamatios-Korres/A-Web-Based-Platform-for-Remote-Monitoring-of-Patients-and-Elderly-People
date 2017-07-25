/**
 * Created by timos on 24/7/2017.
 */


var myApp = angular.module("Openhealth", ['AngularMaterial','ngRoute','Online','Biosignals']);

myApp.run(function () {

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
            .otherwise({
            redirectTo: ''
        });
    }
]);


myApp.controller('SidenavController',function($scope,$location){
    $scope.Selected =2;
    $scope.changeClass=function(ev){
        console.log('we are inside');
        ev.target.style.background = 'grey'
    };
    $scope.changeNGview= function(number,string){
        $scope.Selected =number;
        console.log('It was summoned');
        $location.path(string);

    }
});

