var express = require('express');
var app = express();

app.get('/:name', function(req, res){
  res.send_file('/static/index.html')
});

app.listen(5000);