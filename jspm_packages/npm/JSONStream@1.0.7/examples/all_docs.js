/* */ 
var request = require('request'),
    JSONStream = require('../index'),
    es = require('event-stream');
var parser = JSONStream.parse(['rows', true]),
    req = request({url: 'http://isaacs.couchone.com/registry/_all_docs'}),
    logger = es.mapSync(function(data) {
      console.error(data);
      return data;
    });
req.pipe(parser);
parser.pipe(logger);
