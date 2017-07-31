
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var notification = new Schema({
    description:{
        type:'String',
        required:true
    },
    date:{
        type:"date",
        required:true
    },
    repeat:{
        type:'String'
    },
    uniqueId:{
        type:'String',
        Required:'true'
    }

});

module.exports= mongoose.model('notification',notification);
