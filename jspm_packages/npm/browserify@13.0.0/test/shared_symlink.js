/* */ 
var browserify = require('../index');
var vm = require('vm');
var test = require('tap').test;
test('shared symlink', function(t) {
  t.plan(1);
  var b = browserify(__dirname + '/shared_symlink/main.js');
  b.bundle(function(err, src) {
    t.equal(err.message, "Cannot find module 'foo' from '" + __dirname + "/shared_symlink/shared'");
  });
});
