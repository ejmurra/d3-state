/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/*
 * WARNING!
 *
 * Do not edit this file directly, it is built from the sources at
 * https://github.com/mozilla/source-map/
 */

Components.utils.import('resource://gre/modules/devtools/Require.jsm');
Components.utils.import('resource://gre/modules/devtools/SourceMap.jsm');

this.EXPORTED_SYMBOLS = [ "define", "runSourceMapTests" ];
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
define('test/source-map/assert', ['exports'], function (exports) {

  let do_throw = function (msg) {
    throw new Error(msg);
  };

  exports.init = function (throw_fn) {
    do_throw = throw_fn;
  };

  exports.doesNotThrow = function (fn) {
    try {
      fn();
    }
    catch (e) {
      do_throw(e.message);
    }
  };

  exports.equal = function (actual, expected, msg) {
    msg = msg || String(actual) + ' != ' + String(expected);
    if (actual != expected) {
      do_throw(msg);
    }
  };

  exports.ok = function (val, msg) {
    msg = msg || String(val) + ' is falsey';
    if (!Boolean(val)) {
      do_throw(msg);
    }
  };

  exports.strictEqual = function (actual, expected, msg) {
    msg = msg || String(actual) + ' !== ' + String(expected);
    if (actual !== expected) {
      do_throw(msg);
    }
  };

  exports.throws = function (fn) {
    try {
      fn();
      do_throw('Expected an error to be thrown, but it wasn\'t.');
    }
    catch (e) {
    }
  };

});
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
define('test/source-map/util', ['require', 'exports', 'module' ,  'lib/source-map/util'], function(require, exports, module) {

  var util = require('source-map/util');

  // This is a test mapping which maps functions from two different files
  // (one.js and two.js) to a minified generated source.
  //
  // Here is one.js:
  //
  //   ONE.foo = function (bar) {
  //     return baz(bar);
  //   };
  //
  // Here is two.js:
  //
  //   TWO.inc = function (n) {
  //     return n + 1;
  //   };
  //
  // And here is the generated code (min.js):
  //
  //   ONE.foo=function(a){return baz(a);};
  //   TWO.inc=function(a){return a+1;};
  exports.testGeneratedCode = " ONE.foo=function(a){return baz(a);};\n"+
                              " TWO.inc=function(a){return a+1;};";
  exports.testMap = {
    version: 3,
    file: 'min.js',
    names: ['bar', 'baz', 'n'],
    sources: ['one.js', 'two.js'],
    sourceRoot: '/the/root',
    mappings: 'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA'
  };
  exports.testMapNoSourceRoot = {
    version: 3,
    file: 'min.js',
    names: ['bar', 'baz', 'n'],
    sources: ['one.js', 'two.js'],
    mappings: 'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA'
  };
  exports.testMapEmptySourceRoot = {
    version: 3,
    file: 'min.js',
    names: ['bar', 'baz', 'n'],
    sources: ['one.js', 'two.js'],
    sourceRoot: '',
    mappings: 'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA'
  };
  // This mapping is identical to above, but uses the indexed format instead.
  exports.indexedTestMap = {
    version: 3,
    file: 'min.js',
    sections: [
      {
        offset: {
          line: 0,
          column: 0
        },
        map: {
          version: 3,
          sources: [
            "one.js"
          ],
          sourcesContent: [
            ' ONE.foo = function (bar) {\n' +
            '   return baz(bar);\n' +
            ' };',
          ],
          names: [
            "bar",
            "baz"
          ],
          mappings: "CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID",
          file: "min.js",
          sourceRoot: "/the/root"
        }
      },
      {
        offset: {
          line: 1,
          column: 0
        },
        map: {
          version: 3,
          sources: [
            "two.js"
          ],
          sourcesContent: [
            ' TWO.inc = function (n) {\n' +
            '   return n + 1;\n' +
            ' };'
          ],
          names: [
            "n"
          ],
          mappings: "CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOA",
          file: "min.js",
          sourceRoot: "/the/root"
        }
      }
    ]
  };
  exports.indexedTestMapDifferentSourceRoots = {
    version: 3,
    file: 'min.js',
    sections: [
      {
        offset: {
          line: 0,
          column: 0
        },
        map: {
          version: 3,
          sources: [
            "one.js"
          ],
          sourcesContent: [
            ' ONE.foo = function (bar) {\n' +
            '   return baz(bar);\n' +
            ' };',
          ],
          names: [
            "bar",
            "baz"
          ],
          mappings: "CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID",
          file: "min.js",
          sourceRoot: "/the/root"
        }
      },
      {
        offset: {
          line: 1,
          column: 0
        },
        map: {
          version: 3,
          sources: [
            "two.js"
          ],
          sourcesContent: [
            ' TWO.inc = function (n) {\n' +
            '   return n + 1;\n' +
            ' };'
          ],
          names: [
            "n"
          ],
          mappings: "CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOA",
          file: "min.js",
          sourceRoot: "/different/root"
        }
      }
    ]
  };
  exports.testMapWithSourcesContent = {
    version: 3,
    file: 'min.js',
    names: ['bar', 'baz', 'n'],
    sources: ['one.js', 'two.js'],
    sourcesContent: [
      ' ONE.foo = function (bar) {\n' +
      '   return baz(bar);\n' +
      ' };',
      ' TWO.inc = function (n) {\n' +
      '   return n + 1;\n' +
      ' };'
    ],
    sourceRoot: '/the/root',
    mappings: 'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA'
  };
  exports.testMapRelativeSources = {
    version: 3,
    file: 'min.js',
    names: ['bar', 'baz', 'n'],
    sources: ['./one.js', './two.js'],
    sourcesContent: [
      ' ONE.foo = function (bar) {\n' +
      '   return baz(bar);\n' +
      ' };',
      ' TWO.inc = function (n) {\n' +
      '   return n + 1;\n' +
      ' };'
    ],
    sourceRoot: '/the/root',
    mappings: 'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA'
  };
  exports.emptyMap = {
    version: 3,
    file: 'min.js',
    names: [],
    sources: [],
    mappings: ''
  };


  function assertMapping(generatedLine, generatedColumn, originalSource,
                         originalLine, originalColumn, name, map, assert,
                         dontTestGenerated, dontTestOriginal) {
    if (!dontTestOriginal) {
      var origMapping = map.originalPositionFor({
        line: generatedLine,
        column: generatedColumn
      });
      assert.equal(origMapping.name, name,
                   'Incorrect name, expected ' + JSON.stringify(name)
                   + ', got ' + JSON.stringify(origMapping.name));
      assert.equal(origMapping.line, originalLine,
                   'Incorrect line, expected ' + JSON.stringify(originalLine)
                   + ', got ' + JSON.stringify(origMapping.line));
      assert.equal(origMapping.column, originalColumn,
                   'Incorrect column, expected ' + JSON.stringify(originalColumn)
                   + ', got ' + JSON.stringify(origMapping.column));

      var expectedSource;

      if (originalSource && map.sourceRoot && originalSource.indexOf(map.sourceRoot) === 0) {
        expectedSource = originalSource;
      } else if (originalSource) {
        expectedSource = map.sourceRoot
          ? util.join(map.sourceRoot, originalSource)
          : originalSource;
      } else {
        expectedSource = null;
      }

      assert.equal(origMapping.source, expectedSource,
                   'Incorrect source, expected ' + JSON.stringify(expectedSource)
                   + ', got ' + JSON.stringify(origMapping.source));
    }

    if (!dontTestGenerated) {
      var genMapping = map.generatedPositionFor({
        source: originalSource,
        line: originalLine,
        column: originalColumn
      });
      assert.equal(genMapping.line, generatedLine,
                   'Incorrect line, expected ' + JSON.stringify(generatedLine)
                   + ', got ' + JSON.stringify(genMapping.line));
      assert.equal(genMapping.column, generatedColumn,
                   'Incorrect column, expected ' + JSON.stringify(generatedColumn)
                   + ', got ' + JSON.stringify(genMapping.column));
    }
  }
  exports.assertMapping = assertMapping;

  function assertEqualMaps(assert, actualMap, expectedMap) {
    assert.equal(actualMap.version, expectedMap.version, "version mismatch");
    assert.equal(actualMap.file, expectedMap.file, "file mismatch");
    assert.equal(actualMap.names.length,
                 expectedMap.names.length,
                 "names length mismatch: " +
                   actualMap.names.join(", ") + " != " + expectedMap.names.join(", "));
    for (var i = 0; i < actualMap.names.length; i++) {
      assert.equal(actualMap.names[i],
                   expectedMap.names[i],
                   "names[" + i + "] mismatch: " +
                     actualMap.names.join(", ") + " != " + expectedMap.names.join(", "));
    }
    assert.equal(actualMap.sources.length,
                 expectedMap.sources.length,
                 "sources length mismatch: " +
                   actualMap.sources.join(", ") + " != " + expectedMap.sources.join(", "));
    for (var i = 0; i < actualMap.sources.length; i++) {
      assert.equal(actualMap.sources[i],
                   expectedMap.sources[i],
                   "sources[" + i + "] length mismatch: " +
                   actualMap.sources.join(", ") + " != " + expectedMap.sources.join(", "));
    }
    assert.equal(actualMap.sourceRoot,
                 expectedMap.sourceRoot,
                 "sourceRoot mismatch: " +
                   actualMap.sourceRoot + " != " + expectedMap.sourceRoot);
    assert.equal(actualMap.mappings, expectedMap.mappings,
                 "mappings mismatch:\nActual:   " + actualMap.mappings + "\nExpected: " + expectedMap.mappings);
    if (actualMap.sourcesContent) {
      assert.equal(actualMap.sourcesContent.length,
                   expectedMap.sourcesContent.length,
                   "sourcesContent length mismatch");
      for (var i = 0; i < actualMap.sourcesContent.length; i++) {
        assert.equal(actualMap.sourcesContent[i],
                     expectedMap.sourcesContent[i],
                     "sourcesContent[" + i + "] mismatch");
      }
    }
  }
  exports.assertEqualMaps = assertEqualMaps;

});
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
define('lib/source-map/util', ['require', 'exports', 'module' , ], function(require, exports, module) {

  /**
   * This is a helper function for getting values from parameter/options
   * objects.
   *
   * @param args The object we are extracting values from
   * @param name The name of the property we are getting.
   * @param defaultValue An optional value to return if the property is missing
   * from the object. If this is not specified and the property is missing, an
   * error will be thrown.
   */
  function getArg(aArgs, aName, aDefaultValue) {
    if (aName in aArgs) {
      return aArgs[aName];
    } else if (arguments.length === 3) {
      return aDefaultValue;
    } else {
      throw new Error('"' + aName + '" is a required argument.');
    }
  }
  exports.getArg = getArg;

  var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
  var dataUrlRegexp = /^data:.+\,.+$/;

  function urlParse(aUrl) {
    var match = aUrl.match(urlRegexp);
    if (!match) {
      return null;
    }
    return {
      scheme: match[1],
      auth: match[2],
      host: match[3],
      port: match[4],
      path: match[5]
    };
  }
  exports.urlParse = urlParse;

  function urlGenerate(aParsedUrl) {
    var url = '';
    if (aParsedUrl.scheme) {
      url += aParsedUrl.scheme + ':';
    }
    url += '//';
    if (aParsedUrl.auth) {
      url += aParsedUrl.auth + '@';
    }
    if (aParsedUrl.host) {
      url += aParsedUrl.host;
    }
    if (aParsedUrl.port) {
      url += ":" + aParsedUrl.port
    }
    if (aParsedUrl.path) {
      url += aParsedUrl.path;
    }
    return url;
  }
  exports.urlGenerate = urlGenerate;

  /**
   * Normalizes a path, or the path portion of a URL:
   *
   * - Replaces consequtive slashes with one slash.
   * - Removes unnecessary '.' parts.
   * - Removes unnecessary '<dir>/..' parts.
   *
   * Based on code in the Node.js 'path' core module.
   *
   * @param aPath The path or url to normalize.
   */
  function normalize(aPath) {
    var path = aPath;
    var url = urlParse(aPath);
    if (url) {
      if (!url.path) {
        return aPath;
      }
      path = url.path;
    }
    var isAbsolute = (path.charAt(0) === '/');

    var parts = path.split(/\/+/);
    for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
      part = parts[i];
      if (part === '.') {
        parts.splice(i, 1);
      } else if (part === '..') {
        up++;
      } else if (up > 0) {
        if (part === '') {
          // The first part is blank if the path is absolute. Trying to go
          // above the root is a no-op. Therefore we can remove all '..' parts
          // directly after the root.
          parts.splice(i + 1, up);
          up = 0;
        } else {
          parts.splice(i, 2);
          up--;
        }
      }
    }
    path = parts.join('/');

    if (path === '') {
      path = isAbsolute ? '/' : '.';
    }

    if (url) {
      url.path = path;
      return urlGenerate(url);
    }
    return path;
  }
  exports.normalize = normalize;

  /**
   * Joins two paths/URLs.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be joined with the root.
   *
   * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
   *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
   *   first.
   * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
   *   is updated with the result and aRoot is returned. Otherwise the result
   *   is returned.
   *   - If aPath is absolute, the result is aPath.
   *   - Otherwise the two paths are joined with a slash.
   * - Joining for example 'http://' and 'www.example.com' is also supported.
   */
  function join(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }
    if (aPath === "") {
      aPath = ".";
    }
    var aPathUrl = urlParse(aPath);
    var aRootUrl = urlParse(aRoot);
    if (aRootUrl) {
      aRoot = aRootUrl.path || '/';
    }

    // `join(foo, '//www.example.org')`
    if (aPathUrl && !aPathUrl.scheme) {
      if (aRootUrl) {
        aPathUrl.scheme = aRootUrl.scheme;
      }
      return urlGenerate(aPathUrl);
    }

    if (aPathUrl || aPath.match(dataUrlRegexp)) {
      return aPath;
    }

    // `join('http://', 'www.example.com')`
    if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
      aRootUrl.host = aPath;
      return urlGenerate(aRootUrl);
    }

    var joined = aPath.charAt(0) === '/'
      ? aPath
      : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

    if (aRootUrl) {
      aRootUrl.path = joined;
      return urlGenerate(aRootUrl);
    }
    return joined;
  }
  exports.join = join;

  /**
   * Make a path relative to a URL or another path.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be made relative to aRoot.
   */
  function relative(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }

    aRoot = aRoot.replace(/\/$/, '');

    // XXX: It is possible to remove this block, and the tests still pass!
    var url = urlParse(aRoot);
    if (aPath.charAt(0) == "/" && url && url.path == "/") {
      return aPath.slice(1);
    }

    return aPath.indexOf(aRoot + '/') === 0
      ? aPath.substr(aRoot.length + 1)
      : aPath;
  }
  exports.relative = relative;

  /**
   * Because behavior goes wacky when you set `__proto__` on objects, we
   * have to prefix all the strings in our set with an arbitrary character.
   *
   * See https://github.com/mozilla/source-map/pull/31 and
   * https://github.com/mozilla/source-map/issues/30
   *
   * @param String aStr
   */
  function toSetString(aStr) {
    return '$' + aStr;
  }
  exports.toSetString = toSetString;

  function fromSetString(aStr) {
    return aStr.substr(1);
  }
  exports.fromSetString = fromSetString;

  function strcmp(aStr1, aStr2) {
    var s1 = aStr1 || "";
    var s2 = aStr2 || "";
    return (s1 > s2) - (s1 < s2);
  }

  /**
   * Comparator between two mappings where the original positions are compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same original source/line/column, but different generated
   * line and column the same. Useful when searching for a mapping with a
   * stubbed out mapping.
   */
  function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
    var cmp;

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp || onlyCompareOriginal) {
      return cmp;
    }

    cmp = strcmp(mappingA.name, mappingB.name);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    return mappingA.generatedColumn - mappingB.generatedColumn;
  };
  exports.compareByOriginalPositions = compareByOriginalPositions;

  /**
   * Comparator between two mappings where the generated positions are
   * compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same generated line and column, but different
   * source/name/original line and column the same. Useful when searching for a
   * mapping with a stubbed out mapping.
   */
  function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
    var cmp;

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp || onlyCompareGenerated) {
      return cmp;
    }

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp) {
      return cmp;
    }

    return strcmp(mappingA.name, mappingB.name);
  };
  exports.compareByGeneratedPositions = compareByGeneratedPositions;

});
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
function runSourceMapTests(modName, do_throw) {
  let mod = require(modName);
  let assert = require('test/source-map/assert');
  let util = require('test/source-map/util');

  assert.init(do_throw);

  for (let k in mod) {
    if (/^test/.test(k)) {
      mod[k](assert, util);
    }
  }

}
this.runSourceMapTests = runSourceMapTests;
