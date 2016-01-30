/* */ 
var browserify = require('../index');
var test = require('tap').test;
var pubdir = __dirname;
var dir = pubdir + '/bundle-bundle-external';
var opt = {
  debug: true,
  basedir: pubdir,
  exposeAll: true
};
test('bundle bundle external', function(t) {
  t.plan(1);
  var bundle1 = browserify(opt);
  var name = dir + '/foo.js';
  bundle1.require(name, {
    entry: true,
    expose: name,
    basedir: pubdir
  });
  var bundle2 = browserify({
    debug: true,
    basedir: pubdir,
    entries: [dir + '/baz.js']
  });
  bundle2.bundle(function(err, src) {
    t.ifError(err);
  });
});
