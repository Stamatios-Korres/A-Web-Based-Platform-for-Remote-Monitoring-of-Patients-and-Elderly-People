/**
 * Created by timoskorres on 1/6/2017.
 */
angular.module('Openhealth').controller('indexController', function ($mdDialog, $location, FriendsAndState, WebsocketService, AjaxServices, $timeout, $scope) {
if (token === undefined)
    $location.path('login');
else {
    $scope.friends = [];
    ws.onopen = function InitWebsocket(e) {
        message = {
            type: 'init',
            token: localStorage.getItem('token')
        };
        message = JSON.stringify(message);
        ws.send(message);
    };
    $scope.user = {
        username: '',
        SetName: function () {
            $scope.user.username = my_name;
            $scope.friends = FriendsAndState.getfriends();
        },
        remove: function(name){
            AjaxServices.services.DeleteFriends(name,function(result){
                console.log(result);
                if(result.message === 'Ok') {
                    $scope.friends = FriendsAndState.removefromlist(name);
                }
            });
        }
    };
    $scope.webrtc = {
        call: function (username) {
            var message = {
                type: 'video-start',
                source: my_name,
                target: username
            };
            WebsocketService.makeVideoCall(message);
        }
    };

    WebsocketService.refresh($scope,
        function () {
            $scope.friends = FriendsAndState.getfriends();
            $scope.$apply();
        });
}
});