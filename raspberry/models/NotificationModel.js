
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
        required:'true'
    },
    remindFlag:{
        type:'bool',
        required:'true'
    },
    remindDate:{
        type:'date',
        required:'true'
    },
    show:{
        type:'String',
        enum:[
            'yes',
            'no'
        ]
    }

});

module.exports= mongoose.model('notification',notification);
