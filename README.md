[![Open Source Love](https://badges.frapsoft.com/os/gpl/gpl.svg?v=102)](https://badges.frapsoft.com/os/gpl/gpl.svg?v=102)
[![Scrutinizer Quality Score](https://scrutinizer-ci.com/g/gplv2/grbtool/badges/quality-score.png?s=4023c984fc1163a44f4220cd7d57406643ced9f2)](https://scrutinizer-ci.com/g/gplv2/grbtool/badges/quality-score.png?s=4023c984fc1163a44f4220cd7d57406643ced9f2)
[![Code Coverage](https://scrutinizer-ci.com/g/gplv2/grbtool/badges/coverage.png?s=531ebd5f55891dfc816ace082531adfb24d194e9)](https://scrutinizer-ci.com/g/gplv2/grbtool/badges/coverage.png?s=531ebd5f55891dfc816ace082531adfb24d194e9)
[![Build](https://scrutinizer-ci.com/g/gplv2/grbtool/badges/build.png?b=master)](https://scrutinizer-ci.com/g/gplv2/grbtool/badges/build.png?b=master)

# Screenshot

![first screenshot](/screenshots/grbtool_new.png?raw=true "First screenshot")

# Grbtool

GRB-GIMT: GRB GUI Import and Merge Tool.  Production site for GRB import work flemish part of Belgium.

[![Latest Stable Version](https://poser.pugx.org/matthiasnoback/badges/v/stable.png)](https://poser.pugx.org/matthiasnoback/badges/v/stable.png)

## Content

* [Introduction](#VagrantIntro)
* [Features](#VagrantFeatures)
* [Requirements](#VagrantRequirements)
* [Instructions](#VagrantInstructions)

<a name="VagrantIntro"></a>

## Introduction

This vagrant is specifically setup to use nginx, mariadb / postgres , php-fpm .  The reason is that standard homestead does not take care of bringing the OS up to date. 0.5 left package management broken in my experience so I started writing a fix script, that eventually became a custom provisioner.  The goal making it was to reuse the homestead box , since it is a good start.  But we will update/upgrade it on OS level. Also add specific software and last but note least: deploy the full app from a git clone and not from a shared dir.

The reason to not use the shared directory as base of our application is that often versions differ between where you work (usually host) and the platform you test. Accidently dumping composer autoload on the host can have strange consequences.  It is better to start totally fresh on a VM.

It's using my own custom installation scripts as I have had lots of issues with particular tasks in Ansible/Puppet etc.  For example some wget commands fail with segfaults when you're not using --quiet option inside a provisioner. If you use the provided vagrant configuration, you are sure to run on the latest ubuntu 16.04 server.

When it's done, you can visit the bridged ip remotely or the internal IP via the host OS to access the webserver.  The only thing you need to do is add a host mapping to your /etc/hosts file (linux) or equivalent for your OS.
This mapping should point to the IP address you want to visit.  Vagrant will output this hosts

Standard name of the app is : grb.app but you can rename this in the .env file and provisioning will follow.

<a name="VagrantFeatures"></a>
## Main Features

* Do networking correct (include a bridge)
* Fixes locale issue (perl warning)
* Upgrades/updates and corrects all dpkg package issues
* Provisions additional packages
* Deploys MariaDB 10.2 or Postgres 9.5 database (We use postgres as we need postgis, MariaDB does not have the extentions we need)
* Configures all os settings/config/databases and users
* Uses NGINX webserver + PHP/FPM (configures the app)
* PHP 7.0.13-1 (stable) , Optional installation of 7.1 possible
* Deploys the app (check repo url)
* Triggers right composer + artisan commands to correctly deploy

## Install flow

* install/upgrade 16.04 Base Ubuntu installation
* install PHP 7.0 and libraries
* install GRB GIMT
* configure nginx + phpfpm
* configure postgresql/postgis
* download database dump (be gently on the host)
* import dump
* deploy framework (Laravel 5.2) + node.js
* perform the usual post install Laravel jobs / node jobs

### single configuration source 

with the env plugin, we can reuse .env.example to deploy our app.  So you clone the Grbtool repository, make a copy of the example to .env and edit your preferences, then do `vagrant up`.  You need to be aware that any .env is excluded in being commited to git.  Changes you make in the .env file remain local changes.  But you don't need this to deploy your application. The default example file works out of the box. If you want to change this , you'll need to fork the repository and change the .env.example. Currently the repository is still hardcoded but that will change.

<a name="VagrantRequirements"></a>
## Minimum requirements

### Installing
You'll need vagrant and Virtualbox.  Clone the repo locally, This repository complete install itself using '''vagrant up'''.   At this point, it will install everything automatically and also download a database dump and import it into PostGis.

### Versions

* Homestead/laravel 0.5+ (preferably 0.6)
* Virtualbox 5.1.8+
* Vagrant 1.8.7

If vagrant is not up to date, chances are your VM will not be able to establish ssh communications due to key problems (the fall back will not work).  Upgrading to atleast those will make it work. getting this to work from 0.5 to 0.6 took more time that getting it run with 0.5 alone.

<a name="VagrantPlugin"></a>
### install env plugin

Install the lastest version of [vagrant-env plugin](https://github.com/gosuri/vagrant-env). 

    $ vagrant plugin install vagrant-env

<a name="VagrantInstructions"></a>
## Vagrant instructions

Now , it will use your .env file to create a vagrant setup, make sure you have one, at the very least you would copy the example over. This will not be automated, the dark side of the force is too strong here. If you don't have a `.env` file, create one from the example.

    $ cp .env.example .env

Edit the file, and choose a database, supported now are : `pgsql` and `mysql`.  You can adjust user password, or database name.  The mysql root password is hardcoded to `datacharmer`.  We'll fix that soon.  Everything should now be ready to be deployed.

In case you want to customize and run this from a fork, you should edit the `SOURCE_REPOSITORY` variable in `scripts/install.app.sh` to deploy the correct source code.  If there isn't a .env file available, it will be copied automatically from `.env.example` on the guest.  So changes you make to the example affect the vagrant example setup, but only when you commit and push your changes to the repository in the config file. If you change the database password in the example, you need to make sure that it's also there once vagrant checks out the repository.  Deployment will work, but then the application will not run until you match the database password.  Make sure you understand these dynamics.

### vagrant run

    $ vagrant up

You will see all the provisioning tasks to ensure php/laravel etc is running decently on Ubuntu 16.04 custom homestead machine.

### vagrant ssh

Now after a while, since it takes some time to complete, you'll see instructions on how to add hosts information to your system to contact the webserver. You can open a shell to the VM:

    $ vagrant ssh

### notes

#### source dir

Your source directory on the host is mapped under `/vagrant/` directory.  The www root application directory sites under `/var/www/`.

#### update code

If you change code locally, you can now choose to push it to your repository, on the vagrant machine you'll be able to use `git pull` to update the code.  When Container/Port code has been updated, you'll have to do a fresh installation at the time of writing this, but this is being worked at.


So you'll do something like this in /etc/hosts (local):

    192.168.6.218 grb.app
    192.168.6.218 api.grb.app
    192.168.6.218 admin.grb.app

When that is done, you can visit the application at http://grb.app  (or https but the key is self-signed, so your browser will complain).

# notes

This is NOT the tool used to extract/create the source database this tool will use.  That is a bit more complex and involves many steps. The tools for building this DB are https://github.com/gplv2/grb2pgsql and  https://github.com/gplv2/grb2osm .  Be aware that this is quite a complex process and it's possible that not every step has been documented yet.  When rebuilding this database with updated GRB data, this procedure will be verified and completed.  This repo concerns the frontend website and backend api only.
