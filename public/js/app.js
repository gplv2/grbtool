/*jslint node: true, maxerr: 50, indent: 4 */

// vim: tabstop=4 softtabstop=4 shiftwidth=4 expandtab

( function() {
    'use strict';

    // api/auth/login

    angular.module( 'app', [
            'ngStorage',
            'ngRoute',
            'angular-loading-bar'
        ] )
        .constant( 'urls', {
            BASE: '//' + window.location.hostname + ( ( window.location.port.length ) ? ':' + window.location.port : '' ),
            BASE_API: '//' + window.location.hostname + ( ( window.location.port.length ) ? ':' + window.location.port + '/api' : '/api' )
        } )
        .config( [ '$routeProvider', '$httpProvider', function( $routeProvider, $httpProvider ) {
            $routeProvider.
            when( '/', {
                templateUrl: 'partials/home.html',
                controller: 'HomeController'
            } ).
            when( '/signin', {
                templateUrl: 'partials/signin.html',
                controller: 'HomeController'
            } ).
            when( '/recover', {
                templateUrl: 'partials/recover.html',
                controller: 'HomeController'
            } ).
            when( '/reset', {
                templateUrl: 'partials/reset.html',
                controller: 'HomeController'
            } ).
            when( '/signup', {
                templateUrl: 'partials/signup.html',
                controller: 'HomeController'
            } ).
            when( '/restricted', {
                templateUrl: 'partials/restricted.html',
                controller: 'RestrictedController'
            } ).
            otherwise( {
                //redirectTo: '/'
            } );

            $httpProvider.interceptors.push( [ '$q', '$location', '$localStorage', function( $q, $location, $localStorage ) {
                return {
                    'request': function( config ) {
                        config.headers = config.headers || {};
                        if ( $localStorage.token ) {
                            config.headers.Authorization = 'Bearer ' + $localStorage.token;
                        }
                        return config;
                    },
                    'responseError': function( response ) {
                        if ( response.status === 401 || response.status === 403 ) {
                            delete $localStorage.token;
                            $location.path( '/signin' );
                        }
                        return $q.reject( response );
                    }
                };
            } ] );
        } ] ).run( function( $rootScope, $location, $localStorage ) {
            $rootScope.$on( "$routeChangeStart", function( event, next ) {
                if ( $localStorage.token == null ) {
                    if ( next.templateUrl === "partials/restricted.html" ) {
                        $location.path( "/signin" );
                    }
                }
            } );
        /*
            } );
            $rootScope.$on( "$routeChangeSuccess", function( event, next ) {
                console.log("change success!");
                if ( next.templateUrl === "partials/reset.html" ) {
                    var token = $location.search().token;
                    var email = $location.search().email;
                    //self.document.forms[0][0].value=email;
                    //self.document.forms[0][1].value=token;
                }
            } );
            $rootScope.$watch('$viewContentLoaded', function(event) {
                var token = $location.search().token;
                var email = $location.search().email;
                self.document.forms[0][0].value=email;
                self.document.forms[0][1].value=token;
                console.log("URL changed!");
                console.log(self);
            });
        */
        } );
} )();
