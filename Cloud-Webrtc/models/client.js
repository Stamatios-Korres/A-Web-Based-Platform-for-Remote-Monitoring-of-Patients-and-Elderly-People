var mongoose = require('mongoose');

// Define our token schema

var client   = new mongoose.Schema({
    name:{
        type:String
    },
    ClientId:{
        type: String,
        required: true
    },
    Client_Secret:{
        type:String,
        required: true
    }
});

// Export the Mongoose model
module.exports = mongoose.model('client', client);