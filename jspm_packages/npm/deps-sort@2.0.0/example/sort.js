/* */ 
(function(process) {
  var sort = require('../index')();
  var JSONStream = require('JSONStream');
  var parse = JSONStream.parse([true]);
  var stringify = JSONStream.stringify();
  process.stdin.pipe(parse).pipe(sort).pipe(stringify).pipe(process.stdout);
})(require('process'));
