var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.get('mongoose:uri'));
var db = mongoose.connection;

db.on('error', function (err) {
    console.log('connection error:', err.message);
});
db.once('open', function callback () {
    console.log("Connected to DB!");
});

var Schema = mongoose.Schema;

var Users = new Schema({
    role: {
        type: String,
        enum: ['professor', 'student'],
        required: true
    },
    email: { type: String, required: true },
	password: { type: Stinrg, required: true}
});

var UsersModel = mongoose.model('Users', Users);

module.exports.UsersModel = UsersModel;