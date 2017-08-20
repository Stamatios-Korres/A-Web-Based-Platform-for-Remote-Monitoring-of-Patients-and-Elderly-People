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
    WayOfLogin:{
      type:'String',
      required: true,
      enum :[
          'auto',
          'manual'
      ]
    },
    ApprovedUsers:[]

});

module.exports= mongoose.model('User',User);
