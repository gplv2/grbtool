/*jslint node: true, maxerr: 50, indent: 4 */

// vim: tabstop=4 softtabstop=4 shiftwidth=4 expandtab


"use strict";

var my_history = new Object();
var start_time = 0;

/* Here a map resize is getting handled */
$( window ).resize( function() {
    var canvaswidth = $( '#map' ).parent().css( 'width' );
    var w = $( "#map" ).width();
    $( '#map-wrap' ).css( "height", w * 4 / 8.5 );
} );

/* Here the map size is getting initially set */
var canvaswidth = $( '#map' ).parent().css( 'width' );
var w = $( "#map" ).width();
$( '#map-wrap' ).css( "height", w * 4 / 8.5 );

initmap();

var myLocalStorage = {
    set: function( item, value ) {
        localStorage.setItem( item, JSON.stringify( value ) );
    },
    get: function( item ) {
        return JSON.parse( localStorage.getItem( item ) );
    }
};

$( document ).ready( function() {
    if ( !library ) {
        var library = {};
    }
} );