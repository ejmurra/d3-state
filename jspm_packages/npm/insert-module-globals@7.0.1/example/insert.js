/* */ 
(function(process) {
  var mdeps = require('module-deps');
  var bpack = require('browser-pack');
  var insert = require('../index');
  function inserter(file) {
    return insert(file, {basedir: __dirname + '/files'});
  }
  var files = [__dirname + '/files/main.js'];
  mdeps(files, {transform: inserter}).pipe(bpack({raw: true})).pipe(process.stdout);
  ;
})(require('process'));
