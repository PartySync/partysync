/*
	(c) 2015 Gautam Mittal
*/

var dotenv = require('dotenv');
dotenv.load(); // load environment variables

var express = require('express');
var app = express();

var Keen = require("keen.io");
var client = Keen.configure({
    projectId: process.env.KEEN_PROJECT_ID,
    writeKey: process.env.KEEN_WRITE_KEY
});

var Firebase = require('firebase');

var port = 8080;

// var globalDB = new Firebase("https://tap-78901.firebaseio.com/");

app.use(express.static(__dirname + ""));

app.use(function(req, res, next) {
  if (/\/hidden\/*/.test(req.path)) {
    return res.send(404, "Not Found"); // or 403, etc
  }
  next();
});

app.get('/', function (req, res) {
  // res.send('Hello World!');
  res.sendFile(__dirname + '/index.html');
});



app.get('/:party_name', function (req, res) {
	console.log(req.param("party_name").toLowerCase());
	var id = req.param("party_name").toLowerCase();

	client.addEvent("basic", {"room_name": id}, function(err, res) {
	    if (err) {
	        console.log("Oh no, an error!");
	    } else {
	        console.log("Hooray, it got logged!");
	    }
	});



	  res.sendFile(__dirname + '/tap.html');


});

app.listen(port);



console.log('Listening on port ' + port);
