/**
 * Created by timos on 25/7/2017.
 */

var Biosignals = angular.module('Biosignals', ['nvd3']);

Biosignals.service('BiosignalService', function ($http) {
    var services = {};
    var OnlineServices = {};
    OnlineServices.updateHeart = function (newvalue, uniqueId, callback) {
        $http({
            method: 'post',
            url: '/biosignal/heartUpdate',
            data: {newvalue: newvalue, uniqueId: uniqueId}
        }).then(function successCallback(response) {
            callback(response.data.message);
        });
    };
    OnlineServices.deleteHeart = function (uniqueId, callback) {
        $http({
            headers: {
                'Content-type': 'application/json;charset=utf-8'
            }
            ,
            method: 'delete',
            url: '/biosignal/heartdelete',
            data: {uniqueId: uniqueId}
        }).then(function successCallback(response) {
            callback(response.data.message);
        });
    };
    OnlineServices.insertHeart = function (value, callback) {
        $http({
            method: 'post',
            url: '/biosignal/heartInsert',
            data: value
        }).then(function successCallback(response) {
            callback(response.data.message);
        });
    };
    OnlineServices.getHeart = function (range,callback) {
        $http({
            method: 'get',
            url: '/biosignal/heartbiosignals',
            params:{range:range}
        }).then(function successCallback(response) {
            callback(response.data);
        });
    };
    OnlineServices.updateBloodSaturation = function (newvalue, uniqueId, callback) {
        console.log(uniqueId);
        $http({
            method: 'put',
            url: '/biosignal/BloodSaturation',
            data: {newvalue: newvalue, uniqueId: uniqueId}
        }).then(function successCallback(response) {
            callback(response.data.message);
        });
    };
    OnlineServices.deleteBloodSaturation = function (uniqueId, callback) {
        $http({
            headers: {
                'Content-type': 'application/json;charset=utf-8'
            }
            ,
            method: 'delete',
            url: '/biosignal/bloodSaturationdelete',
            data: {uniqueId: uniqueId}
        }).then(function successCallback(response) {
            callback(response.data.message);
        });
    };
    OnlineServices.insertBloodSaturation = function (value, callback) {
        $http({
            method: 'post',
            url: '/biosignal/BloodSaturationInsert',
            data: value
        }).then(function successCallback(response) {
            callback(response.data.message);
        });
    };
    OnlineServices.getBloodSaturation = function (range,callback) {
        $http({
            method: 'get',
            url: '/biosignal/bloodSaturationbiosignals',
            params:{range:range}
        }).then(function successCallback(response) {
            callback(response.data);
        });
    };
    return {services: services, OnlineServices: OnlineServices};
});


