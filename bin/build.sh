#!/usr/bin/env bash

rm -rf build
node node_modules/typescript/bin/tsc
node node_modules/browserify/bin/cmd build/StateStepper.js -o dist/StateStepper.js
./node_modules/uglify-js/bin/uglifyjs dist/StateStepper.js -o dist/StateStepper.min.js