<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

Route::get('/', function () {
    //return view('welcome'); 
    return view('home'); 
    //return redirect('maps');
});

Route::resource('maps', 'MapController@showMap', ['only' => [
    'index', 'show'
]]);

Route::resource('search', 'MapController@showSearch', ['only' => [
    'index', 'show'
]]);

Route::resource('about', 'MapController@showAbout', ['only' => [
    'index', 'show'
]]);

Route::resource('exports', 'MapController@showExports', ['only' => [
    'index', 'show'
]]);

Route::resource('options', 'MapController@showOptions', ['only' => [
    'index', 'show'
]]);
