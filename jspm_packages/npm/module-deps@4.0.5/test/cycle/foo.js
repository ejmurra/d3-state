/* */ 
var bar = require('./bar');
exports.ooo = function(n) {
  return n * bar(110);
};
exports.p = function(a, b) {
  return a + b;
};
