/* */ 
var op = require('./node_modules/op/index');
var i = 0;
module.exports = function() {
  i = op(i);
  return i;
};
