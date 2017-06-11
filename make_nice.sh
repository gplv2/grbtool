#!/bin/sh
export PATH=$PATH:/var/www/grbtool/node_modules/.bin
for file in public/js/*.js ; do
    js-beautify -s 4 -P -m -k -r -f $file
done

