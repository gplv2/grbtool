#!/usr/bin/env bash

DB=$1;
USER=$2;
PASSWORD=$3;
DBTYPE=$4;

# vagrant default subnet (NAT)
SUBNET=10.0.2.2/32

# re-configure postgres auth/config  (if postgres is on there, do it anyway even if we select other db)
if [ ! -x "/etc/postgresql/9.5/main/postgresql.conf" ]; then
    printf "Enable listening on all interfaces"
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/9.5/main/postgresql.conf
    sed -i "s/shared_buffers = 128MB/shared_buffers = 1024MB/" /etc/postgresql/9.5/main/postgresql.conf
    sed -i "s/#work_mem = 4MB/work_mem = 32MB/" /etc/postgresql/9.5/main/postgresql.conf
    sed -i "s/#maintenance_work_mem = 64MB/maintenance_work_mem = 256MB/" /etc/postgresql/9.5/main/postgresql.conf
fi

# trust our vagrant subnet
if [ ! -x "/etc/postgresql/9.5/main/pg_hba.conf" ]; then
    echo "host    all             all             $SUBNET           trust" >> /etc/postgresql/9.5/main/pg_hba.conf
fi

if [ "$DBTYPE" = "pgsql" ]; then
    echo "(re)Start Postgres DB ..."
    # service postgresql restart # Gives no output, so take old school one
    /etc/init.d/postgresql restart
fi

if [ "$DBTYPE" = "mysql" ]; then
    # Defaults to 256M , raise it:
    if [ ! -x "/etc/mysql/my.cnf" ]; then
       sed -i "/innodb_buffer_pool_size = 256M/innodb_buffer_pool_size = 512M/" /etc/mysql/my.cnf
    fi
    echo "(re)Start Maria DB ..."
    # restart mysql
    service mysql restart
fi

echo "Preparing Database ... $1 / $2 "

# some grace time as from time to time, it needs a second.
sleep 2

# Setup postgresql
if [ "$DBTYPE" = "pgsql" ]; then
    # su postgres -c "dropdb $DB --if-exists"
    if ! su - postgres -c "psql -d $DB -c '\q' 2>/dev/null"; then
        su - postgres -c "createuser $USER"
        su - postgres -c "createdb --encoding='utf-8' --owner=$USER '$DB'"
    fi

    echo "Changing user password ..."
    cat > /home/vagrant/install.postcreate.sql << EOF
ALTER USER "$USER" WITH PASSWORD '${PASSWORD}';
EOF
    su - postgres -c "cat /home/vagrant/install.postcreate.sql | psql -d $DB"
fi

# Setup mysql
if [ "$DBTYPE" = "mysql" ]; then

    mysql --user="root" -pdatacharmer -e "CREATE USER '${USER}'@'%' IDENTIFIED BY '${PASSWORD}';"
    mysql --user="root" -pdatacharmer -e "GRANT ALL ON *.* TO '${USER}'@'0.0.0.0' IDENTIFIED BY '${PASSWORD}' WITH GRANT OPTION;"
    mysql --user="root" -pdatacharmer -e "GRANT ALL ON *.* TO '${USER}'@'%' IDENTIFIED BY '${PASSWORD}' WITH GRANT OPTION;"
    mysql --user="root" -pdatacharmer -e "FLUSH PRIVILEGES;"

    mysql --user="root" -pdatacharmer -e "CREATE DATABASE IF NOT EXISTS \`$DB\` DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_unicode_ci";

fi