Biosignals.controller('BiosignalsController', function (Websocket,$timeout, $mdToast, $scope, BiosignalService) {


    // 1st Tab
    $scope.newdata = true;
    $scope.HistoryChart = {
        functions:{
            getData:function() {
                if ($scope.newdata === true) {        //Ask new data only if data have been inserted
                    var Blood;
                    var Heart;
                    BiosignalService.OnlineServices.getHeart($scope.HistoryChart.range, function (responseHeart) {
                        console.log('asking DB');
                        if (responseHeart.message === 'Ok') {
                            BiosignalService.OnlineServices.getBloodSaturation($scope.HistoryChart.range, function (responseBlood) {
                                if (responseBlood.message === 'Ok') {
                                    Heart =$scope.HistoryChart.functions.transformData(responseHeart.Result);
                                    Blood = $scope.HistoryChart.functions.transformData(responseBlood.Result);
                                    $scope.HistoryChart.chart.data[0].values = Blood;
                                    $scope.HistoryChart.chart.data[1].values= Heart;
                                    $scope.HistoryChart.chart.api.refresh();
                                    $timeout(function(){
                                    $scope.HistoryChart.chart.config.visible = true;
                                    if (!$scope.$digest)
                                        $scope.$apply();
                                    $scope.newdata = false;
                                },5)
                               }
                            })
                        }
                    })
                }
            },
            transformData:function(Data){
                var ResultArray = [];
                for(var i=0;i<Data.length;i++){
                    var mes = {
                        x: Data[i][1],
                        y: Data[i][0],
                        id:Data[i][2]
                    };
                    ResultArray.push(mes);
                }
                return ResultArray;
            },
            ClickCallback : function(type){
                $scope.HistoryChart.ChartSelect = type;
                var temp = $scope.HistoryChart.measurement.date;
                var month = temp.getMonth() + 1;
                $scope.HistoryChart.measurement.date = month + '/' + temp.getDate() + '/' + temp.getFullYear();
                $scope.HistoryChart.flag = true;
                if (!$scope.$digest)
                    $scope.$apply();
            },
            updateHeart: function () {
                BiosignalService.OnlineServices.updateHeart($scope.HistoryChart.newValue, $scope.HistoryChart.measurement.uniqueId, function (result) {
                    if (result === 'Ok') {
                        for (var i = 0; i < $scope.HistoryChart.chart.data[1].values.length; i++) {
                            if ( $scope.HistoryChart.chart.data[1].values[i].id === $scope.HistoryChart.measurement.uniqueId) {
                                $scope.HistoryChart.chart.data[1].values[i].y = $scope.HistoryChart.newValue;
                                break;
                            }
                        }
                        // $scope.HistoryChart.chart.api.refresh();
                        $scope.HistoryChart.flag = false;
                        $scope.HistoryChart.newValue = '';
                        $scope.HistoryChart.measurement = {};
                        if(!$scope.$digest)
                            $scope.$apply();
                    }
                });
            },
            deleteHeart: function () {
                BiosignalService.OnlineServices.deleteHeart($scope.HistoryChart.measurement.uniqueId, function (result) {
                    if(result ==='Ok') {
                        for (var i = 0; i < $scope.HistoryChart.chart.data[1].values.length; i++) {
                            if ($scope.HistoryChart.chart.data[1].values[i].id === $scope.HistoryChart.measurement.uniqueId) {
                                $scope.HistoryChart.chart.data[1].values.splice(i, 1);
                                break;
                            }
                        }
                        $scope.HistoryChart.measurement = {}
                    }
                })
            },
            updateBloodSaturation: function () {
                BiosignalService.OnlineServices.updateBloodSaturation($scope.HistoryChart.newValue, $scope.HistoryChart.measurement.uniqueId, function (result) {
                    if (result === 'Ok') {
                        for (var i = 0; i < $scope.HistoryChart.chart.data[0].values.length; i++) {
                            if ($scope.HistoryChart.chart.data[0].values[i].id === $scope.HistoryChart.measurement.uniqueId) {
                                $scope.HistoryChart.chart.data[0].values[i].y = $scope.HistoryChart.newValue;
                                break;
                            }
                        }
                       $scope.HistoryChart.flag = false;
                       $scope.HistoryChart.newValue = '';
                       $scope.HistoryChart.measurement = {}
                    }
                });
            },
            deleteBloodSaturation: function () {
                BiosignalService.OnlineServices.deleteBloodSaturation($scope.HistoryChart.measurement.uniqueId, function (result) {
                    for (var i = 0; i < $scope.HistoryChart.chart.data[0].values.length; i++) {
                        if ($scope.HistoryChart.chart.data[0].values[i].id === $scope.HistoryChart.measurement.uniqueId) {
                            $scope.HistoryChart.chart.data[0].values.splice(i, 1);
                            break;
                        }
                    }
                    $scope.HistoryChart.newValue = '';
                    $scope.HistoryChart.flag = false;
                    $scope.HistoryChart.measurement = {};
               })
            },
            askDB:function(){
                $scope.newdata = true;
                $scope.HistoryChart.functions.getData();
            }

        },
        measurement: {
            value: '',
            date: '',
            uniqueId: ''
        },
        ChartSelect:'Heart', // Enum :[Heart,Update]
        newValue:null,
        flag:false,  // Flag to hide-show an div area
        range:24,
        chart: {
            callback: {},
            events: {},
            config: {visible: false},
            api:{},
            options : {
                chart: {
                    type: 'lineChart',
                    height: 470,
                    width:700,
                    padData:true,
                    forceY:([45,120]),
                    margin : {
                        top: 100,
                        right: 20,
                        bottom: 40,
                        left: 55
                    },
                    x: function(d){ return d.x; },
                    y: function(d){ return d.y; },
                    useInteractiveGuideline: false,
                    lines: {
                        dispatch: {
                            stateChange: function (e) {
                                console.log("stateChange");
                            },
                            changeState: function (e) {
                                console.log("changeState");
                            },
                            tooltipShow: function (e) {
                                console.log("tooltipShow");
                            },
                            tooltipHide: function (e) {
                                console.log("tooltipHide");
                            },
                            elementClick:
                                function (e) {
                                    if (e.series.key === 'Heart Rate') {
                                        $scope.HistoryChart.measurement.value = e.series.value;
                                        $scope.HistoryChart.measurement.uniqueId = e.point.id;
                                        $scope.HistoryChart.measurement.date = new Date(e.point.x);
                                        $scope.HistoryChart.functions.ClickCallback('Heart');
                                    }
                                    else if (e.series.key === 'Blood Saturation') {
                                        $scope.HistoryChart.measurement.value = e.series.value;
                                        $scope.HistoryChart.measurement.uniqueId = e.point.id;
                                        $scope.HistoryChart.measurement.date = new Date(e.point.x);
                                        $scope.HistoryChart.functions.ClickCallback('Blood');
                                    }

                                }
                        }
                    },
                    xAxis: {
                        axisLabel: 'Time',
                        tickFormat:function(d) {
                            return d3.time.format('%b %d %H:%M')(new Date(d));
                        }
                    },
                    yAxis: {
                        axisLabel: '',
                        tickFormat: function(d){
                            return d3.format('.02f')(d);
                        },
                        axisLabelDistance: -10
                    },
                    callback: function(chart){
                        // console.log("!!! lineChart callback !!!");
                    },
                    "zoom": {
                        "enabled": true,
                        "scaleExtent": [
                            1,
                            10
                        ],
                        "useFixedDomain": false,
                        "useNiceScale": false,
                        "horizontalOff": false,
                        "verticalOff": true,
                        "unzoomEventType": "dblclick.zoom"
                    }
                },
                title: {
                    enable: true,
                    text: 'Chart Area'
                },
                subtitle: {
                    enable: false,
                    text:   'No data received  - Press the button and ask for data '  ,
                    css: {
                        'text-align': 'center',
                        'margin': '10px 13px 0px 7px'
                    }
                },
                caption: {
                    enable: false,
                    html: '<b>Figure 1.</b> Lorem ipsum dolor sit amet, at eam blandit sadipscing, <span style="text-decoration: underline;">vim adhuc sanctus disputando ex</span>, cu usu affert alienum urbanitas. <i>Cum in purto erat, mea ne nominavi persecuti reformidans.</i> Docendi blandit abhorreant ea has, minim tantas alterum pro eu. <span style="color: darkred;">Exerci graeci ad vix, elit tacimates ea duo</span>. Id mel eruditi fuisset. Stet vidit patrioque in pro, eum ex veri verterem abhorreant, id unum oportere intellegam nec<sup>[1, <a href="https://github.com/krispo/angular-nvd3" target="_blank">2</a>, 3]</sup>.',
                    css: {
                        'text-align': 'justify',
                        'margin': '10px 13px 0px 7px'
                    }
                }
            },
            data:[
                {
                    key:'Blood Saturation',
                    values:[],
                    color: 'blue'

                },
                {
                    key:'Heart Rate',
                    values:[],
                    color:'red'
                }

            ]
    }    //It will now be a common Chart
    };
    $(document).on('click', function (e) {
        if ($(e.target).closest(".show").length !== 0) {
            if($scope.HistoryChart.measurement.value) {
                $timeout(function() {
                    $scope.HistoryChart.flag = true;
                    $scope.$apply();
                },15);
            }
        }
    });

    $(document).on('click', function (e) {
        if ($(e.target).closest(".Nothide").length === 0) {
            $timeout(function() {
                $scope.HistoryChart.flag = false;
                $scope.HistoryChart.measurement = {};
                $scope.$apply();
            },10);
        }
    });


    $scope.FirstTime = true;

    // 2nd Tab
    $scope.sensor = {

        Chart: {
            callback: {},
            events: {},
            api: {},
            config: {visible: true},
            options : {
                chart: {
                    type: 'lineChart',
                    height: 450,
                    width:600,
                    padData:true,
                    forceY:([55,110]),
                    margin : {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 55
                    },
                    x: function(d){ return d.x; },
                    y: function(d){ return d.y; },
                    useInteractiveGuideline: true,
                    dispatch: {
                        stateChange: function(e){ console.log("stateChange"); },
                        changeState: function(e){ console.log("changeState"); },
                        tooltipShow: function(e){ console.log("tooltipShow"); },
                        tooltipHide: function(e){ console.log("tooltipHide"); }
                    },
                    xAxis: {
                        axisLabel: 'Time',
                        tickFormat:function(d) { return d3.time.format('%b %d')(new Date(d)); }
                    },
                    yAxis: {
                        axisLabel: '',
                        axisLabelDistance: -10
                    },
                    callback: function(chart){
                    }
                },
                title: {
                    enable: true,
                    text: 'Sensor Chart'
                },
                subtitle: {
                    enable: true,
                    text: 'State of Sensor: offline'  ,
                    css: {
                        'text-align': 'center',
                        'margin': '10px 13px 0px 7px'
                    }
                },
                caption: {
                    enable: false,
                     html: '<b>Figure 1.</b> Lorem ipsum dolor sit amet, at eam blandit sadipscing, <span style="text-decoration: underline;">vim adhuc sanctus disputando ex</span>, cu usu affert alienum urbanitas. <i>Cum in purto erat, mea ne nominavi persecuti reformidans.</i> Docendi blandit abhorreant ea has, minim tantas alterum pro eu. <span style="color: darkred;">Exerci graeci ad vix, elit tacimates ea duo</span>. Id mel eruditi fuisset. Stet vidit patrioque in pro, eum ex veri verterem abhorreant, id unum oportere intellegam nec<sup>[1, <a href="https://github.com/krispo/angular-nvd3" target="_blank">2</a>, 3]</sup>.',
                    css: {
                        'text-align': 'justify',
                        'margin': '10px 13px 0px 7px'
                    }
                }
            },
            data:[
                {
                    key:'Blood Saturation',
                    values:[],
                    color: 'blue'

                },
                {
                    key:'Heart Rate',
                    values:[],
                    color:'red'
                }

            ]
            },
        Text:{
            area:'No data',
            show:false,
            stop:false
        }

    };
    //3rd Tab - Insert Manually Measurements
    $scope.NewValue = {

        //Global Variables for Radio Buttons

        selectedCategory: null,
        TimeDateType: null,
        TimeDateTypeBlood: null,

        //Heart Rate info
        DateHeartRate: null,
        timeTakenHeartRate: '',
        heartRate: '',

        //Blood Saturation Info
        timeTakenBloodSaturation: '',
        DateBloodSaturation: '',
        bloodSaturation: null,

        checkNumber: function isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        InsertHeartRate: function (string) {
            switch (string) {
                case 'auto':
                    var msg = {
                        type: 'autoHeart',
                        value: $scope.NewValue.heartRate,
                        Date: new Date()
                    };
                    BiosignalService.OnlineServices.insertHeart(msg, function (result) {
                        if (result === 'Ok') {
                            $scope.NewValue.timeTaken = '';
                            $scope.NewValue.Date = '';
                            $scope.NewValue.heartRate = '';
                            $scope.functions.showResult('New measurement was inserted');
                            $scope.newdata = true;
                        }
                    });
                    break;
                case 'manual':
                    var time = $scope.NewValue.timeTakenHeartRate;
                    var hours = time.getHours();
                    var min = time.getMinutes();
                    var sec = time.getSeconds();
                    var date = $scope.NewValue.DateHeartRate;
                    var year = date.getFullYear();
                    var month = date.getMonth();
                    var day = date.getDate();
                    var Dat1 = new Date(year, month, day, hours, min, sec, 0);
                    var msg1 = {
                        type: 'manualHeart',
                        value: $scope.NewValue.heartRate,
                        Date: Dat1
                    };
                    BiosignalService.OnlineServices.insertHeart(msg1, function (result) {
                        if (result === 'Ok') {
                            $scope.NewValue.timeTakenHeartRate = '';
                            $scope.NewValue.DateHeartRate = '';
                            $scope.NewValue.heartRate = '';
                            $scope.functions.showResult('New measurement was inserted');
                            $scope.newdata = true;
                        }
                    });


                    break;
                default:
                    console.log('unkown options - Code problem');
            }
        },
        InsertOxygenSaturation: function (string) {
            switch (string) {
                case 'auto':
                    var msg = {
                        type: 'Oxygen',
                        value: $scope.NewValue.bloodSaturation,
                        Date: new Date()
                    };
                    BiosignalService.OnlineServices.insertBloodSaturation(msg, function (result) {
                        if (result === 'Ok') {
                            $scope.NewValue.bloodSaturation = '';
                            $scope.functions.showResult('New measurement was inserted');
                            $scope.newdata = true;
                        }
                    });
                    break;
                case 'manual':
                    var time = $scope.NewValue.timeTakenBloodSaturation;
                    var hours = time.getHours();
                    var min = time.getMinutes();
                    var sec = time.getSeconds();
                    var date = $scope.NewValue.DateBloodSaturation;
                    var year = date.getFullYear();
                    var month = date.getMonth();
                    var day = date.getDate();
                    var Dat1 = new Date(year, month, day, hours, min, sec, 0);
                    var msg1 = {
                        type: 'Heart',
                        value: $scope.NewValue.bloodSaturation,
                        Date: Dat1
                    };
                    BiosignalService.OnlineServices.insertBloodSaturation(msg1, function (result) {
                        if (result === 'Ok') {
                            $scope.functions.showResult('New measurement was inserted');
                            $scope.newdata = true;
                            $scope.NewValue.timeTakenBloodSaturation = '';
                            $scope.NewValue.DateBloodSaturation = '';
                            $scope.NewValue.bloodSaturation = '';
                        }
                    });


                    break;
                default:
                    console.log('unkown options - Code problem');
            }

        }

    };
    //Listener in order to hide the box

    $scope.functions = {
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


    Websocket.NewMeasurement($scope,function(){
        if(status !==  "Disconnected / Scanning") {
            if ($scope.sensor.Chart.data[0].values.length === 10) {
                $scope.sensor.Chart.data[0].values.splice(0, 1);
                $scope.sensor.Chart.data[1].values.splice(0, 1);
            }
            $scope.sensor.Chart.data[0].values.push(SpO2);
            $scope.sensor.Chart.data[1].values.push(Pulse);
            $scope.sensor.Chart.api.update();
            }
        else {
            $timeout(function(){
                $scope.sensor.Text.show = false;
                $scope.sensor.Text.stop = false;
                $scope.sensor.Text.area = '';
                $scope.sensor.Chart.data[0].values = [];
                $scope.sensor.Chart.data[1].values = [];
                $scope.sensor.Chart.api.update();
                SpO2 = null;
                Pulse = null;
            },3000);
        }
        if(stable === 'Yes' && !$scope.sensor.Text.stop){
            $timeout(
                function(){
                $scope.sensor.Text.show = true;
                $scope.sensor.Text.stop = true;
                $scope.sensor.Text.area = 'Ok stable measurement was saved, you can remove your Oximeter';
                if(!$scope.$digest)
                    $scope.$apply();
                },100);
            $scope.newdata = true;
        }

        $scope.sensor.Chart.options.subtitle.text = 'State of Sensor: ' + status;
        if(!$scope.$digest)
            $scope.$apply();

    });
});