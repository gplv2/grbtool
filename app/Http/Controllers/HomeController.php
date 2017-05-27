<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

class HomeController extends Controller
{
    /**
     * Show the Offered services
     *
     * @return Response
     */
    public function showHom()
    {
        return view('home');
    }

    public function showAbout()
    {
        return view('about');
    }
}
