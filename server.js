var express = require('express');
var app = express();

app.get('/sasha/:anyparam', function (req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  
  res.type('application/json');
  var parameterValue = req.params.anyparam,
      jsonResponse = new Object();
  jsonResponse.response = parameterValue;
  res.json(jsonResponse);
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});