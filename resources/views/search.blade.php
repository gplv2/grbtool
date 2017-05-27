@extends('layouts.app')

@section('title', 'Cell sources')

@section('page-style')
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/openlayers/2.12/theme/default/style.css" media="all" />
<style>
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
         min-height: 500px;
      }
</style>
@stop

@section('page-script')
<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/openlayers/2.12/OpenLayers.js"></script>
@stop


@section('content')

<div class="container-fluid">
  <div class="row-fluid">
    <div class="col-sm-3 col-md-3 sidebar sidebar-left pull-left">
      <!--Sidebar content-->
            <div class="panel panel-default">
                <div class="panel-heading">
                  Search a Cell
               </div>
                <div class="panel-body">
                 <form class="form-horizontal" role="form">
                   <div class="form-group">
                     <label class="col-sm-2 form-control-label" for="mcc">MCC:</label>
                     <div class="col-sm-4">
                        <input type="number" class="form-control" id="mcc" placeholder="Enter MCC">
                     </div>
                     <label class="col-sm-2 form-control-label" for="mnc">MNC:</label>
                     <div class="col-sm-4">
                        <input type="number" class="form-control" id="mnc" placeholder="Enter MNC">
                     </div>
                  </div>
                  <div class="form-group">
                     <label class="col-sm-2 form-control-label" for="lac">Lac:</label>
                     <div class="col-sm-4">
                        <input type="number" class="form-control" id="lac" placeholder="Enter LAC">
                     </div>
                     <label class="col-sm-2 form-control-label" for="cellid">CellID:</label>
                     <div class="col-sm-4">
                        <input type="number" class="form-control" id="cellid" placeholder="Enter Cell ID">
                     </div>
                  </div>
                  <div class="form-group">
                     <div class="col-sm-offset-2 col-sm-10">
                     <div class="checkbox">
                        <label><input id="details" type="checkbox"> Get me address details</label>
                     </div>
                     </div>
                  </div>
                  <div class="form-group">
                     <div class="col-sm-offset-2 col-sm-10">
                     <button id="searchbutton" type="button" class="btn btn-default">Search</button>
                     </div>
                  </div>
               </form>
               </div>
                <div class="panel-heading">
                  Cell information
               </div>
                <div id="cellinfo" class="panel-body">
                  This is the cell
               </div>
                <div class="panel-footer">
                  Geocoding services can be requested at {!! Html::mailto('info@bitless.be') !!}
               </div>
            </div>
    </div>
    <div class="col-sm-8 col-md-8 sidebar sidebar-right pull-right">
      <!--Body content-->
            <div class="panel panel-default">
                <div class="panel-heading">
                  Search GSM cells
                </div>
                <div class="panel-body" id="map-wrap">
                  <div id="map" class="map"></div>
                  <div id="mapcontrols">
                     <div id="idtag"></div>
                  </div>
                </div>
                 <div class="panel-footer">
                     <div id="msg" class="notice info"><p>...</p></div>
                </div>
            </div>
    </div>
  </div>
</div>

        <!-- <div class="col-sm-offset-0 col-sm-2"> -->
    </div>
@endsection

@section('page-bottom-script')
<!-- Scripts -->
{!! Html::script('js/cellsearch.js') !!}
{!! Html::script('js/cellstyle.js') !!}
{!! Html::script('js/start.js') !!}
@endsection
