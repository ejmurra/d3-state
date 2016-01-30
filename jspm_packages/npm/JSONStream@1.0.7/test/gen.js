/* */ 
(function(process) {
  return;
  var fs = require('fs');
  var JSONStream = require('../index');
  var file = process.argv[2] || '/tmp/JSONStream-test-large.json';
  var size = Number(process.argv[3] || 100000);
  var tape = require('tape');
  tape('out of mem', function(t) {
    t.plan(1);
    var randomNumber = function(min, max) {
      var number = Math.floor(Math.random() * (max - min + 1) + min);
      return number;
    };
    var randomString = function(min, max) {
      var chars = '      0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var result = '';
      var randomLength = randomNumber(min, max);
      for (var i = randomLength; i > 0; --i) {
        result += chars[Math.round(Math.random() * (chars.length - 1))];
      }
      return result;
    };
    var randomJsonDoc = function() {
      var doc = {
        "CrashOccurenceID": randomNumber(10000, 50000),
        "CrashID": randomNumber(1000, 10000),
        "SiteName": randomString(10, 25),
        "MachineName": randomString(10, 25),
        "Date": randomString(26, 26),
        "ProcessDuration": randomString(18, 18),
        "ThreadIdentityName": null,
        "WindowsIdentityName": randomString(15, 40),
        "OperatingSystemName": randomString(35, 65),
        "DetailedExceptionInformation": randomString(100, 800)
      };
      doc = JSON.stringify(doc);
      doc = doc.replace(/\,/g, ',\n');
      return doc;
    };
    var generateTestData = function(cb) {
      console.log('generating large data file...');
      var stream = fs.createWriteStream(file, {encoding: 'utf8'});
      var i = 0;
      var max = size;
      var writing = false;
      var split = ',\n';
      var doc = randomJsonDoc();
      stream.write('[');
      function write() {
        if (writing)
          return;
        writing = true;
        while (++i < max) {
          if (Math.random() < 0.001)
            console.log('generate..', i + ' / ' + size);
          if (!stream.write(doc + split)) {
            writing = false;
            return stream.once('drain', write);
          }
        }
        stream.write(doc + ']');
        stream.end();
        console.log('END');
      }
      write();
      stream.on('close', cb);
    };
    var testJSONStreamParse_causesOutOfMem = function(done) {
      var items = 0;
      console.log('parsing data files using JSONStream...');
      var parser = JSONStream.parse([true]);
      var stream = fs.createReadStream(file);
      stream.pipe(parser);
      parser.on('data', function(data) {
        items++;
        if (Math.random() < 0.01)
          console.log(items, '...');
      });
      parser.on('end', function() {
        t.equal(items, size);
      });
    };
    fs.stat(file, function(err, stat) {
      console.log(stat);
      if (err)
        generateTestData(testJSONStreamParse_causesOutOfMem);
      else
        testJSONStreamParse_causesOutOfMem();
    });
  });
})(require('process'));
