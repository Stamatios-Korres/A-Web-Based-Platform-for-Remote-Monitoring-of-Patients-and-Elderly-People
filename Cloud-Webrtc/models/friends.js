/**
 * Created by timoskorres on 5/5/2017.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var relationship = new Schema(
    {
        user:{
            type:'String',
            required: 'true',
            unique:'true'
        },
        friends:[{
                type: 'String',
                required:'true'
        }],
        RequestsSent:[{
                to:{
                    type:'String',
                    required:'true'
                },
                state:{
                    type:'String',
                    enum:[
                        'pending',
                        'accepted',
                        'rejectedFromReceiver',
                        'cancelled'
                    ]
                }
        }],
        RequestsReceived:[{
                from:{
                    type:'String',
                    required:'true'
                },
                state:{
                    type:'String',
                    enum:[
                        'pending',
                        'accepted',
                        'RejectedFromReceiver',
                        'cancelled'
                    ]
                }
        }]
    }
);

module.exports = mongoose.model('relationships',relationship);
