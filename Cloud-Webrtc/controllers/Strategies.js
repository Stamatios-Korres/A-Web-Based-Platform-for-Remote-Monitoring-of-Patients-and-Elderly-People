
var passport = require('passport');
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var LocalStrategy = require('passport-local').Strategy;
var users = require('../models/user');
var token = require('../models/token');
var client = require('../models/client');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    })
};

passport.use(new LocalStrategy(
    function(username,password,done) {
        users.findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'incorrect password'});
            }
            if (password !== user.password) {
                return done(null, false,{message: 'incorrect password'});
            }
            return done(null, user);
        })
    }));

passport.use(new ClientPasswordStrategy(
    function(client_id,client_secret,done) {
        client.findOne({ClientId: client_id}, function (err, client) {
            if (err) {
                return done(err);
            }
            if (!client) {
                console.log('No client with username : ' + client_id);
                return done(null, false, {message: 'No user with this name'});
            }
            if (client_secret !== client.Client_Secret) {
                return done(null, false,{message: 'incorrect password'});
            }
            return done(null, client);
        })
    }));

passport.use(new BasicStrategy(
    function(username,password,done) {
        users.findOne({username: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'incorrect passworrd'});
            }
            if (password !== user.password) {
                return done(null, false);
            }
            return done(null, user);
        })
    }));

passport.use(new BearerStrategy('accessToken',function(access_token,done) {
        token.findOne({value:access_token},function(err,token_found){
            if(err)
                return done(err);
            else if(!token_found)
              return done(null,false);
            else if(token_found.expirationDate <= new Date() )
              return(done(null,false));
            else {
                users.findOne({_id: token_found.userId}, function (err, found_user) {
                    if (err)
                        return done(err);
                    if (!found_user)
                        return done(null, false);
                    done(null, found_user);
                })
            }
        })
    }
));

//exports.login = passport.authenticate('oauth2-client-password',{session:false});