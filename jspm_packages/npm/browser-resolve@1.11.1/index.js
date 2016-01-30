/* */ 
(function(process) {
  var fs = require('fs');
  var path = require('path');
  var resv = require('resolve');
  function nodeModulesPaths(start, cb) {
    var splitRe = process.platform === 'win32' ? /[\/\\]/ : /\/+/;
    var parts = start.split(splitRe);
    var dirs = [];
    for (var i = parts.length - 1; i >= 0; i--) {
      if (parts[i] === 'node_modules')
        continue;
      var dir = path.join.apply(path, parts.slice(0, i + 1).concat(['node_modules']));
      if (!parts[0].match(/([A-Za-z]:)/)) {
        dir = '/' + dir;
      }
      dirs.push(dir);
    }
    return dirs;
  }
  function find_shims_in_package(pkgJson, cur_path, shims, browser) {
    try {
      var info = JSON.parse(pkgJson);
    } catch (err) {
      err.message = pkgJson + ' : ' + err.message;
      throw err;
    }
    var replacements = getReplacements(info, browser);
    if (!replacements) {
      return;
    }
    if (typeof replacements === 'string') {
      var key = path.resolve(cur_path, info.main || 'index.js');
      shims[key] = path.resolve(cur_path, replacements);
      return;
    }
    Object.keys(replacements).forEach(function(key) {
      var val;
      if (replacements[key] === false) {
        val = __dirname + '/empty.js';
      } else {
        val = replacements[key];
        if (val[0] === '.') {
          val = path.resolve(cur_path, val);
        }
      }
      if (key[0] === '/' || key[0] === '.') {
        key = path.resolve(cur_path, key);
      }
      shims[key] = val;
    });
    ['.js', '.json'].forEach(function(ext) {
      Object.keys(shims).forEach(function(key) {
        if (!shims[key + ext]) {
          shims[key + ext] = shims[key];
        }
      });
    });
  }
  function load_shims(paths, browser, cb) {
    var shims = Object.create(null);
    (function next() {
      var cur_path = paths.shift();
      if (!cur_path) {
        return cb(null, shims);
      }
      var pkg_path = path.join(cur_path, 'package.json');
      fs.readFile(pkg_path, 'utf8', function(err, data) {
        if (err) {
          if (err.code === 'ENOENT') {
            return next();
          }
          return cb(err);
        }
        try {
          find_shims_in_package(data, cur_path, shims, browser);
          return cb(null, shims);
        } catch (err) {
          return cb(err);
        }
      });
    })();
  }
  ;
  function load_shims_sync(paths, browser) {
    var shims = Object.create(null);
    var cur_path;
    while (cur_path = paths.shift()) {
      var pkg_path = path.join(cur_path, 'package.json');
      try {
        var data = fs.readFileSync(pkg_path, 'utf8');
        find_shims_in_package(data, cur_path, shims, browser);
        return shims;
      } catch (err) {
        if (err.code === 'ENOENT') {
          continue;
        }
        throw err;
      }
    }
    return shims;
  }
  function build_resolve_opts(opts, base) {
    var packageFilter = opts.packageFilter;
    var browser = normalizeBrowserFieldName(opts.browser);
    opts.basedir = base;
    opts.packageFilter = function(info, pkgdir) {
      if (packageFilter)
        info = packageFilter(info, pkgdir);
      var replacements = getReplacements(info, browser);
      if (!replacements) {
        return info;
      }
      info[browser] = replacements;
      if (typeof replacements === 'string') {
        info.main = replacements;
        return info;
      }
      var replace_main = replacements[info.main || './index.js'] || replacements['./' + info.main || './index.js'];
      info.main = replace_main || info.main;
      return info;
    };
    var pathFilter = opts.pathFilter;
    opts.pathFilter = function(info, resvPath, relativePath) {
      if (relativePath[0] != '.') {
        relativePath = './' + relativePath;
      }
      var mappedPath;
      if (pathFilter) {
        mappedPath = pathFilter.apply(this, arguments);
      }
      if (mappedPath) {
        return mappedPath;
      }
      var replacements = info[browser];
      if (!replacements) {
        return;
      }
      mappedPath = replacements[relativePath];
      if (!mappedPath && path.extname(relativePath) === '') {
        mappedPath = replacements[relativePath + '.js'];
        if (!mappedPath) {
          mappedPath = replacements[relativePath + '.json'];
        }
      }
      return mappedPath;
    };
    return opts;
  }
  function resolve(id, opts, cb) {
    opts = opts || {};
    var base = path.dirname(opts.filename);
    if (opts.basedir) {
      base = opts.basedir;
    }
    var paths = nodeModulesPaths(base);
    if (opts.paths) {
      paths.push.apply(paths, opts.paths);
    }
    paths = paths.map(function(p) {
      return path.dirname(p);
    });
    load_shims(paths, opts.browser, function(err, shims) {
      if (err) {
        return cb(err);
      }
      var resid = path.resolve(opts.basedir || path.dirname(opts.filename), id);
      if (shims[id] || shims[resid]) {
        var xid = shims[id] ? id : resid;
        if (shims[xid][0] === '/') {
          return resv(shims[xid], build_resolve_opts(opts, base), function(err, full, pkg) {
            cb(null, full, pkg);
          });
        }
        id = shims[xid];
      }
      var modules = opts.modules || Object.create(null);
      var shim_path = modules[id];
      if (shim_path) {
        return cb(null, shim_path);
      }
      var full = resv(id, build_resolve_opts(opts, base), function(err, full, pkg) {
        if (err) {
          return cb(err);
        }
        var resolved = (shims) ? shims[full] || full : full;
        cb(null, resolved, pkg);
      });
    });
  }
  ;
  resolve.sync = function(id, opts) {
    opts = opts || {};
    var base = path.dirname(opts.filename);
    if (opts.basedir) {
      base = opts.basedir;
    }
    var paths = nodeModulesPaths(base);
    if (opts.paths) {
      paths.push.apply(paths, opts.paths);
    }
    paths = paths.map(function(p) {
      return path.dirname(p);
    });
    var shims = load_shims_sync(paths, opts.browser);
    if (shims[id]) {
      if (shims[id][0] === '/') {
        return shims[id];
      }
      id = shims[id];
    }
    var modules = opts.modules || Object.create(null);
    var shim_path = modules[id];
    if (shim_path) {
      return shim_path;
    }
    var full = resv.sync(id, build_resolve_opts(opts, base));
    return (shims) ? shims[full] || full : full;
  };
  function normalizeBrowserFieldName(browser) {
    return browser || 'browser';
  }
  function getReplacements(info, browser) {
    browser = normalizeBrowserFieldName(browser);
    var replacements = info[browser] || info.browser;
    if (typeof info.browserify === 'string' && !replacements) {
      replacements = info.browserify;
    }
    return replacements;
  }
  module.exports = resolve;
})(require('process'));
