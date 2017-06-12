/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";
var tcontext = {
    getColor: function( feature ) {
        if ( feature.layer[ 'name' ] == "Wegenregister data" ) {
            //console.log(feature); 
            //$.each(vector_layer.features, function(i, item) 
            if ( feature.attributes[ '_meta'] ) {
                var cat = feature.attributes[ '_meta']['WEGCAT'];
                //console.log(cat);
                switch(cat) {
                    case '-8':
                        // unknown road
                        return 'orange';
                        break;
                    case 'L2':
                        return 'yellow';
                        break;
                    case 'S3':
                        return 'orange';
                        break;
                    case 'PII-4':
                        return 'green';
                        break;
                    case 'H':
                        return 'green';
                        break;
                    default:
                        return 'blue';
                } 
            }   
        } else if ( feature.layer[ 'name' ] == "CRAB - Addresses" ) {
            if ( feature.attributes[ 'house_nrs' ] == 'EVENTS' ) {
                return "red";
            } else if ( feature.attributes[ 'category' ] == 'WORKS' ) {
                return "orange";
            } else {
                return "green";
            }
        }
    },
    /*
             getSize: function(feature) {
                return feature.attributes["type"] / map.getResolution() * .703125;
             }
    */
    getLabel: function( feature ) {
        if ( feature.layer[ 'name' ] == "CRAB - Addresses" ) {
            var is_muted = $('#mute_crab_labels').prop('checked');
            if (is_muted) {
                return '';
            }
            //console.log( feature );
            //$.each(feature , function(i, item) 
            var label = '';
            if ( feature.attributes[ 'sname' ] ) {
                label += feature.attributes[ 'sname' ];
            }
            if ( feature.attributes[ 'house_nr' ] ) {
                $.each( feature.attributes[ 'house_nr' ], function( i, item ) {
                    label += ' ' + item;
                } );
            }
            if ( feature.attributes[ 'bus_nr' ] ) {
                label += ' ( ';
                $.each( feature.attributes[ 'bus_nr' ], function( i, item ) {
                    label += ' ' + item;
                } );
                label += ' )';
            } else if ( feature.attributes[ 'app_nr' ] ) {
                label += ' ( ';
                $.each( feature.attributes[ 'app_nr' ], function( i, item ) {
                    label += ' ' + item;
                } );
                label += ' )';
            }
            return label;
        } else if ( feature.layer[ 'name' ] == "Wegenregister data" ) {
            var is_muted = $('#mute_wr_labels').prop('checked');
            if (is_muted) {
                return '';
            }
            //console.log( feature );
            //$.each(feature , function(i, item) 
            var label = '';
            if ( feature.attributes[ 'name:left' ] == feature.attributes[ 'name:right' ] ) {
                label = feature.attributes[ 'name:right' ];
            } else if ( feature.attributes[ 'name:right' ] && feature.attributes[ 'name:right' ].length ) {
                label = feature.attributes[ 'name:right' ];
            } else if ( feature.attributes[ 'name:left' ] && feature.attributes[ 'name:left' ].length ) {
                label = feature.attributes[ 'name:left' ];
            } else {
                label = '';
            }
            if (!label) {
                return '';
            } else {
                return label;
            }
        }
    },
    getWidth: function( feature ) {
        if ( feature.layer[ 'name' ] == "CRAB - Addresses" ) {
            return 1;
        } else if ( feature.layer[ 'name' ] == "Wegenregister data" ) {
            //console.log(feature.attributes[ '_meta' ]);
            if ( feature.attributes[ '_meta'] ) {
                var cat = feature.attributes[ '_meta']['WEGCAT'];
                //console.log(cat);
                switch(cat) {
                    case '-8':
                        // unknown road
                        return 2;
                        break;
                    case 'L2':
                        return 3;
                        break;
                    case 'S3':
                        return 5;
                        break;
                    case 'PII-4':
                        return 6;
                        break;
                    case 'H':
                        return 7;
                        break;
                    default:
                        return 3;
                } 
            }   
        }
    }
};

