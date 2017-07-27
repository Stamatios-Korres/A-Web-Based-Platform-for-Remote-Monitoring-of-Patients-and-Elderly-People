var noble = require('noble');

var ble = {};

var bufferPulse = [];
var bufferSpO2 = [];
var bufferPi = [];
var bufferDate = [];
var index = 0;
var status = "";
const BIO_BUFFER_SIZE = 10;

noble.on('stateChange', function (state) {
    console.log(state);
    if (state === 'poweredOn') {
        status = "Disconnected / Scanning";
        noble.startScanning(['cdeacb8052354c07884693a37ee6b86d'], true);
    } else {
        status = "No BLE Available / NOT Scanning";
        noble.stopScanning();
    }
});

connecting = false;

//oximeter
noble.on('discover', function (peripheral) {
    console.log('Found device with local name: ' + peripheral.advertisement.localName);
    console.log('advertising the following service uuid\'s: ' + peripheral.advertisement.serviceUuids);
    console.log();

    if (peripheral.advertisement.localName == 'Medical' && !connecting) {
        connecting = true;
        noble.stopScanning();
        peripheral.connect(function (error) {
            console.log('connected to peripheral: ' + peripheral.uuid);
            status = "Connected to Medical";
            peripheral.discoverServices(['cdeacb8052354c07884693a37ee6b86d'], function (error, services) {
                console.log('discovered services');
                var oximeterService = services[0];
                oximeterService.discoverCharacteristics(['cdeacb8152354c07884693a37ee6b86d'], function (error, characteristics) {
                    console.log('discovered characteristics');
                    var oximeterChar = characteristics[0];
                    oximeterChar.on('data', function (data, isNotification) {
                        if (data.length == 11 && (data[0] & 0xff) == 0x80) {
                            processPpg(data);
                        } else if (data.length == 4 && (data[0] & 0xff) == 0x81) {
                            processSpO2(data);

                        }
                    });
                    oximeterChar.notify(true, function (error) {
                        console.log('Measurement notification on');
                    });
                });
            });
        });
        peripheral.once('disconnect', function () {
            console.log('disconnected');
            status = "Disconnected / Scanning";
            noble.startScanning(['cdeacb8052354c07884693a37ee6b86d'], true);
            connecting = false;
        });
    }
});

function bufferPush(pulse, spO2, pi, date) {
    if (index < BIO_BUFFER_SIZE) {
        index++;
    } else {
        bufferPulse.splice(0, 1);
        bufferSpO2.splice(0, 1);
        bufferPi.splice(0, 1);
        bufferDate.splice(0, 1);
    }
    bufferPulse.push(pulse);
    bufferSpO2.push(spO2);
    bufferPi.push(pi);
    bufferDate.push(date);
}

function processPpg(data) {
    var ppg = [];

    //console.log(data);
}

function processSpO2(data) {
    var pulse = data[1] & 0xff;
    var SpO2 = data[2] & 0xff;
    var pi = data[3] & 0xff;
    console.log('pulse :' + pulse);
    console.log('SpO2 :' + SpO2);
    console.log('pi :' + pi);

    status = "Measuring";

    if (pulse != 255 && SpO2 != 127) {
        var d = new Date();
        d.setMilliseconds(0);
        bufferPush(pulse, SpO2, pi, d);
    }
}

ble.getData = function () {
    return {
        'pulse': bufferPulse,
        'SpO2': bufferSpO2,
        'pi': bufferPi,
        'status': status,
        'date': bufferDate
    };
};

ble.getDataSize = function () {
    return BIO_BUFFER_SIZE;
};

module.exports = ble;
