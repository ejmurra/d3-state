/* */ 
var ClientRequest = require('./lib/request');
var extend = require('xtend');
var statusCodes = require('builtin-status-codes');
var url = require('url');
var http = exports;
http.request = function(opts, cb) {
  if (typeof opts === 'string')
    opts = url.parse(opts);
  else
    opts = extend(opts);
  var defaultProtocol = global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : '';
  var protocol = opts.protocol || defaultProtocol;
  var host = opts.hostname || opts.host;
  var port = opts.port;
  var path = opts.path || '/';
  if (host && host.indexOf(':') !== -1)
    host = '[' + host + ']';
  opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path;
  opts.method = (opts.method || 'GET').toUpperCase();
  opts.headers = opts.headers || {};
  var req = new ClientRequest(opts);
  if (cb)
    req.on('response', cb);
  return req;
};
http.get = function get(opts, cb) {
  var req = http.request(opts, cb);
  req.end();
  return req;
};
http.Agent = function() {};
http.Agent.defaultMaxSockets = 4;
http.STATUS_CODES = statusCodes;
http.METHODS = ['CHECKOUT', 'CONNECT', 'COPY', 'DELETE', 'GET', 'HEAD', 'LOCK', 'M-SEARCH', 'MERGE', 'MKACTIVITY', 'MKCOL', 'MOVE', 'NOTIFY', 'OPTIONS', 'PATCH', 'POST', 'PROPFIND', 'PROPPATCH', 'PURGE', 'PUT', 'REPORT', 'SEARCH', 'SUBSCRIBE', 'TRACE', 'UNLOCK', 'UNSUBSCRIBE'];
