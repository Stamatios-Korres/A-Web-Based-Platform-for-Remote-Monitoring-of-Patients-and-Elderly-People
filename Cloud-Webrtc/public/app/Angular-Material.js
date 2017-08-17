/**
 * Created by timoskorres on 9/6/2017.
 */

/**   I created a new Module which has to do with Angular Material Design -> Define Functions,configures etc */


var App = angular.module('AngularMaterial',['ngMaterial']);

App.config(
    function($mdThemingProvider,$mdToastProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('blue-grey');
    }
);
App.controller('TestingController',function($scope,$mdDialog){
    $scope.showAlert=function(ev){
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('Are you sure you want to cancel the request')
                .textContent("")
                .ariaLabel()
                .openFrom('#right')
                .ok('Yes')
                .targetEvent(ev)
        );
    };
    $scope.user='';
    $scope.username='';
    $scope.password='';
    $scope.remember='';

    this.openMenu = function( ev) {
        console.log("yeah we are here");
        originatorEv = ev;
        this.open(ev);
    };
});

