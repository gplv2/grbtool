@extends('layouts.app')

@section('title', 'GRB sources')

@section('page-style')
<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css"/>
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/openlayers/2.13.1/theme/default/style.css" media="all" />
    <style>
            html, body {
                height: 100%;
            }

            body {
                margin: 0;
                padding: 0;
                width: 100%;
                display: table;
                font-family: 'Lato', "Source Sans Pro", sans-serif;
                font-size: 20px;
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

            .title {
                font-size: 96px;
            }

            .fa-btn {
            margin-right: 6px;
            }
            .article-img {
               display: inline-block;
               /* vertical-align: middle; */
               margin-left: 5%;
               margin-bottom: 2%;
               width: 90%;
               height: 300px;
            }
            .article-img img{
               border: 1px dashed transparent;
               border-color: #e7e7e7;
               width: 100%;
               height: 100%;
            }
            .navbar {
               min-height: 55px;
            }
            .navbar-header {
               float: left;
               font-family: 'Oswald';
            }
            .panel-heading {
               font-family: 'Oswald';
               font-size: 26px;
            }

            #footerLogo {margin-bottom: 22px;}
            #footerRights {padding-top:22px;padding-bottom:22px;margin-top:22px; text-align: center; font-size:10px;}
            .footerWidget {margin-bottom: 22px}

            footer {
               padding:44px 0 0 0;
               color: #777;
               background: #f8f8f8;
               border-top: 1px solid transparent;
               border-color: #e7e7e7;
            }

            /* footer 1 */
            .worksList li{display:inline-block; margin: 0 10px 10px 0;}

            /* footer 4 */
            .footer4 #footerRights {text-align: left; background:#e7e7e7;}
            .bigTitle.bigTitleFooter {font-size: 2em; margin-bottom: 0;}

            #footerRights {
               background-color: #f8f8f8;
               color: #999;
               border-top: 1px solid #e7e7e7;
               padding-top: 22px;
               padding-bottom: 22px;
               margin-top: 22px;
               text-align: center;
               font-size: 10px;
               display: block;
               font-family: 'Lato';
            }

            .navbar {
               min-height: 55px;
            }
            .navbar-header {
               float: left;
               padding: 5px;
               font-family: 'Oswald';
            }
            .navbar-header > a.active{
               font-weight:bold;
               font-size: 34px;
               color: white !important;
            }

            .navbar-default {
               /*font: normal 36px 'Cookie', cursive;*/
               font: normal 16px sans-serif;
               text-decoration: none;
               background-color: #292c2f;
            }

            .navbar-brand {
               color: #efe3e3 !important;
               font-family: 'Oswald';
               font-size: 32px;
               -o-object-fit: contain;
               object-fit: contain;
            }
            .navbar>.container-fluid .navbar-brand {
                margin-left: -5px;
            }

            .vim {
               display: inline-block;
               font: normal normal normal 14px/1 FontAwesome;
               font-size: inherit;
               text-rendering: auto;
               -webkit-font-smoothing: antialiased;
               -moz-osx-font-smoothing: grayscale;
               height: 100%;
            }
               /* background-color: transparent; */

            @media(min-width:992px){
               /* footer 4 */
               .footer4 #footerRights .quickMenu {float:right;}
               /* footer 5 */
               .footer5 #footerRights p{float: left;}
               .footer5 #footerRights .socialNetwork{float: right;}
            }
    </style>
@stop

@section('page-script')
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/openlayers/2.13.1/OpenLayers.js"></script>
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
      <!--General options -->
            <div class="panel panel-default">
                <div class="panel-heading" data-toggle="collapse" data-target="#generalopts">
                  Options
               </div>
                <div id="opts" class="panel-body collapse">
                <form id="genform" class="form-horizontal" role="form">
                    <div class="form-group">
                        <label for="userid" class="col-md-2 control-label">UserID</label>

                        <div class="col-md-6">
                            <input type="number" class="form-control" id="userid" placeholder="Numeric id : 1234" value="111">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="requestid" class="col-md-2 control-label">Simplify</label>

                        <div class="col-md-6">
                            <input type="text" class="form-control" id="requestid" placeholder="" value="666">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="percentage">Simplify:</label>

                        <div id="slider_container">
                            <input type="text" id="percentage" style="width : 35px" readonly="">
                            <div id="dpslider" class="ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all"><span class="ui-slider-handle ui-state-default ui-corner-all" tabindex="0" style="left: 81.8182%;"></span></div>
                        </div>
                    </div>
                </form>
               </div>
            </div>
      <!--Request options -->
            <div class="panel panel-default">
                <div class="panel-heading" data-toggle="collapse" data-target="#reqopts">
                  Search Options
               </div>
                <div id="reqopts" class="panel-body collapse in">
                <form id="reqform" class="form-horizontal" role="form">
                    <div class="form-group">
                        <label for="mediatype" class="col-md-2 control-label">Name</label>
                        <div class="col-md-5">
                            <input type="text" class="form-control" id="mediatype" value="" placeholder="Damstraat, Weerde" tabindex="1">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="mediacount" class="col-md-2 control-label">Quantity</label>

                        <div class="col-md-5">
                            <input type="number" class="form-control" id="mediacount" value="3" placeholder="3" tabindex="1">
                        </div>
                    </div>
                    <div class="form-group">
                        <div id="search" style="float: right">
                            <div id="geosearch" class="filterclass ui-widget">
                            <input id="address" type="text" style="" class="ui-autocomplete-input" autocomplete="off" title="Zoek via nominatim">
                            <div id="radio" class="ui-buttonset">
                                <input type="radio" name="radio" id="sosm" checked="" class="ui-helper-hidden-accessible"><label for="sosm" class="ui-state-active ui-button ui-widget ui-state-default ui-button-text-only ui-corner-left" role="button"><span class="ui-button-text">OSM</span></label>
                                <input type="radio" name="radio" id="sgoogle" class="ui-helper-hidden-accessible"><label for="sgoogle" class="ui-button ui-widget ui-state-default ui-button-text-only ui-corner-right" role="button"><span class="ui-button-text">Google</span></label>
                            </div>
                            <input class="ui-button ui-state-default ColVis_Button" type="button" name="clearsearch" value="X" id="clssearch" title="Wissen zoekbox"></div>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="col-md-offset-1 col-md-8">
                            <button id="resetbutton"  type="button" class="btn btn-primary pull-left" tabindex="2">Reset</button>
                            <button id="reqbutton"  type="button" class="btn btn-primary pull-right" tabindex="1">Godosomething!</button>
                            <!-- <button id="testbutton"  type="button" class="btn btn-primary pull-left">Test grid</button>-->
                        </div>
                    </div>
                </form>
               </div>
            </div>
      <!--Sidebar content-->
            <div class="panel panel-default">
               <div class="panel-heading" data-toggle="collapse" data-target="#jsonpane">
                  Blah options
               </div>
               <div class="panel-body collapse in" id="jsonpane">
                  <form class="form-horizontal" role="form">
                     <div class="form-group">
                        <div class="col-sm-12">
                           <label class="form-control-label" for="laccelldata">Paste your data:</label>
                           <textarea id="laccelldata" class="form-control" cols=40 rows=10 placeholder="Lac;Cell csv or json with array of lac/cell pairs"></textarea>
                           <div class="form-check">
                              <label class="form-check-label">
                                 <input class="form-check-input" type="checkbox" id="linedata" value="">connect the dots with a line
                              </label>
                           </div>
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
{!! Html::script('js/celllayers.js') !!}
{!! Html::script('js/cellstyle.js') !!}
{!! Html::script('js/start.js') !!}
@endsection
