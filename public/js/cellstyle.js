/*jslint node: true, maxerr: 50, indent: 4 */
"use strict";

/*
 var colors = ["red", "green", "blue"];
            var context = {
                getColor: function(feature) {
                    var region = parseInt((feature.geometry.x + 180) / 120);
                    return colors[region];
                },
                getSize: function(feature) {
                    return feature.attributes["type"] / map.getResolution() * .703125;
                }
            };
            var template = {
                pointRadius: "${getSize}", // using context.getSize(feature)
                fillColor: "${getColor}" // using context.getColor(feature)
            };
            var style = new OpenLayers.Style(template, {context: context});
            var layer2 = new OpenLayers.Layer.Vector('Points', {
                styleMap: new OpenLayers.StyleMap(style),
                renderers: renderer
            });
*/
      var context = {
         getColor: function(feature) {
               // console.log(feature); 
               //$.each(vector_layer.features, function(i, item) 
               if (feature.attributes["gsm:radio"] == 'UMTS') {
                  return "red";
               } else if (feature.attributes["gsm:radio"] == 'GSM') {
                  return "orange";
               } else if (feature.attributes["gsm:radio"] == 'LTE') {
                  return "green";
               } else {
                  return "purple";
               }  
         },
/*
         getSize: function(feature) {
            return feature.attributes["type"] / map.getResolution() * .703125;
         }
*/
         getLabel: function(feature) {
/*
               if ( !$( "#labelswitch" ).prop( "checked" ) ) {
                  return '';
               }
*/
               if (feature.attributes["gsm:radio"]) {
                  return feature.attributes["gsm:radio"];
               } else {
                  return "?";
               }
         },
         getAddress: function(feature) {
               var addr="";
               if (feature.attributes["gsm:radio"]) {
                   addr="("+feature.attributes["gsm:radio"]+")  ";
	       }

               if (feature.attributes['mcc']) {
                   addr+=feature.attributes['mcc'];
               }
               if (feature.attributes['mnc']) {
                  addr+= " " + feature.attributes['mnc'];
               }

               if (feature.attributes["gsm:lac"]) {
                  addr+=" - " + feature.attributes["gsm:lac"];
               }
               if (feature.attributes["gsm:cellid"]) {
                  addr+= " " + feature.attributes["gsm:cellid"];
               }
               return addr;
         },
         getAdd: function(feature) {
               var addr=0;
               if (feature.attributes['gsm:lac']) {
                   addr++;
               }
               if (feature.attributes['gsm:cellid']) {
                   addr++;
               }
               if (feature.attributes['gsm:radio']) {
                   addr++;
               }
               addr=1;
               return addr;
         }
      };

//$(document).ready(function () {
   var asset_styled = new OpenLayers.Style({
      fillColor: "${getColor}", // using context.getColor(feature)
      // fillColor: "white",
      //pointRadius: 1,
      //fontWeight: "normal",
      //fontColor: "#000000",
      // fontSize: "1px",
      strokeColor: "black",
      strokeWidth: "${getAdd}",
      pointerEvents: "all",
      fillOpacity: 0.6,
      cursor: "pointer",
//      label : "${getAddress}",
      labelOutlineColor: "white",
      labelOutlineWidth: 3,
      fontFamily: "sans-serif"
      //fontFamily: "Courier New, monospace"
   }, {context: context});

   /* Hover/select style */
   var asset_temp_styled = new OpenLayers.Style({
      label : "${getAddress}",
      fillColor: "white",
      strokeColor: "#ff9933",
      strokeWidth: 4,
      pointerEvents: "all",
      fillOpacity: 0.4,
      cursor: "pointer",
//      label : "${getAddress}",
      labelOutlineColor: "white",
      labelOutlineWidth: 4,
      fontFamily: "sans-serif"
      //fontFamily: "Courier New, monospace"
   }, {context: context});
   
   /* stylemaps */
   var vectorlayer_style = new OpenLayers.StyleMap({
      'default' : asset_styled,
      'temporary' : asset_temp_styled
   });

   vectorlayer_style.styles['default'].addRules([
      new OpenLayers.Rule({
         maxScaleDenominator: 60000000,
         minScaleDenominator: 433344,
         symbolizer: {
            //fillColor: "white",
            fontColor: "#333333",
            fontWeight: "bolder",
            //strokeColor: "${speed_color}",
            pointRadius: 2,
            fontSize: "8px"
            }
      }),
      new OpenLayers.Rule({
         maxScaleDenominator: 433344,
         minScaleDenominator: 54168,
         symbolizer: {
            //fillColor: "orange",
            fontColor: "#333333",
            //strokeColor: "${speed_color}",
            fontWeight: "bolder",
            pointRadius: 4,
            fontSize: "11px"
            }
      }),
      new OpenLayers.Rule({
         maxScaleDenominator: 54168,
         minScaleDenominator: 1,
         symbolizer: {
            //fillColor: "#E6EA18",
            fontColor: "#333333",
            //strokeColor: "${speed_color}",
            fontWeight: "bolder",
            pointRadius: 8,
            fontSize: "20px"
            }
      })
   ]);
//});
