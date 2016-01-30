/* */ 
var parse = require('../index').parse;
var xs = parse('beep --boop="$PWD"', {PWD: '/home/robot'});
console.dir(xs);
