/* */ 
var A = require('./one/f');
var B = require('./one/dir/f');
t.notEqual(A, B);
t.equal(A(), 555);
t.equal(B(), 333);
var C = require('./two/f');
var D = require('./two/dir/f');
t.notEqual(C, D);
t.equal(C(), 555);
t.equal(D(), 333);
var E = require('./three/f');
var F = require('./three/dir/f');
t.notEqual(E, F);
t.equal(E(), 555);
t.equal(F(), 555);
