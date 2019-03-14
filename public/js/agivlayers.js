/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";
var agiv_layer;
var isagivup = null;
var stylemap = null;

// The function that gets called on feature selection. Shows information
// about the number of "points" on the map.
var updateAddressInfo = function() {
    var info = 'Currently ' + agiv_layer.features.length + ' address points are shown on the map.';
    $( '#notes' ).html( info );
};

function loadagivlayer() {
    webmercator = new OpenLayers.Projection( "EPSG:3857" );
    geodetic = new OpenLayers.Projection( "EPSG:4326" );
    mercator = new OpenLayers.Projection( "EPSG:900913" );
    lambert = new OpenLayers.Projection( "EPSG:31370" );

    var postcode = $( '#postcode' ).val();
    var keys = [];

    if ( vector_layer == null || vector_layer == undefined ) {
        return false;
    }

    var streets = {};

    $.each( vector_layer.features, function( i, item ) {
        if ( item.attributes[ 'addr:street' ] ) {
            streets[ item.attributes[ 'addr:street' ] ] = 1;
        }
    } );

    /*
        for ( var key in streets ) {
            if ( streetlist.hasOwnProperty( key ) ) {
                keys.push( key );
            }
        }
        keys.sort();
    */

    //console.log(keys);
    //$.each( keys, function( i, item ) {
    //}


    //console.log( streetlist );
    //console.log( keys );

    if ( postcode == null || postcode == undefined ) {
        return false;
    }

    if ( isagivup == null || isagivup == undefined ) {

        var refresh = new OpenLayers.Strategy.Refresh( {
            force: true,
            active: true
        } );

        var boxStrategy = new OpenLayers.Strategy.BBOX( {
            ratio: 2,
            resFactor: 2
        } );

        //var clusterStrategy = new OpenLayers.Strategy.Cluster(); /* performance drain !! */

        var geojson_format = new OpenLayers.Format.GeoJSON( {
            extractAttributes: true,
            internalProjection: map.getProjectionObject(),
            externalProjection: geodetic
        } );

        agiv_layer = new OpenLayers.Layer.Vector( 'CRAB - Addresses', {
            styleMap: eventlayer_style,
            format: geojson_format,
            strategies: [ boxStrategy, refresh ],
            maxScale: 420,
            minScale: 6772,
            //minScale: 12772,
            //minScale: 3000,
            //maxResolution: map.getResolutionForZoom(15),
            //zoomOffset: 9, resolutions: [152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135],
            //zoomOffset: 10, resolutions: [76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135],
            protocol: new OpenLayers.Protocol.HTTP( {
                url: "https://agivdata.grbosm.site/?streets=" + JSON.stringify( Object.keys( streets ) ) + "&postcode=" + postcode,
                format: geojson_format
            } ),

            projection: mercator,
            //displayProjection: mercator
            isBaseLayer: false
        } );
        //map.setLayerIndex(grb_wms, 1);

        var highlightagiv = new OpenLayers.Control.SelectFeature( agiv_layer, {
            hover: true,
            highlightOnly: true,
            //autoActivate:true,
            toggle: false,
            renderIntent: "temporary",
            /*
                        eventListeners: {
                        	featurehighlighted: updateAddressInfo
                        	//featurehighlighted: onFeatureSelect,
                        	//featureunhighlighted: onFeatureUnselect
                        }
            */
        } );

        // create selection lists
        agiv_layer.events.register( 'loadend', this, onloadagivend );

        map.addLayer( agiv_layer );
        agiv_layer.setVisibility( false );
        /* Enable highlighting  */
        map.addControl( highlightagiv );
        highlightagiv.activate();

        /* Overpass style */
        var address_styled = new OpenLayers.Style( {
            fillColor: "red",
            fillOpacity: 0.6,
            fontColor: "#000000",
            fontWeight: "light",
            pointRadius: 8,
            fontSize: "11px",
            strokeColor: "#ff9963",
            strokeWidth: 3,
            //externalGraphic: "${image_url}",
            // externalGraphic: "images/entrs.png",
            //externalGraphic: "http://www2.synctrace.com/images/entrs.png",
            pointerEvents: "all",
            //graphicName: 'star',
            labelOutlineColor: "white",
            labelOutlineWidth: 8,
            labelAlign: "cm",
            cursor: "pointer",
            fontFamily: "sans-serif"
            //fontFamily: "Courier New, monospace"
        } );

        /* Overpass select hover style */
        var address_temp_styled = new OpenLayers.Style( {
            fillColor: "red",
            fontColor: "#000000",
            fontWeight: "normal",
            pointRadius: 8,
            fontSize: "11px",
            strokeColor: "#ff9933",
            strokeWidth: 2,
            // externalGraphic: null,
            pointerEvents: "all",
            fillOpacity: 0.3,
            label: "${getNumber}",
            labelOutlineColor: "black",
            labelAlign: "rb",
            labelOutlineWidth: 8,
            cursor: "pointer",
            fontFamily: "sans-serif"
            //fontFamily: "Courier New, monospace"
        }, {
            context: {
                getLabel: function( feature ) {
                    return feature.properties.tags.sname;
                },
                getNumber: function( feature ) {
                    return feature.properties.tags.house_nr;
                }
            }
        } );

        var address_style = new OpenLayers.StyleMap( {
            'default': address_styled,
            'temporary': address_temp_styled
        } );

        /* Style the halte layer acc to res */
        address_style.styles[ 'default' ].addRules( [
            new OpenLayers.Rule( {
                maxScaleDenominator: 60000000,
                minScaleDenominator: 215000,
                symbolizer: {
                    fillColor: "red",
                    fillOpacity: 0.6,
                    fontColor: "#000000",
                    fontWeight: "light",
                    pointRadius: 2,
                    fontSize: "11px",
                    strokeColor: "#ff9963",
                    strokeWidth: 1,
                    pointerEvents: "all",
                    labelOutlineColor: "white",
                    labelOutlineWidth: 8,
                    labelAlign: "cm",
                    cursor: "pointer",
                    fontFamily: "sans-serif"
                }
            } ),
            new OpenLayers.Rule( {
                maxScaleDenominator: 215000,
                minScaleDenominator: 27000,
                symbolizer: {
                    fillColor: "red",
                    fillOpacity: 0.6,
                    fontColor: "#000000",
                    fontWeight: "light",
                    pointRadius: 4,
                    fontSize: "11px",
                    strokeColor: "#ff9963",
                    strokeWidth: 2,
                    pointerEvents: "all",
                    labelOutlineColor: "white",
                    labelOutlineWidth: 8,
                    labelAlign: "cm",
                    cursor: "pointer",
                    fontFamily: "sans-serif"

                }
            } ),
            new OpenLayers.Rule( {
                maxScaleDenominator: 27000,
                minScaleDenominator: 3384,
                symbolizer: {
                    fillColor: "red",
                    fillOpacity: 0.6,
                    fontColor: "#000000",
                    fontWeight: "light",
                    pointRadius: 10,
                    fontSize: "11px",
                    strokeColor: "#ff9963",
                    strokeWidth: 3,
                    pointerEvents: "all",
                    labelOutlineColor: "white",
                    labelOutlineWidth: 8,
                    labelAlign: "cm",
                    cursor: "pointer",
                    fontFamily: "sans-serif"

                }
            } ),
            new OpenLayers.Rule( {
                maxScaleDenominator: 3384,
                minScaleDenominator: 1,
                symbolizer: {
                    fillColor: "red",
                    fillOpacity: 0.6,
                    fontColor: "#000000",
                    fontWeight: "light",
                    pointRadius: 10,
                    fontSize: "11px",
                    strokeColor: "#ff9963",
                    strokeWidth: 3,
                    label: "${getNumber}",
                    labelAlign: "cm",
                    //labelAlign: "cm",
                    pointerEvents: "all",
                    labelOutlineColor: "white",
                    labelOutlineWidth: 8,
                    cursor: "pointer",
                    fontFamily: "sans-serif"
                }
            } )
        ] );

        agiv_layer.events.on( {
            "featuresadded": function() {
                // $("#msg").html("Info : "+ "Loaded CRAB import layer").removeClass().addClass("notice success");
            }
        } );


        function onloadagivend( evt ) {
            // isagivup = null; Always do this now
            isagivup = null;
            if ( isagivup == null || isagivup == undefined ) {
                // if(stuff !== null && stuff !== undefined)
                // console.log(poilayer);
                updateAddressInfo();
                $( '#cntain' ).css( "width", 'auto' );
                $( '#contentfilters' ).empty();
                $( '#contentfilters' ).css( "float", 'right' );
                $( '#contentfilters' ).append( '<fieldset id="pset" style="display: inline-block" class="col-lg-6 col-md-6 col-sm-6 col-xs-6">' );
                $( '#pset' ).append( '<legend class="fright">Street filter</legend>' );
                $( '#pset' ).append( '<select id="seltagid" class="text-primary" name="tagid" style="width:100%;">' );
                $( '#seltagid' ).append( new Option( '*', 'None' ) );
                var streets = {};

                $.each( vector_layer.features, function( i, item ) {
                    if ( item.attributes[ 'addr:street' ] ) {
                        streets[ item.attributes[ 'addr:street' ] ] = 1;
                    }
                } );

                var keys = [];
                for ( var key in streets ) {
                    if ( streets.hasOwnProperty( key ) ) {
                        keys.push( key );
                    }
                }
                keys.sort();

                //console.log(keys);
                $.each( keys, function( i, item ) {
                    //$('#seltagid').append(new Option(item.['addr:street'], item.asdfsadf ));
                    $( '#seltagid' ).append( new Option( item, item ) );
                } );
                // $('#pset').append('<div id="gicon"></div>');

                $( '#contentfilters' ).append( '</fieldset>' );

                $( '#seltagid' ).change( function() {
                    //streetStrategy.setFilter(null);
                    var filterstring = $( '#seltagid' ).val();
                    var propertysearch = 'addr:street';

                    if ( filterstring == 'None' ) {
                        filterstring = ''
                    }

                    var myfilter = new OpenLayers.Filter.Comparison( {
                        type: OpenLayers.Filter.Comparison.LIKE,
                        // property: "imei",
                        property: propertysearch,
                        value: filterstring
                    } );

                    //console.log(filterstring);
                    if ( filterstring.length <= 0 ) {
                        streetStrategy.setFilter( null );
                    } else {
                        streetStrategy.setFilter( myfilter );
                    }
                    vector_layer.refresh();

                    var bounds = vector_layer.getDataExtent();
                    //map.getZoom()

                    if ( bounds !== null && bounds !== undefined ) {
                        map.panTo( bounds.getCenterLonLat() );
                        //map.zoomToExtent(bounds, true);
                    }
                } );

                // The building filter
                $( '#contentfilters' ).append( '<fieldset id="bset" style="display: inline-block" class="col-lg-5 col-md-5 col-sm-5 col-xs-5">' );
                $( '#bset' ).append( '<legend class="fright">Building filter</legend>' );
                $( '#bset' ).append( '<select id="selbtype" class="text-primary" name="tagid" style="width:100%;">' );
                $( '#selbtype' ).append( new Option( '*', 'None' ) );
                //stuff = vector_layer.features;
                //addr:street
                var buildings = {};

                $.each( vector_layer.features, function( i, item ) {
                    //console.log(item.attributes['building']);
                    if ( item.attributes[ 'building' ] ) {
                        buildings[ item.attributes[ 'building' ] ] = item.attributes[ 'building' ];
                    }
                } );

                var keys = [];
                for ( var key in buildings ) {
                    if ( buildings.hasOwnProperty( key ) ) {
                        keys.push( key );
                    }
                }
                keys.sort();

                // console.log(keys);
                $.each( keys, function( i, item ) {
                    //$('#selbtype').append(new Option(item.['addr:street'], item.asdfsadf ));
                    $( '#selbtype' ).append( new Option( item, item ) );
                } );
                // $('#bset').append('<div id="gicon"></div>');

                $( '#contentfilters' ).append( '</fieldset>' );

                $( '#selbtype' ).change( function() {
                    //buildingStrategy.setFilter(null);
                    // vector_layer.refresh();
                    var filterstring = $( '#selbtype' ).val();
                    var propertysearch = 'building';

                    if ( filterstring == 'None' ) {
                        filterstring = ''
                    }

                    var myfilter = new OpenLayers.Filter.Comparison( {
                        type: OpenLayers.Filter.Comparison.LIKE,
                        // property: "imei",
                        property: propertysearch,
                        value: filterstring
                    } );

                    //console.log(filterstring);
                    if ( filterstring.length <= 0 ) {
                        buildingStrategy.setFilter( null );
                    } else {
                        buildingStrategy.setFilter( myfilter );
                    }
                    vector_layer.refresh();

                    var bounds = vector_layer.getDataExtent();

                    if ( bounds !== null && bounds !== undefined ) {
                        map.panTo( bounds.getCenterLonLat() );
                        //map.zoomToExtent(bounds, true);
                    }
                } );
                //console.log(poilayer.features);
                isagivup = true;
            }
        }
    }
}
