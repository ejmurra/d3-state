/* */ 
var detect = require('../index');
var fs = require('fs');
var src = fs.readFileSync(__dirname + '/jquery.js');
var scope = detect(src);
console.dir(scope);
