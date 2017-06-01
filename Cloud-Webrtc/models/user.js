/**
 * Created by timoskorres on 30/4/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
//var bcrypt = require('bcrypt');
var SaltFactor = 10;


var user = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

user.methods.verifyPassword = function(password,cb){
    bcrypt.compare(password,this.password,function(err,isMatch){
        if(err) return cb(err);
        cb(null,isMatch);
    });
};

user.pre('save',function(callback){
    var user = this;
    if (!user.isModified('password')) //What ?
            return callback();
    bcrypt.genSalt(SaltFactor,function(err,salt){
        if(err) return callback(err);
        bcrypt.hash(user.password,salt,null,function(err,hash){
            if(err) return callback(err);
            user.password = hash;
            callback();
        })
    });
});

module.exports = mongoose.model('user',user);