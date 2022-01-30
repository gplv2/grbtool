/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";

// vim: tabstop=4 softtabstop=4 shiftwidth=4 expandtab

var streets = []; // list of streets with the addresses divided in several categories + extra info

var jsonDataVL = {};
var jsonDataBR = {};
var jsonDataWA = {};

// Loading the borders
$.getJSON('geojson/bru_small.geojson',function(data){
    jsonDataBR = data;
});
$.getJSON('geojson/vla_small.geojson',function(data){
    jsonDataVL = data;
});
$.getJSON('geojson/wal_small.geojson',function(data){
    jsonDataWA = data;
});

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
/*
    try {
        //javascript:_paq.push(['trackEvent', 'filterForJosm', bounds]);
    } catch(err) {
        // tracking api probably blocked by user
    }
    */

    /* Filter out all buildings that come back via overpass from source vector layer */
    var overpassfilter = new OpenLayers.Filter.Comparison( {
        type: OpenLayers.Filter.Comparison.LIKE,
        property: "source:geometry:ref",
        evaluate: function( feature ) {
            var ret = true;
            $.each( overpass_layer.features, function( i, overpass ) {
                //console.log("testing " + feature.attributes['source:geometry:oidn']);
                //console.log(overpass)k;
                //console.log(feature.attributes);
                /*
                if ( !overpass.attributes.tags[ 'source:geometry:ref' ] ) {
                    $( "#msg" ).html( "Warning : " + "The features from overpass are missing the entity tag, add the entity (Gbg, Knw ..) , this will improve and correct the filtering." ).removeClass().addClass( "notice warn" );
    // Entity is missing, probably a legacy test import
                    if ( overpass.attributes.tags[ 'source:geometry:oidn' ] === feature.attributes[ 'source:geometry:oidn' ] ) {
                //console.log("found match: " + overpass.attributes.tags['source:geometry:oidn']);
                        ret = false;
                    }
                } else {
                */          
                // Format the date in OSM format
                // GRB + PICC
                if ( feature.attributes[ "source:geometry:date" ] !== null && feature.attributes[ "source:geometry:date" ] !== undefined ) {
                    //console.log(node.val[ "source:geometry:date" ]);
                    var mydate = "";
                    // make it a string by catting it into one.
                    mydate = '' + feature.attributes[ "source:geometry:date" ];
                    var stripped = mydate.replace( /\//g, '-' );
                    var object_date = stripped;
                    //console.log(stripped);
                }
                // URBIS
                if ( feature.attributes[ "source:geometry:version" ] !== null && feature.attributes[ "source:geometry:version" ] !== undefined ) {
                    // make it a string by catting it into one.
                    var object_version = '' + feature.attributes[ "source:geometry:version" ];
                } else {
                    //feature.attributes[ "source:geometry:version" ]='1';
                    var object_version = '1' ;
		        }

                // Multiple values situation: 
                // ref tag present in overpass data
                if ( overpass.attributes.tags[ 'source:geometry:ref' ] || overpass.attributes.tags[ 'ref:UrbIS' ] ) {
                    // See if a ; is present
                    if ( overpass.attributes.tags[ 'source:geometry:ref' ] ) {
                        var dotcomma = overpass.attributes.tags[ 'source:geometry:ref' ].indexOf(";");
                    } else if ( overpass.attributes.tags[ 'ref:UrbIS' ] ) {
                        var dotcomma = overpass.attributes.tags[ 'ref:UrbIS' ].indexOf(";");
                    }
                    // If a dotcomma is present in the overpass tags, this means a combined ref key of multiple objects
                    if (dotcomma) {
			 //console.log("dotcomma");
                        // combined ref key needs different approach
                        if ( overpass.attributes.tags[ 'source:geometry:ref' ] ) {
                            var refArray = overpass.attributes.tags[ 'source:geometry:ref' ].split(';');
                        } else if ( overpass.attributes.tags[ 'ref:UrbIS' ] ) {
                            var refArray = overpass.attributes.tags[ 'ref:UrbIS' ].split(';');
                        }
                        // What entity are we dealing with, if URBIS we need the version approach and not the date
                        //console.log(refArray);
                        //console.log(entity);
                        
                        if ( overpass.attributes.tags[ 'source:geometry:version' ]){
                            var versionArray = overpass.attributes.tags[ 'source:geometry:version' ].split(';');
                            $.each( refArray , function( j, ref ) {
                                // Compair, assuming ref and date have same number of elements
                                if ( feature.attributes[ 'source:geometry:entity' ] + '/' + feature.attributes[ 'source:geometry:oidn' ] === ref && 
                                    versionArray[j] === object_version ) {
                                    // This object seems up to date with source
                                    ret = false;
                                }
                            });
                        } else {
                            overpass.attributes.tags[ 'source:geometry:version' ] = '1';
                        }

                        if (overpass.attributes.tags[ 'source:geometry:date' ]) {
                            var dateArray = overpass.attributes.tags[ 'source:geometry:date' ].split(';');
                            $.each( refArray , function( j, ref ) {
                                // Compair, assuming ref and date have same number of elements
                                if ( feature.attributes[ 'source:geometry:entity' ] + '/' + feature.attributes[ 'source:geometry:oidn' ] === ref && 
                                    dateArray[j] === object_date ) {
                                    // This object seems up to date with source
                                    ret = false;
                                }
                            });
                        }
                    } else  {
                        // pic grb
                        if ( overpass.attributes.tags[ 'source:geometry:ref' ] === feature.attributes[ 'source:geometry:entity' ] + '/' + feature.attributes[ 'source:geometry:oidn' ] && 
                            overpass.attributes.tags[ 'source:geometry:date' === object_date ]
                        ) {
                            ret = false;
                        }
                        //urbis
                        console.log("ref:UrbIS");
                        if ( overpass.attributes.tags[ 'source:geometry:version' ] ){
                            console.log("ref:UrbIS if");
                            if ( overpass.attributes.tags[ 'source:geometry:ref' ] === feature.attributes[ 'source:geometry:entity' ] + '/' + feature.attributes[ 'source:geometry:oidn' ] && 
                                overpass.attributes.tags[ 'source:geometry:version' === object_version ]
                            ) {
                                ret = false;
                            }
                        } else if ( overpass.attributes.tags[ 'ref:UrbIS' ] ) {
                            console.log("ref:UrbIS else");
                            var overpass_ref = overpass.attributes.tags[ 'source:geometry:ref' ] = 'Urbis/' + overpass.attributes.tags[ 'ref:UrbIS' ];
                            if ( overpass_ref === feature.attributes[ 'source:geometry:entity' ] + '/' + feature.attributes[ 'source:geometry:oidn' ] && 
                                overpass.attributes.tags[ 'source:geometry:version' === object_version ]
                            ) {
                                ret = false;
                            } else {
                                // Do a geo compair here of equal refs
                                var urbis_intersect = mturf.de9im.intersects( overpass.geometry, feature.geometry );
                                console.log(overpass);
                                console.log(feature);
                                console.log(urbis_intersect);
                            }
                        }
                    }
                }
                //}
            } );
            return ret;
        }
    } );
    mergeStrategy.setFilter( overpassfilter );
    $( "#msg" ).html( "<br/>Info : " + "Filtered Export Vector Layer with overpass data" ).removeClass().addClass( "notice success" );
    //return true;
}

