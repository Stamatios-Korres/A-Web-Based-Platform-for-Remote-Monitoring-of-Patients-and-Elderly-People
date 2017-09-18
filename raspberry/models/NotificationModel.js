
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
        type:'String',
        enum:[
            'Daily',
            'Never',
            'Weekly'
        ]
    },
    showedToday:{
        type:'bool',
        required:true

    },
    readyTochange:{
        type:'bool',
        required:true

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
        ],
        required:true
    }
});

module.exports= mongoose.model('notification',notification);
