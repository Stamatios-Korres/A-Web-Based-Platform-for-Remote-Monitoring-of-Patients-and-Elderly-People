/**
 * Created by timos on 19/7/2017.
 */


var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var conversation = new Schema({

        ConversationId:{                        //Primary Key
            type:'String',
            required:'true',
            unique: 'true'
        },
        Participants:[]
   });

module.exports = mongoose.model('conversation',conversation);
