/* */ 
(function(process) {
  var subarg = require('../index');
  var argv = subarg(process.argv.slice(2));
  console.log(argv);
})(require('process'));
