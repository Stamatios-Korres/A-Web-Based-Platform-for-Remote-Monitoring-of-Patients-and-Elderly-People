
var Notifications = angular.module("Notification",[]);

Notifications.controller('NotificationController',function($scope,$http,$mdToast){
    $scope.functions ={
        showResult: function (string) {
            string = string.toUpperCase();
            $mdToast.show(
                $mdToast.simple()
                    .textContent(string)
                    .capsule(true)
                    .position('top left')
            )

        }
    };
    $scope.newNotification={
        description :null,
        date:null,
        time:null,
        addNotification:function(description,date,time){
            console.log('summoned');
            if(description && date && time){
                $http({
                    method: 'post',
                    url: '/notification',
                    data: {description: description, date: date,time: time}
                }).then(function successCallback(response) {
                    if(response.data.message==='Ok')
                        $scope.functions.showResult('Notification was added');
                    else
                        $scope.functions.showResult('Problem occured,try again');
                    console.log(response);
                });
            }
        }
    }

});