/* */ 
(function(Buffer, process) {
  var capability = require('./capability');
  var inherits = require('inherits');
  var response = require('./response');
  var stream = require('stream');
  var toArrayBuffer = require('to-arraybuffer');
  var IncomingMessage = response.IncomingMessage;
  var rStates = response.readyStates;
  function decideMode(preferBinary) {
    if (capability.fetch) {
      return 'fetch';
    } else if (capability.mozchunkedarraybuffer) {
      return 'moz-chunked-arraybuffer';
    } else if (capability.msstream) {
      return 'ms-stream';
    } else if (capability.arraybuffer && preferBinary) {
      return 'arraybuffer';
    } else if (capability.vbArray && preferBinary) {
      return 'text:vbarray';
    } else {
      return 'text';
    }
  }
  var ClientRequest = module.exports = function(opts) {
    var self = this;
    stream.Writable.call(self);
    self._opts = opts;
    self._body = [];
    self._headers = {};
    if (opts.auth)
      self.setHeader('Authorization', 'Basic ' + new Buffer(opts.auth).toString('base64'));
    Object.keys(opts.headers).forEach(function(name) {
      self.setHeader(name, opts.headers[name]);
    });
    var preferBinary;
    if (opts.mode === 'prefer-streaming') {
      preferBinary = false;
    } else if (opts.mode === 'allow-wrong-content-type') {
      preferBinary = !capability.overrideMimeType;
    } else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
      preferBinary = true;
    } else {
      throw new Error('Invalid value for opts.mode');
    }
    self._mode = decideMode(preferBinary);
    self.on('finish', function() {
      self._onFinish();
    });
  };
  inherits(ClientRequest, stream.Writable);
  ClientRequest.prototype.setHeader = function(name, value) {
    var self = this;
    var lowerName = name.toLowerCase();
    if (unsafeHeaders.indexOf(lowerName) !== -1)
      return;
    self._headers[lowerName] = {
      name: name,
      value: value
    };
  };
  ClientRequest.prototype.getHeader = function(name) {
    var self = this;
    return self._headers[name.toLowerCase()].value;
  };
  ClientRequest.prototype.removeHeader = function(name) {
    var self = this;
    delete self._headers[name.toLowerCase()];
  };
  ClientRequest.prototype._onFinish = function() {
    var self = this;
    if (self._destroyed)
      return;
    var opts = self._opts;
    var headersObj = self._headers;
    var body;
    if (opts.method === 'POST' || opts.method === 'PUT' || opts.method === 'PATCH') {
      if (capability.blobConstructor) {
        body = new global.Blob(self._body.map(function(buffer) {
          return toArrayBuffer(buffer);
        }), {type: (headersObj['content-type'] || {}).value || ''});
      } else {
        body = Buffer.concat(self._body).toString();
      }
    }
    if (self._mode === 'fetch') {
      var headers = Object.keys(headersObj).map(function(name) {
        return [headersObj[name].name, headersObj[name].value];
      });
      global.fetch(self._opts.url, {
        method: self._opts.method,
        headers: headers,
        body: body,
        mode: 'cors',
        credentials: opts.withCredentials ? 'include' : 'same-origin'
      }).then(function(response) {
        self._fetchResponse = response;
        self._connect();
      }, function(reason) {
        self.emit('error', reason);
      });
    } else {
      var xhr = self._xhr = new global.XMLHttpRequest();
      try {
        xhr.open(self._opts.method, self._opts.url, true);
      } catch (err) {
        process.nextTick(function() {
          self.emit('error', err);
        });
        return;
      }
      if ('responseType' in xhr)
        xhr.responseType = self._mode.split(':')[0];
      if ('withCredentials' in xhr)
        xhr.withCredentials = !!opts.withCredentials;
      if (self._mode === 'text' && 'overrideMimeType' in xhr)
        xhr.overrideMimeType('text/plain; charset=x-user-defined');
      Object.keys(headersObj).forEach(function(name) {
        xhr.setRequestHeader(headersObj[name].name, headersObj[name].value);
      });
      self._response = null;
      xhr.onreadystatechange = function() {
        switch (xhr.readyState) {
          case rStates.LOADING:
          case rStates.DONE:
            self._onXHRProgress();
            break;
        }
      };
      if (self._mode === 'moz-chunked-arraybuffer') {
        xhr.onprogress = function() {
          self._onXHRProgress();
        };
      }
      xhr.onerror = function() {
        if (self._destroyed)
          return;
        self.emit('error', new Error('XHR error'));
      };
      try {
        xhr.send(body);
      } catch (err) {
        process.nextTick(function() {
          self.emit('error', err);
        });
        return;
      }
    }
  };
  function statusValid(xhr) {
    try {
      var status = xhr.status;
      return (status !== null && status !== 0);
    } catch (e) {
      return false;
    }
  }
  ClientRequest.prototype._onXHRProgress = function() {
    var self = this;
    if (!statusValid(self._xhr) || self._destroyed)
      return;
    if (!self._response)
      self._connect();
    self._response._onXHRProgress();
  };
  ClientRequest.prototype._connect = function() {
    var self = this;
    if (self._destroyed)
      return;
    self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode);
    self.emit('response', self._response);
  };
  ClientRequest.prototype._write = function(chunk, encoding, cb) {
    var self = this;
    self._body.push(chunk);
    cb();
  };
  ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function() {
    var self = this;
    self._destroyed = true;
    if (self._response)
      self._response._destroyed = true;
    if (self._xhr)
      self._xhr.abort();
  };
  ClientRequest.prototype.end = function(data, encoding, cb) {
    var self = this;
    if (typeof data === 'function') {
      cb = data;
      data = undefined;
    }
    stream.Writable.prototype.end.call(self, data, encoding, cb);
  };
  ClientRequest.prototype.flushHeaders = function() {};
  ClientRequest.prototype.setTimeout = function() {};
  ClientRequest.prototype.setNoDelay = function() {};
  ClientRequest.prototype.setSocketKeepAlive = function() {};
  var unsafeHeaders = ['accept-charset', 'accept-encoding', 'access-control-request-headers', 'access-control-request-method', 'connection', 'content-length', 'cookie', 'cookie2', 'date', 'dnt', 'expect', 'host', 'keep-alive', 'origin', 'referer', 'te', 'trailer', 'transfer-encoding', 'upgrade', 'user-agent', 'via'];
})(require('buffer').Buffer, require('process'));
