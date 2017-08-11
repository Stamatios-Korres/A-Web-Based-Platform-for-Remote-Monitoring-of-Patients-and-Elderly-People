var notification = require('../models/NotificationModel');
var notify = require('../WebsocketServer/Websocket').notification;
exports.deamon = function () {
    console.log('Starting to looking in DB ...');
    SearchDb();
};


function SearchDb() {
    notification.find({}, function (err, result) {
        if (err)
            console.log(err);
        else {
            for (var i = 0; i < result.length; i++) {
                var tempDate = result[i].date.getTime();
                var nowDate = new Date().getTime();
                var updateTime = result[i].remindDate.getTime();
                // Initial Time of notifications has arrived
                if (Math.abs(tempDate - nowDate) <= 60000) { //Inform the User about the notification
                    console.log('Active Found');
                    if (result[i].show === 'yes') {
                        console.log('going to show now');
                        notify(result[i]);
                        notification.update({uniqueId: result[i].uniqueId}, {show: 'no'}, function (err, res) {
                            if (err)
                                console.log(err);
                            else
                                console.log('succes with updating view');
                        })
                    }
                }
                // The notification had been postoponed - Remind also
                else if (Math.abs(tempDate - updateTime) <= 60000 && result[i].remindFlag === 'true') {
                    console.log('Found a reminder one');
                    notify(result[i]);
                    notification.update({uniqueId: result[i].uniqueId}, {
                        show: 'no',
                        remindFlag: false
                    }, function (err, res) {
                        if (err)
                            console.log(err);
                        else
                            console.log('succes with updating view');
                    })
                }
            }
        }
        setTimeout(SearchDb, 30000);
    });

}