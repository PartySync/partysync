/*
	(c) 2015 Gautam Mittal
*/

var dotenv = require('dotenv');
dotenv.load(); // load environment variables

var express = require('express');
var app = express();

var request = require('request');

var Keen = require("keen.io");
var client = Keen.configure({
    projectId: process.env.KEEN_PROJECT_ID,
    writeKey: process.env.KEEN_WRITE_KEY
});

var Firebase = require('firebase');

// access to the command line
// var exec = require('child_process').exec;

// ability to invoke ngrok
var ngrok = require('ngrok');
 







// main PartySync server stuff
var port = 3000;

// var globalDB = new Firebase("https://tap-78901.firebaseio.com/");

app.use(express.static(__dirname + ""));

app.use(function(req, res, next) {
  if (/\/hidden\/*/.test(req.path)) {
    return res.send(404, "Not Found"); // or 403, etc
  }
  next();
});

// make it all work
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/', function (req, res) {
  // res.send('Hello World!');
  res.sendFile(__dirname + '/index.html');
});


// method of grabbing the firebase url
app.get('/db-cEk3A5u9V7jx5A7GelF5', function (req, res) {
	res.send({"firebase_url": secure_firebaseDB_tunnel});
});


app.get('/:party_name', function (req, res) {
	var ip = req.connection.remoteAddress;

	console.log(req.param("party_name").toLowerCase());
	var id = req.param("party_name").toLowerCase();

	request('http://ip-api.com/json/'+ip, function (err, response, body) {
		var ipData = JSON.parse(body);
		var location = ipData.city + ", " + ipData.region + ", " + ipData.country +" "+ipData.zip;
		console.log(location);

		client.addEvent("basic", {"room_name": id, "location": location}, function(err, res) {
		    if (err) {
		        console.log("Oh no, an error!");
		    } else {
		        console.log("Hooray, it got logged!");
		    }
		});
	});




	  res.sendFile(__dirname + '/tap.html');


});

app.listen(port);



console.log('Listening on port ' + port);
