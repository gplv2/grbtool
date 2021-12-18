<?php

namespace App\Api\V1\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use JWTAuth;
use Validator;
use App\User;
use App\Option;
use Storage;
use DB;
use Dingo\Api\Routing\Helpers;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Cache;

class OptionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $currentUser = JWTAuth::parseToken()->authenticate();

        $type='application/json'; // ->header('Content-Type', $type);

        $response = new Response();
        $response->header('charset', 'utf-8');
        $options = array();
	$data = $request->toArray();

	if (!empty($data['name'])) {
		$options = Option::where('user_id', $currentUser->id)->where('name', '=', $data['name'])->get()->first();
	} else {
		$options = Option::where('user_id', $currentUser->id)->get();
	}

        //dd($options);

        return response()->json(compact('options'),200);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $currentUser = JWTAuth::parseToken()->authenticate();

        // $options = Option::where('user_id', $currentUser->id)->get();
        $response = new Response();

        $length = 32;
        $token = '';

        $msg=array('status' => 'option created');

        if ($request->isMethod('post')) {
            //dd($request->all());exit;
            if (strlen($request->getContent())) {
                $data = $request->toArray();

                $validator = Validator::make($data, $this->rules());
                if ($validator->fails()) {
                    $reply = $validator->messages();
                    return response()->json($reply,428);
                };

                Option::unguard();
                $option = Option::where('user_id', $currentUser->id)->where('name', '=', $data['name'])->get()->first();
                if (empty($option)) {
                    $option = new Option();
                    $option->user_id = $currentUser->id;
                } else {
                    $msg=array('status' => 'option updated');
                }
                $option->name = $data['name'];
                $option->value = $data['value'];

                if($option->save()){
                    $response->status = "STATUS_OK";
                    //$response->code = $response::code_ok;
                    $response->result = $msg;
                }
                Option::reguard();
            }
        }

        $type='application/json'; // ->header('Content-Type', $type);
        $response->header('Content-Type', $type);
        $response->header('charset', 'utf-8');
        return response()->json($msg);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    public function rules()
    {
        // 'label', 'dsn', 'priority',
        return [
            //'id'   => 'required',
            'name'     => 'required|min:5',
            'value' => 'required'
            //'user'     => 'required|min:2'
            ];
    }
}
