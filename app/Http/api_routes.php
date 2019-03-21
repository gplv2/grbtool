<?php
	
$api = app('Dingo\Api\Routing\Router');

$api->version('v1', function ($api) {
    $api->post('auth/login', 'App\Api\V1\Controllers\AuthController@login');
    $api->post('auth/signup', 'App\Api\V1\Controllers\AuthController@signup');
    $api->post('auth/recovery', 'App\Api\V1\Controllers\AuthController@recovery');
    $api->post('auth/reset', 'App\Api\V1\Controllers\AuthController@reset');

	// example of protected route
	$api->get('protected', ['middleware' => ['api.auth'], function () {		
		return \App\User::all();
    }]);

   $api->group(['middleware' => 'api.auth'], function ($api) {
      //$api->post('cell/store', 'App\Api\V1\Controllers\CellController@store');
      $api->get('cell', 'App\Api\V1\Controllers\CellController@index');
      $api->get('batch', 'App\Api\V1\Controllers\CellController@batch');
      $api->post('batch', 'App\Api\V1\Controllers\CellController@batch');
   });

   $api->group(['middleware' => 'api.auth'], function ($api) {
      //$api->post('cell/store', 'App\Api\V1\Controllers\CellController@store');
      $api->get('cell', 'App\Api\V1\Controllers\ExportController@index');
      $api->get('batch', 'App\Api\V1\Controllers\ExportController@batch');
      $api->post('batch', 'App\Api\V1\Controllers\ExportController@batch');
   });

	// example of free route
	$api->get('free', function() {
		return \App\User::all();
	});

    $api->get('status', ['middleware' => ['api.auth'], function () {
        // We need to trap this as cli stuff does not have JWT token inside. weird framework behavior
        $sapi_type = php_sapi_name();
        if (substr($sapi_type, 0, 3) == 'cli') {
            return \App\User::all();
        } else {
            return $currentUser = JWTAuth::parseToken()->authenticate();
        }
    }]);
});
