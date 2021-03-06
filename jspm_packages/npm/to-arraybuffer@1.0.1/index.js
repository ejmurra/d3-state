/* */ 
(function(Buffer) {
  var Buffer = require('buffer').Buffer;
  module.exports = function(buf) {
    if (buf instanceof Uint8Array) {
      if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
        return buf.buffer;
      } else if (typeof buf.buffer.slice === 'function') {
        return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      }
    }
    if (Buffer.isBuffer(buf)) {
      var arrayCopy = new Uint8Array(buf.length);
      var len = buf.length;
      for (var i = 0; i < len; i++) {
        arrayCopy[i] = buf[i];
      }
      return arrayCopy.buffer;
    } else {
      throw new Error('Argument must be a Buffer');
    }
  };
})(require('buffer').Buffer);
