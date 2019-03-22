/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";

// vim: tabstop=4 softtabstop=4 shiftwidth=4 expandtab

var streets = []; // list of streets with the addresses divided in several categories + extra info

// REMOTECONTROL BINDINGS FOR JOSM
function filterForJosm() {
    filterStrategy.setFilter( null );
    mergeStrategy.setFilter( null );

    newlayername = 'filtered-sourcelayer';

    var bounds = map.getExtent();

    var filter1 = new OpenLayers.Filter.Spatial( {
        projection: geodetic,
        type: OpenLayers.Filter.Spatial.BBOX,
        value: bounds
    } );
    filterStrategy.setFilter( filter1 );

    /* Filter out all buildings that come back via overpass from source vector layer */
    var overpassfilter = new OpenLayers.Filter.Comparison( {
        type: OpenLayers.Filter.Comparison.LIKE,
        property: "source:geometry:oidn",
        evaluate: function( feature ) {
            var ret = true;
            $.each( overpass_layer.features, function( i, item ) {
                //console.log("testing " + feature.attributes['source:geometry:oidn']);
                //console.log(item)k;
                //console.log(feature.attributes);
                if ( !item.attributes.tags[ 'source:geometry:entity' ] ) {
                    $( "#msg" ).html( "Warning : " + "The features from overpass are missing the entity tag, add the entity (Gbg, Knw ..) , this will improve and correct the filtering." ).removeClass().addClass( "notice warn" );
                    // Entity is missing, probably a legacy test import
                    if ( item.attributes.tags[ 'source:geometry:oidn' ] === feature.attributes[ 'source:geometry:oidn' ] ) {
                        //console.log("found match: " + item.attributes.tags['source:geometry:oidn']);
                        ret = false;
                    }
                } else {
                    if ( item.attributes.tags[ 'source:geometry:oidn' ] === feature.attributes[ 'source:geometry:oidn' ] &&
                        item.attributes.tags[ 'source:geometry:entity' ] === feature.attributes[ 'source:geometry:entity' ] ) {
                        ret = false;
                    }
                }
            } );
            return ret;
        }
    } );
    mergeStrategy.setFilter( overpassfilter );
    $( "#msg" ).html( "<br/>Info : " + "Filtered vector layer GRB with overpass data" ).removeClass().addClass( "notice success" );
    //return true;
}

function returnJosmUrl() {
    var josmUrl = '';
    if ( $( 'input[id="jinsecure"]' ).is( ':checked' ) ) {
        josmUrl = '//127.0.0.1:8111';
    } else if ( $( 'input[id="jsecure"]' ).is( ':checked' ) ) {
        josmUrl = "//127.0.0.1:8112";
    }
    return josmUrl;
}

