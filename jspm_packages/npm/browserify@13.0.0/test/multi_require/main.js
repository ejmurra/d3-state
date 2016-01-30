/* */ 
var localA = require('./a');
var globalA = require('a');
t.equal(localA, globalA);
