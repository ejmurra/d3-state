/* */ 
var reduce = require('../index');
var xs = [1, 2, 3, 4];
var sum = reduce(xs, function(acc, x) {
  return acc + x;
}, 0);
console.log(sum);
