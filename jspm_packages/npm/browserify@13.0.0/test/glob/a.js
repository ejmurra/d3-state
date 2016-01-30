/* */ 
console.log('a');
try {
  require('./vendor/x');
} catch (err) {
  console.log('!x');
}
require('./lib/z');
