#!/bin/sh
# terser is a JavaScript parser and rejects an HTML file outright, so the
# script is extracted, minified and re-inlined by build.js. advzip cannot
# create an archive either -- it only recompresses one that already exists,
# so it runs afterwards and is optional.
set -e

npm install --silent            # terser, the only dependency
node build.js                   # -> dist/index.html and dist/game.zip

if command -v advzip >/dev/null 2>&1; then
  advzip -z -4 dist/game.zip
  echo "advzip: recompressed"
else
  echo "advzip: not installed, skipped (the zip is already deflate -9)"
fi

ls -l dist/game.zip
