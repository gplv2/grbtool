#!/usr/bin/env bash
export DEBIAN_FRONTEND=noninteractive

APP_HME_DIR=$1
SOURCE_REPOSITORY="https://github.com/gplv2/grbtool.git"

# is this app provisioned already ? (would mess / error out on things like db migrations)
if [ -r /var/www/${APP_HME_DIR}/storage/logs/provisioned.status ]; then
    echo "App is already provisioned, you need to remove this file to do it again"
    exit 0;
fi

[ -r /etc/lsb-release ] && . /etc/lsb-release

if [ -z "$DISTRIB_RELEASE" ] && [ -x /usr/bin/lsb_release ]; then
    # Fall back to using the very slow lsb_release utility
    DISTRIB_RELEASE=$(lsb_release -s -r)
    DISTRIB_CODENAME=$(lsb_release -s -c)
fi

# If you disable xdebug, you cant use tools like phpspec that depend on
# phpunit dumping coverage data
if [ ! -x "/var/log/provision/xdebug.enable" ]; then 

    echo "Disable xdebug"

    if [ -L /etc/php/7.0/cli/conf.d/20-xdebug.ini ]; then
        echo "Disabling Xdebug for compilation - cli"
        rm -f /etc/php/7.0/cli/conf.d/20-xdebug.ini
    fi

    if [ -L /etc/php/7.0/fpm/conf.d/20-xdebug.ini ]; then
        echo "Disabling Xdebug for compilation - fpm"
        rm -f /etc/php/7.0/fpm/conf.d/20-xdebug.ini
    fi
fi

# this is a choice that affects the server

echo "Setting up Hello-API in $1"

# Here you could use deploy keys for your non-vagrant private app which you would
# provision remotely with for example terraform.

# echo "Installing SSH deployment keys"
# if [ ! -d "~/.ssh" ]; then 
#    mkdir ~/.ssh
#    chmod 700 ~/.ssh
# fi

# cp /vagrant/scripts/deployment_key.rsa ~/.ssh/deployment_key.rsa
# cp /vagrant/scripts/deployment_key.rsa.pub ~/.ssh/deployment_key.rsa.pub
# cp /vagrant/scripts/ssh_config ~/.ssh/config

# chmod 600 ~/.ssh/deployment_key.rsa
# chmod 644 ~/.ssh/deployment_key.rsa.pub
# chmod 644 ~/.ssh/config


#  Do some cleanup work, I hate that login banner, so silence it
sudo su - vagrant -c "touch ~/.hushlogin"

# Create known_hosts file
sudo su - vagrant -c "touch ~/.ssh/known_hosts"

# Add github key
sudo su - vagrant -c "ssh-keyscan github.com >> ~/.ssh/known_hosts"

# Add bitbuckets key (optional, for private repo use)
# sudo su - vagrant -c "ssh-keyscan bitbucket.org >> ~/.ssh/known_hosts"

echo "Cloning code"

if [ -d "/var/www" ]; then 
    chown vagrant:vagrant /var/www/
fi

# Clone the target repo
sudo su - vagrant -c "cd /var/www && git clone ${SOURCE_REPOSITORY} ${APP_HME_DIR}"

echo "Fixing ownerships and permissions"

chown vagrant:vagrant /var/www
chown -R vagrant:vagrant /var/www/${APP_HME_DIR}

echo "Launching composer install"
sudo su - vagrant -c "cd /var/www/${APP_HME_DIR} && composer install --no-progress"

# dump autoload 1 time before migrate, it seems to need/want it
sudo su - vagrant -c "cd /var/www/${APP_HME_DIR} && composer dump-autoload"

echo "Configuring the application database config"
# Copy .env.example to .env
if [ ! -x "/var/www/${APP_HME_DIR}/.env" ]; then 
    sudo su - vagrant -c "cp /var/www/${APP_HME_DIR}/.env.example /var/www/${APP_HME_DIR}/.env"
    # In case you need to change port numbers
    # echo "Verifying postgres DB port"
    # sed -i 's/DB_PORT=5433/DB_PORT=5432/' /var/www/${APP_HME_DIR}/.env
fi

echo "Completing laravel installation ( as vagrant user)"

echo "Create migration table"
sudo su - vagrant -c "cd /var/www/${APP_HME_DIR} && php artisan migrate:install"
echo "Perform migrations"
sudo su - vagrant -c "cd /var/www/${APP_HME_DIR} && php artisan migrate"
echo "Vendor publish (configs)"
sudo su - vagrant -c "cd /var/www/${APP_HME_DIR} && php artisan vendor:publish"
echo "Optimize"
sudo su - vagrant -c "cd /var/www/${APP_HME_DIR} && php artisan optimize"
echo "Dump autoload"
sudo su - vagrant -c "cd /var/www/${APP_HME_DIR} && composer dump-autoload"

# common aliases for laravel
if [ ! -x "/home/vagrant/.bash_aliases" ]; then 
   cat << EOF > /home/vagrant/.bash_aliases
alias h='cd ~'
alias hm='cd /var/www/${APP_HME_DIR}'
alias c='clear'
alias art=artisan

alias phpspec='vendor/bin/phpspec'
alias phpunit='vendor/bin/phpunit'

EOF
fi

chown vagrant:vagrant /home/vagrant/.bash_aliases

# Mark end of provisioning for this app
touch /var/www/${APP_HME_DIR}/storage/logs/provisioned.status
