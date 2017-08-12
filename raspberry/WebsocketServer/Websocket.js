var Wss = require('websocket').server;
var wss;
var ourConnectionIp;


exports.initialize =function (server) {
    wss = new Wss({
        httpServer: server
    });
    wss.on('request', function (request) {
        var connection = request.accept(null, request.origin);
        connection.on('message', function (message) {
            var data = message.utf8Data;
            try {
                data = JSON.parse(data);
                switch (data.type) {
                    case 'init':{
                        ourConnectionIp = connection;
                        console.log('Connection was set');
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });
        connection.on('close', function () {
            ourConnectionIp = null;
        })
    })
};

exports.Sensor = function(data){
    var msg = {
        type:'SensorMeasurement',
        data:data
    };
    if(ourConnectionIp)
        ourConnectionIp.send(JSON.stringify(msg));
};

exports.notification = function(notification){
    var message = {
        type:'ActiveNotification',
        notification:notification
    };
    if(ourConnectionIp) {
        ourConnectionIp.send(JSON.stringify(message));
    }
};