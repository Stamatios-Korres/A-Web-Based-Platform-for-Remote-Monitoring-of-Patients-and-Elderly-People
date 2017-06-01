/**
 * Created by timoskorres on 30/4/2017.
 */
var mongoose = require('mongoose');

// Define our token schema
var TokenSchema   = new mongoose.Schema({
    value: { type: String, required: true },
    userId: { type: String, required: true },
    clientId:{ type: String, required: true },
    expirationDate:{type:Date, required:true}
});

// Export the Mongoose model
module.exports = mongoose.model('Token', TokenSchema);