/*
	(c) 2015 Gautam Mittal
*/

var express = require('express');
var app = express();

var Keen = require("keen.io");
var client = Keen.configure({
    projectId: "54cc2e72c1e0ab7eb9e4c858",
    writeKey: "ce3dfd99ae1a5c7d8621162eecb4a80acc5d1f15439288556d1bd829e95f9625954da38847aa95f2aa6567e16494519a3a70ae31b1976103ba95beff21899c63495a1aeb5b3badf1d8a80a8861f48956f948a94114287a77bf458c6ca94559ad96a11bb062133be59cf8b968276a0bdf"
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
  res.send('Hello World!');
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
