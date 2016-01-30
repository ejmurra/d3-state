/* */ 
var quote = require('../index').quote;
var s = quote(['a', 'b c d', '$f', '"g"']);
console.log(s);
