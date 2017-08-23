/**
 * Created by timos on 18/7/2017.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var msg1 = new Schema({

    ConvesrationId:{
      type:'String',
      unique:'true',
      required:'true'
    },
    message:[
        {
            data:{
                type:'String',
                required:true
            },
            from:{
                type:'String',
                required:true
            },
            to:{
                type:'String',
                required:true
            },
            timestamp:{
                type :Date,
                required: 'true',
                default :Date.now()
            },
            uniqueId:{
                type:'String',
                required:true
            }
        }
    ]
});

module.exports = mongoose.model('msg1',msg1);
