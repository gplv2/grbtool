/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";

$( document ).ready( function() {
    /*
    var vectorLayer = new ol.source.Vector({
      url: 'http://traffic.byteless.net/trafficgeo.json',
      format: new ol.format.GeoJSON(),
      projection: 'EPSG:3857'
    });

    var vectorLayer = new ol.layer.Vector({
       title: 'Traffic layer',
       source: new ol.source.GeoJSON ({
                url: 'http://traffic.byteless.net/trafficgeo.json',
                //defaultProjection: 'EPSG:4326',
                projection: 'EPSG:3857'
       })
    });
    */

    var vectorLayer = new ol.layer.Vector( {
        title: 'Traffic layer',
        source: new ol.source.Vector( {
            url: '//traffic.byteless.net/trafficgeo.json',
            format: new ol.format.GeoJSON( {
                defaultDataProjection: 'EPSG:4326',
                projection: 'EPSG:3857'
            } )
        } )
    } );


    var geo_format = new ol.format.GeoJSON( {
        defaultDataProjection: 'EPSG:4326',
        projection: 'EPSG:3857'
    } );

    var vectorSource = new ol.source.Vector( {
        format: geo_format,
        url: function( extent ) {
            return '//testapi.byteless.net/api/cell?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsImlzcyI6Imh0dHBzOlwvXC90ZXN0YXBpLmJ5dGVsZXNzLm5ldFwvYXBpXC9hdXRoXC9sb2dpbiIsImlhdCI6MTQ3NjcwMjg1MCwiZXhwIjoxNDg0NDQyODUwLCJuYmYiOjE0NzY3MDI4NTAsImp0aSI6ImNhNTlmNTQ4ZTMwNzU3OWNiZGM3OWQyZjM5ZTZlZTc4In0.nElIuFMDmmMOl3IUOWbxFq7tZ-R21iT9NPexzveHAtE' + '&bbox=' + extent.join( ',' ) + '&srid=3857';
        },
        strategy: ol.loadingstrategy.bbox,
    } );

    // &bbox=423893.71236239,6652130.399613,426123.52379659,6652903.1301958",
    var cellLayer = new ol.layer.Vector( {
        title: 'Cell layer',
        source: vectorSource,
        style: new ol.style.Style( {
            stroke: new ol.style.Stroke( {
                color: 'rgba(0, 0, 255, 1.0)',
                width: 3
            } )
        } ),
        maxScale: 420,
        minScale: 80000
        //maxResolution   : getResolutionFromScale(30000,'max'),
    } );

    // defaultProjection :'EPSG:4326', projection: 'EPSG:3857'
    // console.log(vectorLayer);

    var carto = new ol.layer.Tile( {
        source: new ol.source.XYZ( {
            url: 'http://{1-4}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        } )
    } );

    var map = new ol.Map( {
        view: new ol.View( {
            center: ol.proj.transform( [ 4.4699, 50.5039 ], 'EPSG:4326', 'EPSG:3857' ),
            zoom: 12,
            maxZoom: 19,
            projection: 'EPSG:3857'
        } ),
        target: 'map',
        controls: ol.control.defaults( {
            attributionOptions: ( {
                collapsible: false
            } )
        } ).extend( [
            new ol.control.ZoomSlider(),
            new ol.control.Rotate(),
            new ol.control.OverviewMap(),
            new ol.control.ScaleLine(),
            //new ol.control.LayerSwitcher(),
            //new ol.control.FullScreen(),
            new ol.control.MousePosition( {
                coordinateFormat: ol.coordinate.createStringXY( 4 ),
                projection: 'EPSG:4326'
            } )
        ] ),
        // interactions and controls are seperate entities in ol3
        // we extend the default navigation with a hover select interaction
        interactions: ol.interaction.defaults().extend( [
            new ol.interaction.Select( {
                condition: ol.events.condition.mouseMove
            } )
        ] ),
        layers: [
            carto,
            vectorLayer,
            cellLayer
        ]
    } );
} );
