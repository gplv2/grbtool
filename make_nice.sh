#!/bin/sh

PATH=$PATH:/var/www/grbtool/node_modules/.bin

# Bake the pizza
echo "Building pizza.js"
browserify node_modules/geojsontoosm/index.js -d --s geos  > public/js/pizza.js

echo "Building mapshaper.js"
# Bake the mapshaper
browserify node_modules/mapshaper/www/mapshaper.js --s mapshaper | uglifyjs > public/js/mapshaper.js

echo "Building trf.js"
# Bake the wrdiff stuff
browserify public/js/wrdiff.js --s tf > public/js/trf.js

for file in public/js/*.js ; do
    js-beautify -s 4 -P -m -k -r -f $file
done

