/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";

var lat = 51.111051691569;
var lon = 3.907685546875;

var zoomlevel = 12;

var map;
var vector_layer;
var refresh;
var searchprotocol;

var layerswitcher;

var isvecup = null;

var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsImlzcyI6Imh0dHBzOlwvXC90ZXN0YXBpLmJ5dGVsZXNzLm5ldFwvYXBpXC9hdXRoXC9sb2dpbiIsImlhdCI6MTQ3NjcwMjg1MCwiZXhwIjoxNDg0NDQyODUwLCJuYmYiOjE0NzY3MDI4NTAsImp0aSI6ImNhNTlmNTQ4ZTMwNzU3OWNiZGM3OWQyZjM5ZTZlZTc4In0.nElIuFMDmmMOl3IUOWbxFq7tZ-R21iT9NPexzveHAtE";

var overpassapi = "http://overpass-api.de/api/interpreter?data=";

function initmap() {
    $( 'body' ).css( 'cursor', 'wait' );
    // pink tile avoidance
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 2;

    webmercator = new OpenLayers.Projection( "EPSG:3857" );
    geodetic = new OpenLayers.Projection( "EPSG:4326" );
    mercator = new OpenLayers.Projection( "EPSG:900913" );
    lambert = new OpenLayers.Projection( "EPSG:31370" );

    //projection: "EPSG:31370",

    //$('#log').append('<div>Handler for .resize() called.</div>');
    var canvasheight = $( '#map' ).parent().css( 'height' );
    var canvaswidth = $( '#map' ).parent().css( 'width' );

    // Size the map for bootstrap container
    $( '#map' ).css( "height", canvasheight );
    $( '#map' ).css( "width", canvaswidth );

    //$('#left').css("height", canvasheight);
    //$('#right').css("height", canvasheight);

    $( "#msg" ).html( "Setting up map." );
    layerswitcher = new OpenLayers.Control.LayerSwitcher();

    map = new OpenLayers.Map( {
        div: "map",
        projection: mercator,
        displayProjection: geodetic,
        theme: null,
        controls: [
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.Navigation( {
                'zoomWheelEnabled': true
            } ),
            new OpenLayers.Control.MousePosition(),
            new OpenLayers.Control.ScaleLine(),
            layerswitcher,
            //new OpenLayers.Control.PanZoomBar({ panIcons: false }),
            //new OpenLayers.Control.Permalink(),                    
            new OpenLayers.Control.Zoom()
        ],
        units: 'm',
        allOverlays: false,
        //fractionalZoom: true,
        numZoomLevels: 19,

        layers: [
            new OpenLayers.Layer.OSM( "OpenStreetMap", null, {
                numZoomLevels: 19
            } ),
        ]
    } );

    var get_my_url = function( bounds ) {
        // console.log(this.url);
        // console.log(this.map.getProjectionObject());
        var res = map.getResolution();
        var x = Math.round( ( bounds.left - this.maxExtent.left ) / ( res * this.tileSize.w ) );
        var y = Math.round( ( this.maxExtent.top - bounds.top ) / ( res * this.tileSize.h ) );
        var z = this.map.getZoom();
        /* 
        if(!x || !y || !z) {
           console.log(x + ' / ' + y + ' / ' + z);
        }
        */

        // var bounds = map.getExtent();
        // bounds.transform(map.getProjectionObject(), geodetic);

        //var path = 'tile_' + z + "_" + x + "-" + y + "." + this.type; 
        var path = z + "/" + x + "/" + y + "." + this.type;
        //console.log(path);

        var url = this.url;
        if ( url instanceof Array ) {
            url = this.selectUrl( path, url );
        }
        return url + path;
    }

    refresh = new OpenLayers.Strategy.Refresh( {
        force: true,
        active: true
    } );
    // sboxStrategy = new OpenLayers.Strategy.BBOX({ratio: 2, resFactor: 2});
    searchprotocol = new OpenLayers.Protocol.HTTP( {
        // url: "http://grbtiles.byteless.net/cell.php?",
        url: "/api/cell?token=" + token + "&",
        format: new OpenLayers.Format.GeoJSON( {
            extractAttributes: true
        } )
    } );

    vector_layer = new OpenLayers.Layer.Vector( 'OpenCellDB - BE', {
        styleMap: vectorlayer_style,
        strategies: [ new OpenLayers.Strategy.Fixed(), refresh ],
        attribution: "Data &copy; OpenCellID database CC-BY-SA 3.0",
        //maxScale: 420,
        //minScale: 6772,
        //minScale: 80000,
        //maxResolution: map.getResolutionForZoom(15),
        //zoomOffset: 9, resolutions: [152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135],
        //zoomOffset: 10, resolutions: [76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135],
        protocol: searchprotocol,
        projection: mercator,
        //displayProjection: mercator
        isBaseLayer: false
    } );

    /*
          var selectCtrl = new OpenLayers.Control.SelectFeature(vector_layer,
             {  
                clickout: true ,
                toggle: false,
                multiple: true, hover: true,
                //box: true,
                toggleKey: "ctrlKey", // ctrl key removes from selection
                multipleKey: "shiftKey" // shift key adds to selection
             }
          );
    */

    var highlightvector = new OpenLayers.Control.SelectFeature( vector_layer, {
        clickout: true,
        hover: true,
        highlightOnly: true,
        //autoActivate:true,
        toggle: false,
        renderIntent: "temporary",
        eventListeners: {
            // featurehighlighted: report
            featurehighlighted: onFeatureSelect,
            featureunhighlighted: onFeatureUnselect
        }
    } );
    //map.addControl(selectCtrl);

    map.addControl( highlightvector );

    highlightvector.activate();


    vector_layer.events.on( {
        "featureselected": onFeatureSelect
        /*,
                "featuresadded": function() {
                   // $("#msg").html("Info : "+ "Loaded GRB import layer").removeClass().addClass("notice success");
                } */
    } );


    vector_layer.events.register( "loadend", vector_layer, function() {
        if ( !vector_layer.features.length ) {
            //console.log("No Cell's found.");
            $( '#msg' ).html( "No Cell's found. Please enter different parameters" );
        } else {
            var bounds = vector_layer.getDataExtent();
            /*
                         if(bounds !== null && bounds !== undefined) {
                                bounds.extend(bounds);
                            }
            */
            if ( bounds !== null && bounds !== undefined ) {
                map.panTo( bounds.getCenterLonLat() );
                map.zoomToExtent( bounds, true );
            }
            $( '#msg' ).html( vector_layer.features.length + " Cells found" );
        }
        // console.log(this);
    } );

    map.addLayer( vector_layer );
    map.setLayerIndex( vector_layer, 1 );

    var cdark_all = new OpenLayers.Layer.XYZ(
        "Carto basemap Dark", [
            'http://1.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png',
            'http://2.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png',
            'http://3.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png',
            'http://4.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png',
        ], {
            attribution: "Tiles &copy; <a href='http://mapbox.com/'>MapBox</a> | " +
                "Data &copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " +
                "and contributors, CC-BY-SA",
            sphericalMercator: true,
            wrapDateLine: true,
            transitionEffect: "resize",
            buffer: 1,
            type: 'png',
            layername: 'dark_all',
            //getURL: get_my_url,
            transparent: "false",
            numZoomLevels: 19,
            //projection: geodetic,
            //projection: 'EPSG:3857',
            //displayProjection: mercator
            strategies: [ new OpenLayers.Strategy.BBOX( {
                ratio: 2,
                resFactor: 2
            } ) ],
            tiled: true,
            isBaseLayer: true,
            visibility: false
        }
    );

    var clight_all = new OpenLayers.Layer.XYZ(
        "Carto basemap Light", [
            'http://1.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png',
            'http://2.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png',
            'http://3.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png',
            'http://4.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png',
        ], {
            attribution: "Tiles &copy; <a href='http://mapbox.com/'>MapBox</a> | " +
                "Data &copy; <a href='http://www.openstreetmap.org/'>OpenStreetMap</a> " +
                "and contributors, CC-BY-SA",
            sphericalMercator: true,
            wrapDateLine: true,
            // transitionEffect: "resize",
            // buffer: 1,
            type: 'png',
            layername: 'dark_all',
            //getURL: get_my_url,
            transparent: "false",
            numZoomLevels: 19,
            //projection: geodetic,
            //projection: 'EPSG:3857',
            //displayProjection: mercator
            strategies: [ new OpenLayers.Strategy.BBOX( {
                ratio: 2,
                resFactor: 2
            } ) ],
            tiled: true,
            isBaseLayer: true,
            visibility: false
        }
    );
    map.addLayer( clight_all );
    map.addLayer( cdark_all );

    map.setLayerIndex( clight_all, 2 );
    map.setLayerIndex( cdark_all, 3 );

    var osmlayer = map.getLayersByName( 'OpenStreetMap' )[ 0 ];
    map.raiseLayer( osmlayer, map.layers.length );

    // default lon + lat + zoom 
    /*
          var retrievedObject = JSON.parse(localStorage.getItem('defaultlocation'));
          if ( retrievedObject ) {
             // var setObject = { 'lat': center.lat, 'lon': center.lon, 'zoom':  map.getZoom() };
             // localStorage.setItem('defaultlocation', JSON.stringify(setObject) );
             var lonLat = new OpenLayers.LonLat(retrievedObject.lon, retrievedObject.lat).transform(geodetic, map.getProjectionObject());
             map.setCenter (lonLat, retrievedObject.zoom);

          } else {
             var lonLat = new OpenLayers.LonLat(lon, lat).transform(geodetic, map.getProjectionObject());
             map.setCenter (lonLat, zoom);
          }
    */

    var lonLat = new OpenLayers.LonLat( lon, lat ).transform( geodetic, map.getProjectionObject() );
    map.setCenter( lonLat, zoomlevel );

    map.events.register( 'zoomend', this, function( event ) {
        var bounds = map.getExtent();
        bounds.transform( map.getProjectionObject(), geodetic );
        var center = bounds.getCenterLonLat();
        var setObject = {
            'lat': center.lat,
            'lon': center.lon,
            'zoom': map.getZoom()
        };
        $( '#msg' ).html( "lat: " + center.lat + " lon: " + center.lon + " / Scale: " + map.getScale() + " / ZoomLevel: " + map.getZoom() + " / Resolution: " + map.getResolution() );
    } );

    $( '#searchbutton' ).click( function( event ) {
        event.preventDefault();
        $( 'body' ).css( 'cursor', 'wait' );
        var url = "/api/cell?token=" + token;
        var mnc = $( '#mnc' ).val();
        var mcc = $( '#mcc' ).val();
        var lac = $( '#lac' ).val();
        var cell = $( '#cellid' ).val();
        var details = $( '#details' ).val();

        if ( mnc ) {
            if ( mnc.length > 0 ) {
                url += "&mnc=" + mnc;
            }
        }
        if ( mcc ) {
            if ( mcc.length > 0 ) {
                url += "&mcc=" + mcc;
            }
        }

        if ( lac ) {
            if ( lac.length > 0 ) {
                url += "&lac=" + lac;
            }
        }

        if ( cell ) {
            if ( cell.length > 0 ) {
                url += "&cell=" + cell;
            }
        }

        if ( details ) {
            url += "&details=true";
        }

        // get the search box from the view this time (not using strategy)
        var sbox = map.getExtent().toBBOX();
        if ( sbox ) {
            url += "&sbox=" + sbox;
        }

        // console.log(url);

        searchprotocol.options.url = url;

        refresh.refresh( {
            force: true
        } );

        var bounds = vector_layer.getDataExtent();
        /*
                     if(bounds !== null && bounds !== undefined) {
                            bounds.extend(bounds);
                        }
                    if(bounds !== null && bounds !== undefined) {
                       map.panTo(bounds.getCenterLonLat());
                       map.zoomToExtent(bounds, true);
                    }
        */
        $( 'body' ).css( 'cursor', 'default' );
    } );

    $( 'body' ).css( 'cursor', 'default' );
}

