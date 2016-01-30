/* */ 
var f = require('./f');
var m = require('./node_modules/m/index');
var g = require('./node_modules/g/index');
t.equal(m(f(AAA)), 555, 'transformation scope');
t.equal(g(3), 333, 'sub-transformation applied');
t.equal(typeof GGG, 'undefined', 'GGG leak');
