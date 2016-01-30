/* */ 
(function(process) {
  var argv = require('subarg')(process.argv.slice(2));
  var JSONStream = require('JSONStream');
  var sort = require('../index')(argv);
  var parse = JSONStream.parse([true]);
  var stringify = JSONStream.stringify();
  process.stdin.pipe(parse).pipe(sort).pipe(stringify).pipe(process.stdout);
})(require('process'));
