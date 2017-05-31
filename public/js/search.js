/*jslint node: true */
"use strict";

var geocoder = null;
var refresh_poi = null;

$( document ).ready( function() {
    $.ajaxSetup( {
        cache: false,
        type: "GET"
    } );

    $( '#address' ).focus( function() {
        $( '#address' ).val( '' );
    } );

    $( "#idtagadd" ).dblclick( function( event ) {
        event.preventDefault();
        $( 'body' ).css( 'cursor', 'progress' );
        // event.preventDefault();
        // $('#okfilt').click();
        var lat = $( '#idtaglat' ).val();
        var lon = $( '#idtaglon' ).val();
        var address = $( '#idtagadd' ).val();
        //var url = 'http://nm1.bitless.be/reverse.php?format=json&lon='+ lon + '&lat=' + lat + '&zoom=18&addressdetails=1&accept-language=nl,en;q=0.8,fr;q=0.5';
        var url = 'http://nominatim.openstreetmap.org/reverse.php?format=json&lon=' + lon + '&lat=' + lat + '&zoom=18&addressdetails=1&accept-language=nl,en;q=0.8,fr;q=0.5';

        if ( ( lat !== null && lat !== undefined && lat != 0 ) && ( lon !== null && lon !== undefined && lon != 0 ) ) {
            if ( address.length <= 0 ) {
                // console.log(event);
                geocode = ( function() {
                    var geocode = null;
                    $.ajax( {
                        'async': true,
                        'global': false,
                        'url': url,
                        'dataType': "json",
                        'success': function( data ) {
                            geocode = data;
                        }
                    } );
                    var road = '';
                    var housenumber = '';
                    var postcode = '';
                    var city = '';
                    if ( geocode.address.road !== null && geocode.address.road !== undefined ) {
                        road = geocode.address.road + ' ';
                    }
                    if ( geocode.address.housenumber !== null && geocode.address.housenumber !== undefined ) {
                        housenumber = geocode.address.housenumber + ', ';
                    }
                    if ( geocode.address.postcode !== null && geocode.address.postcode !== undefined ) {
                        postcode = geocode.address.postcode + ' ';
                    }
                    if ( geocode.address.city !== null && geocode.address.city !== undefined ) {
                        city = geocode.address.city;
                    }

                    var geoaddress = road + housenumber + postcode + city;
                    $( '#idtagadd' ).val( geoaddress );
                    $( 'body' ).css( 'cursor', 'default' );
                    // console.log(geocode);
                    return geocode;
                } )();
            }
        }
        $( 'body' ).css( 'cursor', 'default' );
    } );

    $( "#idtagadd" ).keydown( function( event ) {
        if ( event.which == 13 ) {
            $( "#idtagadd" ).dblclick();
            //$('#okfilt').click();
            // console.log(event);
        }
    } );

    $( "#crabdata" ).click( function( event ) {
        event.preventDefault();
        $( 'body' ).css( 'cursor', 'progress' );
        // event.preventDefault();
        //var url = 'http://nm1.bitless.be/reverse.php?format=json&lon='+ lon + '&lat=' + lat + '&zoom=18&addressdetails=1&accept-language=nl,en;q=0.8,fr;q=0.5';
        var url = 'http://nominatim.openstreetmap.org/reverse.php?format=json&lon=' + lon + '&lat=' + lat + '&zoom=18&addressdetails=1&accept-language=nl,en;q=0.8,fr;q=0.5';
        var geodetic = new OpenLayers.Projection( "EPSG:4326" );
        // var lonlat = map.getCenter();
        // map.getCenter().lat
        var lonlat = new OpenLayers.LonLat( map.getCenter().lon, map.getCenter().lat );
        lonlat.transform( map.getProjectionObject(), geodetic );
        $( "#msg" ).html( "Reverse geocoding coordinates : " + toFixed( lonlat.lat, 6 ) + " N, " + toFixed( lonlat.lon, 6 ) + " E" ).removeClass().addClass( "notice success" );
        lon = toFixed( lonlat.lon, 6 );
        lat = toFixed( lonlat.lat, 6 );

        if ( ( lat !== null && lat !== undefined && lat != 0 ) && ( lon !== null && lon !== undefined && lon != 0 ) ) {
            // console.log(event);
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
    } );

    $( function() {
        var geoCodeURL = "proxy/search.php?format=json&accept-language=nl,en;q=0.8,fr;q=0.5";
        //var revgeoCodeURL = "proxy/reverse.php?format=json&accept-language=nl,en;q=0.8,fr;&lat=%s&lon=%s&zoom=18&addressdetails=1";
        /*
        {"place_id":"141544983","licence":"Data © OpenStreetMap contributors, ODbL 1.0. http:\/\/www.openstreetmap.org\/copyright","osm_type":"way","osm_id":"353022756","lat":"51.02122585","lon":"4.49124251666685","display_name":"12, Aambeeldstraat, Mechelen, Antwerpen, Vlaanderen, 2800, België","address":{"house_number":"12","road":"Aambeeldstraat","city_district":"Mechelen","town":"Mechelen","county":"Mechelen","state":"Vlaanderen","postcode":"2800","country":"België","country_code":"be"},"boundingbox":["51.0211772","51.0212744","4.4911865","4.4912986"]}
        */
        // var data = null;

        // $('#sgoogle').button();
        // $('#geosearch').append('<input class="ui-button ui-state-default ColVis_Button" type="button" name="clearsearch" value="X" id="clssearch" title="Wissen zoekbox" />');
        // $('#geosearch').append('<div style="margin-left: 10px; font-size: 1.0em;" class="postit" id="geolog"></div>');
        // $('#geolog').empty();

        $( "#address" ).autocomplete( {
            source: function( request, response ) {
                var google = $( '#sgoogle' ).attr( 'checked' );

                if ( google !== null && google !== undefined ) {
                    // var loc = new OpenLayers.LonLat(point.x,point.y);
                    // map.setCenter(loc,3);
                    geocoder.geocode( {
                        'address': request.term
                    }, function( results, status ) {
                        $( '#address' ).removeClass( 'ui-autocomplete-loading' );
                        // console.log(status)
                        if ( status == 'OK' ) {
                            // console.log(results)
                            // var loc = new OpenLayers.LonLat(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                            // map.setCenter(loc, 3);
                            response( $.map( results, function( item ) {
                                return {
                                    label: item.formatted_address,
                                    value: item.formatted_address,
                                    lat: item.geometry.location.d,
                                    lon: item.geometry.location.e
                                }
                            } ) );
                        } else {
                            // console.log(status);
                            if ( status == 'ZERO_RESULTS' ) {
                                $( '#msg' ).removeClass().addClass( "notice info" ).html( "Result: No results found with these search options" );
                                // $('#geolog').html("Geen resultaten gevonden met deze zoekopties.");
                            }
                            return [];
                        }
                    } );
                } else {
                    $.ajax( {
                        url: geoCodeURL,
                        data: {
                            format: "json",
                            q: request.term
                        },
                        success: function( mdata ) {
                            var obj = jQuery.parseJSON( mdata );
                            // var data = obj.pop();
                            $( '#address' ).removeClass( 'ui-autocomplete-loading' );
                            // console.log(data); return true;

                            if ( obj.length <= 0 ) {
                                $( '#msg' ).removeClass().addClass( "notice info" ).html( "Result: No results found with these search options" );
                                //$('#geolog').html("Geen resultaten gevonden met deze zoekopties.");
                            }
                            // console.log(data);
                            var rdata = $.makeArray( obj );
                            console.log( rdata );
                            response( $.map( rdata, function( item ) {
                                return {
                                    label: item.display_name,
                                    value: item.display_name,
                                    lat: item.lat,
                                    lon: item.lon
                                }
                            } ) );
                        },
                        statusCode: {
                            404: function() {
                                $( '#msg' ).removeClass().addClass( "notice error" ).html( "Error: Problem with external geocoding service" );
                                //$('#geolog').html("Probleem met externe geocoder dienst.");
                            }
                        }
                    } );
                }
            },
            minLength: 4,
            delay: 500,
            select: function( event, ui ) {
                $( '#address' ).removeClass( 'ui-autocomplete-loading' );
                // console.log(ui.item);
                // console.log(event);
                var epsg4326 = new OpenLayers.Projection( 'EPSG:4326' );
                //var epsg900913 = new OpenLayers.Projection('EPSG:900913');

                var layer_style = OpenLayers.Util.extend( {}, OpenLayers.Feature.Vector.style[ 'default' ] );
                var style_blue;

                style_blue = OpenLayers.Util.extend( {}, layer_style );
                style_blue.strokeColor = "blue";
                style_blue.fillColor = "blue";
                style_blue.graphicName = "star";
                style_blue.pointRadius = 10;
                style_blue.strokeWidth = 3;
                style_blue.rotation = 45;
                style_blue.strokeLinecap = "butt";

                // $('#idtagname').val(ui.item.label.substr(0, 10));
                // $('#idtagadd').val(ui.item.label);
                map.setCenter(
                    new OpenLayers.LonLat( ui.item.lon, ui.item.lat ).transform(
                        epsg4326,
                        map.getProjectionObject()
                    ), 17 );

                if ( ( ui.item.lat !== null && ui.item.lat !== undefined && ui.item.lat != 0 ) && ( ui.item.lon !== null && ui.item.lon !== undefined && ui.item.lon != 0 ) ) {
                    // console.log("START");

                    var llat = ui.item.lat;
                    var llon = ui.item.lon;
                    //$('#idtaglon').val(llon);
                    //$('#idtaglat').val(llat);

                    var templabel = ui.item.label;
                    var lonlat = new OpenLayers.LonLat( llon, llat );
                    //console.log(lonlat);
                    lonlat.transform( epsg4326, map.getProjectionObject() );
                    //console.log(lonlat);
                    var point = new OpenLayers.Geometry.Point( lonlat.lat, lonlat.lon );
                    //console.log(point);
                    var pointFeature = new OpenLayers.Feature.Vector( point, null, style_blue );
                    //console.log(pointFeature);
                    //var pointFeature = new OpenLayers.Feature.Vector(point);
                    // create a point feature
                    pointFeature.attributes = {
                        name: templabel,
                        lon: llon,
                        lat: llat,
                        align: "cm"
                    };
                    //editlayer.addFeatures([pointFeature]);
                    //editlayer.redraw();
                    // console.log("END");
                    return true;
                }
            },
            open: function() {
                // console.log(this);
                var offset = $( '#address' ).offset();
                var height = $( '#address' ).height();
                // console.log(mybottom);
                // console.log(mytop);
                $( '.ui-autocomplete' ).css( 'top', offset.top + height );
                $( '.ui-autocomplete' ).css( 'left', offset.left );
                $( '.ui-autocomplete' ).css( 'z-index', 9999 );
                $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
            },
            close: function() {
                //console.log(this);
                $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
            }
        } );

        $( '#clssearch' ).click( function() {
            $( '#address' ).removeClass( 'ui-autocomplete-loading' );
            //$('#geolog').empty();
            $( '#address' ).val( '' );
            return true;
        } );
    } );

    //var bounds = new OpenLayers.Bounds (3.54635, 49.94169, 5.47995, 51.53569);
    geocoder = new google.maps.Geocoder();

    // map.addControl(geocoder);
    /*
        var gsat = new OpenLayers.Layer.Google(
                    "Google Satellite",
                    {type: G_SATELLITE_MAP}
                );
       map.addLayers([gsat]);
    */

    // map.zoomToExtent(bounds);
} );