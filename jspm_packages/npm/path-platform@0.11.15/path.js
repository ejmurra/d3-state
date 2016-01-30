/* */ 
(function(process) {
  var isWindows = process.platform === 'win32';
  var util = require('util');
  var _path = require('path');
  if (_path.posix) {
    module.exports = _path;
    return;
  }
  function normalizeArray(parts, allowAboveRoot) {
    var res = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!p || p === '.')
        continue;
      if (p === '..') {
        if (res.length && res[res.length - 1] !== '..') {
          res.pop();
        } else if (allowAboveRoot) {
          res.push('..');
        }
      } else {
        res.push(p);
      }
    }
    return res;
  }
  var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
  var splitTailRe = /^([\s\S]*?)((?:\.{1,2}|[^\\\/]+?|)(\.[^.\/\\]*|))(?:[\\\/]*)$/;
  var win32 = {};
  function win32SplitPath(filename) {
    var result = splitDeviceRe.exec(filename),
        device = (result[1] || '') + (result[2] || ''),
        tail = result[3] || '';
    var result2 = splitTailRe.exec(tail),
        dir = result2[1],
        basename = result2[2],
        ext = result2[3];
    return [device, dir, basename, ext];
  }
  var normalizeUNCRoot = function(device) {
    return '\\\\' + device.replace(/^[\\\/]+/, '').replace(/[\\\/]+/g, '\\');
  };
  win32.resolve = function() {
    var resolvedDevice = '',
        resolvedTail = '',
        resolvedAbsolute = false;
    for (var i = arguments.length - 1; i >= -1; i--) {
      var path;
      if (i >= 0) {
        path = arguments[i];
      } else if (!resolvedDevice) {
        path = process.cwd();
      } else {
        path = process.env['=' + resolvedDevice];
        if (!path || path.substr(0, 3).toLowerCase() !== resolvedDevice.toLowerCase() + '\\') {
          path = resolvedDevice + '\\';
        }
      }
      if (!util.isString(path)) {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        continue;
      }
      var result = splitDeviceRe.exec(path),
          device = result[1] || '',
          isUnc = device && device.charAt(1) !== ':',
          isAbsolute = win32.isAbsolute(path),
          tail = result[3];
      if (device && resolvedDevice && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
        continue;
      }
      if (!resolvedDevice) {
        resolvedDevice = device;
      }
      if (!resolvedAbsolute) {
        resolvedTail = tail + '\\' + resolvedTail;
        resolvedAbsolute = isAbsolute;
      }
      if (resolvedDevice && resolvedAbsolute) {
        break;
      }
    }
    if (isUnc) {
      resolvedDevice = normalizeUNCRoot(resolvedDevice);
    }
    resolvedTail = normalizeArray(resolvedTail.split(/[\\\/]+/), !resolvedAbsolute).join('\\');
    if (resolvedDevice && resolvedDevice.charAt(1) === ':') {
      resolvedDevice = resolvedDevice[0].toLowerCase() + resolvedDevice.substr(1);
    }
    return (resolvedDevice + (resolvedAbsolute ? '\\' : '') + resolvedTail) || '.';
  };
  win32.normalize = function(path) {
    var result = splitDeviceRe.exec(path),
        device = result[1] || '',
        isUnc = device && device.charAt(1) !== ':',
        isAbsolute = win32.isAbsolute(path),
        tail = result[3],
        trailingSlash = /[\\\/]$/.test(tail);
    if (device && device.charAt(1) === ':') {
      device = device[0].toLowerCase() + device.substr(1);
    }
    tail = normalizeArray(tail.split(/[\\\/]+/), !isAbsolute).join('\\');
    if (!tail && !isAbsolute) {
      tail = '.';
    }
    if (tail && trailingSlash) {
      tail += '\\';
    }
    if (isUnc) {
      device = normalizeUNCRoot(device);
    }
    return device + (isAbsolute ? '\\' : '') + tail;
  };
  win32.isAbsolute = function(path) {
    var result = splitDeviceRe.exec(path),
        device = result[1] || '',
        isUnc = !!device && device.charAt(1) !== ':';
    return !!result[2] || isUnc;
  };
  win32.join = function() {
    function f(p) {
      if (!util.isString(p)) {
        throw new TypeError('Arguments to path.join must be strings');
      }
      return p;
    }
    var paths = Array.prototype.filter.call(arguments, f);
    var joined = paths.join('\\');
    if (!/^[\\\/]{2}[^\\\/]/.test(paths[0])) {
      joined = joined.replace(/^[\\\/]{2,}/, '\\');
    }
    return win32.normalize(joined);
  };
  win32.relative = function(from, to) {
    from = win32.resolve(from);
    to = win32.resolve(to);
    var lowerFrom = from.toLowerCase();
    var lowerTo = to.toLowerCase();
    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== '')
          break;
      }
      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== '')
          break;
      }
      if (start > end)
        return [];
      return arr.slice(start, end + 1);
    }
    var toParts = trim(to.split('\\'));
    var lowerFromParts = trim(lowerFrom.split('\\'));
    var lowerToParts = trim(lowerTo.split('\\'));
    var length = Math.min(lowerFromParts.length, lowerToParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (lowerFromParts[i] !== lowerToParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    if (samePartsLength == 0) {
      return to;
    }
    var outputParts = [];
    for (var i = samePartsLength; i < lowerFromParts.length; i++) {
      outputParts.push('..');
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join('\\');
  };
  win32._makeLong = function(path) {
    if (!util.isString(path))
      return path;
    if (!path) {
      return '';
    }
    var resolvedPath = win32.resolve(path);
    if (/^[a-zA-Z]\:\\/.test(resolvedPath)) {
      return '\\\\?\\' + resolvedPath;
    } else if (/^\\\\[^?.]/.test(resolvedPath)) {
      return '\\\\?\\UNC\\' + resolvedPath.substring(2);
    }
    return path;
  };
  win32.dirname = function(path) {
    var result = win32SplitPath(path),
        root = result[0],
        dir = result[1];
    if (!root && !dir) {
      return '.';
    }
    if (dir) {
      dir = dir.substr(0, dir.length - 1);
    }
    return root + dir;
  };
  win32.basename = function(path, ext) {
    var f = win32SplitPath(path)[2];
    if (ext && f.substr(-1 * ext.length) === ext) {
      f = f.substr(0, f.length - ext.length);
    }
    return f;
  };
  win32.extname = function(path) {
    return win32SplitPath(path)[3];
  };
  win32.format = function(pathObject) {
    if (!util.isObject(pathObject)) {
      throw new TypeError("Parameter 'pathObject' must be an object, not " + typeof pathObject);
    }
    var root = pathObject.root || '';
    if (!util.isString(root)) {
      throw new TypeError("'pathObject.root' must be a string or undefined, not " + typeof pathObject.root);
    }
    var dir = pathObject.dir;
    var base = pathObject.base || '';
    if (dir.slice(dir.length - 1, dir.length) === win32.sep) {
      return dir + base;
    }
    if (dir) {
      return dir + win32.sep + base;
    }
    return base;
  };
  win32.parse = function(pathString) {
    if (!util.isString(pathString)) {
      throw new TypeError("Parameter 'pathString' must be a string, not " + typeof pathString);
    }
    var allParts = win32SplitPath(pathString);
    if (!allParts || allParts.length !== 4) {
      throw new TypeError("Invalid path '" + pathString + "'");
    }
    return {
      root: allParts[0],
      dir: allParts[0] + allParts[1].slice(0, allParts[1].length - 1),
      base: allParts[2],
      ext: allParts[3],
      name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
    };
  };
  win32.sep = '\\';
  win32.delimiter = ';';
  var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  var posix = {};
  function posixSplitPath(filename) {
    return splitPathRe.exec(filename).slice(1);
  }
  posix.resolve = function() {
    var resolvedPath = '',
        resolvedAbsolute = false;
    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = (i >= 0) ? arguments[i] : process.cwd();
      if (!util.isString(path)) {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        continue;
      }
      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charAt(0) === '/';
    }
    resolvedPath = normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');
    return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
  };
  posix.normalize = function(path) {
    var isAbsolute = posix.isAbsolute(path),
        trailingSlash = path.substr(-1) === '/';
    path = normalizeArray(path.split('/'), !isAbsolute).join('/');
    if (!path && !isAbsolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }
    return (isAbsolute ? '/' : '') + path;
  };
  posix.isAbsolute = function(path) {
    return path.charAt(0) === '/';
  };
  posix.join = function() {
    var path = '';
    for (var i = 0; i < arguments.length; i++) {
      var segment = arguments[i];
      if (!util.isString(segment)) {
        throw new TypeError('Arguments to path.join must be strings');
      }
      if (segment) {
        if (!path) {
          path += segment;
        } else {
          path += '/' + segment;
        }
      }
    }
    return posix.normalize(path);
  };
  posix.relative = function(from, to) {
    from = posix.resolve(from).substr(1);
    to = posix.resolve(to).substr(1);
    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== '')
          break;
      }
      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== '')
          break;
      }
      if (start > end)
        return [];
      return arr.slice(start, end + 1);
    }
    var fromParts = trim(from.split('/'));
    var toParts = trim(to.split('/'));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push('..');
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join('/');
  };
  posix._makeLong = function(path) {
    return path;
  };
  posix.dirname = function(path) {
    var result = posixSplitPath(path),
        root = result[0],
        dir = result[1];
    if (!root && !dir) {
      return '.';
    }
    if (dir) {
      dir = dir.substr(0, dir.length - 1);
    }
    return root + dir;
  };
  posix.basename = function(path, ext) {
    var f = posixSplitPath(path)[2];
    if (ext && f.substr(-1 * ext.length) === ext) {
      f = f.substr(0, f.length - ext.length);
    }
    return f;
  };
  posix.extname = function(path) {
    return posixSplitPath(path)[3];
  };
  posix.format = function(pathObject) {
    if (!util.isObject(pathObject)) {
      throw new TypeError("Parameter 'pathObject' must be an object, not " + typeof pathObject);
    }
    var root = pathObject.root || '';
    if (!util.isString(root)) {
      throw new TypeError("'pathObject.root' must be a string or undefined, not " + typeof pathObject.root);
    }
    var dir = pathObject.dir ? pathObject.dir + posix.sep : '';
    var base = pathObject.base || '';
    return dir + base;
  };
  posix.parse = function(pathString) {
    if (!util.isString(pathString)) {
      throw new TypeError("Parameter 'pathString' must be a string, not " + typeof pathString);
    }
    var allParts = posixSplitPath(pathString);
    if (!allParts || allParts.length !== 4) {
      throw new TypeError("Invalid path '" + pathString + "'");
    }
    allParts[1] = allParts[1] || '';
    allParts[2] = allParts[2] || '';
    allParts[3] = allParts[3] || '';
    return {
      root: allParts[0],
      dir: allParts[0] + allParts[1].slice(0, allParts[1].length - 1),
      base: allParts[2],
      ext: allParts[3],
      name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
    };
  };
  posix.sep = '/';
  posix.delimiter = ':';
  if (isWindows)
    module.exports = win32;
  else
    module.exports = posix;
  module.exports.posix = posix;
  module.exports.win32 = win32;
})(require('process'));
