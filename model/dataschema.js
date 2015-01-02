var mongoose = require('mongoose'),
	config = require('./config');

mongoose.connect(config.get('mongoose:uri'));
var db = mongoose.connection;

db.on('error', function (err) {
    console.log('connection error:', err.message);
});
db.once('open', function callback () {
    console.log("Connected to DB!");
});

module.exports = mongoose.model('UsersModel',{
	id: String,
    role: {
        type: String,
        enum: config.get('roles'),
        required: true
    },
	username: { type: String, required: true},
    email: { type: String, required: true},
	password: { type: String, required: true}
});