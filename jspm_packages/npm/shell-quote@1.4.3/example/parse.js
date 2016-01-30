/* */ 
var parse = require('../index').parse;
var xs = parse('a "b c" \\$def \'it\\\'s great\'');
console.dir(xs);
