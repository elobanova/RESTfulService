var login = require('./login');
var signup = require('./register');
var UsersModel = require('../model/dataschema');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        console.log('serializing a user with the data ', user);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        UsersModel.findById(id, function(err, user) {
            console.log('deserializing a user with the data ', user);
            done(err, user);
        });
    });

    login(passport);
    signup(passport);
}