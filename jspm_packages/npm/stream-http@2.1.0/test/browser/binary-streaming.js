/* */ 
(function(Buffer) {
  var Buffer = require('buffer').Buffer;
  var fs = require('fs');
  var test = require('tape');
  var UAParser = require('ua-parser-js');
  var http = require('../../index');
  var browser = (new UAParser()).setUA(navigator.userAgent).getBrowser();
  var browserName = browser.name;
  var browserVersion = browser.major;
  var skipStreamingCheck = (browserName === 'Opera' || (browserName === 'IE' && browserVersion <= 10));
  var skipVerification = (browserName === 'IE' && browserVersion <= 8);
  var COPIES = skipVerification ? 1 : 20;
  var MIN_PIECES = 2;
  var referenceOnce = fs.readFileSync(__dirname + '/../server/static/browserify.png');
  var reference = new Buffer(referenceOnce.length * COPIES);
  for (var i = 0; i < COPIES; i++) {
    referenceOnce.copy(reference, referenceOnce.length * i);
  }
  test('binary streaming', function(t) {
    http.get({
      path: '/browserify.png?copies=' + COPIES,
      mode: 'allow-wrong-content-type'
    }, function(res) {
      var buffers = [];
      res.on('end', function() {
        if (skipVerification)
          t.skip('binary data not preserved on IE <= 8');
        else
          t.ok(reference.equals(Buffer.concat(buffers)), 'contents match');
        if (skipStreamingCheck)
          t.skip('streaming not available on IE <= 8');
        else
          t.ok(buffers.length >= MIN_PIECES, 'received in multiple parts');
        t.end();
      });
      res.on('data', function(data) {
        buffers.push(data);
      });
    });
  });
  test('large binary request without streaming', function(t) {
    http.get({
      path: '/browserify.png?copies=' + COPIES,
      mode: 'default'
    }, function(res) {
      var buffers = [];
      res.on('end', function() {
        if (skipVerification)
          t.skip('binary data not preserved on IE <= 8');
        else
          t.ok(reference.equals(Buffer.concat(buffers)), 'contents match');
        t.end();
      });
      res.on('data', function(data) {
        buffers.push(data);
      });
    });
  });
})(require('buffer').Buffer);
