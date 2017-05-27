server {
    listen 80;
    listen 443 ssl;
    server_name api.grb.app grb.app;
    root "/var/www/grbtool/public/";

    index index.php;

    keepalive_timeout 30;

    types_hash_max_size 2048;

# Do not permit Content-Type sniffing.
    add_header X-Content-Type-Options nosniff;

    charset utf-8;

    location /lb-status {
        access_log off;
        return 200;
    }

    location /proxy {
    	root "/var/www/grbtool/public/proxy/";
        try_files $uri /search.php?$query_string;
    }

    location / {
        try_files $uri /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    rewrite_log on;
    error_log  /var/log/nginx/api_error.log debug;
    access_log  /var/log/nginx/api_access.log combined;

#sendfile on;

    client_max_body_size 100m;

    location ~ ^/search\.php(/|$) {
        include fastcgi_params;
    	root "/var/www/grbtool/public/proxy/";
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/var/run/php/php7.0-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_intercept_errors off;
        fastcgi_buffering on;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
        internal;
    }

    location ~ ^/index\.php(/|$) {
# If request comes from allowed subdomain
# (*.bitless.be) then we enable CORS
        if ($http_origin ~* "^https?://.*\.bitless\.be$") {
            set $cors "1";
        }

# OPTIONS indicates a CORS pre-flight request
        if ($request_method = 'OPTIONS') {
            set $cors "${cors}o";
        }

# Append CORS headers to any request from 
# allowed CORS domain, except OPTIONS
        if ($cors = "1") {
#add_header "Access-Control-Allow-Origin" $http_origin;
#add_header "Access-Control-Allow-Credentials" true;
            more_set_headers 'Access-Control-Allow-Origin: $http_origin';
            more_set_headers 'Access-Control-Allow-Credentials: true';
        }

# OPTIONS (pre-flight) request from allowed

# CORS domain. return response directly
        if ($cors = "1o") {
            more_set_headers 'Access-Control-Allow-Origin: $http_origin';
            more_set_headers 'Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE';
            more_set_headers 'Access-Control-Allow-Credentials: true';
            more_set_headers 'Access-Control-Allow-Headers: $http_access_control_request_headers';

#more_set_headers 'Access-Control-Allow-Headers: Origin,Content-Type,Accept';
#set $cors_method $http_access_control_request_method;
            add_header Access-Control-Expose-Headers "Authorization";
# Valid for 2 days
            add_header Access-Control-Max-Age 172800;

            add_header Content-Length 0;
            add_header Content-Type text/plain;

            return 204;
        }

        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/var/run/php/php7.0-fpm.sock;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_intercept_errors off;
        fastcgi_buffering on;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
# Prevents URIs that include the front controller. This will 404:
# http://domain.tld/app.php/some-path
# Remove the internal directive to allow URIs like this
        internal;
    }

    location ~ /\.ht {
        deny all;
    }

    ssl_certificate     /etc/nginx/ssl/grb.app.crt;
    ssl_certificate_key /etc/nginx/ssl/grb.app.key;
}

