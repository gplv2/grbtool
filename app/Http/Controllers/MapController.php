<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

class MapController extends Controller
{
    /**
     * Show the Offered services
     *
     * @return Response
     */
    public function showMap()
    {
        return view('maps');
    }

    public function showSearch()
    {
        return view('search');
    }

    public function showAbout()
    {
        return view('about');
    }

    public function showExports()
    {
        return view('exports');
    }

    public function showOptions()
    {
        return view('options');
    }
}
