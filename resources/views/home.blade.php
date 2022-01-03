@extends('layouts.app')

@section('title', 'Home - overview')

@section('page-style')
<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/openlayers/2.12/theme/default/style.css" media="all" />
<link rel="stylesheet" href="css/complete.css">
<style>

/* Fix the slider so it aligns better with the label*/
#dpslider {
    margin-top: 1em;
}
#custom-handle {
    width: 3em;
    height: 1.6em;
    top: 50%;
    margin-top: -.8em;
    text-align: center;
    line-height: 1.6em;
}
.ol-mouse-position {
    top: auto;
    bottom: 2em;
}
.ol-overviewmap {
    bottom: 2em;
}
.ol-zoomslider {
    top: 7em;
}
.ol-rotate {
    top: 2.5em;
}
.draw-point {
    right: 3em;
    top: .5em;
}

dl {
  width: 100%;
  overflow: auto;
  padding: 0;
  margin: 0
}
dt {
  float: left;
  width: 50%;
  /* adjust the width; make sure the total of both is 100% */
  padding: 0;
  margin: 0
}
dd {
  float: left;
  width: 50%;
  /* adjust the width; make sure the total of both is 100% */
  padding: 0;
  margin: 0
}


.map{
    /* width: 1000px;
    margin: 5px;
    height: 468px;
    height: 94%; */
    position: block;
}
.panel-body {
    padding: 0px;
}
.panel {
    margin-bottom: 5px;
    margin-top: 5px;
    padding: 8px;
}
.form-group {
    padding: 8px;
}

#map-wrap {
    top: 0;
    bottom:0;
   /* position:fixed; */
    overflow-y:hidden;
    overflow-x:hidden;
    min-height: 600px;
}
.container {
    text-align: left;
    vertical-align: middle;
}

.content {
    text-align: center;
display: inline-block;
}

.form-check-label {
    margin-right: 5em;
    margin-bottom: 0;
    cursor: pointer;
}

.form-check {
    position: relative;
    display: block;
    margin-bottom: .75rem;
}

.form-check-input {
    position: absolute;
    margin-top: .25rem;
    margin-left: -1.25rem;
    margin-right: 14px;
}

.form-check-input:only-child {
    margin-right: 10px;
    position: static;
}

.form-check.disabled .form-check-label {
    color: #818a91;
    cursor: not-allowed;
}

.boxsizingBorder {
    -webkit-box-sizing: border-box;
       -moz-box-sizing: border-box;
            box-sizing: border-box;
}

fieldset {
    display: block;
    -webkit-margin-start: 2px;
    -webkit-margin-end: 2px;
    -webkit-padding-before: 0.35em;
    -webkit-padding-start: 0.75em;
    -webkit-padding-end: 0.75em;
    -webkit-padding-after: 0.625em;
    border-image-source: initial;
    border-image-slice: initial;
    border-image-width: initial;
    border-image-outset: initial;
    border-image-repeat: initial;
    min-width: -webkit-min-content;
    border-width: 1px;
    border-style: groove;
    border-color: threedface;
}

#cb_none {
    margin: 15px;
    padding: 18px;
}

.break-word {
    word-wrap: break-word;
}

/* Style json with CSS + Javascript

.json {
   background-color: ghostwhite;
   border: 1px solid silver;
   padding: 10px 20px;
   margin: 20px;
}
*/

.json-key {
   color: brown;
}

.json-value {
   color: navy;
}

.json-string {
   color: olive;
}

