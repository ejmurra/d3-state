/* */ 
(function(process) {
  var mdeps = require('../index');
  var JSONStream = require('JSONStream');
  var md = mdeps();
  md.pipe(JSONStream.stringify()).pipe(process.stdout);
  md.end({file: __dirname + '/files/main.js'});
})(require('process'));
