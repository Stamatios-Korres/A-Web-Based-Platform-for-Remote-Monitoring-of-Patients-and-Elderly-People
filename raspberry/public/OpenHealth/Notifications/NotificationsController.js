
var Notifications = angular.module("Notification",[]);

Notifications.controller('NotificationController',function(Websocket,$mdDialog,$scope,$http,$mdToast){
    $scope.functions ={
        showResult: function (string) {
            string = string.toUpperCase();
            $mdToast.show(
                $mdToast.simple()
                    .textContent(string)
                    .capsule(true)
                    .position('top left')
            )

        },
        getNotifications:function(callback){
            $http({
                method: 'get',
                url: '/notification'
            }).then(function successCallback(response) {
                callback(response.data);
            });

        }
    };
    $scope.newNotification={
        description :null,
        date:null,
        time:null,
        reset:function(){
            $scope.newNotification.description  ='';
            $scope.newNotification.date         ='';
            $scope.newNotification.time         ='';
        },
        addNotification:function(description,date,time){
            if(description && date && time){
                $http({
                    method: 'post',
                    url: '/notification',
                    data: {description: description, date: date,time: time}
                }).then(function successCallback(response) {
                    if(response.data.message==='Ok') {
                        $scope.newNotification.reset();
                        $scope.functions.showResult('Notification was added');
                    }
                    else {
                        $scope.newNotification.reset();
                        $scope.functions.showResult('Problem occured,try again');
                    }
                });
            }
        }
    };
    $scope.ActiveNotification = {} ;
    $scope.notifications ={
        notifications :[],
        showNotifications:function(){
            $scope.functions.getNotifications(function(result){
                if(result.message ==='Ok'){
                    $scope.notifications.notifications = result.Result;
                    if(!$scope.$digest)
                        $scope.$apply();
                }
            })
        }
    };

    $scope.notifications.showNotifications();

    $scope.showTabDialog = function(ev) {
        $scope.ActiveNotification = notification;
        $mdDialog.show({
            controller: 'NotificationController',
            templateUrl: 'Notifications/NotificationTemplate.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true
        })
            .then(function(answer) {
                console.log( 'You said the information was "' + answer + '".');
            }, function() {
                console.log( 'You said the information was "' + answer + '".');
            });
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
    Websocket.ActiveNotification($scope,function(){
        $scope.showTabDialog();
    })


});