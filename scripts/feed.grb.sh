#!/bin/bash -xe

DATA=http://debian.byte-consult.be/grb/data_schema.grb_api.sql.gz

cd /usr/local/src/

if [ ! -r /vagrant/grb.gz ]; then
   echo "Fetch GRB data ..."
   # Download helper scripts to create a configuration file
   wget --quiet $DATA -O grb.gz
else
   echo "Using host shared GRB data ..."
   ln -s /vagrant/grb.gz 
fi

# CREATE EXTENSION postgis;
# CREATE EXTENSION postgis_topology;
# CREATE EXTENSION hstore;
echo "Enable PostGIS on GRB database ..."

su - postgres -c "psql -d grb-api -c 'CREATE EXTENSION postgis;'"
su - postgres -c "psql -d grb-api -c 'CREATE EXTENSION postgis_topology;'"
su - postgres -c "psql -d grb-api -c 'CREATE EXTENSION hstore;'"
   
# psql --set ON_ERROR_STOP=on dbname < infile

echo "Importing data ..."
su - postgres -c "zcat /usr/local/src/grb.gz | psql --set ON_ERROR_STOP=on grb-api"

echo "Done"

sleep 2

