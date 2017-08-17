var Settings = angular.module("Setting", []);


Settings.controller('SettingController',function($mdDialog,$scope,$http){

    $scope.functions ={
        getAcceptedUsers:function(callback){
            $http({
                method:'get',
                url:'/biosignal/AcceptedUsers',
                params:{myself:my_name}
            }).then(function successCallback(response){
                if(response.data.message ==='Ok') {
                    callback(response.data.users);
                }
            },function errorCallback(response){
                alert('Error occured ')
            })
        },
        deleteAcceptedUser:function(username,callback){
            $http({
                headers: {
                    'Content-type': 'application/json;charset=utf-8'
                },
                method:'delete',
                url:'/biosignal/AcceptedUsers',
                data:{myself:my_name,user:username}
            }).then(function successCallback(response){
                if(response.data.message ==='Ok') {
                    callback('Ok');
                }
            },function errorCallback(response){
                callback('Err');
            })
        }
    };
    $scope.acceptedFriends ={
        Listof:[],
        getAccepted:function(){
            $scope.functions.getAcceptedUsers(function(response){
                console.log(response);
                $scope.acceptedFriends.Listof = response;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            })
        },
        showConfirm : function(user) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want delete ' + user+' ?')
                .textContent('He will no loner be able to get the biosignals automatically')
                .ariaLabel('DeleteAcceptedUser')
                .ok('Yes')
                .cancel('No');
            $mdDialog.show(confirm).then(function() {
                $scope.functions.deleteAcceptedUser(user,function(stringResult){
                        console.log('Searching ... ');
                        $scope.acceptedFriends.Listof =deleteFromList( $scope.acceptedFriends.Listof,user);
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                });
            }, function() {
            });
        }
    };
    $scope.acceptedFriends.getAccepted();

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