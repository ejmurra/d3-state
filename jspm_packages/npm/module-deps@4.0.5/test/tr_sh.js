/* */ 
var mdeps = require('../index');
var test = require('tap').test;
var JSONStream = require('JSONStream');
var packer = require('browser-pack');
var path = require('path');
test('transform', function(t) {
  t.plan(3);
  var p = mdeps({
    transform: ['./tr_a.js', './tr_b.js'],
    transformKey: ['browserify', 'transform']
  });
  p.end(path.join(__dirname, '/files/tr_sh/main.js'));
  var pack = packer();
  p.pipe(JSONStream.stringify()).pipe(pack);
  var src = '';
  pack.on('data', function(buf) {
    src += buf;
  });
  pack.on('end', function() {
    Function('t', src)(t);
  });
});
