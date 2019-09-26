<?php


namespace App\Api\V1\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use JWTAuth;
// use App\Grb;
use Validator;
use App\User;
use App\DataExport;
use Storage;
use DB;
use Dingo\Api\Routing\Helpers;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Cache;

class ExportController extends Controller
{
    protected $hidden = ['password', 'remember_token'];

    use Helpers;
    //

    public function index(Request $request)
    {
        // DB::enableQueryLog();
        $currentUser = JWTAuth::parseToken()->authenticate();
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

        $length = 32;
        $token = '';

        $msg=array('status' => 'request received');

        if ($request->isMethod('post')) {
            $postbody='';
            // Check for presence of a body in the request

            // dd($request);exit;

            if (strlen($request->getContent())) {
                $postbody = $request->getContent();
                if (function_exists("random_bytes")) {
                    $bytes = random_bytes(ceil($length / 2));
                    $token = substr(bin2hex($bytes), 0, $length);
                } else {
                    $bytes = openssl_random_pseudo_bytes(32);
                    $token = bin2hex($bytes);
                }
                if(strlen($token)) {
                    Storage::disk('public')->put($token.'.osm', $postbody);
                    $msg=array('fname' => $token . '.osm', 'url' => 'public/'. $token .'.osm' , 'status' => 'stored');
                }
/*
                $validator = Validator::make($request->all(), $this->rules());
                if ($validator->fails()) {
                    $reply = $validator->messages();
                    return response()->json($reply,428);
                };
*/
                DataExport::unguard();
                $dataexport = new DataExport([
                        'filename' => $token.'.osm',
                        'user' => $currentUser.id
                        ]);

                $dataexport->save();
                DataExport::reguard();
            }
        }

        $response = new Response();
        $response->header('charset', 'utf-8');
        return response()->json($msg);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($export_id)
    {
        $currentUser = JWTAuth::parseToken()->authenticate();

        $type='application/json'; // ->header('Content-Type', $type);

        $response = new Response();
        $response->header('charset', 'utf-8');

        $export = DataExport::where('id', $export_id)->firstOrFail();

        return response()->json(compact('export'),200);
    }

    /**
     * Display all exports .
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function showlist()
    {
        $currentUser = JWTAuth::parseToken()->authenticate();

        $type='application/json'; // ->header('Content-Type', $type);

        $response = new Response();
        $response->header('charset', 'utf-8');

        $exports = DataExport::all();

        return response()->json(compact('exports'),200);
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $currentUser = JWTAuth::parseToken()->authenticate();
        //
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        // 'label', 'dsn', 'priority',
        return [
            //'id'   => 'required',
            //'filename'     => 'required|min:5'
            'body' => 'required'
            //'user'     => 'required|min:2'
            ];
    }
}