$( document ).ready( function() {
    $( "#msg" ).html( "Action: Search is ready!" );
    //console.log( "docready!" );

    $( function() {
        $( '#msg' ).removeClass().addClass( "notice info" );
        $( "#msg" ).html( "Action: Init buttons" );
        /*
                $( "#refreshgrb" ).button().click(function( event ) {
                    $('#msg').removeClass().addClass("notice info");
                    via_layer.setVisibility(true);
                    via_layer.refresh();
                    event.preventDefault();
                    return false; 
                });
        */
    } );
    $( "#msg" ).html( "Action: docReadydone" );

} );

jQuery.fn.encHTML = function() {
    return this.each( function() {
        var me = jQuery( this );
        var html = me.html();
        me.html( html.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ) );
    } );
};

jQuery.fn.decHTML = function() {
    return this.each( function() {
        var me = jQuery( this );
        var html = me.html();
        me.html( html.replace( /&amp;/g, '&' ).replace( /&lt;/g, '<' ).replace( /&gt;/g, '>' ) );
    } );
};

jQuery.fn.isEncHTML = function( str ) {
    if ( str.search( /&amp;/g ) != -1 || str.search( /&lt;/g ) != -1 || str.search( /&gt;/g ) != -1 ) {
        return true;
    } else {
        return false;
    }
};

