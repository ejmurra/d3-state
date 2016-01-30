/* */ 
var browserify = require('../index');
var vm = require('vm');
var test = require('tap').test;
test('multi bundle', function(t) {
  t.plan(5);
  var core = browserify();
  core.require(__dirname + '/multi_bundle/b.js', {expose: true});
  var app = browserify([__dirname + '/multi_bundle/a.js']);
  app.external(__dirname + '/multi_bundle/b.js');
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
    });
  });
});
test('multi bundle', function(t) {
  t.plan(8);
  var core = browserify({exposeAll: true});
  core.require(__dirname + '/multi_bundle/a.js', {expose: true});
  var app = browserify([__dirname + '/multi_bundle/c.js']);
  app.external(core);
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
    });
  });
});
