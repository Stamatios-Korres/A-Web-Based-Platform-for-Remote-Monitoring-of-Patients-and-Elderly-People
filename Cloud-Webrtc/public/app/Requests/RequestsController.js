/**
 * Created by timoskorres on 1/6/2017.
 */


mainApp.controller('RequestController', function (AjaxServices, $scope, $timeout) {
    $scope.Requests = {
        Requests: '',
        PendingRequests: '',
        getRequests: function () {
            $scope.Requests.Requests = requests;
            $scope.Requests.PendingRequests = Pending;
        },
        accept: function (name) {
            AjaxServices.services.requestReply(name, 'accept', function (reply) {
                if (reply === 'Ok') {
                    $scope.Requests.Requests = deleteFromList($scope.Requests.Requests, name);
                    requests = $scope.Requests.Requests;
                }
                console.log("accepting " + name);
            })
        },
        reject: function (name) {
            AjaxServices.services.requestReply(name, 'reject', function (reply) {
                if (reply === 'Ok') {
                    $scope.Requests.Requests = deleteFromList($scope.Requests.Requests, name);
                    requests = $scope.Requests.Requests;
                }
            });
            console.log("rejecting " + name);
        },
        cancel: function (name) {
            AjaxServices.services.CancelRequest(name, function (reply) {
                if (reply.message === 'Ok') {
                    $scope.Requests.PendingRequests = deleteFromList($scope.Requests.PendingRequests, name);
                    Pending = $scope.Requests.PendingRequests;
                    console.log($scope.Requests.PendingRequests);
                }
            })
        }
    };
    function deleteFromList(list, element) {
        for (var i = 0; i < list.length; i++) {
            if (list[i] === element) {
                list.splice(i, 1);
                break;
            }
        }
        return list;
    }

    //This Flag is used in order to decide whether the User has a new request BUT IT DOESN'T WORK
    $scope.flag = {
        decide: function () {
            return $scope.Requests.length > 0
        }
    };
    $scope.friend = {
        send: '',
        received: ''
    };
});
