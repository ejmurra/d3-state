/* */ 
var A = require('./one/f');
var B = require('./one/dir/f');
t.equal(A, B);
t.equal(A(), 555);
t.equal(B(), 555);
