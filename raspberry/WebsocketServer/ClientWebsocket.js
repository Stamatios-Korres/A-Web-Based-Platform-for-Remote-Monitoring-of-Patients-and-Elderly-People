var WebSocketClient = require('websocket').client;
var client;
var W3CWebSocket = require('websocket').w3cwebsocket;
var msg = {
    type: 'unknown'

};




exports.initialize = function(){
    client = new W3CWebSocket('wss://healthcloud.menychtas.com/sockets', 'echo-protocol');
    console.log('Ok it was captured');
    client.onerror = function() {
        console.log('Connection Error');
    };
    client.onopen = function() {
        console.log('WebSocket Client Connected');
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(msg));
        }
    };
};
//
// exports.initialize = function(){
//     client = new WebSocketClient();
//     client.on('connectFailed', function(error) {
//         console.log('Connect Error: ' + error.toString());
//     });
//
//     client.on('connect', function(connection) {
//         console.log('WebSocket Client Connected');
//         client.onopen = function () {
//             console.log('WebSocket Client Connected');
//             client.connect('ws://healthcloud.menychtas.com/sockets', 'echo-protocol');
//             if (client.readyState === client.OPEN) {
//                 client.send(JSON.stringify(msg));
//             }
//         }
//     })
// };