function isEncHTML( str ) {
    if ( str.search( /&amp;/g ) != -1 || str.search( /&lt;/g ) != -1 || str.search( /&gt;/g ) != -1 ) {
        return true;
    } else {
        return false;
    }
}

function decHTMLifEnc( str ) {
    if ( isEncHTML( str ) ) {
        return str.replace( /&amp;/g, '&' ).replace( /&lt;/g, '<' ).replace( /&gt;/g, '>' );
    }
    return str;
}

function encHTML( str ) {
    return str.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}

function strcmp( str1, str2 ) {
    // http://kevin.vanzonneveld.net
    // +   original by: Waldo Malqui Silva
    // +      input by: Steve Hilder
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: gorthaur
    // *     example 1: strcmp( 'waldo', 'owald' );
    // *     returns 1: 1
    // *     example 2: strcmp( 'owald', 'waldo' );
    // *     returns 2: -1
    return ( ( str1 == str2 ) ? 0 : ( ( str1 > str2 ) ? 1 : -1 ) );
}

function toFixed( value, precision ) {
    var power = Math.pow( 10, precision || 0 );
    return String( Math.round( value * power ) / power );
}

function getdetails( attributes ) {
    var response = "<dl class=\"dl-horizontal\">";
    $.each( attributes, function( i, item ) {
        //var option = '<option value="'+ item.groupid +'">'+ imag + item.groupdesc +'</option>';
        // item.groupdesc, item.groupid));
        //$('#selgroupid').append(option);
        if ( strcmp( 'way', i ) !== 0 && item.length !== 0 && strcmp( 'z_order', i ) !== 0 && strcmp( 'way_area', i ) !== 0 ) {
            response += "<dt>" + i + "</dt><dd>" + item + "</dd>";
            //console.log(response);
        }
    } );
    response += "</dl>";
    return response;
}

