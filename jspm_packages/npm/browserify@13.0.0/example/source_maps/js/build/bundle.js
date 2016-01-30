/* */ 
;
(function(e, t, n, r) {
  function i(r) {
    if (!n[r]) {
      if (!t[r]) {
        if (e)
          return e(r);
        throw new Error("Cannot find module '" + r + "'");
      }
      var s = n[r] = {exports: {}};
      t[r][0](function(e) {
        var n = t[r][1][e];
        return i(n ? n : e);
      }, s, s.exports);
    }
    return n[r].exports;
  }
  for (var s = 0; s < r.length; s++)
    i(r[s]);
  return i;
})(typeof require !== "undefined" && require, {
  1: [function(require, module, exports) {
    console.log('main line 1');
    var foo = require('./foo');
    foo();
  }, {"./foo.js": 2}],
  2: [function(require, module, exports) {
    console.log('foo line 1');
    var bar = require('./wunder/bar');
    module.exports = function foo() {
      console.log('hello from foo line 5');
      bar();
    };
  }, {"./wunder/bar": 3}],
  3: [function(require, module, exports) {
    console.log('bar line 1');
    'use strict';
    module.exports = function bar() {
      console.log('hello from bar line 7');
    };
  }, {}]
}, {}, [1]);
;
