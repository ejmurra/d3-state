/* */ 
var robot = require('./robot');
var trex = require('t-rex');
module.exports = function(n) {
  return robot(n) * trex;
};
