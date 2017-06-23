( function( f ) {
    if ( typeof exports === "object" && typeof module !== "undefined" ) {
        module.exports = f()
    } else if ( typeof define === "function" && define.amd ) {
        define( [], f )
    } else {
        var g;
        if ( typeof window !== "undefined" ) {
            g = window
        } else if ( typeof global !== "undefined" ) {
            g = global
        } else if ( typeof self !== "undefined" ) {
            g = self
        } else {
            g = this
        }
        g.tf = f()
    }
} )( function() {
    var define, module, exports;
    return ( function e( t, n, r ) {
        function s( o, u ) {
            if ( !n[ o ] ) {
                if ( !t[ o ] ) {
                    var a = typeof require == "function" && require;
                    if ( !u && a ) return a( o, !0 );
                    if ( i ) return i( o, !0 );
                    var f = new Error( "Cannot find module '" + o + "'" );
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[ o ] = {
                    exports: {}
                };
                t[ o ][ 0 ].call( l.exports, function( e ) {
                    var n = t[ o ][ 1 ][ e ];
                    return s( n ? n : e )
                }, l, l.exports, e, t, n, r )
            }
            return n[ o ].exports
        }
        var i = typeof require == "function" && require;
        for ( var o = 0; o < r.length; o++ ) s( r[ o ] );
        return s
    } )( {
        1: [ function( require, module, exports ) {
            module.exports = normalize;

            var types = {
                Point: 'geometry',
                MultiPoint: 'geometry',
                LineString: 'geometry',
                MultiLineString: 'geometry',
                Polygon: 'geometry',
                MultiPolygon: 'geometry',
                GeometryCollection: 'geometry',
                Feature: 'feature',
                FeatureCollection: 'featurecollection'
            };

            /**
             * Normalize a GeoJSON feature into a FeatureCollection.
             *
             * @param {object} gj geojson data
             * @returns {object} normalized geojson data
             */
            function normalize( gj ) {
                if ( !gj || !gj.type ) return null;
                var type = types[ gj.type ];
                if ( !type ) return null;

                if ( type === 'geometry' ) {
                    return {
                        type: 'FeatureCollection',
                        features: [ {
                            type: 'Feature',
                            properties: {},
                            geometry: gj
                        } ]
                    };
                } else if ( type === 'feature' ) {
                    return {
                        type: 'FeatureCollection',
                        features: [ gj ]
                    };
                } else if ( type === 'featurecollection' ) {
                    return gj;
                }
            }

        }, {} ],
        2: [ function( require, module, exports ) {
            'use strict';

            var d2r = Math.PI / 180,
                r2d = 180 / Math.PI;

            /**
             * Get the bbox of a tile
             *
             * @name tileToBBOX
             * @param {Array<number>} tile
             * @returns {Array<number>} bbox
             * @example
             * var bbox = tileToBBOX([5, 10, 10])
             * //=bbox
             */
            function tileToBBOX( tile ) {
                var e = tile2lon( tile[ 0 ] + 1, tile[ 2 ] );
                var w = tile2lon( tile[ 0 ], tile[ 2 ] );
                var s = tile2lat( tile[ 1 ] + 1, tile[ 2 ] );
                var n = tile2lat( tile[ 1 ], tile[ 2 ] );
                return [ w, s, e, n ];
            }

            /**
             * Get a geojson representation of a tile
             *
             * @name tileToGeoJSON
             * @param {Array<number>} tile
             * @returns {Feature<Polygon>}
             * @example
             * var poly = tileToGeoJSON([5, 10, 10])
             * //=poly
             */
            function tileToGeoJSON( tile ) {
                var bbox = tileToBBOX( tile );
                var poly = {
                    type: 'Polygon',
                    coordinates: [
                        [
                            [ bbox[ 0 ], bbox[ 1 ] ],
                            [ bbox[ 0 ], bbox[ 3 ] ],
                            [ bbox[ 2 ], bbox[ 3 ] ],
                            [ bbox[ 2 ], bbox[ 1 ] ],
                            [ bbox[ 0 ], bbox[ 1 ] ]
                        ]
                    ]
                };
                return poly;
            }

            function tile2lon( x, z ) {
                return x / Math.pow( 2, z ) * 360 - 180;
            }

            function tile2lat( y, z ) {
                var n = Math.PI - 2 * Math.PI * y / Math.pow( 2, z );
                return r2d * Math.atan( 0.5 * ( Math.exp( n ) - Math.exp( -n ) ) );
            }

            /**
             * Get the tile for a point at a specified zoom level
             *
             * @name pointToTile
             * @param {number} lon
             * @param {number} lat
             * @param {number} z
             * @returns {Array<number>} tile
             * @example
             * var tile = pointToTile(1, 1, 20)
             * //=tile
             */
            function pointToTile( lon, lat, z ) {
                var tile = pointToTileFraction( lon, lat, z );
                tile[ 0 ] = Math.floor( tile[ 0 ] );
                tile[ 1 ] = Math.floor( tile[ 1 ] );
                return tile;
            }

            /**
             * Get the 4 tiles one zoom level higher
             *
             * @name getChildren
             * @param {Array<number>} tile
             * @returns {Array<Array<number>>} tiles
             * @example
             * var tiles = getChildren([5, 10, 10])
             * //=tiles
             */
            function getChildren( tile ) {
                return [
                    [ tile[ 0 ] * 2, tile[ 1 ] * 2, tile[ 2 ] + 1 ],
                    [ tile[ 0 ] * 2 + 1, tile[ 1 ] * 2, tile[ 2 ] + 1 ],
                    [ tile[ 0 ] * 2 + 1, tile[ 1 ] * 2 + 1, tile[ 2 ] + 1 ],
                    [ tile[ 0 ] * 2, tile[ 1 ] * 2 + 1, tile[ 2 ] + 1 ]
                ];
            }

            /**
             * Get the tile one zoom level lower
             *
             * @name getParent
             * @param {Array<number>} tile
             * @returns {Array<number>} tile
             * @example
             * var tile = getParent([5, 10, 10])
             * //=tile
             */
            function getParent( tile ) {
                // top left
                if ( tile[ 0 ] % 2 === 0 && tile[ 1 ] % 2 === 0 ) {
                    return [ tile[ 0 ] / 2, tile[ 1 ] / 2, tile[ 2 ] - 1 ];
                }
                // bottom left
                if ( ( tile[ 0 ] % 2 === 0 ) && ( !tile[ 1 ] % 2 === 0 ) ) {
                    return [ tile[ 0 ] / 2, ( tile[ 1 ] - 1 ) / 2, tile[ 2 ] - 1 ];
                }
                // top right
                if ( ( !tile[ 0 ] % 2 === 0 ) && ( tile[ 1 ] % 2 === 0 ) ) {
                    return [ ( tile[ 0 ] - 1 ) / 2, ( tile[ 1 ] ) / 2, tile[ 2 ] - 1 ];
                }
                // bottom right
                return [ ( tile[ 0 ] - 1 ) / 2, ( tile[ 1 ] - 1 ) / 2, tile[ 2 ] - 1 ];
            }

            function getSiblings( tile ) {
                return getChildren( getParent( tile ) );
            }

            /**
             * Get the 3 sibling tiles for a tile
             *
             * @name getSiblings
             * @param {Array<number>} tile
             * @returns {Array<Array<number>>} tiles
             * @example
             * var tiles = getSiblings([5, 10, 10])
             * //=tiles
             */
            function hasSiblings( tile, tiles ) {
                var siblings = getSiblings( tile );
                for ( var i = 0; i < siblings.length; i++ ) {
                    if ( !hasTile( tiles, siblings[ i ] ) ) return false;
                }
                return true;
            }

            /**
             * Check to see if an array of tiles contains a particular tile
             *
             * @name hasTile
             * @param {Array<Array<number>>} tiles
             * @param {Array<number>} tile
             * @returns {boolean}
             * @example
             * var tiles = [
             *     [0, 0, 5],
             *     [0, 1, 5],
             *     [1, 1, 5],
             *     [1, 0, 5]
             * ]
             * hasTile(tiles, [0, 0, 5])
             * //=boolean
             */
            function hasTile( tiles, tile ) {
                for ( var i = 0; i < tiles.length; i++ ) {
                    if ( tilesEqual( tiles[ i ], tile ) ) return true;
                }
                return false;
            }

            /**
             * Check to see if two tiles are the same
             *
             * @name tilesEqual
             * @param {Array<number>} tile1
             * @param {Array<number>} tile2
             * @returns {boolean}
             * @example
             * tilesEqual([0, 1, 5], [0, 0, 5])
             * //=boolean
             */
            function tilesEqual( tile1, tile2 ) {
                return (
                    tile1[ 0 ] === tile2[ 0 ] &&
                    tile1[ 1 ] === tile2[ 1 ] &&
                    tile1[ 2 ] === tile2[ 2 ]
                );
            }

            /**
             * Get the quadkey for a tile
             *
             * @name tileToQuadkey
             * @param {Array<number>} tile
             * @returns {string} quadkey
             * @example
             * var quadkey = tileToQuadkey([0, 1, 5])
             * //=quadkey
             */
            function tileToQuadkey( tile ) {
                var index = '';
                for ( var z = tile[ 2 ]; z > 0; z-- ) {
                    var b = 0;
                    var mask = 1 << ( z - 1 );
                    if ( ( tile[ 0 ] & mask ) !== 0 ) b++;
                    if ( ( tile[ 1 ] & mask ) !== 0 ) b += 2;
                    index += b.toString();
                }
                return index;
            }

            /**
             * Get the tile for a quadkey
             *
             * @name quadkeyToTile
             * @param {string} quadkey
             * @returns {Array<number>} tile
             * @example
             * var tile = quadkeyToTile('00001033')
             * //=tile
             */
            function quadkeyToTile( quadkey ) {
                var x = 0;
                var y = 0;
                var z = quadkey.length;

                for ( var i = z; i > 0; i-- ) {
                    var mask = 1 << ( i - 1 );
                    var q = +quadkey[ z - i ];
                    if ( q === 1 ) x |= mask;
                    if ( q === 2 ) y |= mask;
                    if ( q === 3 ) {
                        x |= mask;
                        y |= mask;
                    }
                }
                return [ x, y, z ];
            }

            /**
             * Get the smallest tile to cover a bbox
             *
             * @name bboxToTile
             * @param {Array<number>} bbox
             * @returns {Array<number>} tile
             * @example
             * var tile = bboxToTile([ -178, 84, -177, 85 ])
             * //=tile
             */
            function bboxToTile( bboxCoords ) {
                var min = pointToTile( bboxCoords[ 0 ], bboxCoords[ 1 ], 32 );
                var max = pointToTile( bboxCoords[ 2 ], bboxCoords[ 3 ], 32 );
                var bbox = [ min[ 0 ], min[ 1 ], max[ 0 ], max[ 1 ] ];

                var z = getBboxZoom( bbox );
                if ( z === 0 ) return [ 0, 0, 0 ];
                var x = bbox[ 0 ] >>> ( 32 - z );
                var y = bbox[ 1 ] >>> ( 32 - z );
                return [ x, y, z ];
            }

            function getBboxZoom( bbox ) {
                var MAX_ZOOM = 28;
                for ( var z = 0; z < MAX_ZOOM; z++ ) {
                    var mask = 1 << ( 32 - ( z + 1 ) );
                    if ( ( ( bbox[ 0 ] & mask ) !== ( bbox[ 2 ] & mask ) ) ||
                        ( ( bbox[ 1 ] & mask ) !== ( bbox[ 3 ] & mask ) ) ) {
                        return z;
                    }
                }

                return MAX_ZOOM;
            }

            /**
             * Get the precise fractional tile location for a point at a zoom level
             *
             * @name pointToTileFraction
             * @param {number} lon
             * @param {number} lat
             * @param {number} z
             * @returns {Array<number>} tile fraction
             * var tile = pointToTileFraction(30.5, 50.5, 15)
             * //=tile
             */
            function pointToTileFraction( lon, lat, z ) {
                var sin = Math.sin( lat * d2r ),
                    z2 = Math.pow( 2, z ),
                    x = z2 * ( lon / 360 + 0.5 ),
                    y = z2 * ( 0.5 - 0.25 * Math.log( ( 1 + sin ) / ( 1 - sin ) ) / Math.PI );
                return [ x, y, z ];
            }

            module.exports = {
                tileToGeoJSON: tileToGeoJSON,
                tileToBBOX: tileToBBOX,
                getChildren: getChildren,
                getParent: getParent,
                getSiblings: getSiblings,
                hasTile: hasTile,
                hasSiblings: hasSiblings,
                tilesEqual: tilesEqual,
                tileToQuadkey: tileToQuadkey,
                quadkeyToTile: quadkeyToTile,
                pointToTile: pointToTile,
                bboxToTile: bboxToTile,
                pointToTileFraction: pointToTileFraction
            };

        }, {} ],
        3: [ function( require, module, exports ) {
            function flatten( gj ) {
                switch ( ( gj && gj.type ) || null ) {
                    case 'FeatureCollection':
                        gj.features = gj.features.reduce( function( mem, feature ) {
                            return mem.concat( flatten( feature ) );
                        }, [] );
                        return gj;
                    case 'Feature':
                        if ( !gj.geometry ) return gj;
                        return flatten( gj.geometry ).map( function( geom ) {
                            return {
                                type: 'Feature',
                                properties: JSON.parse( JSON.stringify( gj.properties ) ),
                                geometry: geom
                            };
                        } );
                    case 'MultiPoint':
                        return gj.coordinates.map( function( _ ) {
                            return {
                                type: 'Point',
                                coordinates: _
                            };
                        } );
                    case 'MultiPolygon':
                        return gj.coordinates.map( function( _ ) {
                            return {
                                type: 'Polygon',
                                coordinates: _
                            };
                        } );
                    case 'MultiLineString':
                        return gj.coordinates.map( function( _ ) {
                            return {
                                type: 'LineString',
                                coordinates: _
                            };
                        } );
                    case 'GeometryCollection':
                        return gj.geometries.map( flatten ).reduce( function( memo, geoms ) {
                            return memo.concat( geoms );
                        }, [] );
                    case 'Point':
                    case 'Polygon':
                    case 'LineString':
                        return [ gj ];
                }
            }

            module.exports = flatten;

        }, {} ],
        4: [ function( require, module, exports ) {
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

        }, {
            "@mapbox/geojson-normalize": 1,
            "@mapbox/tilebelt": 2,
            "geojson-flatten": 3
        } ]
    }, {}, [ 4 ] )( 4 )
} );