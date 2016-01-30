/* */ 
(function(process) {
  var wrap = require('./wrap');
  var ro = wrap();
  ro.pipe(process.stdout);
})(require('process'));
