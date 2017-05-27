/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";

var lat = 51.111051691569;
var lon = 3.907685546875;
var zoomlevel = 12;

var map;
var vector_layer;
var track_layer;

var event_layer;
var overpass_layer;
var agiv_layer;
var osmInfo;
var layerswitcher;
var filterStrategy;
var streetStrategy;
var batchprotocol;
var buildingStrategy;
var mergeStrategy;
var parentFilter;
var newlayername='source-layer';
var isvecup = null;
var stuff = null;
var streetextents = null;

var laccelldata;


var token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsImlzcyI6Imh0dHBzOlwvXC90ZXN0YXBpLmJ5dGVsZXNzLm5ldFwvYXBpXC9hdXRoXC9sb2dpbiIsImlhdCI6MTQ3NjcwMjg1MCwiZXhwIjoxNDg0NDQyODUwLCJuYmYiOjE0NzY3MDI4NTAsImp0aSI6ImNhNTlmNTQ4ZTMwNzU3OWNiZGM3OWQyZjM5ZTZlZTc4In0.nElIuFMDmmMOl3IUOWbxFq7tZ-R21iT9NPexzveHAtE";

var overpassapi = "http://overpass-api.de/api/interpreter?data=";
var tile_url = "";

function initmap() {
    $('body').css('cursor', 'wait');

    // pink tile avoidance
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 2;

    var webmercator  = new OpenLayers.Projection("EPSG:3857");
    var geodetic     = new OpenLayers.Projection("EPSG:4326");
    var mercator     = new OpenLayers.Projection("EPSG:900913");
    var lambert     = new OpenLayers.Projection("EPSG:31370");
    //projection: "EPSG:31370",

      //$('#log').append('<div>Handler for .resize() called.</div>');
    var canvasheight=$('#map').parent().css('height');
    var canvaswidth=$('#map').parent().css('width');

    $('#map').css("height", canvasheight);
    $('#map').css("width", canvaswidth);

    //$('#left').css("height", canvasheight);
    //$('#right').css("height", canvasheight);

     $("#msg").html("Loading ...");
       layerswitcher = new OpenLayers.Control.LayerSwitcher();

       map = new OpenLayers.Map({
            div: "map",
            projection: mercator,
            displayProjection: geodetic,
            theme: null,
            controls: [
                new OpenLayers.Control.Attribution(),
                new OpenLayers.Control.Navigation({'zoomWheelEnabled': true}),
                new OpenLayers.Control.MousePosition(),
                new OpenLayers.Control.ScaleLine(),
                layerswitcher,
                //new OpenLayers.Control.PanZoomBar({ panIcons: false }),
                new OpenLayers.Control.Permalink(),                    
                new OpenLayers.Control.Zoom()
            ],
            units: 'm',
            allOverlays: false,
            //fractionalZoom: true,
            numZoomLevels: 20,

            layers: [
                new OpenLayers.Layer.OSM("OpenStreetMap", null, {
                  numZoomLevels: 20
                }),
            ]
        });

       var get_my_url = function (bounds) {
          //console.log(this.url);
          // console.log(this.map.getProjectionObject());
          var res = map.getResolution();
          var x = Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
          var y = Math.round ((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
          var z = this.map.getZoom();
          
         if(!x || !y || !z) {
            console.log(x + ' / ' + y + ' / ' + z);
         }

          // var bounds = map.getExtent();
          // bounds.transform(map.getProjectionObject(), geodetic);


          //var path = 'tile_' + z + "_" + x + "-" + y + "." + this.type; 
          var path = z + "/" + x + "/" + y + "." + this.type;
          //console.log(path);
          var url = this.url;
          if (url instanceof Array) {
             url = this.selectUrl(path, url);
          }
          return url + path;
       }

       var silentrefresh = new OpenLayers.Strategy.Refresh({force: true, active: false});
       var refresh = new OpenLayers.Strategy.Refresh({force: true, active: true});
       var boxStrategy = new OpenLayers.Strategy.BBOX({ratio: 2, resFactor: 2});

      batchprotocol = new OpenLayers.Protocol.HTTP({
            readWithPOST : true,
            // url: "http://grbtiles.byteless.net/cell.php?",
            url: "/api/batch?token="+ token,
            format: new OpenLayers.Format.GeoJSON({
               extractAttributes: true
            }),
            handleResponse : function(resp, options) {
               var request = resp.priv;
               if (options.callback) {
                  if (request.status >= 200 && request.status < 300) {
                     // success
                     if (resp.requestType != "delete") {
                        resp.features = this.parseFeatures(request);
                     }
                     console.log('success');
                     resp.code = OpenLayers.Protocol.Response.SUCCESS;
                  } else {
                     // failure
                     resp.code = OpenLayers.Protocol.Response.FAILURE;
                     console.log('failed');
                     $("#msg").html("Please enter valid csv data");
                  }
                  options.callback.call(options.scope, resp);
               }
            //me.updateData(resp.features);
          }
      });

       track_layer = new OpenLayers.Layer.Vector('Track layer', {
            styleMap: vectorlayer_style,
            strategies: [new OpenLayers.Strategy.Fixed(), silentrefresh],
            reportError: true,
            // attribution: "Data &copy; OpenCellID database CC-BY-SA 3.0",
            //maxScale: 420,
            //minScale: 6772,
            //minScale: 80000,
            //maxResolution: map.getResolutionForZoom(15),
            //zoomOffset: 9, resolutions: [152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135],
            //zoomOffset: 10, resolutions: [76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135],
            protocol: batchprotocol,
            projection: mercator,
            //displayProjection: mercator
            isBaseLayer: false
         });


       vector_layer = new OpenLayers.Layer.Vector('OpenCellDB - Base', {
            styleMap: vectorlayer_style,
            strategies: [ boxStrategy, refresh ],
            attribution: "Data &copy; OpenCellID database CC-BY-SA 3.0",
            maxScale: 420,
            //minScale: 6772,
            minScale: 80000,
            //maxResolution: map.getResolutionForZoom(15),
            //zoomOffset: 9, resolutions: [152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135],
            //zoomOffset: 10, resolutions: [76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135],
            protocol: new OpenLayers.Protocol.HTTP({
                   // url: "http://grbtiles.byteless.net/cell.php?",
                   url: "/api/cell?token="+ token + '&',
                   format: new OpenLayers.Format.GeoJSON({
                     extractAttributes: true
                })
            }),
            projection: mercator,
            //displayProjection: mercator
            isBaseLayer: false
         });

         vector_layer.events.register("loadend", vector_layer, function() {
            if (!vector_layer.features.length) {
               console.log('zoom in for details');
            } else {
                var mnccounters= {};
                var radiocounters= {};

                // counts[array[i]] = (counts[array[i]] + 1) || 1;

                $.each(vector_layer.features, function(i, feature) {
                   mnccounters[feature.attributes.mnc] =  ( mnccounters[feature.attributes.mnc] +1 ) || 1;
                   radiocounters[feature.attributes['gsm:radio']] = ( radiocounters[feature.attributes['gsm:radio']] +1 ) || 1;
                });
                $('#mapinfo').empty();
                $('#radioinfo').empty();

                // console.log(radiocounters);
                var stats = "<dl class=\"dl-horizontal\">";
                $.each(mnccounters, function(i, counter) {
                    stats += "<dt>" + i +"</dt><dd>" + counter + "</dd>";
                });
                stats += "</dl>";
                $('#operatorinfo').html(stats);

                var radios = "<dl class=\"dl-horizontal\">";
                $.each(radiocounters, function(i, counter) {
                    radios += "<dt>" + i +"</dt><dd>" + counter + "</dd>";
                });
                radios += "</dl>";
                $('#radioinfo').html(radios);
	    	    //vector_layer.features.length
                // console.log(this);
            }
         });

        track_layer.setVisibility(false);

        map.addLayer(vector_layer);
        map.addLayer(track_layer);

        // track_layer.events.on({"loadend": function(e){console.log(e)}});

        track_layer.events.register("loadend", track_layer, function(event) {
            var bounds = track_layer.getDataExtent();
            if(bounds !== null && bounds !== undefined) {
               bounds.extend(bounds);
            }

            if(bounds !== null && bounds !== undefined) {
               map.panTo(bounds.getCenterLonLat());
               map.zoomToExtent(bounds, true);
            }

            if (!track_layer.features.length) {
               console.log('zoom in for details');
            } else {
                var mnccounters= {};
                var radiocounters= {};

                // counts[array[i]] = (counts[array[i]] + 1) || 1;

                $.each(track_layer.features, function(i, feature) {
                   mnccounters[feature.attributes.mnc] =  ( mnccounters[feature.attributes.mnc] +1 ) || 1;
                   radiocounters[feature.attributes['gsm:radio']] = ( radiocounters[feature.attributes['gsm:radio']] +1 ) || 1;
                });

                $('#mapinfo').empty();
                $('#radioinfo').empty();

                // console.log(radiocounters);
                var stats = "<dl class=\"dl-horizontal\">";
                $.each(mnccounters, function(i, counter) {
                    stats += "<dt>" + i +"</dt><dd>" + counter + "</dd>";
                });
                stats += "</dl>";
                $('#operatorinfo').html(stats);

                var radios = "<dl class=\"dl-horizontal\">";
                $.each(radiocounters, function(i, counter) {
                    radios += "<dt>" + i +"</dt><dd>" + counter + "</dd>";
                });
                radios += "</dl>";
                $('#radioinfo').html(radios);
	    	       //track_layer.features.length
                // console.log(this);
            }
        });

        map.setLayerIndex(vector_layer, 1);
        map.setLayerIndex(track_layer, 2);

         var cdark_all = new OpenLayers.Layer.XYZ(
            "Carto basemap Dark",
            [
            'http://1.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png',
            'http://2.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png',
            'http://3.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png',
            'http://4.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png',
            ],
            {
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
               numZoomLevels: 20,
               //projection: geodetic,
                //projection: 'EPSG:3857',
               //displayProjection: mercator
                strategies: [ new OpenLayers.Strategy.BBOX({ratio: 2, resFactor: 2})], 
                tiled: true,
                isBaseLayer: true,
                visibility: false
            }
        );

         var clight_all = new OpenLayers.Layer.XYZ(
            "Carto basemap Light",
            [
            'http://1.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png',
            'http://2.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png',
            'http://3.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png',
            'http://4.basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png',
            ],
            {
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
               numZoomLevels: 20,
               //projection: geodetic,
                //projection: 'EPSG:3857',
               //displayProjection: mercator
                strategies: [ new OpenLayers.Strategy.BBOX({ratio: 2, resFactor: 2})], 
                tiled: true,
                isBaseLayer: true,
                visibility: false
            }
        );
        map.addLayer(clight_all);
        map.addLayer(cdark_all);

        map.setLayerIndex(clight_all, 2);
        map.setLayerIndex(cdark_all, 3);

        var osmlayer = map.getLayersByName('OpenStreetMap')[0];
        map.raiseLayer(osmlayer, map.layers.length);

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

       var lonLat = new OpenLayers.LonLat(lon, lat).transform(geodetic, map.getProjectionObject());
       map.setCenter (lonLat, zoomlevel);

       map.events.register('zoomend', this, function (event) {
               var bounds = map.getExtent();
               bounds.transform(map.getProjectionObject(), geodetic);
               var center = bounds.getCenterLonLat();
               var setObject = { 'lat': center.lat, 'lon': center.lon, 'zoom':  map.getZoom() };
               $('#msg').html("lat: " + center.lat + " lon: " + center.lon + " / Scale: " + map.getScale() + " / ZoomLevel: " + map.getZoom() + " / Resolution: " + map.getResolution());
       });

      $('#geocodebutton').click(function(event) {
            event.preventDefault();

            // Switch off the other layer
            vector_layer.setVisibility(false);    

            $('body').css('cursor', 'wait');
            var url= "/api/batch?token="+ token;
            // var laccelldata = encodeURIComponent($('#laccelldata').val());
            var laccelldata = $('#laccelldata').val();
            var linedata = $('#linedata').val();
/*
            if (laccelldata) {
               if (laccelldata.length > 0) {
                  url += "&laccelldata=" + laccelldata;
               }
            }

            batchprotocol.options.url = url;
*/
            if (laccelldata) {
               batchprotocol.options.params = { 
                  'laccelldata' : laccelldata ,
                  'linedata' : linedata ,
               };
               // console.log(batchprotocol);
            } else {
               $('#msg').removeClass().addClass("notice error");
               $("#msg").html("Please enter valid csv data");
               return false;
            }

            if (! track_layer.getVisibility()) {
               track_layer.setVisibility(true);
            } else {
               silentrefresh.refresh({force: true});
            }

            $('body').css('cursor', 'default');
      });


      $('body').css('cursor', 'default');
}

$( document ).ready(function() {
    // $("#msg").html("Action: DocReady");
    //console.log( "docready!" );

    $(function() {
        $('#msg').removeClass().addClass("notice info");
        $("#msg").html("Ready.");
/*
        $( "#refreshgrb" ).button().click(function( event ) {
            $('#msg').removeClass().addClass("notice info");
            via_layer.setVisibility(true);
            via_layer.refresh();
            event.preventDefault();
            return false; 
        });
*/
    });
    //$("#msg").html("Action: docReadydone");
});

jQuery.fn.encHTML = function () {
return this.each(function(){
   var me   = jQuery(this);
   var html = me.html();
   me.html(html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'));
   });
};

jQuery.fn.decHTML = function () {
return this.each(function(){
   var me   = jQuery(this);
   var html = me.html();
   me.html(html.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>'));
   });
};

jQuery.fn.isEncHTML = function (str) {
   if(str.search(/&amp;/g) != -1 || str.search(/&lt;/g) != -1 || str.search(/&gt;/g) != -1) {
      return true;
   } else {
      return false;
   }
};

function isEncHTML(str) {
   if(str.search(/&amp;/g) != -1 || str.search(/&lt;/g) != -1 || str.search(/&gt;/g) != -1) {
      return true;
   } else {
      return false;
   }
}

function decHTMLifEnc(str){
   if(isEncHTML(str)) {
      return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
   }
   return str;
}

function encHTML(str) {
   return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function strcmp (str1, str2) {
   // http://kevin.vanzonneveld.net
   // +   original by: Waldo Malqui Silva
   // +      input by: Steve Hilder
   // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
   // +    revised by: gorthaur
   // *     example 1: strcmp( 'waldo', 'owald' );
   // *     returns 1: 1
   // *     example 2: strcmp( 'owald', 'waldo' );
   // *     returns 2: -1
   return ((str1 == str2) ? 0 : ((str1 > str2) ? 1 : -1));
}

function toFixed(value, precision) {
    var power = Math.pow(10, precision || 0);
    return String(Math.round(value * power) / power);
}

/*

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
