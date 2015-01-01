var express = require('express');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}

module.exports = function (passport) {
	router.get('/', function(req, res) {
		var jsonResponse = new Object();
		jsonResponse.message = req.flash('message');
		res.render('index', jsonResponse);
	});

	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true  
	}));

	router.get('/signup', function(req, res) {
		var jsonResponse = new Object();
		jsonResponse.message = req.flash('message');
		res.render('register', jsonResponse);
	});

	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true  
	}));

	router.get('/home', isAuthenticated, function(req, res) {
		var jsonResponse = new Object();
		jsonResponse.user = req.user;
		res.render('home', jsonResponse);
	});

	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;
}





