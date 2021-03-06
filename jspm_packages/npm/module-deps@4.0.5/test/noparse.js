/* */ 
var parser = require('../index');
var test = require('tap').test;
var fs = require('fs');
var path = require('path');
var files = {
  main: path.join(__dirname, '/files/main.js'),
  foo: path.join(__dirname, '/files/foo.js'),
  bar: path.join(__dirname, '/files/bar.js')
};
var sources = Object.keys(files).reduce(function(acc, file) {
  acc[file] = fs.readFileSync(files[file], 'utf8');
  return acc;
}, {});
test('noParse', function(t) {
  t.plan(1);
  var p = parser({noParse: [files.foo]});
  p.end(files.main);
  var rows = [];
  p.on('data', function(row) {
    rows.push(row);
  });
  p.on('end', function() {
    t.deepEqual(rows.sort(cmp), [{
      id: files.main,
      file: files.main,
      source: sources.main,
      entry: true,
      deps: {'./foo': files.foo}
    }, {
      id: files.foo,
      file: files.foo,
      source: sources.foo,
      deps: {}
    }].sort(cmp));
  });
});
function cmp(a, b) {
  return a.id < b.id ? -1 : 1;
}
