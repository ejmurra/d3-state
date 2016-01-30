/* */ 
(function(process) {
  var browserify = require('../../index');
  var b = browserify();
  b.add('./browser/main.js');
  b.bundle().pipe(process.stdout);
})(require('process'));
