/* */ 
(function(Buffer, process) {
  var capability = require('./capability');
  var inherits = require('inherits');
  var stream = require('stream');
  var rStates = exports.readyStates = {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4
  };
  var IncomingMessage = exports.IncomingMessage = function(xhr, response, mode) {
    var self = this;
    stream.Readable.call(self);
    self._mode = mode;
    self.headers = {};
    self.rawHeaders = [];
    self.trailers = {};
    self.rawTrailers = [];
    self.on('end', function() {
      process.nextTick(function() {
        self.emit('close');
      });
    });
    if (mode === 'fetch') {
      self._fetchResponse = response;
      self.statusCode = response.status;
      self.statusMessage = response.statusText;
      for (var header,
          _i,
          _it = response.headers[Symbol.iterator](); header = (_i = _it.next()).value, !_i.done; ) {
        self.headers[header[0].toLowerCase()] = header[1];
        self.rawHeaders.push(header[0], header[1]);
      }
      var reader = response.body.getReader();
      function read() {
        reader.read().then(function(result) {
          if (self._destroyed)
            return;
          if (result.done) {
            self.push(null);
            return;
          }
          self.push(new Buffer(result.value));
          read();
        });
      }
      read();
    } else {
      self._xhr = xhr;
      self._pos = 0;
      self.statusCode = xhr.status;
      self.statusMessage = xhr.statusText;
      var headers = xhr.getAllResponseHeaders().split(/\r?\n/);
      headers.forEach(function(header) {
        var matches = header.match(/^([^:]+):\s*(.*)/);
        if (matches) {
          var key = matches[1].toLowerCase();
          if (self.headers[key] !== undefined)
            self.headers[key] += ', ' + matches[2];
          else
            self.headers[key] = matches[2];
          self.rawHeaders.push(matches[1], matches[2]);
        }
      });
      self._charset = 'x-user-defined';
      if (!capability.overrideMimeType) {
        var mimeType = self.rawHeaders['mime-type'];
        if (mimeType) {
          var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/);
          if (charsetMatch) {
            self._charset = charsetMatch[1].toLowerCase();
          }
        }
        if (!self._charset)
          self._charset = 'utf-8';
      }
    }
  };
  inherits(IncomingMessage, stream.Readable);
  IncomingMessage.prototype._read = function() {};
  IncomingMessage.prototype._onXHRProgress = function() {
    var self = this;
    var xhr = self._xhr;
    var response = null;
    switch (self._mode) {
      case 'text:vbarray':
        if (xhr.readyState !== rStates.DONE)
          break;
        try {
          response = new global.VBArray(xhr.responseBody).toArray();
        } catch (e) {}
        if (response !== null) {
          self.push(new Buffer(response));
          break;
        }
      case 'text':
        try {
          response = xhr.responseText;
        } catch (e) {
          self._mode = 'text:vbarray';
          break;
        }
        if (response.length > self._pos) {
          var newData = response.substr(self._pos);
          if (self._charset === 'x-user-defined') {
            var buffer = new Buffer(newData.length);
            for (var i = 0; i < newData.length; i++)
              buffer[i] = newData.charCodeAt(i) & 0xff;
            self.push(buffer);
          } else {
            self.push(newData, self._charset);
          }
          self._pos = response.length;
        }
        break;
      case 'arraybuffer':
        if (xhr.readyState !== rStates.DONE)
          break;
        response = xhr.response;
        self.push(new Buffer(new Uint8Array(response)));
        break;
      case 'moz-chunked-arraybuffer':
        response = xhr.response;
        if (xhr.readyState !== rStates.LOADING || !response)
          break;
        self.push(new Buffer(new Uint8Array(response)));
        break;
      case 'ms-stream':
        response = xhr.response;
        if (xhr.readyState !== rStates.LOADING)
          break;
        var reader = new global.MSStreamReader();
        reader.onprogress = function() {
          if (reader.result.byteLength > self._pos) {
            self.push(new Buffer(new Uint8Array(reader.result.slice(self._pos))));
            self._pos = reader.result.byteLength;
          }
        };
        reader.onload = function() {
          self.push(null);
        };
        reader.readAsArrayBuffer(response);
        break;
    }
    if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
      self.push(null);
    }
  };
})(require('buffer').Buffer, require('process'));
