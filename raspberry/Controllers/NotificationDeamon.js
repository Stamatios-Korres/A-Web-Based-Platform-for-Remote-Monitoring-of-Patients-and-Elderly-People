var notification = require('../models/NotificationModel');
var notify = require('../WebsocketServer/Websocket').notification;


function try1(){
    console.log('Starting to looking in DB ...');
    SearchDb();
}

exports.deamon = try1;

function SearchDb() {
    nowDate = new Date();
    notification.find({}, function (err, result) {
        if (err)
            console.log(err);
        else {
            for (var i = 0; i < result.length; i++) {
                var tempDate = result[i].date;
                var updateTime = result[i].remindDate;

                // Initial Time of notifications has arrived

                if(result[i].repeat === 'Never' || result[i].remindFlag === true) {
                    if (Math.abs(tempDate - nowDate) <= 50000 && result[i].show === 'yes') {
                        // console.log('going to show now');
                        notify(result[i]);
                        notification.update({uniqueId: result[i].uniqueId}, {show: 'no'}, function (err, res) {
                            if (err)
                                console.log(err);
                            else
                                console.log('succes with updating view');
                        })
                    }

                    // The notification had been postoponed - Remind also

                    else if (Math.abs(nowDate - updateTime) <= 60000 && result[i].remindFlag === true) {
                        // console.log('Found a reminder one');
                        notify(result[i]);
                        notification.update({uniqueId: result[i].uniqueId},
                            {
                                show: 'no',
                                remindFlag: false
                            }, function (err, result) {
                                if (err)
                                    console.log(err);
                                else {
                                }
                            })
                    }

                    // Periodical  Notification
                }
                else {
                    var distance = result[i].repeat;
                    if(distance === 'Weekly') {
                        console.log('Periodical');
                        if( nowDate.getDay() -tempDate.getDay() === 0){
                            var difference = (nowDate.getHours()*60 + nowDate.getMinutes())-(tempDate.getHours()*60 + tempDate.getMinutes());
                            if(Math.abs(difference) <= 5 && !result[i].showedToday && !result[i].readyTochange){
                                notify(result[i]);
                                notification.update({uniqueId:result[i].uniqueId},{
                                    showedToday:true,
                                    readyTochange:true
                                },function(err,result){

                                });
                            }
                            else if(difference > 5 && result[i].readyTochange){
                                notification.update({uniqueId:result[i].uniqueId},{
                                    showedToday:false,
                                    readyTochange:false
                                },function(err,result){
                                    if(err)
                                        console.log(err);
                                })
                            }
                        }
                    }
                    else if(distance === 'Daily'){
                        var difference2 = (nowDate.getHours()*60 + nowDate.getMinutes())-(tempDate.getHours()*60 + tempDate.getMinutes());
                        if(Math.abs(difference2) <= 5 && !result[i].showedToday && !result[i].readyTochange){
                            notify(result[i]);
                            notification.update({uniqueId:result[i].uniqueId},{
                                showedToday:true,
                                readyTochange:true
                            },function(err,result){

                            });
                        }
                        else if(difference2 > 5 && result[i].readyTochange){
                            notification.update({uniqueId:result[i].uniqueId},
                                {
                                    showedToday:false,
                                    readyTochange:false
                                },function(err,result){
                                if(err)
                                    console.log(err);
                            })
                        }
                    }
                }
            }
        }
        setTimeout(SearchDb, 30000);
    });

}