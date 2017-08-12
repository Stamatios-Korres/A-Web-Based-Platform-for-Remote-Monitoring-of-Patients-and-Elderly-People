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
                            $scope.notifications.notifications = notification;
                            if (!$scope.$digest)
                                $scope.$apply();
                            break;
                        }
                    }
                    break;
                case 'RemindNotification':
                    for (var k = 0; k < notification.length; k++) {
                        console.log(Newnotification);
                        if (notification[k].uniqueId === Newnotification.uniqueId) {
                            console.log('Found what I was looking for');
                            notification[k].reminder = true;
                            $scope.notifications.notifications = notification;
                            if (!$scope.$digest)
                                $scope.$apply();
                            console.log('everything is done');
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
        updateNotification: function (uniqueId, date, description, callback) {
            var UpdatedNotification = {
                field: 'Both',
                uniqueId: uniqueId,
                date: date,
                description: description
            };
            $http({
                method: 'put',
                url: '/notification',
                data: UpdatedNotification
            }).then(function successCallback(response) {
                callback(response.data);
            })
        }
    };          // General functions needed bu the controller
    $scope.newNotification = {
        description: null,
        date: null,
        time: null,
        reset: function () {
            console.log('Function was called');
            $scope.newNotification.description = '';
            $scope.newNotification.date = null;
            $scope.newNotification.time = null;
        },
        addNotification: function (description, date, time) {
            if (description && date && time) {
                $http({
                    method: 'post',
                    url: '/notification',
                    data: {description: description, date: date, time: time}
                }).then(
                    function successCallback(response) {
                        if (response.data.message === 'Ok') {
                            $scope.functions.showResult('Notification was added');
                            $scope.functions.refreshTable('insert', {
                                description: description,
                                date: response.data.date,
                                uniqueId: response.data.uniqueId
                            });
                        }
                        else {
                            $scope.functions.showResult('Problem occured,try again');
                        }

                    });
                 $location.path('Notifications');
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
        showmenu: function (description, date, uniqueID) {
            $mdDialog.show({
                locals: {description: description, Date: date},
                scope: $scope,
                clickOutsideToClose: false,
                preserveScope: true,
                controller: ['$scope', 'description', function ($scope) {
                    $scope.CrudOperations.Updatingdescription = description;
                    $scope.CrudOperations.Updatingdate = date;
                    $scope.CrudOperations.UpdatingUniqueId = uniqueID;
                    $scope.answer = function (answer) {
                        $mdDialog.hide(answer);
                    };
                }],

                templateUrl: 'Notifications/CrudTemplate.html',
                parent: angular.element(document.body)
            })
                .then(function (answer) {
                    if (answer === 'Update') {
                        $scope.functions.updateNotification($scope.CrudOperations.UpdatingUniqueId, $scope.CrudOperations.Updatingdate, $scope.CrudOperations.Updatingdescription,
                            function (response) {
                                if (response.message === 'Ok') {
                                    $scope.functions.refreshTable('update', {
                                        uniqueId: $scope.CrudOperations.UpdatingUniqueId,
                                        date: $scope.CrudOperations.Updatingdate,
                                        description: $scope.CrudOperations.Updatingdescription
                                    })
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
                });
        }
    };     // CRUD operations on existed notifications

    // Functions used for the md-Dialog to work as expected

    $scope.showTabDialog = function (ev) {
        $scope.ActiveNotification = Activenotification.description;
        console.log($scope.ActiveNotification);
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
            clickOutsideToClose: true
        })
            .then(function (answer) {
                if (answer === 'Ok') {
                    $scope.functions.refreshTable('delete', Activenotification)
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