/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";

var turf = require( '@turf/turf' ),
    flatten = require( 'geojson-flatten' ),
    normalize = require( '@mapbox/geojson-normalize' ),
    tilebelt = require( '@mapbox/tilebelt' );

module.exports = function( source, dest ) {

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
        if ( road.geometry.type == 'Point' ) {
            console.log( "nwr: found point" );
            nwrData.features.splice( i, 1 );
        }
    } );

    console.log( nwrData );
    nwrData.features.forEach( function( road, i ) {
        if ( road.geometry.type == 'Point' ) {
            console.log( "nwr: found point agani" );
            nwrData.features.splice( i, 1 );
        }
    } );

    // filter out Points
    osmData.features.forEach( function( road, i ) {
        if ( road.geometry.type == 'Point' ) {
            console.log( "osm: found point" );
            osmData.features.splice( i, 1 );
        }
    } );
    //console.log( osmData );
    //console.log( nwrData );

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
    var OsmStreetBuffers = turf.featureCollection( [] );
    var buffer_meters = $( '#streetbuffer' ).val();

    if ( buffer_meters == null || buffer_meters == undefined || !buffer_meters ) {
        //console.log( "using default buffer_meters.check code" );
        buffer_meters = 20;
    }

    OsmStreetBuffers.features = osmData.features.map( function( f ) {
            //console.log(f);return true;
            //if ( f.properties.tags.highway ) 
            if ( f.properties.tags.highway !== null || f.properties.tags.highway !== undefined ) {
                return turf.buffer( f.geometry, buffer_meters, 'meters' );
            } else {
                console.log( f );
            }
    } );

//OsmStreetBuffers = normalize( turf.union( OsmStreetBuffers ) );
//OsmStreetBuffers = normalize( OsmStreetBuffers );

// erase street buffer from nwr lines
var nwrDeltas = turf.featureCollection( [] );

if ( nwrData && OsmStreetBuffers ) {
    nwrData.features.forEach( function( nwrRoad ) {
        OsmStreetBuffers.features.forEach( function( osmRoad ) {
            var roadDiff = turf.difference( nwrRoad, osmRoad );
            //console.log( roadDiff );
            if ( roadDiff && !filter( roadDiff ) ) nwrDeltas.features.push( roadDiff );
        } );
    } );
}

//done( null, nwrDeltas );

//console.log( "deltas" );
return ( nwrDeltas );
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
