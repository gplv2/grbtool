/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";
var wr_layer;
var iswrup = null;
var stylemap = null;

var webmercator = new OpenLayers.Projection( "EPSG:3857" );
var geodetic = new OpenLayers.Projection( "EPSG:4326" );
var mercator = new OpenLayers.Projection( "EPSG:900913" );
var lambert = new OpenLayers.Projection( "EPSG:31370" );

// The function that gets called on feature selection. Shows information 
// about the number of "ways" on the map.
var updateAddressInfo = function() {
    var info = 'Currently ' + wr_layer.features.length + ' ways are shown on the map.';
    $( '#notes' ).html( info );
};

function loadwrlayer() {
    var postcode = $( '#postcode' ).val();

    var streets = { };
    if ( vector_layer == null || vector_layer == undefined ) {
        return false;
    }

    if ( postcode == null || postcode == undefined ) {
        return false;
    }

    if ( iswrup == null || iswrup == undefined ) {

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

        wr_layer = new OpenLayers.Layer.Vector( 'Wegenregister data', {
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
                url: "https://data.grbosm.site/wr?streets=" + JSON.stringify( Object.keys( streets ) ) + "&postcode=" + postcode,
                format: geojson_format
            } ),

            projection: mercator,
            //displayProjection: mercator
            isBaseLayer: false
        } );
        //map.setLayerIndex(grb_wms, 1);

        var highlightwr = new OpenLayers.Control.SelectFeature( wr_layer, {
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
        wr_layer.events.register( 'loadend', this, onloadwrend );

        map.addLayer( wr_layer );
        wr_layer.setVisibility( true );
        /* Enable highlighting  */
        map.addControl( highlightwr );
        highlightwr.activate();

        wr_layer.events.on( {
            "featuresadded": function() {
                // $("#msg").html("Info : "+ "Loaded CRAB import layer").removeClass().addClass("notice success");
            }
        } );

        function onloadwrend( evt ) {
            // iswrup = null; Always do this now
            iswrup = null;
            if ( iswrup == null || iswrup == undefined ) {
                // if(stuff !== null && stuff !== undefined) 
                // console.log(poilayer);
            }
            var bounds = vector_layer.getDataExtent();

            if ( bounds !== null && bounds !== undefined ) {
                map.panTo( bounds.getCenterLonLat() );
                //map.zoomToExtent(bounds, true);
            }
        }
        //console.log(poilayer.features);
        iswrup = true;
    }
}
