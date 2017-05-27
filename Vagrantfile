# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure("2") do |config|

  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # install and enable vagrant-env plugin
  # see https://github.com/gosuri/vagrant-env
  config.env.enable # enable the plugin

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  config.vm.box = "laravel/homestead"

  # Configure The homestead Box for GRB Api
  config.vm.define "homestead-7-grb"
  config.vm.box_version = ">= 0.6.0"
  config.vm.hostname = "homestead"
    
  # Configure Local Variable To Access Scripts From Remote Location
  scriptDir = File.dirname(__FILE__)
  localscriptDir = "/vagrant/scripts"

  # pull from .env , copy the .env.example to .env 
  dbUser = ENV['DB_USERNAME']
  dbName = ENV['DB_DATABASE']
  dbPass = ENV['DB_PASSWORD']
  dbType = ENV['DB_CONNECTION']
  # it might be wise to not use spaces or special chars in usernames/passwords ...

  sshPublicKey = "#{Dir.home}/.ssh/id_rsa.pub"
  
  # pass the www subdir to the scripts
  appHomeDir = "grb-api"


  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  config.vm.network "forwarded_port", guest: 80, host: 8680

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.

  # Configure A Private Network IP
  # config.vm.network "private_network", ip: "192.168.10.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.

  # By default, a private network is already created, additionally, we'll
  # also make a bridge for easy access
  config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"
  config.vm.provider "virtualbox" do |v|
    v.customize ["modifyvm", :id, "--memory", 2048 ]
    v.customize ["modifyvm", :id, "--cpus", 2 ]

    # Our GRB-Api vagrant name
    v.name = "homestead-7-grb"
    # for homestead 0.6 to work (0.5 seemed less picky)
    v.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
    v.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
    v.customize ["modifyvm", :id, "--ostype", "Ubuntu_64"]
  end

  # fix the shell
  config.vm.provision "fix-no-tty", type: "shell" do |s|
    s.privileged = false
    s.inline = "sudo sed -i '/tty/!s/mesg n/tty -s \\&\\& mesg n/' /root/.profile"
  end

  # Add our own Public Key For SSH Access
  config.vm.provision "shell", run: "once" do |s|
   ssh_pub_key_string = File.readlines(sshPublicKey).first.strip
   s.inline = <<-SHELL
      echo "#{ssh_pub_key_string}" >> /home/vagrant/.ssh/authorized_keys
    SHELL
  end

  # The commands in comments are there because sometimes they fix things but 
  # they are platform dependant.
  # apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"
  # The stuff below is to fix issues with ubuntu non-interactive install flow.  
  config.vm.provision "shell", :inline => 'DEBIAN_FRONTEND=noninteractive apt-get update --fix-missing -y -q -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"'
  config.vm.provision "shell", :inline => 'DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -q -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"'

  # in case an install failed, this might clean things up (check the dpkg options for more info)
  #config.vm.provision "shell", :inline => "apt-get -o 'Dpkg::Options::=--force-confnew' -f install"

  # Our custom OS upgrade script
  config.vm.provision "shell", :inline => localscriptDir + "/apt-get.upgrade.sh " + dbType

  # uncomment to disable xdebug from being disabled (*ploink*) by touching this file on the vm
  #config.vm.provision "shell" do |s|
  #  s.name = "Enabling xdebug"
  #  s.inline = "#touch /var/log/provision/xdebug.enable"
  #end

  # postgres DB setup
  config.vm.provision "shell", run: "once" do |s|
    s.name = "Creating PostgresDB/MariaDB"
    s.inline = localscriptDir + "/create.db.sh " + dbName + " " + dbUser + " " + dbPass + " " + dbType
  end

  # Service control
  config.vm.provision "shell" do |s|
    s.name = "Restart service(s)"
    s.inline = "service php7.0-fpm restart"
  end

  # Deploy the app using git clone and composer install, not by sharing a directory with the host
  config.vm.provision "shell", run: "once" do |s|
    s.name = "Installing GRB-Api framework"
    s.inline = localscriptDir + "/install.app.sh " + appHomeDir
  end

  # Install dev stuff , currently npm + generate docs
  config.vm.provision "shell", run: "once" do |s|
    s.name = "Configuring NPM " + appHomeDir
    s.inline = localscriptDir + "/install.dev.sh " + appHomeDir
  end

  # setup the nginx site using script
  # s.args = [site["map"], site["to"], site["port"] ||= "80", site["ssl"] ||= "443"]
  config.vm.provision "shell", run: "once" do |s|
      s.name = "Setup NGINX configs"
      s.inline = localscriptDir + "/serve-nginx.sh" + " " + ENV['APP_URL'] + " /var/www/" + appHomeDir +"/public" + " 80"+ " 443"
  end

  # restart nginx/fpm (1 extra needed)
  config.vm.provision "shell" do |s|
    s.name = "Restarting Nginx and PHPFPM"
    s.inline = "sudo service nginx restart; sudo service php7.0-fpm restart"
  end

  # load GRB data dump (postgres)
  config.vm.provision "shell", run: "once" do |s|
    s.name = "Downloading GRB datadump"
    s.inline = localscriptDir + "/feed.grb.sh"
  end

  # output useful information on setup
  config.vm.provision "shell", run: "always" do |s|
    s.name = "Finish and ouput status"
    s.inline = localscriptDir + "/output.sh " + ENV['APP_URL']
  end

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  # config.vm.provider "virtualbox" do |vb|
  #   # Display the VirtualBox GUI when booting the machine
  #   vb.gui = true
  #
  #   # Customize the amount of memory on the VM:
  #   vb.memory = "1024"
  # end
  #
  # View the documentation for the provider you are using for more
  # information on available options.

  # Define a Vagrant Push strategy for pushing to Atlas. Other push strategies
  # such as FTP and Heroku are also available. See the documentation at
  # https://docs.vagrantup.com/v2/push/atlas.html for more information.
  # config.push.define "atlas" do |push|
  #   push.app = "YOUR_ATLAS_USERNAME/YOUR_APPLICATION_NAME"
  # end

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  # config.vm.provision "shell", inline: <<-SHELL
  #   apt-get update
  #   apt-get install -y apache2
  # SHELL
end
