/**
 * Created by timos on 24/7/2017.
 */


var App = angular.module('AngularMaterial',['ngMaterial','Online']);

App.config(
    function($mdThemingProvider,$mdToastProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('blue-grey');
    }
);