.json {outline: 1px solid #ccc; padding: 5px; margin: 5px; }
.string { color: green; }
.number { color: darkorange; }
.boolean { color: blue; }
.null { color: magenta; }
.key { color: red; }

.olControlLayerSwitcher {
   position: absolute;
   top: 25px;
   right: 0;
   width: 26em !important;
   font-family: sans-serif;
   font-weight: bold;
   margin-top: 3px;
   margin-left: 3px;
   margin-bottom: 3px;
   font-size: smaller;
   color: white;
   z-index: 10000;
}
.olControlLayerSwitcher .layersDiv
{
   padding-top: 5px;
   padding-left: 10px;
   padding-bottom: 5px;
   padding-right: 10px;
}

</style>
@stop

@section('page-script')
<script>
//  Keep track if google is loaded or not
var isMapsApiLoaded = false;
window.mapsCallback = function () {
  isMapsApiLoaded = true;
  // initialize map, etc.
};
</script>
{!! Html::script('js/mapshaper.js') !!}
{!! Html::script('js/pizza.js') !!}
{!! Html::script('js/fixlistener.js') !!}
<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBaPvbu-B8-JS0N_zAH5BiI6foAvccFBDY&callback=mapsCallback" type="text/javascript"></script>
<!-- <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/openlayers/2.12/OpenLayers.js"></script> -->
{!! Html::script('js/openlayers/OpenLayers.js') !!}

@stop

@section('bodydef')
<body ng-app="app">
@endsection

@section('content')

<div class="container-fluid">
  <div class="row-fluid">
    <!--Sidebar content-->
    <div class="col-sm-3 col-md-3 col-lg-3 sidebar sidebar-left pull-left">
      <!--Injected angular content-->
            <div class="panel panel-default" ng-view=""></div>
      <!-- Object information -->
            <div class="panel panel-default">
               <div class="panel-heading" data-toggle="collapse" data-target="#obj_info">
                  Object info
               </div>

               <div id="obj_info" class="panel-body collapse in">
                <form id="reqform1" class="form-horizontal ng-pristine ng-valid" role="form">
                  <div class="col-md-offset-0 col-md-8">
                  </div>
                </form>
                <div id="obj_info_ex" class="panel-body collapse in"></div>
               </div>
            </div>
      <!-- Toolbox -->
            <div class="panel panel-default">
                <div class="panel-heading" data-toggle="collapse" data-target="#tools">
                  Tools
               </div>
               <div id="tools" class="panel-body collapse in">
                  <div class="col-md-offset-0 col-md-12">
<!-- form group 1 -->
                    <div class="row">
                        <div class="form-group col-lg-6 col-md-6 col-sm-6 col-xs-6">
                        <div class="help-block col-md-offset-1">Postalcode</div>
                            <!-- <label for="postcode" class="col-lg-3 col-md-2 col-sm-2 col-xs-2">Postcode</label> -->
                            <div class="col-md-offset-0 col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <input type="text" class="form-control col-md-6 col-sm-6 col-xs-6" autocomplete="off" title="found via nominatim" id="postcode" tabindex="2">
                            </div>
                            <div class="col-md-offset-0 col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <button id="ocrab" type="button" class="btn btn-default" tabindex="1" onclick="javascript:_paq.push(['trackEvent', 'josm', 'OpenInCrab']);">Open in CRAB import</button>
                            </div>
                        </div>
                    </div>
<!-- form group 2 -->
                    <div class="col-md-offset-0 col-lg-12 col-md-12 col-sm-12 col-xs-12">
<!-- form group 3 -->
                        <div class="row">
                            <div class="form-group col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <div class="help-block">Export data actions</div>
                                <button id="opass" type="button" class="btn btn-default" tabindex="6" onclick="javascript:_paq.push(['trackEvent','josm', 'LoadOSMData']);">Load OSM data</button>
                                <button id="fpass" type="button" class="btn btn-default" tabindex="7" onclick="javascript:_paq.push(['trackEvent','josm', 'FilterGRBLayer']);">Filter Export layer</button>
                                <button id="loadarea" type="button" class="btn btn-default" tabindex="8" onclick="javascript:_paq.push(['trackEvent','josm', 'OpenAreaInJosm']);">Open Area in JOSM</button>
                                <button id="loadgrb" type="button" class="btn btn-default" tabindex="9" onclick="javascript:_paq.push(['trackEvent','josm', 'ExportGRB']);">Export data to JOSM</button>
                                <button id="rstfilter" type="button" class="btn btn-default" tabindex="4" onclick="javascript:_paq.push(['trackEvent','josm', 'ResetFilters']);">Reset Filters</button>
                            </div>
                        </div>
                        <div class="row">
                            <div class="form-group col-lg-6 col-md-6 col-sm-6 col-xs-6">
                                <div class="help-block">Optional actions</div>
                                <button id="ostreetview" type="button" class="btn btn-default" data-toggle="tooltip" title="Click on a road segment in the map to select the position" tabindex="2" onclick="javascript:_paq.push(['trackEvent', 'josm', 'OpenStreetview']);">Open Streetview</button>
                                <button id="vrfyjosm" type="button" class="btn btn-default" tabindex="3" onclick="javascript:_paq.push(['trackEvent', 'josm', 'CheckJosm']);">Check JOSM</button>
                            </div>
                            Download this <a href="https://raw.githubusercontent.com/gplv2/grb-mapcss/master/grb_buildings.css">"MAPCSS"</a> for easy merging.
                        <!-- <button id="loadcert" type="button" class="btn btn-default" tabindex="5" onclick="javascript:_paq.push(['trackEvent', 'LoadCertificate']);">Load Certificate</button> -->
                        </div>
<!-- end form group -->
<!--
            <div class="help-block">Take WR actions</div>
                     <div class="form-group">
                         <div class="col-md-offset-1 col-lg-6 col-md-6 col-sm-6 col-xs-6">
                             <button id="wropass" type="button" class="btn btn-default" tabindex="2">Load WR data</button>
                             <button id="diffwr" type="button" class="btn btn-default" tabindex="3">Diff WR vs OSM</button>
                             <button id="loadnwr" type="button" class="btn btn-default" tabindex="3">Export NWR diff to JOSM</button>
                        </div>
                     </div>
           </div>
-->
                    </div>
                </div>
               </div>
            </div>
      <!--Search options -->
            <div class="panel panel-default">
                <div class="panel-heading" data-toggle="collapse" data-target="#searchopts">
                  Search Options
               </div>
                <div id="searchopts" class="panel-body collapse">
                <div class="col-md-offset-1 col-md-12">
                <form id="reqform3" class="form-horizontal ng-pristine ng-valid" role="form">
                    <div class="form-group" id="search">
                           <div id="geosearch" class="filterclass ui-widget">
                             <label for="address" class="col-lg-3 col-md-2 col-sm-2 col-xs-2">Name</label>
                             <div class="col-lg-10 col-md-10 col-sm-10 col-xs-10">
                                 <input type="text" class="form-control ui-autocomplete-input" autocomplete="off" title="Search via nominatim" id="address" value="" placeholder="Damstraat, Weerde" tabindex="1">
                              </div>
                           </div>
                    </div>
                    <div class="form-group">
                            <div class="form-check">
                                <label for="radio" class="col-md-2 col-sm-2 col-xs-2 control-label">Service</label>
                                <div id="radio" class="ui-buttonset col-md-8 col-sm-8 col-xs-8">
                                    <input type="radio" name="optionsRadios" id="sosm" checked="" class="ui-helper-hidden-accessible">
                                        <label for="sosm" class="form-control-label ui-state-active ui-button ui-widget ui-state-default ui-button-text-only ui-corner-left" role="button"><span class="ui-button-text">OSM</span></label>
                                    <input type="radio" name="optionsRadios" id="sgoogle" class="ui-helper-hidden-accessible">
                                        <label for="sgoogle" class="form-control-label ui-button ui-widget ui-state-default ui-button-text-only ui-corner-right" role="button"><span class="ui-button-text">Google</span></label>
                                </div>
                            </div>
                    </div>

                    <div class="form-group">
                        <div class="col-md-offset-2 col-lg-6 col-md-6">
                            <!-- <input class="ui-button ui-state-default ColVis_Button" type="button" name="clearsearch" value="X" id="clssearch" title="Wissen zoekbox"> --!>
                            <button id="resetbutton" type="button" name="clearsearch" id="clssearch" class="btn btn-primary pull-left" tabindex="2">Reset</button>
                            <button id="searchbutton" type="button" class="btn btn-primary pull-right" tabindex="1">Search!</button>
                            <!-- <button id="testbutton"  type="button" class="btn btn-primary pull-left">Test grid</button>-->
                        </div>
                    </div>
                </form>
               </div>
               </div>
            </div>
      <!--options -->
            <div class="panel panel-default">
                <div class="panel-heading" data-toggle="collapse" data-target="#opts">
                  Options
               </div>
                <div id="opts" class="panel-body collapse in">
                <form id="genform" class="form-horizontal ng-pristine ng-valid" role="form">
<!--
                     <div class="form-group">
                         <label for="streetbuffer" class="col-lg-3 col-md-3 col-sm-3 col-xs-3">Buffer for street analysis (meters)</label>
                         <div class="col-md-offset-1 col-lg-3 col-md-3 col-sm-3 col-xs-3">
                             <input type="number" class="form-control col-md-6 col-sm-6 col-xs-6" value="1" title="Enter meters for buffer" id="streetbuffer" tabindex="1">
                        </div>
                     </div>
-->
                    <div class="form-group">
                        <label for="percentage" class="col-md-3 control-label">Simplify</label>
                        <div class="col-md-9">
                            <div id="slider_container">
                                <div id="dpslider" class="ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all">
                                  <div id="percentage" class="ui-slider-handle"></div>
                                  <span class="ui-slider-handle ui-state-default ui-corner-all" tabindex="0"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                         <div id="contentfilters" class="col-md-12" style="clear:both;"> </div>
                    </div>
                    <div class="help-block">Export settings</div>
                    <div class="checkbox">
                        <label class="form-control-label"><input type="checkbox" value="">Include steps in export (not active yet)</label>
                    </div>

                    <div class="help-block">JOSM settings</div>
                    <div class="radio">
                        <label class="ui-button-text"><input type="radio" name="optradio" id="jinsecure" class="form-control-label" checked>NON-SSL</label>
                    </div>
                    <div class="radio">
                        <label class="ui-button-text"><input type="radio" name="optradio" id="jsecure" class="form-control-label">SSL</label>
                    </div>

                    <div class="help-block">Layer settings</div>
                    <div class="checkbox">
                        <label class="form-control-label"><input type="checkbox" value="" checked>Enable CRAB layer</label>
                    </div>
                    <div class="checkbox">
                        <label class="form-control-label"><input type="checkbox" value="" checked>Enable Wegenregister layer</label>
                    </div>
                    <div class="checkbox">
                        <label class="form-control-label"><input id ="mute_crab_labels" type="checkbox" value="" checked>Mute CRAB labels</label>
                    </div>
                    <div class="checkbox">
                        <label class="form-control-label"><input id ="mute_wr_labels" type="checkbox" value="" checked>Mute Wegenregister labels</label>
                    </div>
                    <div class="checkbox">
                        <label class="form-control-label"><input id ="wrinfo" type="checkbox" value="" checked>Show WR object info</label>
                    </div>
                    <div class="checkbox">
                        <label class="form-control-label"><input id ="grbinfo" type="checkbox" value="" checked>Show GRB object info</label>
                    </div>
                    <div class="help-block">Crab settings</div>
                    <div class="checkbox">
                        <label class="form-control-label"><input type="checkbox" value="">Include CRAB data in export (not implemented)</label>
                    </div>
                    <div class="checkbox">
                        <label class="form-control-label"><input id ="posttrack" type="checkbox" value="" checked>Enable postalcode tracking</label>
                    </div>
                    <div class="help-block">Advanced settings</div>
                    <div class="checkbox">
                        <label class="form-control-label"><input id ="metaexport" type="checkbox" value="" >Include meta tags for auto-building detection (debug)</label>
                    </div>
               </div>
            </div>
        </div>
     </div>
     <div class="col-sm-9 col-md-9 sidebar sidebar-right pull-right">
      <!--Body content-->
            <div class="panel panel-default">
                <div class="panel-heading">
                  View Map
                </div>
                <div class="panel-body" id="map-wrap">
                  <div id="map" class="map"></div>
                  <div id="mapcontrols">
                     <div id="idtag"></div>
                  </div>
                </div>
            </div>
            <div class="panel panel-default">
                <div class="panel-heading">
                  Info
                </div>
                <div class="panel-body" id="actions">
                     <div id="msg" class="break-word notice info"></div>
                     <div id="notes" class="break-word notice info"></div>
                </div>
            </div>
      </div>
  </div>
</div>

        <!-- <div class="col-sm-offset-0 col-sm-2"> -->
    </div>
@endsection

@section('page-bottom-script')
{!! Html::script('js/jquery-ui/jquery-ui.min.js') !!}
<!-- <script src="//code.jquery.com/ui/1.12.1/jquery-ui.js"></script> -->
<!-- Scripts
<script src="/js/app.js"></script>
<script src="/js/controllers.js"></script>
<script src="/js/services.js"></script>
-->
<script>
//Snippet comes from http://osgeo-org.1560.x6.nabble.com/OL-2-13-1-latest-Proj4js-td5081636.html
//
/*
*
* This seems to fuckup exports 
*
var Proj4js = window["Proj4js"] = window["Proj4js"] || {
    Proj: function(code) {
        var result = proj4(code);
        result.srsCode = code; // for ol2 compatibility
        return result;
    },
    defs: proj4.defs,
    transform: proj4
};
window.Proj4js = {
Proj: function(code) {
    return proj4(Proj4js.defs[code]);
},
    defs: proj4.defs,
    transform: proj4
};
 */

$(function () {
  $('[data-toggle="tooltip"]').tooltip({ boundary: 'scrollParent' , animation: true, "show": 2000, "hide": 100, "placement" : "auto" })
})

</script>
{!! Html::script('js/turf.min.js') !!}
{!! Html::script('js/osmtogeojson/osmtogeojson.js') !!}
{!! Html::script('js/md5.min.js') !!}
{!! Html::script('js/pointstyle.js') !!}
{!! Html::script('js/vectorstyle.js') !!}
{!! Html::script('js/walk.js') !!}
{!! Html::script('js/grblayers.js') !!}
{!! Html::script('js/agivlayers.js') !!}
{!! Html::script('js/wrlayers.js') !!}
{!! Html::script('js/start.js') !!}
{!! Html::script('js/gmerge.js') !!}
{!! Html::script('js/overpass.js') !!}
{!! Html::script('js/nwr.js') !!}
<!-- {!! Html::script('js/celllayers.js') !!} -->
<!-- {!! Html::script('js/cellstyle.js') !!} -->
{!! Html::script('js/search.js') !!}
@endsection
