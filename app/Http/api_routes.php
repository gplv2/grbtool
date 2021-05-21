<?php

$api = app('Dingo\Api\Routing\Router');

$api->version('v1', function ($api) {
    $api->post('auth/login', 'App\Api\V1\Controllers\AuthController@login');
    $api->post('auth/signup', 'App\Api\V1\Controllers\AuthController@signup');
    $api->post('auth/recovery', 'App\Api\V1\Controllers\AuthController@recovery');
    $api->post('auth/reset', 'App\Api\V1\Controllers\AuthController@reset');
    $api->post('auth/verify', 'App\Api\V1\Controllers\AuthController@verify');

    // example of protected route
    $api->get('protected', ['middleware' => ['api.auth'], function () {
        return \App\User::all();
    }]);

   $api->group(['middleware' => 'api.auth'], function ($api) {
      $api->get('export/list', 'App\Api\V1\Controllers\ExportController@index');
      $api->get('export/listall', 'App\Api\V1\Controllers\ExportController@showlist');
      $api->get('export/download', 'App\Api\V1\Controllers\ExportController@show');
      $api->post('export/upload', 'App\Api\V1\Controllers\ExportController@store');
      $api->get('option', 'App\Api\V1\Controllers\OptionController@index');
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
