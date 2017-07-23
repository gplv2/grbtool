/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";

var flatten = require( 'geojson-flatten' ),
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
    var osmData = normalize( source );
    var nwrData = normalize( dest );

    // filter out Points from both
    var deleteIndexes = [];
    nwrData.features.forEach( function( road, i ) {
        if ( road.geometry.type == 'Point' ) {
            //console.log( "nwr: found point at "+ i );
            deleteIndexes.push( i );
            //nwrData.features.splice( i, 1 );
        }
    } );

    /* sort from big to small : [1, 3, 5] */
    deleteIndexes.sort( function( a, b ) {
        return a - b;
    } );

    var i = deleteIndexes.length - 1;
    /* delete backwards */
    for ( i; i >= 0; i-- ) {
        nwrData.features.splice( deleteIndexes[ i ], 1 );
    }

    var deleteIndexes = [];

    osmData.features.forEach( function( road, i ) {
        if ( road.geometry.type == 'Point' ) {
            //console.log( "osm: found point" );
            deleteIndexes.push( i );
            //osmData.features.splice( i, 1 );
        }
    } );

    /* sort from big to small : [1, 3, 5] */
    deleteIndexes.sort( function( a, b ) {
        return a - b;
    } );

    var i = deleteIndexes.length - 1;
    /* delete backwards */
    for ( i; i >= 0; i-- ) {
        osmData.features.splice( deleteIndexes[ i ], 1 );
    }
    // done 


    /*
        // filter out roads that are shorter than 30m and have no name
        nwrData.features.forEach( function( road, i ) {
            if ( filter( road ) ) nwrData.features.splice( i, 1 );
        } );
    */

    // clip features to tile
    //osmData = clip( osmData, tile );
    //nwrData = clip( nwrData, tile );
    osmData = normalize( flatten( osmData ) );
    nwrData = normalize( flatten( nwrData ) );

    // buffer streets
    // console.log(turf);
    var OsmBuffers = turf.featureCollection( [] );
    var buffer_meters = $( '#streetbuffer' ).val();

    if ( buffer_meters == null || buffer_meters == undefined || !buffer_meters ) {
        //console.log( "using default buffer_meters.check code" );
        buffer_meters = 20;
    }

    OsmBuffers.features = osmData.features.map( function( f ) {
        //console.log(f);return true;
        //if ( f.properties.tags.highway ) 
        if ( f.hasOwnProperty( 'properties' ) ) {
            return turf.buffer( f.geometry, buffer_meters, 'meters' );
            //if (f.properties.hasOwnProperty('name:left') || f.properties.hasOwnProperty('name:right')) {
            //console.log("name HW found");
            //}
        }
    } );

    var deleteIndexes = [];
    // filter out Points
    OsmBuffers.features.forEach( function( feature, i ) {
        if ( typeof feature == 'undefined' ) {
            deleteIndexes.push( i );
        }
    } );

    /* sort from big to small : [1, 3, 5] */
    deleteIndexes.sort( function( a, b ) {
        return a - b;
    } );

    var i = deleteIndexes.length - 1;
    //console.log(OsmBuffers);
    /* delete backwards */
    for ( i; i >= 0; i-- ) {
        OsmBuffers.features.splice( deleteIndexes[ i ], 1 );
        //console.log("Deleting key "+ deleteIndexes[i] + " @ " +i);
    }
    //console.log(OsmBuffers);

    //OsmBuffers = normalize( turf.union( OsmBuffers ) );
    OsmBuffers = normalize( OsmBuffers );

    //if(typeof OsmBuffers[key] === 'undefined' || typeof OsmBuffers[key] == 'null' )

    // return(OsmBuffers);

    var nwrDeltas = turf.featureCollection( [] );
    var missingDeltas = turf.featureCollection( [] );

    /*
        if ( nwrData && OsmBuffers ) {
            nwrData.features.forEach( function( nwrRoad ) {
                OsmBuffers.features.forEach( function( osmRoad ) {
                    var roadDiff = turf.difference( nwrRoad, osmRoad );
                    //console.log( roadDiff );
                    if ( roadDiff ) {
                        nwrDeltas.features.push( roadDiff )
                    };
                } );
            } );
        }
    */
    var segments = null;
    /*
        if ( nwrData && OsmBuffers ) {
            OsmBuffers.features.forEach( function( osmRoad ) {
                var touches = false;
                nwrData.features.forEach( function( nwrRoad ) {
                    var overlapped = turf.intersect( osmRoad, nwrRoad );
                    if ( overlapped !== null && overlapped !== undefined ) {
                        var roadDiff = turf.difference( nwrRoad, osmRoad );
                        missingDeltas.features.push( roadDiff );
                        touches = true;
                    }
                } );
                if ( !touches ) {
                    nwrDeltas.features.push( osmRoad );
                }
            } );
        }
    */
    if ( nwrData && OsmBuffers ) {
        nwrData.features.forEach( function( nwrRoad ) {
            var keep = true;
            OsmBuffers.features.forEach( function( osmRoad ) {
                var overlapped = turf.intersect( osmRoad, nwrRoad );
                if ( overlapped !== null && overlapped !== undefined ) {
                    var roadDiff = turf.difference( nwrRoad, osmRoad );
                    missingDeltas.features.push( roadDiff );
                    keep = false;
                }
            } );
            if ( keep ) {
                nwrDeltas.features.push( nwrRoad );
            }
        } );
    }

    // console.log(nwrDeltas);
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