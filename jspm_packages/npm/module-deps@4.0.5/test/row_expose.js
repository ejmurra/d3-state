/* */ 
var parser = require('../index');
var test = require('tap').test;
var through = require('through2');
var path = require('path');
test('row is exposed', function(t) {
  t.plan(1);
  var common_path = path.join(__dirname, '/files/main');
  var opts = {expose: {}};
  var p = parser(opts);
  p.end({
    file: common_path,
    expose: "whatever"
  });
  p.on('error', t.fail.bind(t));
  p.pipe(through.obj());
  p.on('end', function() {
    t.equal(opts.expose.whatever, common_path + '.js');
  });
});