function openInJosm( layername ) {
    /* Default is GRB */
    if ( layername == null || layername === undefined ) {
        /* default to GRB */
        layername = 'GRB - Vector Source';
        if ( newlayername == null && newlayername === undefined ) {
            newlayername = 'grb-diff';
        }
    } else {
        layername = 'WR OSM - Differences';
        if ( newlayername == null && newlayername === undefined ) {
            newlayername = 'nwr-diff';
        }
    }

    $.ajax( {
        url: returnJosmUrl() + '/version',
        dataType: "json",
        timeout: 5000 // 5 second wait
    } ).done( function( data ) {
        var version = data.protocolversion;
        if ( version.minor < 6 ) {
            $( '#msg' ).removeClass().addClass( "notice error" ).html( "Your JOSM installation does not yet support load_data requests. Please update JOSM to version 7643 or newer" );
        } else {
            $( '#msg' ).removeClass().addClass( "notice success" ).html( "JOSM is ready" );

            var myurl = returnJosmUrl() + "/load_data?new_layer=true&layer_name=" + newlayername + "&data=";

            var geoJSON = new OpenLayers.Format.GeoJSON( {
                internalProjection: map.getProjectionObject(),
                externalProjection: geodetic
            } );

            var mylayers = map.getLayersByName( layername );
            //console.log(mylayers[0].features);
            /*
                           $.each(mylayers.features, function(i, item) {
                              if(!item.attributes.tags['source:geometry:entity']) {
                                    ret = false;
                              }
                           });
            */

            var json = JSON.parse( geoJSON.write( mylayers[ 0 ].features ) );

            // console.log( json );

            // Filter out tags we don't want and create our callback configuration
            var walkConfig = {
                classMap: {
                    "poly": "poly",
                    "properties": "poly"
                },
                callbacks: [
                    {
                        name: 'changer',
                        positions: [ 'preWalk' ],
                        classNames: [ 'poly' ],
                        containers: [ 'object' ],
                        callback: function( node ) {
                            // console.log( node );
                            // migrate the auto_building value to building key
                            if ( node.val.auto_building !== null && node.val.auto_building !== undefined ) {
                                node.val.building = node.val.auto_building;
                            }

                            // create the ref key/val
                            if ( node.val[ "source:geometry:entity" ] !== null && node.val[ "source:geometry:entity" ] !== undefined ) {
                                if ( node.val[ "source:geometry:oidn" ] !== null && node.val[ "source:geometry:oidn" ] !== undefined ) {
                                    node.val[ "source:geometry:ref" ] = node.val[ "source:geometry:entity" ] + '/' + node.val[ "source:geometry:oidn" ];
                                }
                            }

                            // Format the date in OSM format
                            if ( node.val[ "source:geometry:date" ] !== null && node.val[ "source:geometry:date" ] !== undefined ) {
                                //console.log(node.val[ "source:geometry:date" ]);
                                var mydate = "";
                                // make it a string by catting it into one.
                                mydate = '' + node.val[ "source:geometry:date" ];
                                var stripped = mydate.replace( /\//g, '-' );
                                node.val[ "source:geometry:date" ] = stripped;
                            }

                            // Delete stufff we really don't need in the export
                            var delarr = [ "size_grb_building", "source:geometry:uidn", "source", "H_DTM_MIN", "H_DTM_GEM", "H_DSM_MAX", "H_DSM_P99", "HN_MAX",
                                "HN_P99", "detection_method", "size_shared", "size_source_building", "auto_building", "size_source_landuse", "source:geometry:entity",
                                "source:geometry:oidn", "auto_target_landuse" ];

                            Object.keys( node.val ).forEach( function( key, idx ) {
                                if ( delarr.includes( key ) ) {
                                    //console.log("DELETE");
                                    delete node.val[ key ];
                                }
                            } );
                        }
                    }
               ]
            };

            // Filter meta tags before export
            if ( !$( 'input[id="metaexport"]' ).is( ':checked' ) ) {
                Walk.walk( json, "poly", walkConfig );
            }
            // console.log( json );

            mylayers = null;

            // From npm module
            // console.log(json);
            // console.log("parsing json");
            // Command line simplify using mapshaper:
            // -simplify 85% dp keep-shapes stats -o format=geojson /home/glenn/out.geojson

            var xml = '';
            //var opts = { pct: 75 , method: 'dp', keep_shapes: true };
            var threshhold = Number( $( "#dpslider" ).slider( "value" ) );
            if ( threshhold != 100 && threshhold ) {
                $( '#msg' ).removeClass().addClass( "notice info" ).html( "Simplifying ways (overnode removal)..." );
                // console.log("simplifying");
                var dataset = mapshaper.internal.importContent( {
                    json: {
                        content: json
                    }
                } );

                var opts = {
                    pct: ( threshhold / 100 ),
                    method: 'dp',
                    keep_shapes: true
                };

                var ms = mapshaper.simplify( dataset, opts );

                var output = mapshaper.internal.exportFileContent( dataset, {
                    format: 'geojson'
                } );

                $( '#msg' ).removeClass().addClass( "notice info" ).html( "export to OSM-XML format" );

                xml = geos( JSON.parse( output[ 0 ].content ) );
                //var xml = geos(JSON.parse(json));
            } else {
                $( '#msg' ).removeClass().addClass( "notice info" ).html( "Not simplifying." );
                // console.log("Not simplifying");
                xml = geos( json );
            }

            var token = myLocalStorage.get('ngStorage-token');

            $.ajax( {
                type: "POST",
                url: '/api/export/upload',
                data: xml,
                cache: false,
                beforeSend: function(xhr, settings) {
                    if (token) {
                        xhr.setRequestHeader('Authorization','Bearer ' + token);
                    }
                    xhr.setRequestHeader('Content-Type', 'application/xml');
                    xhr.overrideMimeType( 'application/xml' );
                },
                dataType: "json",
                contentType: "application/xml",
                timeout: 5000 // 5 second wait
            } ).done( function( data ) {
                if (data.status == 'stored') {
                    $( '#msg' ).removeClass().addClass( "notice info" ).html( "Export XML uploaded to server: <a href=" + data.url + ">"+ data.fname +"</a>");
                } else
                    $( '#msg' ).removeClass().addClass( "notice info" ).html( "Export XML uploaded to server");
            }
                console.log(data);
            } ).fail( function( jqXHR, textStatus, errorThrown ) {
                $( '#msg' ).removeClass().addClass( "notice error" ).html( "Failed to upload XML export to server: " . textStatus );
                console.log(errorThrown);
            } );


            //  GET /import?url=...
            //
            //console.log(xml);
            json = null;

            var req = new XMLHttpRequest();
            req.onreadystatechange = function() {
                if ( req.readyState == 4 && req.status == 400 )
                    // something went wrong. Alert the user with appropriate messages
                    testJosmVersion();
            };
            $( '#msg' ).removeClass().addClass( "notice info" ).html( "Exporting XML to JOSM" );
            try {
                //console.log(myurl + encodeURIComponent( xml ));
                req.open( "GET", myurl + encodeURIComponent( xml ), true );
                req.send( null );
            } catch ( err ) {
                $( '#msg' ).removeClass().addClass( "notice error" ).html( "Export of objects failed (too big?): " + err );
            }
        }
    } ).fail( function( jqXHR, textStatus, errorThrown ) {
        $( '#msg' ).removeClass().addClass( "notice error" ).html( "Fail to get JOSM version using remote control, is it running ?" );
        //console.log(errorThrown);
    } );
}

