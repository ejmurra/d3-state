/* */ 
var parse = require('../index').parse;
var xs = parse('beep || boop > /byte');
console.dir(xs);
