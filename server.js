var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var config = require('./libs/config');
var UsersModel = require('./libs/mongoose').UsersModel;
var app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());

app.get('/users/:id', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.type('application/json');
  
  var jsonResponse = new Object();
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    jsonResponse.message = 'Not valid user id';
	return res.json(jsonResponse);
  }
    
  return UsersModel.findById(req.params.id, function (err, user) {
        if (!user) {
            res.statusCode = 404;
			jsonResponse.error = 'Not found';
        }
        if (!err) {
			jsonResponse.status = 'OK';
			jsonResponse.user = user;
        } else {
            res.statusCode = 500;
            console.log('Internal error(%d): %s', res.statusCode, err.message);
			jsonResponse.error = 'Server error';
        }
		
		return res.json(jsonResponse);
    });
});

app.get('/users', function(req, res) {
    return UsersModel.find(function (err, users) {
        if (!err) {
            return res.json(users);
        } else {
            res.statusCode = 500;
            console.log('Internal error(%d): %s',res.statusCode,err.message);
			var jsonResponse = new Object();
			jsonResponse.error = 'Server error';
            return res.json(jsonResponse);
        }
    });
});

app.post('/users', function(req, res) {
    var user = new UsersModel({
        role: req.body.role,
        email: req.body.email,
        password: req.body.password
    });

    user.save(function (err) {
		var jsonResponse = new Object();
        if (!err) {
            console.log("user created");
			jsonResponse.status = 'OK';
			jsonResponse.user = user;
            return res.json(jsonResponse);
        } else {
            console.log(err);
            if(err.name == 'ValidationError') {
                res.statusCode = 400;
				jsonResponse.error = 'Validation error';
                res.json(jsonResponse);
            } else {
                res.statusCode = 500;
				jsonResponse.error = 'Server error';
                res.json(jsonResponse);
            }
            console.log('Internal error(%d): %s', res.statusCode, err.message);
        }
    });
});


var server = app.listen(config.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});