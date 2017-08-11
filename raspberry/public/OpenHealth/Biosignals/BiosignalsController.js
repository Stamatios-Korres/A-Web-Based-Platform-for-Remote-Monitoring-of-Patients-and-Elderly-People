/**
 * Created by timos on 25/7/2017.
 */

var Biosignals = angular.module('Biosignals', ['nvd3']);

Biosignals.service('BiosignalService', function ($http) {
    var services = {};
    var OnlineServices = {};
    OnlineServices.updateHeart = function (newvalue, uniqueId, callback) {
        console.log('Now explain me this');
        $http({
            method: 'post',
            url: '/biosignal/heartUpdate',
            data: {newvalue: newvalue, uniqueId: uniqueId}
        }).then(function successCallback(response) {
            console.log(response);
            callback(response.data.message);
        });
    };
    OnlineServices.deleteHeart = function (uniqueId, callback) {
        console.log('Now explain me this');
        $http({
            headers: {
                'Content-type': 'application/json;charset=utf-8'
            }
            ,
            method: 'delete',
            url: '/biosignal/heartdelete',
            data: {uniqueId: uniqueId}
        }).then(function successCallback(response) {
            console.log(response);
            callback(response.data.message);
        });
    };
    OnlineServices.insertHeart = function (value, callback) {
        $http({
            method: 'post',
            url: '/biosignal/heartInsert',
            data: value
        }).then(function successCallback(response) {
            console.log(response);
            callback(response.data.message);
        });
    };
    OnlineServices.insertBloodSaturation = function (value, callback) {
        $http({
            method: 'post',
            url: '/biosignal/BloodSaturationInsert',
            data: value
        }).then(function successCallback(response) {
            console.log(response);
            callback(response.data.message);
        });
    };
    OnlineServices.getHeart = function (callback) {
        $http({
            method: 'get',
            url: '/biosignal/heartbiosignals'
        }).then(function successCallback(response) {
            callback(response.data);
        });
    };
    OnlineServices.getBloodSaturation = function (callback) {
        $http({
            method: 'get',
            url: '/biosignal/bloodSaturationbiosignals'
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
                    console.log('update form');
                    $scope.heartRate.heart.api.update();
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
                    console.log('update form');
                    $scope.heartRate.heart.api.update();
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
                                console.log('tooltipShow')
                            },
                            elementClick: function (e) {
                                $scope.heartRate.measurement.value = e.data[0];
                                var temp = new Date(e.data[1]);
                                console.log('Unique id is: ' + e.data[2]);
                                $scope.heartRate.measurement.uniqueId = e.data[2];
                                console.log(typeof temp.getMonth());
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
                    //     {
                    //     color: 'red',
                    //     "key": "Heart Rate",
                    //     "bar": true,
                    //     "values": []
                    // },

                    {
                        color: 'grey',
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
            BiosignalService.OnlineServices.updateHeart($scope.heartRate.newValue, $scope.heartRate.measurement.uniqueId, function (result) {
                if (result === 'Ok') {
                    for (var i = 0; i < $scope.heartRate.heart.data[0].values.length; i++) {
                        if ($scope.heartRate.heart.data[0].values[i][2] === $scope.heartRate.measurement.uniqueId) {
                            $scope.heartRate.heart.data[0].values[i][0] = $scope.heartRate.newValue;
                            break;
                        }
                    }
                    console.log('update form');
                    $scope.heartRate.heart.api.update();
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
        deleteBloodSaturation: function () {
            BiosignalService.OnlineServices.deleteHeart($scope.heartRate.measurement.uniqueId, function (result) {
                if (result === 'Ok') {
                    for (var i = 0; i < $scope.heartRate.heart.data[0].values.length; i++) {
                        if ($scope.heartRate.heart.data[0].values[i][2] === $scope.heartRate.measurement.uniqueId) {
                            $scope.heartRate.heart.data[0].values.splice(i, 1);

                            break;
                        }
                    }
                    console.log('update form');
                    $scope.heartRate.heart.api.update();
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
                                console.log('tooltipShow')
                            },
                            elementClick: function (e) {

                                $scope.heartRate.measurement.value = e.data[0];
                                var temp = new Date(e.data[1]);
                                console.log('Unique id is: ' + e.data[2]);
                                $scope.heartRate.measurement.uniqueId = e.data[2];
                                console.log(typeof temp.getMonth());
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
                        color: 'grey',
                        key: "Heart Rate",
                        bar: true,
                        values: []
                    }
                ]
        }
    };        //Oxygen-Saturation Chart

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
                        console.log("!!! lineChart callback !!!");
                    }
                },
                title: {
                    enable: true,
                    text: 'Title for Line Chart'
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
                    console.log(msg.Date);
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
            console.log(string);
            switch (string) {
                case 'auto':
                    var msg = {
                        type: 'Oxygen',
                        value: $scope.NewValue.bloodSaturation,
                        Date: new Date()
                    };
                    console.log(msg.Date);
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
        getHeart: function () {
            BiosignalService.OnlineServices.getHeart(function (result) {
                if (result.message === 'Ok') {
                    $scope.heartRate.heart.data[0].values = result.Result;
                    $scope.heartRate.heart.api.refresh();
                    $scope.functions.appearHeart();
                    $scope.flag = false;
                }

            })
        },
        getBloodSaturation: function () {
            BiosignalService.OnlineServices.getBloodSaturation(function (response) {
                if (response.message === 'Ok') {
                    $scope.bloodSaturation.bloodSaturation.data[0].values = response.Result;
                    $scope.bloodSaturation.bloodSaturation.api.refresh();
                    $scope.functions.appearHeart();
                }
            })
        },
        refresh: function () {
            $scope.functions.getHeart();
            $scope.functions.getBloodSaturation();
        }
    };
    Websocket.NewMeasurement($scope,function(){
        if($scope.sensor.Chart.data[0].values.length ===10){
            $scope.sensor.Chart.data[0].values.splice(0,1);
            $scope.sensor.Chart.data[1].values.splice(0,1);
        }
        $scope.sensor.Chart.data[0].values.push(SpO2);
        $scope.sensor.Chart.data[1].values.push(Pulse);
        $scope.sensor.Chart.options.subtitle.text = 'State of Sensor: ' + status;
        if(!$scope.$digest)
            $scope.$apply();
        $scope.sensor.Chart.api.update();
    });
});