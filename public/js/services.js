/*jslint node: true, maxerr: 50, indent: 4 */

// vim: tabstop=4 softtabstop=4 shiftwidth=4 expandtab

( function() {
    'use strict';
    // Auth service
    angular.module( 'app' )
        .factory( 'Auth', [ '$http', '$localStorage', 'urls', function( $http, $localStorage, urls ) {
            function urlBase64Decode( str ) {
                var output = str.replace( '-', '+' ).replace( '_', '/' );
                switch ( output.length % 4 ) {
                    case 0:
                        break;
                    case 2:
                        output += '==';
                        break;
                    case 3:
                        output += '=';
                        break;
                    default:
                        throw 'Illegal base64url string!';
                }
                return window.atob( output );
            }

            function getClaimsFromToken() {
                var token = $localStorage.token;
                var user = {};
                if ( typeof token !== 'undefined' ) {
                    var encoded = token.split( '.' )[ 1 ];
                    user = JSON.parse( urlBase64Decode( encoded ) );
                }
                for ( var key in user ) {
                    if ( key == 'iat' ) {
                        var theDate = new Date( user[ key ] * 1000 );
                        var dateString = theDate.toGMTString();
                        user[ key ] = dateString;
                    } else if ( key == 'exp' ) {
                        var theDate = new Date( user[ key ] * 1000 );
                        var dateString = theDate.toGMTString();
                        user[ key ] = dateString;
                    } else if ( key == 'nbf' ) {
                        var theDate = new Date( user[ key ] * 1000 );
                        dateString = theDate.toGMTString();
                        user[ key ] = dateString;
                    }
                }
                //console.log(user);
                return user;
            }

            function appendTransform( defaults, transform ) {

                // We can't guarantee that the default transformation is an array
                defaults = angular.isArray( defaults ) ? defaults : [ defaults ];

                // Append the new transformation to the defaults
                return defaults.concat( transform );
            }

            function jsonToURI( json ) {
                return encodeURIComponent( JSON.stringify( json ) );
            }

            var tokenClaims = getClaimsFromToken();

            return {
                signup: function( data, success, error ) {
                    var dta = "";
                    for ( var key in data ) {
                        if ( dta != "" ) {
                            dta += "&";
                        }
                        dta += key + "=" + encodeURIComponent( data[ key ] );
                    }

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                        }
                    }

                    $http.post( urls.BASE_API + '/auth/signup', dta, config ).success( success ).error( error )
                },
                signin: function( data, success, error ) {
                     //console.log(data);

                    var dta = "";
                    for ( var key in data ) {
                        if ( dta != "" ) {
                            dta += "&";
                        }
                        dta += key + "=" + encodeURIComponent( data[ key ] );
                    }

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                        }
                    }

                    $http.post( urls.BASE_API + '/auth/login', dta, config ).success( success ).error( error )
                },
                recover: function( data, success, error ) {
                     //console.log(data);

                    var dta = "";
                    for ( var key in data ) {
                        if ( dta != "" ) {
                            dta += "&";
                        }
                        dta += key + "=" + encodeURIComponent( data[ key ] );
                    }

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                        }
                    }

                    $http.post( urls.BASE_API + '/auth/recovery', dta, config ).success( success ).error( error )
                },
                reset: function( data, success, error ) {
                     //console.log(data);

                    var dta = "";
                    for ( var key in data ) {
                        if ( dta != "" ) {
                            dta += "&";
                        }
                        dta += key + "=" + encodeURIComponent( data[ key ] );
                    }

                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                        }
                    }

                    $http.post( urls.BASE_API + '/auth/reset', dta, config ).success( success ).error( error )
                },
                logout: function( success ) {
                    tokenClaims = {};
                    delete $localStorage.token;
                    success();
                },
                getTokenClaims: function() {
                    return tokenClaims;
                }
            };
        } ] );

    angular.module( 'app' )
        .factory( 'Data', [ '$http', 'urls', function( $http, urls ) {

            return {
                getRestrictedData: function( success, error ) {
                    $http.get( urls.BASE + '/restricted' ).success( success ).error( error )
                },
                getApiData: function( success, error ) {
                    $http.get( urls.BASE_API + '/api/user' ).success( success ).error( error )
                }
            };
        } ] );
} )();
