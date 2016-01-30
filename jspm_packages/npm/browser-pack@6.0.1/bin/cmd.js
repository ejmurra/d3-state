/* */ 
(function(process) {
  var pack = require('../index')();
  process.stdin.pipe(pack).pipe(process.stdout);
})(require('process'));
