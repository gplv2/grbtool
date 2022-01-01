#!/bin/sh

#PATH=$PATH:/var/www/grbtool/node_modules/.bin
PATH=$PATH:/home/glenn/repos/grbtool/node_modules/.bin

# Bake the pizza
echo "Building pizza.js"
#  browserify node_modules/geojsontoosm/index.js -d --s geos  > public/js/pizza.js
#  don't override this, I made a custom fix that we need, work for later figuring the build of this js 

echo "Building mapshaper.js"
# Bake the mapshaper
browserify node_modules/mapshaper/www/mapshaper.js --s mapshaper | uglifyjs > public/js/mapshaper.js

echo "Building trf.js"
# Bake the wrdiff stuff
browserify public/js/wrdiff.js --s tf > public/js/trf.js

for file in public/js/*.js ; do
    js-beautify -s 4 -P -m 3 -r -k -f $file
done


# make geojson-merge

# browserify node_modules/@mapbox/geojson-merge/ -d --s gmerge -o public/js/gmerge.js
