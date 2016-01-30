/* */ 
var test = require('tap').test;
var pack = require('../index');
test('this', function(t) {
  t.plan(1);
  var p = pack();
  var src = '';
  p.on('data', function(buf) {
    src += buf;
  });
  p.on('end', function() {
    var r = Function([], 'return ' + src)();
    t.deepEqual(r("abc"), {foo: "bar"});
  });
  p.end(JSON.stringify([{
    id: 'abc',
    source: 'this.foo = "bar"'
  }]));
});
