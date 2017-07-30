var notification = require('../models/NotificationModel');
var notify = require('../WebsocketServer/Websocket').notification;
exports.deamon = function(){
        SearchDb();
};


function SearchDb(){
    notification.find({},function(err,result){
        if(err)
            console.log(err);
        else{
            for(var i=0;i<result.length;i++){
                var tempDate = result[i].date.getTime();
                var nowDate = new Date().getTime();
                if(Math.abs(tempDate-nowDate) <= 60000){ //Inform the User about the notification
                    console.log('Active Found');
                    notify(result[i]);
                }
            }
        }
        setTimeout(SearchDb,30000);
    });

}