var LocalStrategy   = require('passport-local').Strategy;
var UsersModel = require('../model/dataschema');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {
            UsersModel.findOne({ 'username' :  username }, 
                function(err, user) {
                    if (err) {
                        return done(err);
					}
                    if (!user) {
                        console.log('User Not Found with username '+ username);
                        return done(null, false, req.flash('message', 'Incorrect username.'));                 
                    }
                    if (!isValidPassword(user, password)){
                        console.log('Incorrect password.');
                        return done(null, false, req.flash('message', 'Incorrect password.'));
                    }
                    return done(null, user);
                }
            );

        })
    );

    var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    }
    
}