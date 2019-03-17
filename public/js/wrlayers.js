/*jslint node: true, maxerr: 50, indent: 4 */

// vim: tabstop=4 softtabstop=4 shiftwidth=4 expandtab

"use strict";
var wr_layer;
var iswrup = null;
var stylemap = null;

// The function that gets called on feature selection. Shows information
// about the number of "ways" on the map.
//var updateAddressInfo = function() {
////var info = 'Currently ' + wr_layer.features.length + ' ways are shown on the map.';
//$( '#obj_info_ex' ).html( info );
//};

function loadwrlayer() {
    var postcode = $( '#postcode' ).val();

    var streets = {};

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
            ratio: 1,
            resFactor: 1
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

        var wselectCtrl = new OpenLayers.Control.SelectFeature( wr_layer, {
            clickout: true,
            toggle: false,
            multiple: true,
            hover: true,
            //box: true,
            toggleKey: "ctrlKey", // ctrl key removes from selection
            multipleKey: "shiftKey" // shift key adds to selection
        } );

        var highlightwr = new OpenLayers.Control.SelectFeature( wr_layer, {
            hover: true,
            //clickout: true,
            highlightOnly: true,
            //autoActivate:true,
            toggle: false,
            renderIntent: "temporary",
            eventListeners: {
                //featurehighlighted: updateAddressInfo
                featurehighlighted: onFeatureSelect2,
                featureunhighlighted: onFeatureUnselect2
            }
        } );

        map.addControl( highlightwr );
        highlightwr.activate();
        /* Enable highlighting  */
        map.addControl( wselectCtrl );
        wselectCtrl.activate();


        //selectCtrl.activate();
        // create selection lists

        function getdetails( attributes ) {
            var response = "<dl>";
            $.each( attributes, function( i, item ) {
                //var option = '<option value="'+ item.groupid +'">'+ imag + item.groupdesc +'</option>';
                // item.groupdesc, item.groupid));
                //$('#selgroupid').append(option);
                if ( strcmp( '_meta', i ) == 0 ) {
                    $.each( item, function( j, jtem ) {
                        response += "<dt>" + j + "</dt><dd>" + jtem + "</dd>";
                    } );
                } else {
                    if ( strcmp( 'way', i ) !== 0 && item.length !== 0 && strcmp( 'z_order', i ) !== 0 && strcmp( 'way_area', i ) !== 0 ) {
                        response += "<dt>" + i + "</dt><dd>" + item + "</dd>";
                        //console.log(response);
                    }
                }
            } );
            response += "</dl>";
            return response;
        }

        function onFeatureSelect2( event ) {
            //console.log("select feat");
            if ( !$( "#wrinfo" ).prop( "checked" ) ) {
                return true;
            }

            var feature = event.feature;
            if ( strcmp( 'Wegenregister data', feature.layer.name ) !== 0 ) {
                // Don't work on other layers
                return true;
            }

            //destroyPopups( event );

            // var content = "<h2>"+encHTML(feature.attributes.building) + "</h2>" + encHTML(feature.attributes.source);
            var featid = '';
            if ( feature.attributes.building ) {
                featid = feature.attributes.building;
            } else if ( feature.attributes.highway ) {
                featid = feature.attributes.highway;
            } else if ( feature.attributes.man_made ) {
                featid = feature.attributes.man_made;
            } else {
                featid = feature.attributes.oidn;
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

            $( '#obj_info_ex' ).html( getdetails( feature.attributes ) );

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

        function onFeatureUnselect2( event ) {
            //console.log("deselect feat");
            var feature = event.feature;
            if ( feature.popup ) {
                map.removePopup( feature.popup );
                feature.popup.destroy();
                delete feature.popup;
            }
        }


        wr_layer.events.on( {
            "featuresadded": function() {
                $( "#msg" ).html( "Info : " + "Loaded WR data layer" ).removeClass().addClass( "notice success" );
            },
            "featureselected": onFeatureSelect2,
            "featureunselected": onFeatureUnselect2
            /*
                        "featuresadded": function() {
                            // $("#msg").html("Info : "+ "Loaded GRB import layer").removeClass().addClass("notice success");
                        }
            */
        } );

        wr_layer.events.register( 'loadend', this, onloadwrend );

        /* popup handling functions */
        /*
                function onPopupClose( evt ) {
                    highlightwr.unselectAll();
                }
                function destroyPopups( event ) {
                    while ( map.popups.length ) {
                        map.removePopup( map.popups[ 0 ] );
                    }
                }
        */

        map.addLayer( wr_layer );
        wr_layer.setVisibility( false );

        //map.addControl( highlightwr );
        //highlightwr.activate();


        function getpostalcode() {
            $( 'body' ).css( 'cursor', 'progress' );
            //var url = '//nm1.bitless.be/reverse.php?format=json&lon='+ lon + '&lat=' + lat + '&zoom=18&addressdetails=1&accept-language=nl,en;q=0.8,fr;q=0.5';
            var geodetic = new OpenLayers.Projection( "EPSG:4326" );
            // var lonlat = map.getCenter();
            // map.getCenter().lat
            var lonlat = new OpenLayers.LonLat( map.getCenter().lon, map.getCenter().lat );
            lonlat.transform( map.getProjectionObject(), geodetic );
            var url = '//nominatim.openstreetmap.org/reverse.php?format=json&lon=' + lonlat.lon + '&lat=' + lonlat.lat + '&zoom=18&addressdetails=1&accept-language=nl,en;q=0.8,fr;q=0.5';
            $( "#notes" ).html( "Reverse geocoding coordinates : " + toFixed( lonlat.lat, 6 ) + " N, " + toFixed( lonlat.lon, 6 ) + " E" ).removeClass().addClass( "notice success" );
            lon = toFixed( lonlat.lon, 6 );
            lat = toFixed( lonlat.lat, 6 );

            if ( ( lat !== null && lat !== undefined && lat != 0 ) && ( lon !== null && lon !== undefined && lon != 0 ) ) {
                var geocode = ( function() {
                    var geocode = null;
                    $.ajax( {
                        data: {
                            format: "json",
                            lat: lat,
                            lon: lon
                        },
                        'async': true,
                        'global': false,
                        'url': url,
                        'dataType': "json",
                        'success': function( data ) {
                            geocode = data;

                            var road = '';
                            var housenumber = '';
                            var postcode = '';
                            var city = '';
                            //var obj = jQuery.parseJSON(mdata);
                            //if (obj.length<=0)
                            //$('#msg').removeClass().addClass("notice info").html("Result: No results found with these search options");
                            /*
			if(geocode.address.road !== null && geocode.address.road !== undefined) {
                       	road = geocode.address.road + ' ';
                       	}
                       	if(geocode.address.housenumber !== null && geocode.address.housenumber !== undefined) {
                       	housenumber = geocode.address.housenumber + ', ';
                       	}
                       	if(geocode.address.postcode !== null && geocode.address.postcode !== undefined) {
                       	postcode = geocode.address.postcode +' ';
                       	}
                       	if(geocode.address.city !== null && geocode.address.city !== undefined) {
                       	city = geocode.address.city;
                       	}
                        */
                            if ( geocode.address.postcode !== null && geocode.address.postcode !== undefined ) {
                                /* we got the postal code for this region, try to load crab streets */
                                $( '#postcode' ).val( geocode.address.postcode );
                            } else {
                                $( '#msg' ).removeClass().addClass( "notice info" ).html( "Result: Cannot find the postcode back using nominatimm try to move the map a bit." );
                                $( '#postcode' ).empty();
                            }

                            //var geoaddress = road + housenumber + postcode + city;
                            $( 'body' ).css( 'cursor', 'default' );
                            //console.log(geoaddress);
                            return geocode;
                        },
                        statusCode: {
                            404: function() {
                                $( '#msg' ).removeClass().addClass( "notice error" ).html( "Error: Problem with reverse nominatim geocoding service (404)" );
                            }
                        }
                    } );
                } )();
            }
            $( 'body' ).css( 'cursor', 'default' );
        }


        function onloadwrend( evt ) {
            //console.log("loaded iwr layer");
            // iswrup = null; Always do this now
            iswrup = null;
            if ( iswrup == null || iswrup == undefined ) {
                // if(stuff !== null && stuff !== undefined)
                // console.log(poilayer);
                getpostalcode();
            }
            /*
                        var bounds = wr_layer.getDataExtent();

                        if ( bounds !== null && bounds !== undefined ) {
                            map.panTo( bounds.getCenterLonLat() );
                            //map.zoomToExtent(bounds, true);
                        }
            */
        }
        //console.log(poilayer.features);


        iswrup = true;
    }
}
