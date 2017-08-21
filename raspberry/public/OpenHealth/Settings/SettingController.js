var Settings = angular.module("Setting", []);


Settings.service('SettingService', function () {
    services = {};
    var WayofLogin;
    services.setWayOfLogin = function (way) {
        WayofLogin = way;
    };
    services.getWayOfLogin = function () {
        return WayofLogin;
    };
    return services;
});


Settings.controller('SettingController', function ($mdToast, GlobalVariables,$rootScope,SettingService,$timeout,BiosignalsOnlineServices, $mdDialog, $scope, $http) {

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
        getAcceptedUsers: function (callback) {
            $http({
                method: 'get',
                url: '/biosignal/AcceptedUsers',
                params: {myself: my_name}
            }).then(function successCallback(response) {
                if (response.data.message === 'Ok') {
                    callback(response.data.users);
                }
            }, function errorCallback(response) {
                alert('Error occured ')
            })
        },
        deleteAcceptedUser: function (username, callback) {
            $http({
                headers: {
                    'Content-type': 'application/json;charset=utf-8'
                },
                method: 'delete',
                url: '/biosignal/AcceptedUsers',
                data: {myself: my_name, user: username}
            }).then(function successCallback(response) {
                if (response.data.message === 'Ok') {
                    callback('Ok');
                }
            }, function errorCallback(response) {
                callback('Err');
            })
        }
    };
    $scope.acceptedFriends = {
        Listof: [],
        getAccepted: function () {
                $scope.acceptedFriends.Listof = BiosignalsOnlineServices.getUsers();
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
        },
        showConfirm: function (user) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want delete ' + user + ' ?')
                .textContent('He will no loner be able to get the biosignals automatically')
                .ariaLabel('DeleteAcceptedUser')
                .ok('Yes')
                .cancel('No');
            $mdDialog.show(confirm).then(function () {
                $scope.functions.deleteAcceptedUser(user, function (stringResult) {
                    $scope.acceptedFriends.Listof = deleteFromList($scope.acceptedFriends.Listof, user);
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                    BiosignalsOnlineServices.DeleteUser(user);
                });
            }, function () {
            });
        }
    };

    $scope.LoginSettings = {
        WayofLogin: null,
        Subscribed: false,
        getway: function () {
            $scope.LoginSettings.WayofLogin = SettingService.getWayOfLogin();
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        },
        updateWay: function (newWay) {
            var way;
            if (newWay === 'Automatic Login')
                way = 'auto';
            else
                way = 'manual';
            console.log(way);
            $http({
                method: 'put',
                url: '/online',
                data: {
                    change: 'WayOfLogin',
                    myself: GlobalVariables.getUsername(),
                    WayOfLogin: way
                }
            }).then(
                function successCallback(response) {
                    if (response.data.message === 'Ok') {
                        if (way === 'auto') {
                            $scope.functions.showResult('You will now Login Automatically');
                            $rootScope.$broadcast('AutoLogin');

                        }
                        else
                            $scope.functions.showResult('You will now Login Manually');
                    }
                    SettingService.setWayOfLogin(newWay);

                }, function errorCallback(response) {
                }
            )

        }
    };

    $scope.Password = {
        Old1: null,
        Old2: null,
        New: null,
        changePassword: function (Old1, Old2, New) {
            if(!GlobalVariables.GetIsonline()){
                $scope.functions.showResult("You are not currently Online");
            }
            else {
                if (Old1 && Old2 && New) {
                    if (Old1 !== Old2) {
                        $scope.functions.showResult("Passwords do not match");
                    }                // Passowrd do not match
                    else if (GlobalVariables.getPassword() === Old1) {
                        var string = 'Bearer ' + token;
                        $http({
                            headers: {
                                'Authorization': string
                            },
                            method: 'put',
                            url: CloudHttpUrl + '/settings',
                            data: {
                                username: GlobalVariables.getUsername(),
                                change: 'Password',
                                Password: GlobalVariables.getPassword(),
                                NewPassword :New
                            }
                        }).then(function successCallback(response) {
                                if (response === 'Ok') {
                                    $http({
                                        method: 'put',
                                        url: '/online',
                                        data: {
                                            change: 'Password',
                                            myself: 'timos',
                                            Password: New
                                        }
                                    }).then(
                                        function successCallback(response) {
                                            console.log(response);
                                            if (response.data.message === 'Ok') {
                                                alert('Ok done');
                                            }   //Update the Server
                                        },
                                        function errorCallback(response) {
                                            console.log(response);
                                        })
                                }
                                else {
                                    $scope.functions.showResult('Error occured');
                                }
                            }, function errorCallback(response) {
                                console.log(response);
                            }
                        );
                    }
                }           // Passwords are correct
            }
        }

    };

    $timeout(function() {
        if(GlobalVariables.getSubscribe()) {
            $scope.acceptedFriends.getAccepted();
            $scope.LoginSettings.Subscribed = true;
            $scope.LoginSettings.getway();
        }
        else{
            $scope.LoginSettings.Subscribed = false;
            console.log('No point on doing this');
        }
    },250);

    $rootScope.$on('Subsrcibed',function() {
        $scope.LoginSettings.Subscribed = true;
        $scope.acceptedFriends.getAccepted();
        $scope.LoginSettings.getway();
    });
    $rootScope.$on('Accepted',$scope.acceptedFriends.getAccepted);

    function deleteFromList(list, element) {
        for (var i = 0; i < list.length; i++) {
            if (list[i] === element) {
                console.log('deleted ' + element);
                list.splice(i, 1);
                break;
            }
        }
        console.log(list);
        return list;
    }

});