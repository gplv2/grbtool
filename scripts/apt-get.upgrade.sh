#!/usr/bin/env bash
DEBIAN_FRONTEND=noninteractive
export $DEBIAN_FRONTEND

DBTYPE=$1

echo "Finishing off standard install"

printf "Fixing locales warnings"
echo "LC_ALL=en_US.UTF-8" >> /etc/environment

# fix locales
locale-gen "en_US.UTF-8"
# locale-gen "nl_BE.UTF-8"

echo "nl_BE.UTF-8 UTF-8" >> /etc/locale.gen

locale-gen

# Generating locales...
DEBIAN_FRONTEND=noninteractive dpkg-reconfigure locales

# since all services run on localhost, set those in the vagrant hostfile 
echo "127.0.0.1 redis" >> /etc/hosts

# create a log dir that affects the server

if [ ! -d "/var/log/provision" ]; then
    mkdir /var/log/provision 2>/dev/null
    chown vagrant:vagrant /var/log/provision
fi

# Fix package problems & upgrade dist immediately
DEBIAN_FRONTEND=noninteractive apt-get update

DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confnew" -f
DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confnew" -f

[ -r /etc/lsb-release ] && . /etc/lsb-release
if [ -z "$DISTRIB_RELEASE" ] && [ -x /usr/bin/lsb_release ]; then
    # Fall back to using the very slow lsb_release utility
    DISTRIB_RELEASE=$(lsb_release -s -r)
    DISTRIB_CODENAME=$(lsb_release -s -c)
fi

printf "Preparing for ubuntu %s - %s\n" "$DISTRIB_RELEASE" "$DISTRIB_CODENAME"

# common general packages for all ubuntu versions
DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confnew" zip unzip
DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confnew" -f

printf "Removing apparmor\n" 
# Remove apparmor , this is not needed for a vagrant box plus it messes up mariadb, just remove it
DEBIAN_FRONTEND=noninteractive apt-get remove -y apparmor

echo "Setting up for ubuntu %s - %s\n" "$DISTRIB_RELEASE" "$DISTRIB_CODENAME"

if [ "$DBTYPE" = "mysql" ]; then
   echo "Remove standard MysqlDB"
   # Remove standard MySQL
   DEBIAN_FRONTEND=noninteractive apt-get remove -y --purge mysql-server mysql-client mysql-common
   DEBIAN_FRONTEND=noninteractive apt-get autoremove -y
   DEBIAN_FRONTEND=noninteractive apt-get autoclean

   rm -rf /var/lib/mysql
   rm -rf /var/log/mysql
   rm -rf /etc/mysql
fi

echo "Provisioning virtual machine"

# Add mariadb early so we don't install older version first, then upgrade
if [ "$DBTYPE" = "mysql" ]; then
    echo "Setting apt up for latest MariaDB %s - %s\n" "$DISTRIB_RELEASE" "$DISTRIB_CODENAME"
    # Add Maria PPA
    DEBIAN_FRONTEND=noninteractive apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xF1656F24C74CD1D8
    DEBIAN_FRONTEND=noninteractive add-apt-repository 'deb http://ftp.osuosl.org/pub/mariadb/repo/10.2/ubuntu xenial main'

    DEBIAN_FRONTEND=noninteractive apt-get update

    DEBIAN_FRONTEND=noninteractive debconf-set-selections <<< 'mariadb-server-10.2 mysql-server/data-dir select ''"'
    DEBIAN_FRONTEND=noninteractive debconf-set-selections <<< 'mariadb-server-10.2 mysql-server/root_password password datacharmer'
    DEBIAN_FRONTEND=noninteractive debconf-set-selections <<< 'mariadb-server-10.2 mysql-server/root_password_again password datacharmer'
fi

echo "Install packages ..."
# DISTRIB_RELEASE=14.04
if [ "$DISTRIB_RELEASE" = "14.04" ]; then
    DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confnew" -o Dpkg::Progress-Fancy="0" phpunit php7.0 php7.0-fpm php-dev php-pear php-config pkg-config pkgconf pkg-php-tools g++ make memcached libmemcached-dev build-essential python-software-properties php-memcached memcached php-memcache curl php-redis redis-server php5-cli git ccze 2> /dev/null
    if [ "$DBTYPE" = "pgsql" ]; then
        DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confnew" -o Dpkg::Progress-Fancy="0" postgresql postgis 2> /dev/null
    fi
    if [ "$DBTYPE" = "mysql" ]; then
        DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confnew" -o Dpkg::Progress-Fancy="0" mariadb-server mariadb-client php-mysql 2> /dev/null
    fi
fi

if [ "$DISTRIB_RELEASE" = "16.04" ]; then
    echo "Install $DISTRIB_RELEASE packages ..."
    DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confnew" -o Dpkg::Progress-Fancy="0" phpunit php7.0 php7.0-fpm php-dev php-pear pkg-config pkgconf pkg-php-tools g++ make memcached libmemcached-dev build-essential python-software-properties php-memcached memcached php-memcache php-redis redis-server curl php-cli git ccze 2> /dev/null
    if [ "$DBTYPE" = "pgsql" ]; then
        DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confnew" -o Dpkg::Progress-Fancy="0" postgresql postgis 2> /dev/null
    fi
    if [ "$DBTYPE" = "mysql" ]; then
        DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confnew" -o Dpkg::Progress-Fancy="0" mariadb-server mariadb-client php-mysql 2> /dev/null
    fi
fi

echo "Install Composer in /usr/local/bin ..."
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
