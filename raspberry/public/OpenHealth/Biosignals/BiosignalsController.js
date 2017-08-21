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
    $scope.heartRate = {
        dataServer: [],
        newValue: null,
        updateHeart: function () {
            BiosignalService.OnlineServices.updateHeart($scope.heartRate.newValue, $scope.heartRate.measurement.uniqueId, function (result) {
                if (result === 'Ok') {
                    for (var i = 0; i < $scope.heartRate.heart.data[0].values.length; i++) {
                        if ($scope.heartRate.heart.data[0].values[i][2] === $scope.heartRate.measurement.uniqueId) {
                            $scope.heartRate.heart.data[0].values[i][0] = $scope.heartRate.newValue;
                            break;
                        }
                    }
                    $scope.heartRate.heart.api.refresh();
                    $scope.flag = false;
                    $scope.heartRate.newValue = '';
                    $scope.heartRate.measurement = {
                        value: '',
                        date: '',
                        uniqueId: ''
                    }
                }
            });
        },
        deleteHeart: function () {
            BiosignalService.OnlineServices.deleteHeart($scope.heartRate.measurement.uniqueId, function (result) {
                if (result === 'Ok') {
                    for (var i = 0; i < $scope.heartRate.heart.data[0].values.length; i++) {
                        if ($scope.heartRate.heart.data[0].values[i][2] === $scope.heartRate.measurement.uniqueId) {
                            $scope.heartRate.heart.data[0].values.splice(i, 1);

                            break;
                        }
                    }
                    $scope.heartRate.heart.api.refresh();
                    $scope.flag = false;
                    $scope.heartRate.measurement = {
                        value: '',
                        date: '',
                        uniqueId: ''
                    }
                }
            })

        },
        measurement: {
            value: '',
            date: '',
            uniqueId: ''
        },
        //Heart Chart implementatiom
        heart: {
            callback: {},
            events: {},
            api: {},
            config: {visible: false},
            options: {
                chart: {
                    type: 'historicalBarChart',
                    height: 450,
                    width: 600,
                    "margin": {
                        "top": 20,
                        "right": 20,
                        "bottom": 65,
                        "left": 80
                    },
                    clipEdge: true,
                    x: function (d) {
                        return d[1];
                    },
                    y: function (d) {
                        return d[0];
                    },
                    showValues: true,
                    valueFormat: function (d) {
                        return d3.format(',.4f')(d);
                    },
                    transitionDuration: 500,
                    xAxis: {
                        "width": null,
                        axisLabel: '',
                        "rotateLabels": 30,
                        "showMaxMin": true,
                        "dispatch": {},
                        interactive: true,
                        "axisLabelDistance": 0,
                        "staggerLabels": false,
                        "rotateYLabel": true,
                        "height": 60,
                        "margin": {
                            "top": 0,
                            "right": 0,
                            "bottom": 0,
                            "left": 0
                        },
                        "duration": 250,
                        "orient": "bottom",
                        "tickValues": null,
                        "tickSubdivide": 0,
                        "tickSize": 1,
                        "tickPadding": 5,
                        "domain": [
                            0,
                            1
                        ],
                        "range": [
                            0,
                            1
                        ],
                        "ticks": null,
                        tickFormat: function (d) {
                            return d3.time.format('%x')(new Date(d))
                        }
                    },
                    yAxis: {
                        "axisLabelDistance": -10,
                        "dispatch": {},
                        "staggerLabels": false,
                        "rotateLabels": 0,
                        "rotateYLabel": true,
                        "showMaxMin": true,
                        "height": 60,
                        "ticks": null,
                        "width": null,
                        "margin": {
                            "top": 0,
                            "right": 0,
                            "bottom": 0,
                            "left": 0
                        },
                        "duration": 250,
                        "orient": "left",
                        "tickValues": null,
                        "tickSubdivide": 0,
                        "tickSize": 6,
                        "tickPadding": 3,
                        "domain": [
                            0,
                            1
                        ],
                        "range": [
                            0,
                            1
                        ]
                    },
                    tooltip: {
                        keyFormatter: function (d) {
                            return (
                                d3.time.format('%x')(new Date(d))
                            );
                        }
                    },
                    zoom: {
                        "enabled": true,
                        "scaleExtent": [
                            1,
                            15
                        ],
                        "useFixedDomain": false,
                        "useNiceScale": true,
                        "horizontalOff": false,
                        "verticalOff": true,
                        "unzoomEventType": "dblclick.zoom"
                    },
                    bars: {
                        dispatch: {
                            tooltipShow: function (e) {
                            },
                            elementClick: function (e) {
                                $scope.heartRate.measurement.value = e.data[0];
                                var temp = new Date(e.data[1]);
                                $scope.heartRate.measurement.uniqueId = e.data[2];
                                var month = temp.getMonth() + 1;
                                $scope.heartRate.measurement.date = month + '/' + temp.getDate() + '/' + temp.getFullYear();
                                $scope.flag = true;
                                $scope.$apply();
                            }
                        }
                    },
                    "padData": true,
                    "interactive": true,
                    "showLegend": false,
                    "showXAxis": true,
                    "tickValues": null,
                    "showYAxis": true,
                    "defaultState": null,
                    "noData": null,
                    "rightAlignYAxis": false,
                    "useInteractiveGuideline": false,
                    "showGuideLine": true,
                    groupSpacing: (0.5),
                    styles: {
                        "classes": {
                            "with-3d-shadow": true,
                            "with-transitions": true,
                            "gallery": false
                        }
                    }
                },
                title: {
                    "enable": true,
                    "text": "Heart Rate Chart",
                    "className": "h4",
                    "css": {
                        "width": "nullpx",
                        "textAlign": "center"
                    }
                }
            },
            data:
                [

                    {
                        color: 'red',
                        key: "Heart Rate",
                        bar: true,
                        values: []
                    }
                ]
        }

    };               //Heart-Rate Chart
    $scope.bloodSaturation = {
        dataServer: [],
        newValue: null,
        updateBloodSaturation: function () {
            BiosignalService.OnlineServices.updateBloodSaturation($scope.bloodSaturation.newValue, $scope.bloodSaturation.measurement.uniqueId, function (result) {
                if (result === 'Ok') {
                    for (var i = 0; i < $scope.bloodSaturation.bloodSaturation.data[0].values.length; i++) {
                        if ($scope.bloodSaturation.bloodSaturation.data[0].values[i][2] === $scope.bloodSaturation.measurement.uniqueId) {
                            $scope.bloodSaturation.bloodSaturation.data[0].values[i][0] = $scope.bloodSaturation.newValue;
                            break;
                        }
                    }
                    $scope.bloodSaturation.bloodSaturation.api.refresh();
                    $scope.flag = false;
                    $scope.bloodSaturation.newValue = '';
                    $scope.bloodSaturation.measurement = {
                        value: '',
                        date: '',
                        uniqueId: ''
                    }
                }
            });
        },
        deleteBloodSaturation: function () {
            BiosignalService.OnlineServices.deleteBloodSaturation($scope.bloodSaturation.measurement.uniqueId, function (result) {
                if (result === 'Ok') {
                    for (var i = 0; i < $scope.bloodSaturation.bloodSaturation.data[0].values.length; i++) {
                        if ($scope.bloodSaturation.bloodSaturation.data[0].values[i][2] === $scope.bloodSaturation.measurement.uniqueId) {
                            $scope.bloodSaturation.bloodSaturation.data[0].values.splice(i, 1);
                            break;
                        }
                    }
                    $scope.bloodSaturation.bloodSaturation.api.refresh();
                    $scope.flag = false;
                    $scope.bloodSaturation.measurement = {
                        value: '',
                        date: '',
                        uniqueId: ''
                    }
                }
            })

        },
        measurement: {
            value: '',
            date: '',
            uniqueId: ''
        },
        //Heart Chart implementatiom
        bloodSaturation: {

            callback: {},
            events: {},
            api: {},
            config: {visible: true},
            options: {
                chart: {
                    type: 'historicalBarChart',
                    height: 450,
                    width: 600,
                    "margin": {
                        "top": 20,
                        "right": 20,
                        "bottom": 65,
                        "left": 80
                    },
                    clipEdge: true,
                    x: function (d) {
                        return d[1];
                    },
                    y: function (d) {
                        return d[0];
                    },
                    showValues: true,
                    valueFormat: function (d) {
                        return d3.format(',.4f')(d);
                    },
                    transitionDuration: 500,
                    xAxis: {
                        "width": null,
                        axisLabel: '',
                        "rotateLabels": 30,
                        "showMaxMin": true,
                        "dispatch": {},
                        interactive: true,
                        "axisLabelDistance": 0,
                        "staggerLabels": false,
                        "rotateYLabel": true,
                        "height": 60,
                        "margin": {
                            "top": 0,
                            "right": 0,
                            "bottom": 0,
                            "left": 0
                        },
                        "duration": 250,
                        "orient": "bottom",
                        "tickValues": null,
                        "tickSubdivide": 0,
                        "tickSize": 1,
                        "tickPadding": 5,
                        "domain": [
                            0,
                            1
                        ],
                        "range": [
                            0,
                            1
                        ],
                        "ticks": null,
                        tickFormat: function (d) {
                            return d3.time.format('%x')(new Date(d))
                        }
                    },
                    yAxis: {
                        label: "SO2",
                        "axisLabelDistance": -10,
                        "dispatch": {},
                        "staggerLabels": false,
                        "rotateLabels": 0,
                        "rotateYLabel": true,
                        "showMaxMin": true,
                        "height": 60,
                        "ticks": null,
                        "width": null,
                        "margin": {
                            "top": 0,
                            "right": 0,
                            "bottom": 0,
                            "left": 0
                        },
                        "duration": 250,
                        "orient": "left",
                        "tickValues": null,
                        "tickSubdivide": 0,
                        "tickSize": 6,
                        "tickPadding": 3,
                        "domain": [
                            0,
                            1
                        ],
                        "range": [
                            0,
                            1
                        ]
                    },
                    tooltip: {
                        keyFormatter: function (d) {
                            return (
                                d3.time.format('%x')(new Date(d))
                            );
                        }
                    },
                    zoom: {
                        "enabled": true,
                        "scaleExtent": [
                            1,
                            15
                        ],
                        "useFixedDomain": false,
                        "useNiceScale": true,
                        "horizontalOff": false,
                        "verticalOff": true,
                        "unzoomEventType": "dblclick.zoom"
                    },
                    bars: {
                        dispatch: {
                            tooltipShow: function (e) {
                            },
                            elementClick: function (e) {
                                $scope.bloodSaturation.measurement.value = e.data[0];
                                var temp = new Date(e.data[1]);
                                $scope.bloodSaturation.measurement.uniqueId = e.data[2];
                                var month = temp.getMonth() + 1;
                                $scope.bloodSaturation.measurement.date = month + '/' + temp.getDate() + '/' + temp.getFullYear();

                                $scope.flag = true;
                                $scope.$apply();
                            }
                        }
                    },
                    "padData": true,
                    "interactive": true,
                    "showLegend": false,
                    "showXAxis": true,
                    "tickValues": null,
                    "showYAxis": true,
                    "defaultState": null,
                    "noData": null,
                    "rightAlignYAxis": false,
                    "useInteractiveGuideline": false,
                    "showGuideLine": true,
                    groupSpacing: (0.5),
                    styles: {
                        "classes": {
                            "with-3d-shadow": true,
                            "with-transitions": true,
                            "gallery": false
                        }
                    }
                },
                title: {
                    "enable": true,
                    "text": "Blood Saturation Chart",
                    "className": "h4",
                    "css": {
                        "width": "nullpx",
                        "textAlign": "center"
                    }
                }
            },
            data:
                [
                    {
                        color: 'blue',
                        key: "Blood Saturation",
                        bar: true,
                        values: []
                    }
                ]
        }
    };        //Oxygen-Saturation Chart

    $scope.range = '';
    $scope.previousValue ='';  // Flag used to check if elements have changed
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
                        // tickFormat: function(d){
                        //     return d3.format('.02f')(d);
                        // },
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
    $(document).on('click', function (e) {
        if ($(e.target).closest(".Nothide").length === 0) {
            $scope.flag = false;
            $scope.$apply();
        }
    });
    $scope.flag = false;  // Flag to hide-show an div area
    $scope.ChartSelect = 'heart_Rate';
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
        appearHeart: function () {
            $scope.heartRate.heart.config.visible = true;
        },
        getHeart: function (range) {
            BiosignalService.OnlineServices.getHeart(range,function (result) {
                if (result.message === 'Ok') {
                    $scope.heartRate.heart.data[0].values = result.Result;
                    $scope.heartRate.heart.api.refresh();
                    $scope.functions.appearHeart();
                    $scope.flag = false;
                }

            })
        },
        getBloodSaturation: function (range) {
            BiosignalService.OnlineServices.getBloodSaturation(range,function (response) {
                if (response.message === 'Ok') {
                    $scope.bloodSaturation.bloodSaturation.data[0].values = response.Result;
                    $scope.bloodSaturation.bloodSaturation.api.refresh();
                    $scope.functions.appearHeart();
                }
            })
        },
        refresh: function () {
                $scope.FirstTime = false;
                $scope.functions.getHeart($scope.range);
                $scope.functions.getBloodSaturation($scope.range);
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
        }

        $scope.sensor.Chart.options.subtitle.text = 'State of Sensor: ' + status;
        if(!$scope.$digest)
            $scope.$apply();

    });
});