/* */ 
var f = require('./f');
var m = require('m');
var g = require('g');
t.equal(require('./subdir/g'), 999);
t.equal(m(f(AAA)), 555, 'transformation scope');
t.equal(g(3), 332, 'sub-transformation applied');
t.equal(typeof GGG, 'undefined', 'GGG leak');
t.equal(XYZ, 909);
