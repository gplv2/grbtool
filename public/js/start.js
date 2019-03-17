/*jslint node: true, maxerr: 50, indent: 4 */

// vim: tabstop=4 softtabstop=4 shiftwidth=4 expandtab

"use strict";

var my_history = new Object();
var start_time = 0;

/*
$(window).resize(function () {
    var canvaswidth=$('#map-wrap').parent().css('width');
    $('#map-wrap').css("width", canvaswidth);
}
*/

/* Here the map size is getting set? not sure now */
var canvaswidth = $( '#map' ).parent().css( 'width' );
var w = $( "#map" ).width();
$( '#map' ).css( "height", w * 4 / 8.5 );

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
