var express = require('express');
var app = express();


var Firebase = require('firebase');

var port = 50000;

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



	  res.sendFile(__dirname + '/tap.html');


});

app.listen(port);



console.log('Listening on port ' + port);
