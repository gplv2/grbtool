/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";

var turf = require( '@turf/turf' ),
    flatten = require( 'geojson-flatten' ),
    normalize = require( '@mapbox/geojson-normalize' ),
    tilebelt = require( '@mapbox/tilebelt' );

module.exports = function( tileLayers, tile, done ) {
    // concat feature classes and normalize data
    var nwrData = normalize( tileLayers.tiger.tiger20062014 );
    var osmData = normalize( tileLayers.osmdata.migeojson );

    // filter out roads that are shorter than 30m and have no name
    nwrData.features.forEach( function( road, i ) {
        if ( filter( road ) ) nwrData.features.splice( i, 1 );
    } );

    // clip features to tile
    osmData = clip( osmData, tile );
    nwrData = clip( nwrData, tile );
    osmData = normalize( flatten( osmData ) );
    nwrData = normalize( flatten( nwrData ) );

    // buffer streets
    var streetBuffers = turf.featurecollection( [] );
    streetBuffers.features = osmData.features.map( function( f ) {
        if ( f.properties.highway ) {
            return turf.buffer( road, 20, 'meters' ).features[ 0 ];
        }
    } );
    streetBuffers = normalize( turf.merge( streetBuffers ) );

    // erase street buffer from nwr lines
    var nwrDeltas = turf.featurecollection( [] );

    if ( nwrData && streetBuffers ) {
        nwrData.features.forEach( function( nwrRoad ) {
            streetBuffers.features.forEach( function( streetsRoad ) {
                var roadDiff = turf.erase( nwrRoad, streetsRoad );
                if ( roadDiff && !filter( roadDiff ) ) nwrDeltas.features.push( roadDiff );
            } );
        } );
    }

    done( null, nwrDeltas );
};

function clip( lines, tile ) {
    lines.features = lines.features.map( function( line ) {
        try {
            var clipped = turf.intersect( line, turf.polygon( tilebelt.tileToGeoJSON( tile ).coordinates ) );
            return clipped;
        } catch ( e ) {
            return;
        }
    } );
    lines.features = lines.features.filter( function( line ) {
        if ( line ) return true;
    } );
    lines.features = lines.features.filter( function( line ) {
        if ( line.geometry.type === 'LineString' || line.geometry.type === 'MultiLineString' ) return true;
    } );
    return lines;
}

function filter( road ) {
    var length = turf.lineDistance( road, 'kilometers' );
    if ( length < 0.03 || road.properties.fullname == '' ) {
        return true;
    } else {
        return false;
    }
}
