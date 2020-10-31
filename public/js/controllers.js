/*jslint node: true, maxerr: 50, indent: 4 */

// vim: tabstop=4 softtabstop=4 shiftwidth=4 expandtab

( function() {
    'use strict';

    angular.module( 'app' )
        .controller( 'HomeController', [ '$rootScope', '$scope', '$location', '$localStorage', 'Auth',
            function( $rootScope, $scope, $location, $localStorage, Auth ) {
                $scope.email = $location.search().email;
                $scope.resettoken = $location.search().resettoken;
                function successAuth( res ) {
                    $localStorage.token = res.token;

                    var canvaswidth = $( '#map-wrap' ).parent().css( 'width' );
                    $( '#map-wrap' ).css( "width", canvaswidth );

                    // console.log(canvaswidth);
                    var mapwidth = $( '#map-wrap' ).css( 'width' );
                    // console.log(mapwidth);

                    $( "#map-wrap" ).append( res.token + '<br>' );
                    $( '#map-wrap' ).css( "width", canvaswidth );
                    // window.location = "/console#/";
                    setTimeout( function() {
                        location.assign( "/#/" );
                        location.reload( true );
                    }, 50 );
                }

                $scope.signin = function() {
                    var formData = {
                        email: $scope.email,
                        password: $scope.password
                    };

                    Auth.signin( formData, successAuth, function() {
                        $rootScope.error = 'Invalid credentials.';
                    } )
                };

                $scope.recover = function() {
                    var formData = {
                        email: $scope.email
                    };

                    Auth.recover( formData, successAuth, function() {
                        $rootScope.error = 'Invalid recovery.';
                    } )
                };

                $scope.signup = function() {
                    var formData = {
                        name: $scope.name,
                        email: $scope.email,
                        password: $scope.password,
                        mastertoken: $scope.mastertoken
                    };

                    Auth.signup( formData, successAuth, function( res ) {
                        $rootScope.error = res.errors[0][0] || 'Failed to sign up.';
                    } )
                };

                $scope.reset = function() {
                    var formData = {
                        email: $scope.email,
                        password: $scope.password,
                        password_confirmation: $scope.password_confirmation,
                        token: $scope.resettoken
                    };

                    Auth.reset( formData, successAuth, function( res ) {
			    console.log(res);
                        $rootScope.error = res.errors[0][0] || 'Failed to reset password.';
                    } )
                };

                $scope.logout = function() {
                    Auth.logout( function() {
                        setTimeout( function() {
                            window.location = "/#/"
                            location.reload( true );
                        }, 100 );
                    } );
                };
                $scope.token = $localStorage.token;
                $scope.tokenClaims = Auth.getTokenClaims();
            }
        ] )

        .controller( 'RestrictedController', [ '$rootScope', '$scope', 'Data', function( $rootScope, $scope, Data ) {
            Data.getRestrictedData( function( res ) {
                $scope.data = res.data;
            }, function() {
                $rootScope.error = 'Failed to fetch restricted content.';
            } );
            Data.getApiData( function( res ) {
                $scope.api = res.data;
            }, function() {
                $rootScope.error = 'Failed to fetch restricted API content.';
            } );
        } ] ) ;
} )();
