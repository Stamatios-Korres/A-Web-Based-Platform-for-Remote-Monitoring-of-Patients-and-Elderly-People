var SharedServices = angular.module('SharedServices',[]);



SharedServices.service('Websocket',function($rootScope,RealTimeService) {
    services = {};
    services.InitWebsocket = function () {
        ws.onmessage = function (event) {
            try {
                var data = JSON.parse(event.data);
                switch (data.type) {
                    case'SensorMeasurement':
                        if(data.data) {
                            var oximeter = data.data;
                            if(oximeter.status !== "Disconnected / Scanning") {
                                SpO2 = oximeter.Saturation;     // Almost ready to discard the Global Variables
                                Pulse = oximeter.HeartRate;
                                RealTimeService.setMeasurement(Pulse, SpO2);

                            }
                            if(oximeter.stable === 'Yes')
                                stable = oximeter.stable;

                            status = oximeter.status;
                            $rootScope.$emit('NewMeasurement');
                        }
                        break;
                    case 'ActiveNotification':
                        Activenotification = data.notification;
                        $rootScope.$emit('ActiveNotification');
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
    services.ActiveNotification =function($scope,callback){
        var handler = $rootScope.$on('ActiveNotification',callback);
        $scope.$on('$destroy', handler);
    };
    return services;
});