function returnJosmUrl() {
    var josmUrl = '';
    if ( $( 'input[id="jinsecure"]' ).is( ':checked' ) ) {
        josmUrl = 'http://127.0.0.1:8111';
    } else if ( $( 'input[id="jsecure"]' ).is( ':checked' ) ) {
        josmUrl = "https://127.0.0.1:8112";
    }
    return josmUrl;
}

function openFileInJosm(file) {
    /*
    try {
        //javascript:_paq.push(['trackEvent', 'openFileInJosm', file]);
    } catch(err) {
        // tracking api probably blocked by user
    }
    */
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

            var myurl = returnJosmUrl() + "/import?url=" + document.location.origin + "/" + file + "?dummyparam";

            $.ajax( {
                type: "GET",
                url: myurl,
                cache: false,
                //dataType: "json",
                //contentType: "application/xml",
                timeout: 5000 // 5 second wait
            } ).done( function( data ) {
                $( '#msg' ).removeClass().addClass( "notice info" ).html( "Opening file in JOSM" );
            } ).fail( function( jqXHR, textStatus, errorThrown ) {
                $( '#msg' ).removeClass().addClass( "notice error" ).html( "Failed to open file in JOSM" );
                console.log(errorThrown);
            } );
        }
    } ).fail( function( jqXHR, textStatus, errorThrown ) {
        $( '#msg' ).removeClass().addClass( "notice error" ).html( "Fail to get JOSM version using remote control, is it running ?" );
        //console.log(errorThrown);
    } );
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

            var myurl = returnJosmUrl() + "/load_data?upload_policy=never&new_layer=true&layer_name=" + newlayername + "&data=";

            var geoJSON = new OpenLayers.Format.GeoJSON( {
                internalProjection: map.getProjectionObject(),
                externalProjection: geodetic
            } );

            var mylayers = map.getLayersByName( layername );
            //console.log(mylayers[0].features);
            /*
                           $.each(mylayers.features, function(i, overpass) {
                              if(!overpass.attributes.tags['source:geometry:entity']) {
                                    ret = false;
                              }
                           });
            */

            var json = JSON.parse( geoJSON.write( mylayers[ 0 ].features ) );

            // See if there is anything in the data that can be exported, if not return with an error
            if ( json.features.length === 0 ) {
                $( '#msg' ).removeClass().addClass( "notice error" ).html( "Empty vector layer: There are no features to export. Drag the map to an area with buildings and/or click " +"</a> <button id=\"goresetfilters\" type=\"button\" name=\"help_reset_filters\" onclick=\"javascript:$('#rstfilter').click();\" class=\"btn btn-default\" tabindex=\"6\">Reset Filters</button>" );
                return false;
            }

            //console.log( json );

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

            //console.log(json);
            // Filter meta tags before export
            if ( !$( 'input[id="metaexport"]' ).is( ':checked' ) ) {
                $( '#msg' ).removeClass().addClass( "notice info" ).html( "Filtering out META tags" );
                Walk.walk( json, "poly", walkConfig );
            }
            //console.log( json );

            mylayers = null;

            // From npm module
            // console.log(json);
            // console.log("parsing json");
            // Command line simplify using mapshaper:
            // -simplify 85% dp keep-shapes stats -o format=geojson /home/glenn/out.geojson

            var xml = '';
            var threshhold = Number( $( "#dpslider" ).slider( "value" ) );


            // First detect if a polygon is inside another polygon
            console.log("Scanning for polygons for problems with overlapping.. ");
            /*
            $.each( json.features, function( i, featureA ) {
                // testing each of them
                $.each( json.features, function( j, featureB ) {
                } );
            } );
            */

            var deleteIndexes = [];

            if ( $( 'input[id="remove_within"]' ).is( ':checked' ) ) {
                if ( json.features.length) {
                    json.features.forEach( function( featureA , i) {
                        var keep = true;
                        json.features.forEach( function( featureB, j ) {
                            if ( i == j ) {
                                //console.log("Skipping compairing to itself..");
                                return;
                            }
                            if ( j < i ) {
                                //console.log("Skipping stuff we already tested the other way around ..");
                                return;
                            }
                            if (featureA.geometry.type == 'MultiPolygon' || featureB.geometry.type =='MultiPolygon') {
                                // Skip multipolgons
                                return;
                            }
                            //console.log("compairing " + i + " with " + j );
                            var isWithin1 = mturf.booleanWithin( featureA, featureB );
                            var isWithin2 = mturf.booleanWithin( featureB, featureA );
				            /*
                            if ( 
                                featureA.properties [ 'source:geometry:ref' ] === "Picc/1569893" && featureB.properties [ 'source:geometry:ref' ] === "Picc/16926" || 
                                featureB.properties [ 'source:geometry:ref' ] === "Picc/16926" && featureA.properties [ 'source:geometry:ref' ] === "Picc/1569893" 
                            ) {
                                console.log("special");
                                console.log(isWithin1);
                                console.log(isWithin2);
                                var isContains1 = mturf.booleanContains( featureA, featureB );
                                var isContains2 = mturf.booleanContains( featureB, featureA );
                                console.log("contains");
                                console.log(isContains1);
                                console.log(isContains2);
                                console.log("overlap");
                            }
			                */
                            if ( (isWithin1 !== null && isWithin1 !== undefined && isWithin1) || (isWithin2 !== null && isWithin2 !== undefined && isWithin2) ) {
                                console.log("feature A is within feature B - or the other way- properties: ");
                                console.log(featureA.properties);
                                console.log(featureB.properties);
                                var inter = mturf.intersect(featureA,featureB);
                                //console.log("intersection:");
                                //console.log(inter);
                                if (inter === null) {
                                    // This geometry B is just sharing borders and doesn't look like it's encompassed inside, it's an adjacent building, keep this
                                    console.log("Just sharing a border, not deleting");
                                } else {
                                    if ( (featureA.properties [ 'source:geometry:ref' ] === null || featureA.properties [ 'source:geometry:ref' ] === undefined) ) {
                                        console.log("Missing properties on refA where some are expected:");
                                        console.log(featureA.properties);
                                        return;
                                    } else {
                                        var refA = featureA.properties[ 'source:geometry:ref' ];
                                    }
                                    if ( (featureB.properties [ 'source:geometry:ref' ] === null || featureB.properties [ 'source:geometry:ref' ] === undefined) ) {
                                        console.log("Missing properties on refB where some are expected:");
                                        console.log(featureB.properties);
                                        return;
                                    } else {
                                        var refB = featureB.properties[ 'source:geometry:ref' ];
                                    }

                                    if ( (featureA.properties [ 'source:geometry:date' ] !== null && featureA.properties [ 'source:geometry:date' ] !== undefined) ) {
                                        var dateA = featureA.properties[ 'source:geometry:date' ];
                                    } else  if ( (featureA.properties [ 'source:geometry:version' ] !== null && featureA.properties [ 'source:geometry:version' ] !== undefined) ) {
                                        var versionA = featureA.properties[ 'source:geometry:version' ];
                                    } else {
                                        console.log("no way to determine version, missing the date or the version");
                                        return;
                                    }

                                    if ( (featureB.properties [ 'source:geometry:date' ] !== null && featureB.properties [ 'source:geometry:date' ] !== undefined) ) {
                                        var dateB = featureB.properties[ 'source:geometry:date' ];
                                    } else  if ( (featureB.properties [ 'source:geometry:version' ] !== null && featureB.properties [ 'source:geometry:version' ] !== undefined) ) {
                                        var versionB = featureB.properties[ 'source:geometry:version' ];
                                    } else {
                                        console.log("no way to determine version, missing the date or the version");
                                        return;
                                    }

                                    var refA = featureA.properties[ 'source:geometry:ref' ].split('/');
                                    var refB = featureB.properties[ 'source:geometry:ref' ].split('/');
                                   
                                    if (refA[0] === refB[0]) {
                                        if (dateA && dateB) {
                                            var dteA = new Date(dateA);
                                            var dteB = new Date(dateB);
                                            if (dteA > dteB ) {
                                                console.log("date test >");
                                                if ( (featureB.properties [ 'addr:street' ] === null && featureB.properties [ 'addr:street' ] === undefined) && 
                                                    (featureA.properties [ 'addr:street' ] === null || featureA.properties [ 'addr:street' ] === undefined) ) {
                                                        deleteIndexes.push( j );
                                                } else {
                                                    // If one geometry is younger but it doesn't have address data, it's problably not the right one to remove
                                                    if ( (featureB.properties [ 'addr:street' ] !== null && featureB.properties [ 'addr:street' ] !== undefined) && 
                                                        (featureA.properties [ 'addr:street' ] === null || featureA.properties [ 'addr:street' ] === undefined) ) {
                                                        console.log("remove i ");
                                                        deleteIndexes.push( i );
                                                    } else {
                                                        console.log("remove j ");
                                                        deleteIndexes.push( j );
                                                    }
                                                }
                                            } else {
                                                console.log("date test <");
                                                if ( (featureB.properties [ 'addr:street' ] === null && featureB.properties [ 'addr:street' ] === undefined) && 
                                                    (featureA.properties [ 'addr:street' ] === null || featureA.properties [ 'addr:street' ] === undefined) ) {
                                                    deleteIndexes.push( i );
                                                }
                                                if ( (featureA.properties [ 'addr:street' ] !== null && featureA.properties [ 'addr:street' ] !== undefined) && 
                                                    (featureB.properties [ 'addr:street' ] === null || featureB.properties [ 'addr:street' ] === undefined) ) {
                                                    deleteIndexes.push( j );
                                                    console.log("remove j ");
                                                } else{
                                                    console.log("remove i ");
                                                    deleteIndexes.push( i );
                                                }
                                                // erase B
                                            }
                                        } else if (versionA && versionB) {
                                            if (versionA > versionB) {
                                                deleteIndexes.push( j );
                                                // erase A
                                            } else {
                                                deleteIndexes.push( i );
                                                // erase B
                                            }
                                        } else {
                                            console.log("We cant decide what to delete, we should not get here");
                                        }
                                    } else {
                                        console.log("We have a GRB/PICC/URBIS border conflict between data sources");
                                        // Test to see where the points lie on the border
                                        var isWithinVL = mturf.de9im.within( mturf.centroid(featureA), jsonDataVL );
                                        var isWithinWA = mturf.de9im.within( mturf.centroid(featureA), jsonDataWA );
                                        var isWithinBR = mturf.de9im.within( mturf.centroid(featureA), jsonDataBR );
                                        if ((refA[0] === 'Gbg' || refA[0] === 'Gba' || refA[0] === 'Knw' ) && isWithinVL ) {
                                            deleteIndexes.push( j );
                                        } else if (refA[0] === 'Picc' && isWithinWA ) {
                                            deleteIndexes.push( j );
                                        } else if (refA[0] === 'Urbis' && isWithinBR ) {
                                            deleteIndexes.push( j );
                                        } else {
                                            deleteIndexes.push( i );
                                        }
                                        //console.log(isWithinVL);
                                        //console.log(isWithinWA);
                                        //console.log(isWithinBR);
                                    }

                                    //json.features[i].properties[ 'inter' ] = "detected intersection";
                                    //json.features[i].properties[ 'fixme' ] = "help I'm a duplicate";
                                }
                            } else {
                                // If it's not within, check for possible overlap
                                var isOverlap1 = mturf.de9im.intersects( featureA, featureB );
                                //var isOverlap2 = mturf.booleanOverlap( featureB, featureA );
                                //return;

                                //if ( (isOverlap1 !== null && isOverlap1 !== undefined && isOverlap1 ) || (isOverlap2 !== null && isOverlap2 !== undefined && isOverlap2) ) 
                                if ( isOverlap1 !== null && isOverlap1 !== undefined && isOverlap1 ) {
                                    //console.log(isOverlap1);
                                    //console.log(isOverlap2);
                                    //console.log(isOverlap1);
                                    //console.log(isOverlap2);
                                    var inter = mturf.intersect(featureA,featureB);
                                    if (inter === null) {
                                        // This geometry B is just sharing borders and doesn't look like it's encompassed inside, it's an adjacent building, keep this
                                        // console.log("Just sharing a border, not deleting");
                                        return ;
                                    }
                                    // size of areas
                                    var overlapsize = mturf.area(inter);
                                    var areasizeA = mturf.area(featureA);
                                    var areasizeB = mturf.area(featureB);
                                    var maxarea = (areasizeA > areasizeB) ? areasizeA : areasizeB;
                                    var overlappct = ( overlapsize / maxarea) * 100;
                                    var perc_overlap = Math.round(( overlappct  + Number.EPSILON) * 100) / 100;

                                    if (perc_overlap > 0.8 ) {
                                        console.log("features overlap - properties: ");
                                        console.log(featureA.properties);
                                        console.log(featureB.properties);
                                        console.log("overlap size is big :" + perc_overlap + " %");
                                        //json.features[j].properties[ 'fixme' ] = "I am overlapped";

                                        if ( (featureA.properties [ 'source:geometry:ref' ] === null || featureA.properties [ 'source:geometry:ref' ] === undefined) ) {
                                            console.log("Missing properties on refA where some are expected:");
                                            //console.log(featureA.properties);
                                            return;
                                        } else {
                                            var refA = featureA.properties[ 'source:geometry:ref' ];
                                        }
                                        if ( (featureB.properties [ 'source:geometry:ref' ] === null || featureB.properties [ 'source:geometry:ref' ] === undefined) ) {
                                            console.log("Missing properties on refB where some are expected:");
                                            //console.log(featureB.properties);
                                            return;
                                        } else {
                                            var refB = featureB.properties[ 'source:geometry:ref' ];
                                        }

                                        if ( (featureA.properties [ 'source:geometry:date' ] !== null && featureA.properties [ 'source:geometry:date' ] !== undefined) ) {
                                            var dateA = featureA.properties[ 'source:geometry:date' ];
                                        } else  if ( (featureA.properties [ 'source:geometry:version' ] !== null && featureA.properties [ 'source:geometry:version' ] !== undefined) ) {
                                            var versionA = featureA.properties[ 'source:geometry:version' ];
                                        } else {
                                            console.log("no way to determine version, missing the date or the version");
                                            return;
                                        }

                                        if ( (featureB.properties [ 'source:geometry:date' ] !== null && featureB.properties [ 'source:geometry:date' ] !== undefined) ) {
                                            var dateB = featureB.properties[ 'source:geometry:date' ];
                                        } else  if ( (featureB.properties [ 'source:geometry:version' ] !== null && featureB.properties [ 'source:geometry:version' ] !== undefined) ) {
                                            var versionB = featureB.properties[ 'source:geometry:version' ];
                                        } else {
                                            console.log("no way to determine version, missing the date or the version");
                                            return;
                                        }


                                        var refA = featureA.properties[ 'source:geometry:ref' ].split('/');
                                        var refB = featureB.properties[ 'source:geometry:ref' ].split('/');
                                    
                                        if (refA[0] === refB[0]) {
                                            if (dateA && dateB) {
                                                var dteA = new Date(dateA);
                                                var dteB = new Date(dateB);
                                                if (dteA > dteB ) {
                                                    console.log("date test >");
                                                    if ( (featureB.properties [ 'addr:street' ] === null && featureB.properties [ 'addr:street' ] === undefined) && 
                                                        (featureA.properties [ 'addr:street' ] === null || featureA.properties [ 'addr:street' ] === undefined) ) {
                                                        deleteIndexes.push( j );
                                                    } else {
                                                        // If one geometry is younger but it doesn't have address data, it's problably not the right one to remove
                                                        if ( (featureB.properties [ 'addr:street' ] !== null && featureB.properties [ 'addr:street' ] !== undefined) && 
                                                            (featureA.properties [ 'addr:street' ] === null || featureA.properties [ 'addr:street' ] === undefined) ) {
                                                            console.log("remove i ");
                                                            deleteIndexes.push( i );
                                                        } else {
                                                            console.log("remove j ");
                                                            deleteIndexes.push( j );
                                                        }
                                                    }
                                                } else {
                                                    console.log("date test <");
                                                    if ( (featureB.properties [ 'addr:street' ] === null && featureB.properties [ 'addr:street' ] === undefined) && 
                                                        (featureA.properties [ 'addr:street' ] === null || featureA.properties [ 'addr:street' ] === undefined) ) {
                                                        deleteIndexes.push( i );
                                                    } else {
                                                        if ( (featureA.properties [ 'addr:street' ] !== null && featureA.properties [ 'addr:street' ] !== undefined) && 
                                                            (featureB.properties [ 'addr:street' ] === null || featureB.properties [ 'addr:street' ] === undefined) ) {
                                                            deleteIndexes.push( j );
                                                            console.log("remove j ");
                                                        } else{
                                                            console.log("remove i ");
                                                            deleteIndexes.push( i );
                                                        }
                                                    }
                                                }
                                            } else if (versionA && versionB) {
                                                if (versionA > versionB) {
                                                    deleteIndexes.push( j );
                                                    // erase A
                                                } else {
                                                    deleteIndexes.push( i );
                                                    // erase B
                                                }
                                            } else {
                                                console.log("We cant decide what to delete, we should not get here");
                                            }
                                        } else {
                                            console.log("We have a GRB/PICC/URBIS border conflict between data sources");
                                            // Test to see where the points lie on the border
                                            var isWithinVL = mturf.de9im.within( mturf.centroid(featureA), jsonDataVL );
                                            var isWithinWA = mturf.de9im.within( mturf.centroid(featureA), jsonDataWA );
                                            var isWithinBR = mturf.de9im.within( mturf.centroid(featureA), jsonDataBR );
                                            if ((refA[0] === 'Gbg' || refA[0] === 'Gba' || refA[0] === 'Knw' ) && isWithinVL ) {
                                                    deleteIndexes.push( j );
                                            } else if (refA[0] === 'Picc' && isWithinWA ) {
                                                    deleteIndexes.push( j );
                                            } else if (refA[0] === 'Urbis' && isWithinBR ) {
                                                    deleteIndexes.push( j );
                                            } else {
                                                    deleteIndexes.push( i );
                                            }
                                            //console.log(isWithinVL);
                                            //console.log(isWithinWA);
                                            //console.log(isWithinBR);
                                        }
                                        //json.features[i].properties[ 'inter' ] = "detected intersection";
                                        //json.features[i].properties[ 'fixme' ] = "help I intersect";
                                    }
                                }
                            }
                            //console.log("next test");
                            //
                        } );
                    } );
                }
            } // end test
            // Now delete the ones we need to delete

            console.log(deleteIndexes);

            /* sort from big to small : [1, 3, 5] */
            deleteIndexes.sort( function( a, b ) {
                return a - b;
            } );

            var uniqueArray = deleteIndexes.filter(function(item, pos, self) {
                return self.indexOf(item) == pos;
            });
            console.log(uniqueArray);

            var i = uniqueArray.length - 1;
            /* delete backwards */
            for ( i; i >= 0; i-- ) {
                json.features.splice( uniqueArray[ i ], 1 );
            }

            // End

            if ( threshhold != 100 && threshhold ) {
                $( '#msg' ).removeClass().addClass( "notice info" ).html( "Simplifying ways (overnode removal)..." );
                // console.log("simplifying");
                //console.log(json);
                //console.log(dataset);
                var dataset = mapshaper.internal.importContent( {
                    json: {
                        content: json
                    }
                } );
                //console.log(dataset);


                var opts = {
                    percentage: ( threshhold / 100 ),
                    method: 'dp',
                    keep_shapes: true
                };

                var ms = mapshaper.simplify( dataset, opts );

                if ( $( 'input[id="mapshaper_clean"]' ).is( ':checked' ) ) {
                    $( '#msg' ).removeClass().addClass( "notice info" ).html( "Cleaning source data (attaching polygons, snapping to intersections, removing overlapping poly's )..." );
                    // snap-interval=0.0000025 overlap-rule=max-id
                    var opts = {
                        snap_interval: "0.0000025",
                        overlap_rule: 'max-id'
                    };
                    var ms = mapshaper.cleanLayers( dataset.layers, dataset , opts );
                }

                // $( '#msg' ).removeClass().addClass( "notice info" ).html( "Transcoding to geojson" );
                var output = mapshaper.internal.exportFileContent( dataset, {
                    format: 'geojson'
                } );

                $( '#msg' ).removeClass().addClass( "notice info" ).html( "Transcoding geoJSON to OSM-XML format" );
                if (output[0] && output[1]) {
                    $( '#msg' ).removeClass().addClass( "notice info" ).html( "Merging multilayers geoJSON into single layer" );
                    var mergedGeoJSON = gmerge.merge([ JSON.parse(output[0].content) , JSON.parse(output[1].content) ]);
                    xml = geos( mergedGeoJSON );
                }  else  {
                    xml = geos( JSON.parse( output[ 0 ].content ) );
                }
                //var xml = geos(JSON.parse(json));
            } else {
                $( '#msg' ).removeClass().addClass( "notice info" ).html( "Not simplifying or cleaning. Transcoding RAW geoJSON to OSM-XML format" );
                xml = geos( json );
            }

            //$( '#msg' ).removeClass().addClass( "notice info" ).html( "Internal XML structure created" );

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
            /*
                try {
                    //javascript:_paq.push(['trackEvent', 'openInJosm', '/api/export/upload']);
                } catch(err) {
                    // tracking api probably blocked by user
                }
        */
                if (data.status == 'stored') {
                    $( '#msg' ).removeClass().addClass( "notice info" ).html( "Export XML uploaded to server: <a href=" + data.url + ">"+ data.fname +"</a> <button id=\"lfilejosm\" type=\"button\" class=\"btn btn-default\" tabindex=\"6\">JOSM</button>");
                    $( "#lfilejosm" ).click( function( event ) {
                        // $( '#msg' ).removeClass().addClass( "notice info" ).html( "Action: Instructing JOSM to dowload file" );
                        $( 'body' ).css( 'cursor', 'wait' );
                        openFileInJosm(data.url);
                        $( 'body' ).css( 'cursor', 'default' );
                        event.preventDefault();
                        return false;
                    } );
                } else {
                    $( '#msg' ).removeClass().addClass( "notice info" ).html( "Export XML uploaded to server");
                }
                //console.log(data);
            } ).fail( function( jqXHR, textStatus, errorThrown ) {
                $( '#msg' ).removeClass().addClass( "notice error" ).html( "Failed to upload XML export to server: " . textStatus );
                console.log(errorThrown);
            } );


            //  GET /import?url=...
            //
            //console.log(xml);
            json = null;

            //var bytesize = getStringMemorySize(xml);
            var length = xml.length;
            //console.log(bytesize);
            //console.log(length);
            if (length<500000) {

                var req = new XMLHttpRequest();
                req.onreadystatechange = function() {
                    if ( req.readyState == 4 && req.status == 400 ) {
                        // something went wrong. Alert the user with appropriate messages
                        testJosmVersion();
                    }
                };
                try {
                    //$( '#msg' ).removeClass().addClass( "notice info" ).html( "Opening XML in JOSM" );
                    //console.log(myurl + encodeURIComponent( xml ));
                    /*
                try {
                    //javascript:_paq.push(['trackEvent', 'openInJosm', myurl ]);
                } catch(err) {
                                    // tracking api probably blocked by user
                }
                */
                    req.open( "GET", myurl + encodeURIComponent( xml ), true );
                    req.send( null );
               } catch ( err ) {
                    $( '#msg' ).removeClass().addClass( "notice error" ).html( "Export of objects failed (too big?): " + err );
               }
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
/*
            try {
                //javascript:_paq.push(['trackEvent', 'openAreaInJosm', myurl ]);
            } catch(err) {
                // tracking api probably blocked by user
            }
*/
            // console.log( myurl );

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
    /*
    try {
        //javascript:_paq.push(['trackEvent', 'josm', 'testJosmVersion', myurl ]);
    } catch(err) {
        // tracking api probably blocked by user
    }
    */
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

function getStringMemorySize( _string ) {
    var codePoint , accum = 0 ;

    for( var stringIndex = 0, endOfString = _string.length; stringIndex < endOfString; stringIndex++ ) {
        codePoint = _string.charCodeAt( stringIndex );

        if( codePoint < 0x100 ) {
            accum += 1;
            continue;
        }

        if( codePoint < 0x10000 ) {
            accum += 2;
            continue;
        }

        if( codePoint < 0x1000000 ) {
            accum += 3;
        } else {
            accum += 4;
        }
    }

    return accum * 2;
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
