/* */ 
(function(process) {
  process.nextTick(function() {
    console.log('in foo/index.js: ' + JSON.stringify({
      __filename: __filename,
      __dirname: __dirname
    }));
  });
})(require('process'));
