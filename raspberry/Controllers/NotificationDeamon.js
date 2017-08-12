var notification = require('../models/NotificationModel');
var notify = require('../WebsocketServer/Websocket').notification;


function try1(){
    console.log('Starting to looking in DB ...');
    SearchDb(new Date());
}

exports.deamon = try1;

function SearchDb(nowDate) {
    notification.find({}, function (err, result) {
        if (err)
            console.log(err);
        else {
            console.log('Searching Db ...');
            //var nowDate = new Date();
            for (var i = 0; i < result.length; i++) {
                var tempDate = result[i].date;
                var updateTime = result[i].remindDate;


                if (Math.abs(tempDate - nowDate) <= 50000 &&  result[i].show === 'yes') { //Inform the User about the notification
                    console.log('going to show now');
                    notify(result[i]);
                    notification.update({uniqueId: result[i].uniqueId}, {show: 'no'}, function (err, res) {
                        if (err)
                            console.log(err);
                        else
                            console.log('succes with updating view');
                    })
                }   // Initial Time of notifications has arrived

                // The notification had been postoponed - Remind also

                if (Math.abs(nowDate - updateTime) <= 60000 && result[i].remindFlag === true) {
                    console.log('Found a reminder one');
                    notify(result[i]);
                    notification.update({uniqueId: result[i].uniqueId},
                        {
                            show: 'no',
                            remindFlag: false
                        }, function (err, result) {
                            if (err)
                                console.log(err);
                            else {
                                console.log(result);
                                console.log('succes with updating view');
                            }
                        })
                }
            }
        }
        setTimeout(try1, 30000);
    });

}