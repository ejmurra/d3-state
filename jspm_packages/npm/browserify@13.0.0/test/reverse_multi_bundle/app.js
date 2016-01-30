/* */ 
t.equal(require('./shared')(), 1, "the main app bundle can already use the shared library");
t.throws(function() {
  require('./lazy');
}, "lazy bundle is not executed yet so the lazy module cannot be required yet");
setTimeout(function() {
  require('./lazy');
  t.equal(require('./shared')(), 3, "lazy module was able to use shared code");
}, 1);
