var Notifications = angular.module("Notification", []);

Notifications.controller('NotificationController', function (Websocket, $mdDialog, $scope, $http, $location, $mdToast) {


    $scope.functions = {
        showResult: function (string) {
            string = string.toUpperCase();
            $mdToast.show(
                $mdToast.simple()
                    .textContent(string)
                    .capsule(true)
                    .position('top left')
            )

        },
        deleteNotification: function (uniquedId, callback) {
            $http({
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                },
                method: 'delete',
                url: '/notification',
                data: {
                    uniqueId: uniquedId
                }
            }).then(function successCallback(response) {
                callback(response.data.message)
            });
        },
        getNotifications: function (callback) {
            $http({
                method: 'get',
                url: '/notification'
            }).then(function successCallback(response) {
                callback(response.data);
            });

        },
        refreshTable: function (action, Newnotification) {
            switch (action) {
                case 'insert':
                    notification.push(Newnotification);
                    $scope.notifications.notifications = notification;
                    if (!$scope.$digest)
                        $scope.$apply();
                    break;
                case 'delete':
                    for (var i = 0; i < notification.length; i++) {
                        if (notification[i].uniqueId === Newnotification.uniqueId) {
                            notification.splice(i, 1);
                            $scope.notifications.notifications = notification;
                            if (!$scope.$digest)
                                $scope.$apply();
                            break;
                        }
                    }
                    break;
                case 'update':
                    console.log('ready to update');
                    for (var j = 0; j < notification.length; j++) {
                        if (notification[j].uniqueId === Newnotification.uniqueId) {
                            notification[j].description = Newnotification.description;
                            notification[j].date = Newnotification.date;
                            notification[j].type = Newnotification.type;
                            notification[j].repeat = Newnotification.repeat;
                            $scope.notifications.notifications = notification;
                            break;
                        }
                    }
                    if (!$scope.$digest)
                        $scope.$apply();
                    break;
                case 'RemindNotification':
                    for (var k = 0; k < notification.length; k++) {
                        if (notification[k].uniqueId === Newnotification.uniqueId) {
                            notification[k].reminder = true;
                            $scope.notifications.notifications = notification;
                            if (!$scope.$digest)
                                $scope.$apply();
                            console.log($scope.notifications.notifications);
                            break;
                        }
                    }
                    break;
                case'backToRepeat':
                    for (var l = 0; l < notification.length; l++) {
                        if (notification[l].uniqueId === Newnotification.uniqueId) {
                            notification[l].repeat = Activenotification.repeat;
                            $scope.notifications.notifications = notification;
                            if (!$scope.$digest)
                                $scope.$apply();
                            break;
                        }
                    }
                    break;
                default :
                    console.log('uknown action parameter');
            }
        },
        RemindLater: function (id) {
            $http({
                method: 'put',
                url: '/notification',
                data: {field: 'date', id: id}
            })
        },
        updateNotification: function (uniqueId, date, description,repeat, callback) {
            var UpdatedNotification = {
                field: 'Both',
                uniqueId: uniqueId,
                date: date,
                repeat:repeat,
                description: description
            };
            $http({
                method: 'put',
                url: '/notification',
                data: UpdatedNotification
            }).then(function successCallback(response) {
                callback(response.data);
            },function errorCallback(response){
                console.log(response);
            })
        }
    };          // General functions needed bu the controller
    $scope.newNotification = {
        description: null,
        date: null,
        time: null,
        repeat:null,
        reset: function () {
            console.log('Function was called');
            $scope.newNotification.description = null;
            $scope.newNotification.date = null;
            $scope.newNotification.time = null;
            if (!$scope.$digest)
                $scope.$apply();
        },
        addNotification: function (description, date, time) {
            if (description && date && time) {
                $http({
                    method: 'post',
                    url: '/notification',
                    data: {
                        description: description,
                        date: date,
                        time: time,
                        repeat:$scope.newNotification.repeat
                    }
                }).then(
                    function successCallback(response) {
                        if (response.data.message === 'Ok') {
                            $scope.functions.showResult('Notification was added');
                            var type = 'Normal';
                            if($scope.newNotification.repeat !== ' Never')
                                 type ='Periodical';
                            $scope.functions.refreshTable('insert', {
                                description: description,
                                date: response.data.date,
                                uniqueId: response.data.uniqueId,
                                type:type,
                                repeat:$scope.newNotification.repeat
                            });
                        }
                        else {
                            $scope.functions.showResult('Problem occured,try again');
                        }

                    });
                    $scope.newNotification.reset();
            }
            else{
                $scope.functions.showResult('Please fill out all fields');
            }
        }
    };    // Functions for when user adds a new Nofitication to the App
    $scope.ActiveNotification = {};    // The active notification the Server has inform us
    $scope.notifications = {
        notifications: [],
        showNotifications: function () {
            $scope.functions.getNotifications(function (result) {
                if (result.message === 'Ok') {
                    notification = result.Result;
                    $scope.notifications.notifications = result.Result;
                    if (!$scope.$digest)
                        $scope.$apply();
                }
            })
        }
    };      // Model of controller which hosts the array
    $scope.CrudOperations = {
        Updatingdescription: null,
        Updatingdate: null,
        UpdatingUniqueId: null,
        UpdatingRepeat:null,
        showmenu: function (description, date, uniqueID,type,repeat) {
            $mdDialog.show({
                locals: {description: description, Date: date},
                scope: $scope,
                clickOutsideToClose: false,
                preserveScope: true,
                controller: ['$scope', 'description', function ($scope) {
                    $scope.CrudOperations.Updatingdescription = description;
                    $scope.CrudOperations.Updatingdate = date;
                    $scope.CrudOperations.UpdatingUniqueId = uniqueID;
                    $scope.CrudOperations.UpdatingRepeat = repeat;
                    $scope.answer = function (answer) {
                        $mdDialog.hide(answer);
                    };
                }],

                templateUrl: 'Notifications/CrudTemplate.html',
                parent: angular.element(document.body)
            })
                .then(function (answer) {
                    if (answer === 'Update') {
                        $scope.functions.updateNotification($scope.CrudOperations.UpdatingUniqueId, $scope.CrudOperations.Updatingdate, $scope.CrudOperations.Updatingdescription,$scope.CrudOperations.UpdatingRepeat,
                        function (response) {
                                if (response.message === 'Ok') {
                                    console.log($scope.CrudOperations.UpdatingRepeat);
                                    var flag = ($scope.CrudOperations.UpdatingRepeat === 'Never');
                                    var type;
                                    if(flag)
                                        type = 'Normal';
                                    else
                                        type = 'Periodical';
                                    var notification = {
                                        uniqueId: $scope.CrudOperations.UpdatingUniqueId,
                                        date: $scope.CrudOperations.Updatingdate,
                                        description: $scope.CrudOperations.Updatingdescription,
                                        type:type,
                                        repeat:$scope.CrudOperations.UpdatingRepeat
                                    };
                                    console.log(notification);
                                    $scope.functions.refreshTable('update', notification);
                                }

                            }
                        )
                    }
                    else if (answer === 'Delete') {
                        $scope.functions.deleteNotification($scope.CrudOperations.UpdatingUniqueId, function (response) {
                            if (response === 'Ok') {
                                $scope.functions.refreshTable('delete', {uniqueId: $scope.CrudOperations.UpdatingUniqueId});
                            }
                        })
                    }
                },function errorCallback(){

                });
        }
    };     // CRUD operations on existed notifications


    // Functions used for the md-Dialog to work as expected

    $scope.showTabDialog = function (ev) {
        $scope.ActiveNotification = Activenotification.description;
        $mdDialog.show({
            locals: {ActiveNotification: $scope.ActiveNotification},
            controller: ['$scope', 'ActiveNotification', function ($scope, ActiveNotification) {
                $scope.ActiveNotification = ActiveNotification;
                $scope.answer = function (answer) {
                    $mdDialog.hide(answer);
                };
            }],
            templateUrl: 'Notifications/NotificationTemplate.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false
        })
            .then(function (answer) {
                    if (answer === 'Ok') {
                        // Active Notification Comes the way it is saved at the DB
                        if(Activenotification.repeat === 'Never') {
                            $scope.functions.refreshTable('delete', Activenotification);
                            console.log('In here1');
                        }
                        else {
                            $scope.functions.refreshTable('backToRepeat', Activenotification)
                        }
                    }
                    else if (answer === 'Later') {
                        $scope.functions.RemindLater(Activenotification.uniqueId);
                        $scope.functions.refreshTable('RemindNotification', {uniqueId: Activenotification.uniqueId});
                    }
            });
    };
    $scope.answer = function (answer) {
        $mdDialog.hide(answer);
    };
    Websocket.ActiveNotification($scope, function () {
        $scope.showTabDialog();
    });


    // Show saved requests to db

    $scope.notifications.showNotifications();

});