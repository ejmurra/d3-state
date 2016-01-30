/* */ 
var browserify = require('../index');
var vm = require('vm');
var test = require('tap').test;
test('reverse multi bundle', function(t) {
  t.plan(5);
  var app = browserify([__dirname + '/reverse_multi_bundle/app.js']).external(__dirname + '/reverse_multi_bundle/lazy.js').require(__dirname + '/reverse_multi_bundle/shared.js', {expose: true}).require(__dirname + '/reverse_multi_bundle/arbitrary.js', {expose: 'not/real'});
  var lazy = browserify({filter: function(id) {
      return id !== 'not/real';
    }}).require(__dirname + '/reverse_multi_bundle/lazy.js', {expose: true}).external(__dirname + '/reverse_multi_bundle/shared.js').external('not/real');
  app.bundle(function(err, appSrc) {
    if (err)
      throw err;
    lazy.bundle(function(err, lazySrc) {
      if (err)
        throw err;
      var src = appSrc + ';' + lazySrc;
      var c = {
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        t: t
      };
      vm.runInNewContext(src, c);
    });
  });
});
