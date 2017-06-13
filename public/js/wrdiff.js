/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";

var turf = require( '@turf/turf' ),
    flatten = require( 'geojson-flatten' ),
    normalize = require( '@mapbox/geojson-normalize' ),
    tilebelt = require( '@mapbox/tilebelt' );

module.exports = function( source, dest, done ) {

    if ( source == null || source == undefined ) {
        return false;
    }

    if ( dest == null || dest == undefined ) {
        return false;
    }

    // concat feature classes and normalize data
    var nwrData = normalize( source );
    var osmData = normalize( dest );

    // filter out Points
    nwrData.features.forEach( function( road, i ) {
        if (road.geometry.type == 'Point') {
            nwrData.features.splice( i, 1 );
        }
    } );

    // filter out Points
    osmData.features.forEach( function( road, i ) {
        if (road.geometry.type == 'Point') {
            osmData.features.splice( i, 1 );
        }
    } );
    console.log(osmData);
    console.log(nwrData);

    // filter out roads that are shorter than 30m and have no name
    nwrData.features.forEach( function( road, i ) {
        if ( filter( road ) ) nwrData.features.splice( i, 1 );
    } );

    // clip features to tile
    //osmData = clip( osmData, tile );
    //nwrData = clip( nwrData, tile );
    osmData = normalize( flatten( osmData ) );
    nwrData = normalize( flatten( nwrData ) );

    // buffer streets
    // console.log(turf);
    var streetBuffers = turf.featureCollection( [] );
    streetBuffers.features = osmData.features.map( function( f ) {
        //console.log(f);return true;
        if ( f.properties.tags.highway ) {
            return turf.buffer( f.geometry, 20, 'meters' );
        }
    } );
    //streetBuffers = normalize( turf.union( streetBuffers ) );
    streetBuffers = normalize( streetBuffers );

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
