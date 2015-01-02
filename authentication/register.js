var LocalStrategy   = require('passport-local').Strategy;
var UsersModel = require('../model/dataschema');
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

	passport.use('signup', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {

            findOrCreateUser = function(){
                UsersModel.findOne({ 'username' :  username }, function(err, user) {
                    if (err){
                        console.log('Error during registration: ' + err);
                        return done(err);
                    }
                    if (user) {
                        console.log('User already exists');
                        return done(null, false, req.flash('message','User Already Exists'));
                    } else {
                        var newUser = new UsersModel();
                        newUser.username = username;
                        newUser.password = createHash(password);
                        newUser.email = req.param('email');
                        newUser.role = req.param('role');

                        newUser.save(function(err) {
                            if (err){
                                console.log('Error during Saving user: '+err);  
                                throw err;  
                            }
                            console.log('User Registration succesful');    
                            return done(null, newUser);
                        });
                    }
                });
            };
            process.nextTick(findOrCreateUser);
        })
    );

    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }

}