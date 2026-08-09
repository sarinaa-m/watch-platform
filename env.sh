#!/bin/sh
# line endings must be \n, not \r\n !
rm -rf ./env-config.js
touch ./env-config.js

echo "window._env_ = {" > ./env-config.js
awk -F '=' '{ print $1 ": \"" (ENVIRON[$1] ? ENVIRON[$1] : $2) "\"," }' ./.env >> ./env-config.js
echo "}" >> ./env-config.js
