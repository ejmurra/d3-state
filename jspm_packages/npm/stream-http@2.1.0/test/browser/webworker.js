/* */ 
(function(Buffer) {
  var fs = require('fs');
  var test = require('tape');
  var UAParser = require('ua-parser-js');
  var url = require('url');
  var work = require('webworkify');
  var browser = (new UAParser()).setUA(navigator.userAgent).getBrowser();
  var browserName = browser.name;
  var browserVersion = browser.major;
  var skip = ((browserName === 'Opera' && browserVersion <= 12) || (browserName === 'IE' && browserVersion <= 10) || (browserName === 'Safari' && browserVersion <= 5) || (browserName === 'WebKit' && browserVersion <= 534) || (browserName === 'Android Browser' && browserVersion <= 4));
  var reference = fs.readFileSync(__dirname + '/../server/static/browserify.png');
  test('binary download in WebWorker', {skip: skip}, function(t) {
    var testUrl = url.resolve(global.location.href, '/browserify.png');
    var worker = work(require('./lib/webworker-worker'));
    worker.addEventListener('message', function(ev) {
      var data = new Buffer(new Uint8Array(ev.data));
      t.ok(reference.equals(data), 'contents match');
      t.end();
    });
    worker.postMessage(testUrl);
  });
})(require('buffer').Buffer);
