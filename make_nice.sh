#!/bin/sh

PATH=$PATH:/var/www/grbtool/node_modules/.bin

# Bake the pizza
browserify node_modules/geojsontoosm/index.js --s geos  > public/js/pizza.js
browserify public/js/wrdiff.js > public/js/trf.js

for file in public/js/*.js ; do
    js-beautify -s 4 -P -m -k -r -f $file
done

