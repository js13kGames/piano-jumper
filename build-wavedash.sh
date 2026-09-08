#!/bin/sh
# Wavedash build, kept deliberately separate from build.sh so that
# ./build.sh can never produce anything but the js13k submission.
# No advzip step: there is no size pressure here.
set -e

npm install --silent            # terser, the only dependency
node build-wavedash.js          # -> dist/wavedash/index.html and dist/wavedash.zip

ls -l dist/wavedash.zip
