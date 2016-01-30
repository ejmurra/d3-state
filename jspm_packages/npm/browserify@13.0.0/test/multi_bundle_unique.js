/* */ 
var browserify = require('../index');
var vm = require('vm');
var fs = require('fs');
var path = require('path');
var test = require('tap').test;
var prelude = fs.readFileSync(path.join(__dirname, 'multi_bundle', '_prelude.js'), 'utf8');
test('unique require', function(t) {
  t.plan(6);
  var core = browserify({
    externalRequireName: 'unique_require',
    prelude: prelude
  });
  core.require(__dirname + '/multi_bundle/b.js', {expose: './b'});
  var app = browserify([__dirname + '/multi_bundle/a.js'], {prelude: prelude});
  app.external('./b');
  core.bundle(function(err, src) {
    var c = {
      console: console,
      t: t,
      baton: {times: 0}
    };
    vm.runInNewContext(src, c);
    t.equal(c.baton.times, 0);
    app.bundle(function(err, src) {
      vm.runInNewContext(src, c);
      t.equal(c.baton.times, 1);
      vm.runInNewContext(src, c);
      t.equal(c.baton.times, 1);
      t.equal(c.unique_require('./b'), 'foo');
    });
  });
});