function openAreaInJosm() {

    $.ajax( {
        url: returnJosmUrl() + '/version',
        dataType: "json",
        timeout: 5000 // 5 second wait
    } ).done( function( data ) {
        var version = data.protocolversion;
        if ( version.minor < 6 ) {
            $( '#msg' ).removeClass().addClass( "notice error" ).html( "Your JOSM installation does not yet support load_data requests. Please update JOSM to version 7643 or newer" );
        } else {
            $( '#msg' ).removeClass().addClass( "notice success" ).html( "JOSM is ready" );

            function generateId( len ) {
                var arr = new Uint8Array( ( len || 40 ) / 2 );
                window.crypto.getRandomValues( arr );
                return [].map.call( arr, function( n ) {
                    return n.toString( 16 );
                } ).join( "" );
            }

            var bounds = map.getExtent();
            bounds.transform( map.getProjectionObject(), geodetic );
            var myurl = returnJosmUrl() + "/load_and_zoom?new_layer=true&layer_name=" + generateId( 10 ) + "&" + "left=" + bounds.left + "&right=" + bounds.right + "&top=" + bounds.top + "&bottom=" + bounds.bottom;
            console.log( myurl );

            var req = new XMLHttpRequest();
            req.onreadystatechange = function() {
                if ( req.readyState == 4 && req.status == 400 )
                    // something went wrong. Alert the user with appropriate messages
                    testJosmVersion();
            };
            $( '#msg' ).removeClass().addClass( "notice info" ).html( "Opening area in JOSM" );
            var req = new XMLHttpRequest();
            req.open( "GET", myurl, true );
            req.send( null );
        }
    } ).fail( function( jqXHR, textStatus, errorThrown ) {
        $( '#msg' ).removeClass().addClass( "notice error" ).html( "Fail to get JOSM version using remote control, is it running ?" );
        //console.log(errorThrown);
    } );
}

function testJosmVersion() {
    $.ajax( {
        url: returnJosmUrl() + '/version',
        dataType: "json",
        timeout: 5000 // 5 second wait
    } ).done( function( data ) {
        //console.log(data);
        var version = data.protocolversion;
        if ( version.minor < 6 ) {
            $( '#msg' ).removeClass().addClass( "notice error" ).html( "Your JOSM installation does not yet support load_data requests. Please update JOSM to version 7643 or newer" );
        } else {
            $( '#msg' ).removeClass().addClass( "notice success" ).html( "JOSM minor version " + version.minor );
        }
    } ).fail( function( jqXHR, textStatus, errorThrown ) {
        $( '#msg' ).removeClass().addClass( "notice error" ).html( "Fail to get JOSM version using remote control, is it running ?" );
        //console.log(errorThrown);
    } );
}

function escapeXML( str ) {
    return str.replace( /&/g, "&amp;" )
        .replace( /'/g, "&apos;" )
        .replace( />/g, "&gt;" )
        .replace( /</g, "&lt;" );
}

function addOverpassLayer() {
    // map.removeLayer('OverPass').
    overpass_layer.destroyFeatures();
    var geojson_format = new OpenLayers.Format.GeoJSON( {
        internalProjection: map.getProjectionObject(),
        externalProjection: geodetic
    } );
    overpass_layer.addFeatures( geojson_format.read( osmInfo ) );
    //map.addLayer(overpass_layer);
    overpass_layer.setVisibility( true );
    overpass_layer.refresh();
    //console.log(overpass_layer);
}

function addOverpassRoadLayer() {
    // map.removeLayer('OverPass').
    overpass_road_layer.destroyFeatures();
    var geojson_format = new OpenLayers.Format.GeoJSON( {
        internalProjection: map.getProjectionObject(),
        externalProjection: geodetic
    } );
    overpass_road_layer.addFeatures( geojson_format.read( osmRoadInfo ) );
    //map.addLayer(overpass_road_layer);
    overpass_road_layer.setVisibility( true );
    overpass_road_layer.refresh();
    //console.log(overpass_road_layer);
}

function addDiffLayer() {
    var geoJSON = new OpenLayers.Format.GeoJSON( {
        internalProjection: map.getProjectionObject(),
        externalProjection: geodetic
    } );
    var json = geoJSON.write( wr_layer.features );
    var json_o = JSON.parse( json );
    //console.log(json);

    /*
        var obj = wr_layer.features.reduce(function(acc, cur, i) {
            acc[i] = cur;
            return acc;
        }, {});
    */

    var diff = tf( osmRoadInfo, json_o );
    //console.log( diff );

    // map.removeLayer('OverPass').
    diff_layer.destroyFeatures();
    var geojson_format = new OpenLayers.Format.GeoJSON( {
        internalProjection: map.getProjectionObject(),
        externalProjection: geodetic
    } );
    diff_layer.addFeatures( geojson_format.read( diff ) );
    //map.addLayer(overpass_road_layer);
    diff_layer.setVisibility( true );
    diff_layer.refresh();
    //console.log(overpass_road_layer);
}