//$(document).ready(function () {
var event_styled = new OpenLayers.Style( {
    //fillColor: "${getColor}", // using context.getColor(feature)
    fillColor: "white",
    pointRadius: 2,
    fontWeight: "normal",
    //fontColor: "#000000",
    // fontSize: "1px",
    strokeColor: "red",
    strokeWidth: "2",
    pointerEvents: "all",
    fillOpacity: 0.6,
    cursor: "pointer",
    //label: "${house_nrs}",
    //label: "${getLabel}",
    labelOutlineColor: "white",
    labelOutlineWidth: 3,
    fontFamily: "sans-serif"
    //fontFamily: "Courier New, monospace"
}, {
    context: tcontext
} );

/* Hover/select style */
var event_temp_styled = new OpenLayers.Style( {
    fillColor: "white",
    strokeColor: "#ff9933",
    strokeWidth: 3,
    pointerEvents: "all",
    fillOpacity: 0.9,
    cursor: "pointer",
    label: "${getLabel}",
    labelOutlineColor: "white",
    labelOutlineWidth: 4,
    fontFamily: "sans-serif"
    //fontFamily: "Courier New, monospace"
}, {
    context: tcontext
} );


/* stylemaps */
var eventlayer_style = new OpenLayers.StyleMap( {
    'default': event_styled,
    'temporary': event_temp_styled
} );

eventlayer_style.styles[ 'default' ].addRules( [
    new OpenLayers.Rule( {
        maxScaleDenominator: 60000000,
        minScaleDenominator: 3400,
        symbolizer: {
            "Point": {
                pointRadius: 1,
                graphicName: "square",
                fillColor: "white",
                fillOpacity: 0.25,
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#3333aa"
            },
            "Line": {
                label: "${getLabel}",
                strokeWidth: "${getWidth}",
                strokeOpacity: 0.90,
                strokeColor: "${getColor}", // using context.getColor(feature)
                //strokeColor: "#3A01DF"
            },
            "Polygon": {
                strokeWidth: 1,
                strokeOpacity: 1,
                fillColor: "#9999aa",
                strokeColor: "#6666aa"
            }
        }
        /*
                 symbolizer: {
                    //fillColor: "white",
                    fontColor: "#333333",
                    fontWeight: "bolder",
                    //strokeColor: "${speed_color}",
                    pointRadius: 8,
                    fontSize: "8px"
                    }
        */
    } ),
    new OpenLayers.Rule( {
        maxScaleDenominator: 3400,
        minScaleDenominator: 1700,
        symbolizer: {
            "Point": {
                //label: "${getLabel}",
                pointRadius: 5,
                graphicName: "square",
                fillColor: "white",
                fillOpacity: 0.25,
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#3333aa"
            },
            "Line": {
                label: "${getLabel}",
                strokeWidth: "${getWidth}",
                strokeOpacity: 0.90,
                //strokeColor: "#3A01DF"
                strokeColor: "${getColor}", // using context.getColor(feature)
            },
            "Polygon": {
                strokeWidth: 1,
                strokeOpacity: 1,
                fillColor: "#9999aa",
                strokeColor: "#6666aa"
            }
        }
        /*
                 symbolizer: {
                    //fillColor: "orange",
                    fontColor: "#333333",
                    //strokeColor: "${speed_color}",
                    fontWeight: "bolder",
                    pointRadius: 14,
                    fontSize: "11px"
                    }
        */
    } ),
    new OpenLayers.Rule( {
        maxScaleDenominator: 1700,
        minScaleDenominator: 1,
        symbolizer: {
            "Point": {
                label: "${getLabel}",
                pointRadius: 12,
                graphicName: "square",
                fillColor: "white",
                fillOpacity: 0.25,
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#3333aa"
            },
            "Line": {
                label: "${getLabel}",
                strokeWidth: "${getWidth}",
                strokeOpacity: 0.90,
                //strokeColor: "#3A01DF"
                strokeColor: "${getColor}", // using context.getColor(feature)
            },
            "Polygon": {
                strokeWidth: 1,
                strokeOpacity: 1,
                fillColor: "#9999aa",
                strokeColor: "#6666aa"
            }
        }
        /*
                 symbolizer: {
                    //fillColor: "#E6EA18",
                    fontColor: "#333333",
                    //strokeColor: "${speed_color}",
                    fontWeight: "bolder",
                    pointRadius: 20,
                    fontSize: "20px"
                    }
        */
    } )
] );
//});
