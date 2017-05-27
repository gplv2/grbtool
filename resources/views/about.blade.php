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
                  A word about this data
               </div>
                <div class="panel-body">
                The data in our database is open.  We limited the scope of the data in this site to Belgian mobile phone operators.  Feel free to get in touch in order to get a deal on providing batch geocoding and/or other data layers we have in our store.
                </div>
         </div>
    </div>
    <div class="col-sm-8 col-md-8 sidebar sidebar-right pull-left">
          <div class="panel panel-default">
                <div class="panel-heading">
                  Operators in Belgium
               </div>
                <div class="panel-body">
                  <table class="table table-striped">
                    <thead>
                    <tr>
                    <th>MCC</th>
                    <th>MNC</th>
                    <th>Brand</th>
                    <th>Operator</th>
                    <th>Status</th>
                    <th>Frequency Bands</th>
                    <th>Remark</th>
                    </thead>
                    <tbody>
                    <tr><td>206 </td><td> 00 </td><td> Proximus </td><td> Belgacom Mobile </td><td> Unknown </td><td> Unknown </td><td></td></tr>
                    <tr><td>206 </td><td> 01 </td><td> Proximus </td><td> Belgacom Mobile </td><td> Operational </td><td> GSM 900 / GSM 1800 / UMTS 900 / UMTS 2100 / LTE 1800 </td><td></td></tr>
                    <tr><td>206 </td><td> 02 </td><td> NMBS </td><td> National Railway Company of Belgium</td><td> Operational </td><td> GSM-R </td><td></td></tr>
                    <tr><td>206 </td><td> 05 </td><td> Telenet Belgium</td><td> Telenet</td><td> Operational </td><td> MVNO </td><td> MVNO using Mobistar's Network</td></tr>
                    <tr><td>206 </td><td> 06 </td><td> Lycamobile </td><td> Lycamobile sprl </td><td> Operational </td><td> MVNO </td><td></td></tr>
                    <tr><td>206 </td><td> 07 </td><td> Vectone Mobile </td><td> Mundio Mobile Belgium nv </td><td> Reserved </td><td> MVNO </td><td></td></tr>
                    <tr><td>206 </td><td> 09 </td><td> Voxbone </td><td> Voxbone mobile </td><td> Operational </td><td> MVNO </td><td> Cloud MVNO-provider, that provides mobile VOIP services on a wholesale basis</td></tr>
                    <tr><td>206 </td><td> 10 </td><td> Mobistar </td><td> Orange S.A. </td><td> Operational </td><td> GSM 900 / GSM 1800 / UMTS 900 / UMTS 2100 / LTE 800 / LTE 1800 </td><td></td></tr>
                    <tr><td>206 </td><td> 15 </td><td> Elephant Talk</td><td> Elephant Talk Communications Schweiz GmbH </td><td> Not operational </td><td> Unknown </td><td> Withdrawn</td></tr>
                    <tr><td>206 </td><td> 20 </td><td> BASE</td><td> KPN Group Belgium </td><td> Operational </td><td> GSM 900 / GSM 1800 / UMTS 900 / UMTS 2100 / LTE 1800 </td><td></td></tr>
                    <tr><td>206 </td><td> 40 </td><td> JOIN </td><td> JOIN Experience Belgium </td><td> Operational </td><td> MVNO </td><td></td></tr>
                    </tbody>
                  </table>
                </div>
          <div class="panel-footer">
            For a complete list of operators worldwide, I recommend to check {!! Html::link('https://en.wikipedia.org/wiki/Mobile_country_code', $title = 'wikipedia mobile country code' ) !!} page.
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
