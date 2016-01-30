/* */ 
var f = require('./f')();
for (var r = f.next(); !r.done; r = f.next()) {
  console.log(r.value);
}
