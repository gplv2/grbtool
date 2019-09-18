@extends('layouts.app')

@section('title', '- About')

@section('page-style')
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
                  A word about this tool
               </div>
                <div class="panel-body">
                This tool wants to be the middleware in between the official Belgian open dataset for buildings and OSM. Behind the scene's, data is projected to lean more towards OSM as such make it easier to merge with existing data and keep the best of both worlds. 
                </div>
         </div>
    </div>
    <div class="col-sm-8 col-md-8 sidebar sidebar-right pull-left">
          <div class="panel panel-default">
                <div class="panel-heading">
                  Handy links
               </div>
                <div class="panel-body">
                  <table class="table table-striped">
                    <thead>
                    <tr>
                    <th>Link</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Remark</th>
                    </thead>
                    <tbody>
                    <tr><td><a href="https://hackmd.io/@qiTythlKSE-TswFl_PrlrA/HkqtMWE8E?type=view#" title="working notes"/></td>Hackpad Working notes<td>Updated regulary</td><td>-</td></tr>
                    <tr><td><a href="https://wiki.openstreetmap.org/wiki/AIV_GRB_building_import" title="working notes"/></td>GRB landing page<td>static</td><td>-</td></tr>
                    <tr><td><a href="https://wiki.openstreetmap.org/wiki/AIV_GRB_building_import/Import_plan" title="Import plan"/></td>Import plan, more like a merge plan as we do not really import blindly<td>Up to date</td><td>-</td></tr>
                    <tr><td><a href="https://wiki.openstreetmap.org/wiki/AIV_GRB_building_import/Background" title="GRB details"/></td>Background information on the GRB data<td>static</td><td>-</td></tr>
                    <tr><td><a href="https://wiki.openstreetmap.org/wiki/AIV_GRB_building_import/The_import_guidelines_applied" title="Import guidelines flow"/></td>Information and flow of how we followed the guidelines<td>static</td><td>-</td></tr>
                    </tbody>
                  </table>
                </div>
          <div class="panel-footer">
            For a complete list of URLS, code, tools and much more information it's best to browse the OSM wiki pages.
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
