/* */ 
(function(Buffer) {
  module.exports = function(buf) {
    return Buffer.isBuffer(buf);
  };
})(require('buffer').Buffer);
