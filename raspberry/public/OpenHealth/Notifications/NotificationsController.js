
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

        },
        refreshTable:function(action,Newnotification){
            switch (action){
                case 'insert':
                    notification.push(Newnotification);
                    $scope.notifications.notifications = notification;
                    if(!$scope.$digest)
                        $scope.$apply();
                    break;
                case 'delete':
                    for(var i=0;i<notification.length;i++){
                        console.log(notification[i]);
                        if(notification[i].uniqueId === Newnotification.uniqueId){
                            console.log('Notification has been found');
                            notification.splice(i,1);
                            $scope.notifications.notifications = notification;
                            if(!$scope.$digest)
                                $scope.$apply();
                            break;
                        }
                    }
                    break;
                case 'update':
                    break;
                default :
                    console.log('uknown action parameter');
            }
        },
        RemindLater:function(id){
            $http({
                method:'put',
                url:'/notification',
                data:{field:'date',id:id}
            }).then(function successCallback(response){
                console.log(response.data);
            })

        }
    };
    $scope.newNotification={
        description :null,
        date:null,
        time:null,
        reset:function(){
            $scope.newNotification.description  =null;
            $scope.newNotification.date         =null;
            $scope.newNotification.time         =null;
        },
        addNotification:function(description,date,time){
            if(description && date && time){
                $http({
                    method: 'post',
                    url: '/notification',
                    data: {description: description, date: date,time: time}
                }).then(function successCallback(response) {
                    if(response.data.message==='Ok') {
                       // $scope.newNotification.reset();
                        $scope.functions.showResult('Notification was added');
                        $scope.functions.refreshTable('insert',{description:description,date:response.data.date,uniqueId:response.data.uniqueId});
                    }
                    else {
                       // $scope.newNotification.reset();
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
                    notification = result.Result;
                    $scope.notifications.notifications = result.Result;
                    if(!$scope.$digest)
                        $scope.$apply();
                }
            })
        }
    };



    // Functions used for the md-Dialog to work as expected

    $scope.showTabDialog = function(ev) {
        $scope.ActiveNotification = Activenotification.description;
        console.log($scope.ActiveNotification);
        $mdDialog.show({
            locals: { ActiveNotification: $scope.ActiveNotification },
            controller: ['$scope', 'ActiveNotification', function($scope, ActiveNotification) {
                $scope.ActiveNotification = ActiveNotification;
                $scope.answer = function(answer) {
                    $mdDialog.hide(answer);
                };
            }],
            templateUrl: 'Notifications/NotificationTemplate.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true
        })
            .then(function(answer) {
                if(answer ==='Ok'){
                        console.log('User has seen the notification ');
                    $scope.functions.refreshTable('delete',Activenotification)
                }
                else if(answer ==='Later'){
                        $scope.functions.RemindLater(Activenotification.uniqueId);
                        console.log('About to update the database')
                }
            });
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
    Websocket.ActiveNotification($scope,function(){
        $scope.showTabDialog();
    });

    // Show saved requests to db

    $scope.notifications.showNotifications();

});