/**
 * Created by timoskorres on 1/5/2017.
 */

var oauth2orize = require('oauth2orize');
var bcrypt = require('bcrypt');
var passport = require('passport');
var users = require('../models/user');
var token = require('../models/token');
var server = oauth2orize.createServer();
var utils = require('../controllers/utils');
crypto = require('crypto');
var Token = require('../models/token');

server.exchange(oauth2orize.exchange.password(
    function (client, username, password, scope, done) {
        users.findOne({username: username}, function (err, user_found) {
            if (err) {
                return done(err);
            }
            if (!user_found) {
                //User not found
                return done(null, false);
            }
            user_found.verifyPassword(password, function (err, isMatch) {
                if (err)
                    return done(null, false);
                else if (!isMatch)
                    return done(null, false);
                console.log('confirmed password');
                //Create and save new token
                var token_value = utils.uid(256);
                var token = new Token({
                    value: token_value,
                    clientId: client.ClientId,
                    userId: user_found._id,
                    expirationDate: new Date(new Date().getTime() + (24 * 3600 * 1000)) // Each token is Valid for one Day
                });
                token.save(function (err) {
                    if (err) return done(err);
                    return done(null, token_value);
                });
            });
        })
    }));

//token endpoint

exports.token = [
    passport.authenticate('oauth2-client-password', {session: false}),
    server.token(),
    server.errorHandler()
];