function onFeatureUnselect( event ) {
    highlightvector.unselectAll();
}

function onFeatureSelect( event ) {
    /*
    if ( !$( "#popupswitch" ).prop( "checked" ) ) {
       return true;
    }
    */

    var feature = event.feature;
    if ( strcmp( 'OpenCellDB - BE', feature.layer.name ) !== 0 ) {
        // Don't work on other layers
        return true;
    }

    // var content = "<h2>"+encHTML(feature.attributes.building) + "</h2>" + encHTML(feature.attributes.source);
    var featid = '';
    if ( feature.attributes.lac ) {
        featid = feature.attributes.lac;
    } else if ( feature.attributes.mcc ) {
        featid = feature.attributes.mcc;
    } else if ( feature.attributes.mnc ) {
        featid = feature.attributes.mnc;
    } else {
        featid = feature.attributes.mcc;
        //console.log(feature);
    }

    var content = '<div id="plopper"><fieldset>' + "<legend>" + encHTML( featid ) + '</legend>' +
        // '<li>' + encHTML(feature.attributes.description) 
        //+ "<li>Building : "+ feature.attributes.building +"</li>"
        //+ "<li>Source    : "+ feature.attributes.source +"</li>"
        getdetails( feature.attributes ) +
        // + "<li>Tijd server : "+ feature.attributes.server_time +"</li>"
        "</ul></fieldset></div>";
    //console.log(content);

    $( '#cellinfo' ).html( getdetails( feature.attributes ) );

    /*
             var popup = new OpenLayers.Popup.FramedCloud("chicken",
                feature.geometry.getBounds().getCenterLonLat(),
                new OpenLayers.Size(200,200),
                content,
                null, true, onPopupClose);

             feature.popup = popup;
             popup.closeOnMove = false;

             map.addPopup(popup);
    */
    /* TODO disable flickering */
}

jQuery.fn.encHTML = function() {
    return this.each( function() {
        var me = jQuery( this );
        var html = me.html();
        me.html( html.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' ) );
    } );
};

jQuery.fn.decHTML = function() {
    return this.each( function() {
        var me = jQuery( this );
        var html = me.html();
        me.html( html.replace( /&amp;/g, '&' ).replace( /&lt;/g, '<' ).replace( /&gt;/g, '>' ) );
    } );
};

jQuery.fn.isEncHTML = function( str ) {
    if ( str.search( /&amp;/g ) != -1 || str.search( /&lt;/g ) != -1 || str.search( /&gt;/g ) != -1 ) {
        return true;
    } else {
        return false;
    }
};

function isEncHTML( str ) {
    if ( str.search( /&amp;/g ) != -1 || str.search( /&lt;/g ) != -1 || str.search( /&gt;/g ) != -1 ) {
        return true;
    } else {
        return false;
    }
}

function decHTMLifEnc( str ) {
    if ( isEncHTML( str ) ) {
        return str.replace( /&amp;/g, '&' ).replace( /&lt;/g, '<' ).replace( /&gt;/g, '>' );
    }
    return str;
}

function encHTML( str ) {
    return str.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}


/*
  var stuff = null;

  var url = "/stuff.php?account="+ accountname + "&r="+Math.random();

    stuff = (function () {
        var stuff = null;
        $.ajax({
            'async': true,
            'global': false,
            'url': url,
            'dataType': "json",
            'success': function (data) {
            stuff = data;
            }
            });
        //console.log(stuff);
        return stuff;
        })();

*/