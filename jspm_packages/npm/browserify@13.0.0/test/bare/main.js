/* */ 
(function(Buffer, process) {
  console.log([__dirname, __filename, typeof process, typeof global, typeof Buffer]);
})(require('buffer').Buffer, require('process'));
