#!/usr/bin/env bash
export DEBIAN_FRONTEND=noninteractive

APP_HME_DIR=$1

# is this app provisioned already ? (would mess / error out on things like db migrations)
if [ -r /var/www/${APP_HME_DIR}/storage/logs/npm.status ]; then
    echo "NPM is already provisioned, you need to remove this file to do it again"
    exit 0;
fi

[ -r /etc/lsb-release ] && . /etc/lsb-release

if [ -z "$DISTRIB_RELEASE" ] && [ -x /usr/bin/lsb_release ]; then
    # Fall back to using the very slow lsb_release utility
    DISTRIB_RELEASE=$(lsb_release -s -r)
    DISTRIB_CODENAME=$(lsb_release -s -c)
fi

echo "Setting up NPM in $1"

# installing from package.json
echo "Launching NPM install"
sudo su - vagrant -c "cd /var/www/${APP_HME_DIR} && npm install 2>/dev/null"

# Generate docs
echo "Generate public API docs"
sudo su - vagrant -c "cd /var/www/${APP_HME_DIR} && \$(npm bin)/apidoc -f external.php -i app -o public/api/documentation"
echo "Generate private API docs"
sudo su - vagrant -c "cd /var/www/${APP_HME_DIR} && \$(npm bin)/apidoc -f internal.php -i app -o public/api/private/documentation"

# Mark end of provisioning for this app
touch /var/www/${APP_HME_DIR}/storage/logs/npm.status
