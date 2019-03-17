/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";

// vim: tabstop=4 softtabstop=4 shiftwidth=4 expandtab

var agiv_layer;
var isagivup = null;
var stylemap = null;

var webmercator = new OpenLayers.Projection( "EPSG:3857" );
var geodetic = new OpenLayers.Projection( "EPSG:4326" );
var mercator = new OpenLayers.Projection( "EPSG:900913" ); // to Spherical Mercator Projection
var lambert = new OpenLayers.Projection( "EPSG:31370" ); // to Spherical Mercator Projection

/**
 * Class: OpenLayers.Strategy.AttributeCluster
 * Strategy for vector feature clustering based on feature attributes.
 *
 * Inherits from:
 *  - <OpenLayers.Strategy.Cluster>
 */

OpenLayers.Strategy.AttributeCluster = OpenLayers.Class( OpenLayers.Strategy.Cluster, {
    /**
     * the attribute to use for comparison
     */
    attribute: null,
    /**
     * Method: shouldCluster
     * Determine whether to include a feature in a given cluster.
     *
     * Parameters:
     * cluster - {<OpenLayers.Feature.Vector>} A cluster.
     * feature - {<OpenLayers.Feature.Vector>} A feature.
     *
     * Returns:
     * {Boolean} The feature should be included in the cluster.
     */
    shouldCluster: function( cluster, feature ) {
        var cc_attrval = cluster.cluster[ 0 ].attributes[ this.attribute ];
        var fc_attrval = feature.attributes[ this.attribute ];
        var superProto = OpenLayers.Strategy.Cluster.prototype;
        return cc_attrval === fc_attrval &&
            superProto.shouldCluster.apply( this, arguments );
    },
    CLASS_NAME: "OpenLayers.Strategy.AttributeCluster"
} );

/**
 * Class: OpenLayers.Strategy.RuleCluster
 * Strategy for vector feature clustering according to a given rule.
 *
 * Inherits from:
 *  - <OpenLayers.Strategy.Cluster>
 */
OpenLayers.Strategy.RuleCluster = OpenLayers.Class( OpenLayers.Strategy.Cluster, {
    /**
     * the rule to use for comparison
     */
    rule: null,
    /**
     * Method: shouldCluster
     * Determine whether to include a feature in a given cluster.
     *
     * Parameters:
     * cluster - {<OpenLayers.Feature.Vector>} A cluster.
     * feature - {<OpenLayers.Feature.Vector>} A feature.
     *
     * Returns:
     * {Boolean} The feature should be included in the cluster.
     */
    shouldCluster: function( cluster, feature ) {
        var superProto = OpenLayers.Strategy.Cluster.prototype;
        return this.rule.evaluate( cluster.cluster[ 0 ] ) &&
            this.rule.evaluate( feature ) &&
            superProto.shouldCluster.apply( this, arguments );
    },
    CLASS_NAME: "OpenLayers.Strategy.RuleCluster"
} );

// The function that gets called on feature selection. Shows information
// about the number of "points" on the map.
var updateGeneralInformation = function() {
    var info = 'Currently ' + agiv_layer.features.length + ' points are shown on the map.';
    $( '#notes' ).html = info;
};

function loadstreets() {
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
            styleMap: address_style,
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
            eventListeners: {
                featurehighlighted: updateGeneralInformation
                //featurehighlighted: onFeatureSelect,
                //featureunhighlighted: onFeatureUnselect
            }
        } );

        // create selection lists
        agiv_layer.events.register( 'loadend', this, onloadagivend );

        map.addLayer( agiv_layer );
        agiv_layer.setVisibility( true );
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

        function onloadagivend( evt ) {
            // isvecup = null; Always do this now
            isagivup = null;
            if ( isagivup == null || isagivup == undefined ) {
                // if(stuff !== null && stuff !== undefined)
                // console.log(poilayer);
                $( '#cntain' ).css( "width", 'auto' );
                $( '#contentfilters' ).empty();
                $( '#contentfilters' ).css( "float", 'right' );
                $( '#contentfilters' ).append( '<fieldset id="pset" style="display: inline-block; height: 56px;">' );
                $( '#pset' ).append( '<legend class="fright">Street filter</legend>' );
                $( '#pset' ).append( '<select id="seltagid" name="tagid" style="width:100%;">' );
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
                $( '#contentfilters' ).append( '<fieldset id="bset" style="width: 160px; display: inline-block; height: 56px;">' );
                $( '#bset' ).append( '<legend class="fright">Building filter</legend>' );
                $( '#bset' ).append( '<select id="selbtype" name="tagid" style="width:100%;">' );
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
                isvecup = true;
            }
        }
        isagivup = true;
    }
    // wrap the instantiation code in an anonymous function that gets executed
    /*
    (function(){
        // The function that gets called on feature selection: shows information
        // about the feature/cluser in a div on the page
        var showInformation = function(evt){
            var feature = evt.feature;
            var info = 'Last hovered feature:<br>';
            if (feature.cluster) {
                info += '&nbsp;&nbsp;Cluster of ' + feature.attributes.count + ' features:';
                var clazzes = {
                    '1': 0,
                    '2': 0,
                    '3': 0,
                    '4': 0
                };
                for (var i = 0; i < feature.attributes.count; i++) {
                    var feat = feature.cluster[i];
                    clazzes[feat.attributes.clazz]++;
                }
                for (var j=1; j<=4; j++) {
                    var plural_s = (clazzes[j] !== 1) ? 's' : '';
                    info += '<br>&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;clazz ' + j + ': ' + clazzes[j] + ' feature' + plural_s;
                }
            } else {
                info += '&nbsp;&nbsp;Single feature of clazz = ' + feature.attributes.clazz;
            }
            $('#notes').html = info;
        };

        // context to style the agiv_layer
        var context = {
            getColor: function(feature){
                var color = '#aaaaaa';
                if (feature.attributes.clazz && feature.attributes.clazz === 4) {
                    color = '#ee0000';
                } else if(feature.cluster) {
                    var onlyFour = true;
                    for (var i = 0; i < feature.cluster.length; i++) {
                        if (onlyFour && feature.cluster[i].attributes.clazz !== 4) {
                            onlyFour = false;
                        }
                    }
                    if (onlyFour === true) {
                        color = '#ee0000';
                    }
                }
                return color;
            }
        };

        // style the agiv_layer
        stylemap = new OpenLayers.StyleMap({
            'default': new OpenLayers.Style({
                pointRadius: 5,
                fillColor: "${getColor}",
                fillOpacity: 0.7,
                strokeColor: "#666666",
                strokeWidth: 1,
                strokeOpacity: 1,
                graphicZIndex: 1
            }, {
                context: context
            }),
            'select' : new OpenLayers.Style({
                pointRadius: 5,
                fillColor: "#ffff00",
                fillOpacity: 1,
                strokeColor: "#666666",
                strokeWidth: 1,
                strokeOpacity: 1,
                graphicZIndex: 2
            })
        });

        agiv_layer.events.on({"featureselected": showInformation});

        updateGeneralInformation();

    })();
    */

}
