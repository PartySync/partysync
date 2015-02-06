var express = require('express');
var bodyParser = require('body-parser');
var superagent = require('superagent');
var request = require('request');
// var fs = require('fs');
var fs = require('graceful-fs');
var async = require('async');
var Firebase = require('firebase');

var app = express()
app.use(bodyParser());
app.use(express.static(__dirname + '/tmp'));

var db = new Firebase('https://youparty.firebaseio.com');

require('shelljs/global');
// require('./shelljs/shell.js')
// console.log(db.push().key());


app.post('/', function (req, res) {
  // searchYT(req.body.Body, function(url, time) {
  		var url = req.body.url;
  		// var file_name = req.body.name;

        console.log(url);
        // var file_name = extractParameters(url)["v"];
        var file_name = db.push().key();

        cd('tmp');

        res.send("http://www.partysyncwith.me:8081/"+file_name.toString()+".mp4");
        var dl_command = 'youtube-dl -f mp4 -o '+ file_name +'.mp4 "'+ url +'"';
        console.log(dl_command);
        exec(dl_command);

        // var rate_format = 1000000000/time;

        // exec('ffmpeg -i '+file_name+'.mp4 -b '+rate_format+' -y '+file_name+'.mp4');

	
	
	


	  
});


function searchYT(query, cb) {
  superagent
    .get('http://partysyncwith.me:3005/search/'+ query +'/1')
    .end(function(err, res) {
      if(err) {
        console.log(err);
      } else {

        if (typeof JSON.parse(res.text).data !== 'undefined') {
          if (JSON.parse(res.text).data[0].duration < 600) {
            var url = JSON.parse(res.text).data[0].video_url;
            var time = JSON.parse(res.text).data[0].duration;
            // console.log(url);
            cb(url, time);
          } else {
            cb(null);
          }
        }
      }
    })
  }





function extractParameters(url)
{
  var query = url.match(/.*\?(.*)/)[1];
  var assignments = query.split("&");
  var pair, parameters = {};
  for (var ii = 0; ii < assignments.length; ii++)
  { 
      pair = assignments[ii].split("=");
      parameters[pair[0]] = pair[1];
  }
  return parameters;
}


String.prototype.trim = function() {  
   return this.replace(/^\s+|\s+$/g,"");  
}  


function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
}



var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

});


