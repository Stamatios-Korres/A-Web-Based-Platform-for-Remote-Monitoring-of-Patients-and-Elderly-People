var SharedServices = angular.module('SharedServices',[]);



SharedServices.service('Websocket',function($rootScope) {
    services = {};
    services.InitWebsocket = function () {
        ws.onmessage = function (event) {
            try {
                var data = JSON.parse(event.data);
                switch (data.type) {
                    case'SensorMeasurement':
                        if(data.data) {
                            var oximeter = data.data;
                            SpO2 = oximeter.Saturation;
                            Pulse = oximeter.HeartRate;
                            status = oximeter.status;
                            $rootScope.$emit('NewMeasurement');
                        }
                        break;
                    case 'ActiveNotification':
                        console.log(data.notification);
                        break;
                    default:
                        console.log('Unknown option: '+data.type);
                }
            }
            catch (e) {
            }
        }
    };
    services.NewMeasurement =function($scope,callback){
        var handler = $rootScope.$on('NewMeasurement',callback);
        $scope.$on('$destroy', handler);
    };
    return services;
});