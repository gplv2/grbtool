@extends('layouts.app')

@section('title', 'Home - overview')

@section('page-style')
<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/openlayers/2.12/theme/default/style.css" media="all" />
<link rel="stylesheet" href="css/complete.css">
<style>
<<<<<<< HEAD


=======
>>>>>>> d478cde2d4a7e6110cefacd89bb132137c0ddb3b
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
<<<<<<< HEAD

=======
>>>>>>> d478cde2d4a7e6110cefacd89bb132137c0ddb3b
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

.map{
    /* width: 1000px;
    margin: 5px;
    height: 468px; */
    width: 98%;
    height: 98%;
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
       min-height: 500px;
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

#cblist > input {
    margin:3px;
    clear:left;
}

#cblist > label,input {
    float:left;
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

</style>
@stop

@section('page-script')
{!! Html::script('js/mapshaper.js') !!}
{!! Html::script('js/pizza.js') !!}
<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBaPvbu-B8-JS0N_zAH5BiI6foAvccFBDY" type="text/javascript"></script>
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/openlayers/2.12/OpenLayers.js"></script>

@stop

@section('bodydef')
<body ng-app="app">
@endsection

@section('content')

<div class="container-fluid">
  <div class="row-fluid">
    <!--Sidebar content-->
    <div class="col-sm-3 col-md-3 sidebar sidebar-left pull-left">
      <!--Injected angular content-->
            <div class="panel panel-default" ng-view=""></div>
      <!--Request options -->
            <div class="panel panel-default">
                <div class="panel-heading" data-toggle="collapse" data-target="#searchopts">
                  Search Options
               </div>
                <div id="searchopts" class="panel-body collapse in">
                <form id="reqform" class="form-horizontal ng-pristine ng-valid" role="form">
                    <div class="form-group" id="search">
                           <div id="geosearch" class="filterclass ui-widget">
                             <label for="address" class="col-md-2 col-sm-2 col-xs-2">Name</label>
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
                        <div class="col-md-offset-1 col-md-8">
                            <!-- <input class="ui-button ui-state-default ColVis_Button" type="button" name="clearsearch" value="X" id="clssearch" title="Wissen zoekbox"> --!>
                            <button id="resetbutton" type="button" name="clearsearch" id="clssearch" class="btn btn-primary pull-left" tabindex="2">Reset</button>
                            <button id="searchbutton" type="button" class="btn btn-primary pull-right" tabindex="1">Search!</button>
                            <!-- <button id="testbutton"  type="button" class="btn btn-primary pull-left">Test grid</button>-->
                        </div>
                    </div>
                </form>
               </div>
            </div>
      <!--options -->
            <div class="panel panel-default">
                <div class="panel-heading" data-toggle="collapse" data-target="#opts">
                  Options
               </div>
                <div id="opts" class="panel-body collapse in">
                <form id="genform" class="form-horizontal ng-pristine ng-valid" role="form">
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
                </form>
               </div>
            </div>
      <!--Sidebar content-->
            <div class="panel panel-default">
               <div class="panel-heading" data-toggle="collapse" data-target="#jsonpane">
                  Share result data
               </div>
               <div class="panel-body collapse" id="jsonpane">
                  <form class="form-horizontal" role="form">
                     <div class="form-group">
                         <label class="form-control-label" for="postcode">Postcode</label>
                         <div class="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                             <input type="text" class="form-control col-md-6 col-sm-6 col-xs-6" autocomplete="off" title="found via nominatim" id="postcode" tabindex="2">
                    	     <button id="crabdata" type="button" class="btn btn-default">Crabdata!</button>
                        </div>
                     </div>
                     <div class="form-group">
                        <div class="col-sm-12">
                           <label class="form-control-label" for="apidata">Raw request data:</label>
                           <textarea id="apidata" class="form-control" cols=40 rows=10 placeholder=''></textarea>
                     </div>
                  </form>
               </div>
               <div class="panel-footer">
               </div>
               <div class="form-group">
                  <div class="col-sm-offset-4 col-sm-10">
                     <button id="geocodebutton" type="button" class="btn btn-default">Geocode!</button>
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
                 <div class="panel-footer">
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
<script src="//code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
<!-- Scripts 
<script src="/js/app.js"></script>
<script src="/js/controllers.js"></script>
<script src="/js/services.js"></script>
-->
{!! Html::script('js/md5.min.js') !!}
{!! Html::script('js/pointstyle.js') !!}
{!! Html::script('js/vectorstyle.js') !!}
{!! Html::script('js/grblayers.js') !!}
{!! Html::script('js/agivlayers.js') !!}
{!! Html::script('js/start.js') !!}
{!! Html::script('js/overpass.js') !!}
<!-- {!! Html::script('js/celllayers.js') !!} -->
<!-- {!! Html::script('js/cellstyle.js') !!} -->
{!! Html::script('js/search.js') !!}
@endsection
