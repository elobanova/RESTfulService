var express = require('express'),
	path = require('path'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	app = express(),
	passport = require('passport'),
	expressSession = require('express-session'),
	flash = require('connect-flash'),
	initPassport = require('./authentication/init'),
	routes = require('./routes/forwarding')(passport),
	config = require('./model/config');

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
initPassport(passport);
app.use('/', routes);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
	console.log('--------------' + err);
    err.status = 404;
    next(err);
});

var server = app.listen(config.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

module.exports = app;
