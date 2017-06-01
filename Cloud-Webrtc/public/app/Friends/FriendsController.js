/**
 * Created by timoskorres on 1/6/2017.
 */


angular.module('Openhealth').controller('addController', function ($location, AjaxServices, $scope, $timeout) {
    if (token === undefined) {
        $location.path('login');
    }
    else {
        $scope.friend = {
            username: '',
            password: '',
            requestResult: '',
            sendRequest: function () {
                AjaxServices.services.FriendRequest($scope.friend.username, function (result) {
                    $scope.friend.requestResult = result;
                    $timeout(function () {
                        $scope.friend.requestResult = ''
                    }, 4000);
                });
            }
        }
    }
});