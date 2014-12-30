var express = require('express'),
	morgan = require('morgan'),
	bodyParser = require('body-parser'),
	config = require('./libs/config'),
	UsersModel = require('./libs/mongoose').UsersModel,
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(username, password, done) {
  alert('in here!');
    UsersModel.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

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

var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = config.get('port');
 
/*http.createServer(function(request, response) {
 
  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);
  
  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }
 
    if (fs.statSync(filename).isDirectory()) filename += '/index.html';
 
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }
 
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10)); */




var server = app.listen(config.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});