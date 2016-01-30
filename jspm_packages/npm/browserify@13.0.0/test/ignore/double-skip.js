/* */ 
t.deepEqual(require('./skip'), {});
t.deepEqual(require('./double-skip/index'), {foo: 'bar'});
