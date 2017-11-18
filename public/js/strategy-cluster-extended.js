/**
 * Class: OpenLayers.Strategy.AttributeCluster
 * Strategy for vector feature clustering based on feature attributes.
 *
 * Inherits from:
 *  - <OpenLayers.Strategy.Cluster>
 */

// global variables
var map, address_layer, address_style;

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


// wrap the instantiation code in an anonymous function that gets executed
( function() {
        // The function that gets called on feature selection: shows information 
        // about the feature/cluser in a div on the page 
        var showInformation = function( evt ) {
            var feature = evt.feature;
            var info = 'Last hovered feature:<br>';
            if ( feature.cluster ) {
                info += '&nbsp;&nbsp;Cluster of ' + feature.attributes.count + ' features:';
                var clazzes = {
                    '1': 0,
                    '2': 0,
                    '3': 0,
                    '4': 0
                };
                for ( var i = 0; i < feature.attributes.count; i++ ) {
                    var feat = feature.cluster[ i ];
                    clazzes[ feat.attributes.clazz ]++;
                }
                for ( var j = 1; j <= 4; j++ ) {
                    var plural_s = ( clazzes[ j ] !== 1 ) ? 's' : '';
                    info += '<br>&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;clazz ' + j + ': ' + clazzes[ j ] + ' feature' + plural_s;
                }
            } else {
                info += '&nbsp;&nbsp;Single feature of clazz = ' + feature.attributes.clazz;
            }
            document.getElementById( 'info' ).innerHTML = info;
        };

        // The function that gets called on feature selection. Shows information 
        // about the number of "points" on the map.
        var updateGeneralInformation = function() {
            var info = 'Currently ' + address_layer.features.length + ' points are shown on the map.';
            document.getElementById( 'generalinfo' ).innerHTML = info;
        };

        // context to style the address_layer
        var context = {
            getColor: function( feature ) {
                var color = '#aaaaaa';
                if ( feature.attributes.clazz && feature.attributes.clazz === 4 ) {
                    color = '#ee0000';
                } else if ( feature.cluster ) {
                    var onlyFour = true;
                    for ( var i = 0; i < feature.cluster.length; i++ ) {
                        if ( onlyFour && feature.cluster[ i ].attributes.clazz !== 4 ) {
                            onlyFour = false;
                        }
                    }
                    if ( onlyFour === true ) {
                        color = '#ee0000';
                    }
                }
                return color;
            }
        };

        // style the address_layer
        stylemap = new OpenLayers.StyleMap( {
            'default': new OpenLayers.Style( {
                pointRadius: 5,
                fillColor: "${getColor}",
                fillOpacity: 0.7,
                strokeColor: "#666666",
                strokeWidth: 1,
                strokeOpacity: 1,
                graphicZIndex: 1
            }, {
                context: context
            } ),
            'select': new OpenLayers.Style( {
                pointRadius: 5,
                fillColor: "#ffff00",
                fillOpacity: 1,
                strokeColor: "#666666",
                strokeWidth: 1,
                strokeOpacity: 1,
                graphicZIndex: 2
            } )
        } );

        // the select control
        select = new OpenLayers.Control.SelectFeature(
            address_layer, {
                hover: true
            }
        );
        map.addControl( select );
        select.activate();
        address_layer.events.on( {
            "featureselected": showInformation
        } );

        updateGeneralInformation();

    }
} )();