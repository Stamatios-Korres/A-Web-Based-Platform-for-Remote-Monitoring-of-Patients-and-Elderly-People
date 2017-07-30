/**
 * Created by timos on 25/7/2017.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var biosignal = new Schema({
        'date_taken':{
            'type': 'date',
            'required': ' true'
        },
        'type':{
            'type': 'string',
            'enum':[
                'body_weight',
                'heart_rate',
                'body_temperature',
                'blood_saturation'
            ],
            'required': 'true'
        },
        'source':{
            'type': 'string',
            'enum':[
                'self_reported',
                'sensed'
            ]
        },
        'measurement':{
            'value':{
                'type': 'number'
            },
            'unit':{
                'type':'string',
                'enum':[
                    'bpm',
                    'SO2'
                ],
                'required': ' true'

            }
        },
        'condition':{
            'type': 'string',
            'enum':[
                'normal',
                'excellent',
                'warning',
                'critical',
                'average'
            ]
        },
        'user_notes':{
            'type': 'string'
        },
        // Need this in order to update-delete all the biosignals
        uniqueId:{
            type:'String',
            Required:'true'
        }

    });

module.exports= mongoose.model('biosignal',biosignal);
