var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var User = new Schema({
    Username:{
        type:'String',
        required:true
    },
    Password:{
        type:'String',
        required:true
    },
    ApprovedUsers:[{
        username:{
            type:'String'
        }
    }]
});

module.exports= mongoose.model('User',User);
