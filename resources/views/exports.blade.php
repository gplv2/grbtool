@extends('layouts.app')

@section('title', '- About')

@section('page-style')
<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
<style>
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
</style>
<link rel="stylesheet" href="js/tabulator-master/dist/css/tabulator_midnight.css">

@stop
@section('bodydef')
<body>
@endsection

@section('content')

<div class="container-fluid">
  <div class="row-fluid">
    <div class="col-sm-8 col-md-8 sidebar sidebar-right pull-left">
          <div class="panel panel-default">
                <div class="panel-heading">
                  List of exports by known users
               </div>
                <div class="panel-body">
                </div>
         </div>
    </div>
    <div class="col-sm-8 col-md-8 sidebar sidebar-right pull-left">
          <div class="panel panel-default">
                <div class="panel-heading">
                  Users have exported this data
               </div>
                <div class="panel-body">
                  <table id="exportlist" class="table table-striped">
                  </table>
                </div>
          <div class="panel-footer">
            You can download these exports by clicking on them
          </div>
          </div>
<!-- 
          <div class="panel panel-default">
                <div class="panel-heading">
                  Radio types
               </div>
                <div class="panel-body">
               </div>
         </div>
-->
    </div>
  </div>
</div>


@endsection

@section('page-bottom-script')

{!! Html::script('js/moment-with-locales.min.js') !!}
{!! Html::script('js/tabulator-master/dist/js/tabulator.min.js') !!}
{!! Html::script('js/exports.js') !!}

@endsection
