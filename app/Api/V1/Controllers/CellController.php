<?php

namespace App\Api\V1\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use JWTAuth;
// use App\User;
use App\Cell;
use DB;
use Dingo\Api\Routing\Helpers;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Cache;

class CellController extends Controller
{
   protected $hidden = ['password', 'remember_token'];

   use Helpers;
   //

   public function index(Request $request)
   {
      // DB::enableQueryLog();
      $currentUser = JWTAuth::parseToken()->authenticate();

      $geotable="cells";
      $fields = "osm_id, \"mnc\", \"mcc\", \"gsm:radio\", \"gsm:cellid\", \"gsm:lac\"";

      $srid = '900913';
      if ($request->has('srid')) {
         $srid = $request->input('srid');
      } 

      $limit=500;
      $sql_limit = '';

      $bbox='423893.71236239,6652130.399613,426123.52379659,6652903.1301958';
      $sbox='';

      if ($request->has('bbox')) {
         $bbox = pg_escape_string($request->input('bbox'));
      } 

      if ($request->has('sbox')) {
         $sbox = pg_escape_string($request->input('sbox'));
      } 

      $sig = md5($srid . '|'. $bbox . '|' . $fields);

      $output = Cache::get($sig,'');
      $output = "";

      if(!strlen($output)) {
         // &mnc=2222&mcc=1111&lac=33333&details=true
         $mnc=$mcc=$lac=NULL;
         $so=array(); // search options


         // gsm:lac umts:lac lte:lac
         // Build RAW SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
         $sql  = "SELECT " . sprintf(pg_escape_string($fields)) . ", ST_AsGeoJSON(ST_Transform(" . pg_escape_string("way") . ",$srid),15,4) AS geojson FROM " . pg_escape_string($geotable);

         $no_lac_set=false;
         $no_cell_set=false;

         if (! $request->has('bbox')) {
            if ($request->has('mnc')) {
               $mnc = $request->input('mnc');
               $so['mnc']=$mnc;
            } 
            if ($request->has('mcc')) {
               $mcc = $request->input('mcc');
               $so['mcc']=$mcc;
            } 
            if ($request->has('lac')) {
               // gsm:lac umts:lac lte:lac
               $lac = $request->input('lac');
               $so['gsm:lac']=$lac;
            } else {
               $no_lac_set=true;
            }
            if ($request->has('cell')) {
               // cellid
               $cell = $request->input('cell');
               $so['gsm:cellid']=$cell;
            } else {
               $no_cell_set=true;
            }

            if($no_lac_set || $no_cell_set) {
               $sql_limit = " LIMIT " . $limit;
            }

            if ($request->has('sbox')) {
               $sql_limit = '';
            }

            $and = '';

            foreach ($so as $param => $val) {
               $and .= sprintf(' AND "%s"=\'%s\'',pg_escape_string($param), pg_escape_string($val));
            }

            if(strlen($and)) {
               if ($request->has('sbox')) {
                  // Searchbox
                  list($sbox_west, $sbox_south, $sbox_east, $sbox_north) = preg_split("/,/", $sbox);
                  $sbox_area=sprintf(" WHERE way && ST_SetSRID('BOX3D(%s %s, %s %s)'::box3d, %s)", $sbox_west, $sbox_south, $sbox_east, $sbox_north, $srid);
                  $sql.= $sbox_area . $and . $sql_limit;
               } else {
                  $sql.= " WHERE 1=1 " . $and . $sql_limit;
               }
               // dd ($sql);
            } else {
               // We should not end up here
               exit();
            }
         } else {
            list($bbox_west, $bbox_south, $bbox_east, $bbox_north) = preg_split("/,/", $bbox);
            // in square meters -> 26986
            $bbox_area = sprintf("SELECT ST_Area(ST_Transform((ST_SetSRID('BOX3D(%s %s, %s %s)'::box3d, 900913)),26986)) as sqm",$bbox_west, $bbox_south, $bbox_east, $bbox_north);
            $bbox = DB::select(DB::raw($bbox_area));
            $bbox_size=$bbox[0]->sqm;

            //dd ($bbox_size);

            //if($bbox_size >  695923.15) 
            if($bbox_size >  504387832.05) {
               $msg=array('error' => 'bounding box size is too large '. round($bbox_size,2) . ' m2');
               $response = new Response();
               $response->header('charset', 'utf-8');
               return response()->json($msg);
               //return response()->json($msg,400);
            }

            $sql .= sprintf(" WHERE " . pg_escape_string("way") . " && ST_SetSRID('BOX3D(%s %s, %s %s)'::box3d, %s)", $bbox_west, $bbox_south, $bbox_east, $bbox_north, $srid);
         }


         //  explain SELECT osm_id, "mnc", "mcc", "gsm:radio", "gsm:cellid", "gsm:lac", ST_AsGeoJSON(ST_Transform(way,900913),15,4) 
         //  AS geojson FROM cells WHERE way && ST_SetSRID('BOX3D(383865.19328215 6635266.48025, 455219.15917643 6659993.8588968)'::box3d, 900913)
         //  explain SELECT osm_id, "mnc", "mcc", "gsm:radio", "gsm:cellid", "gsm:lac", ST_AsGeoJSON(ST_Transform(way,900913),15,4) 
         //  AS geojson FROM cells WHERE way && ST_SetSRID('BOX3D(382234.25632491 6566593.3158132, 669484.60858063 6697453.5082192)'::box3d, 900913)
         //dd($_REQUEST);
         // dd($sql);exit;

         $cells = DB::select(DB::raw($sql));

         // dd( DB::getQueryLog());
         // $rec_count = count ( $cells );
         $rowOutput = '';
         $output = '';

         foreach ($cells as $k => $row) {
            $rowOutput = (strlen($rowOutput) > 0 ? ',' : '') . '{"type": "Feature", "geometry": ' . $row->geojson . ', "properties": {';
            $props = '';
            $id    = '';
            foreach ($row as $key => $val) {
               if ($key !== 'geojson') {
                  if (strlen($val)>0) {
                     $props .= (strlen($props) > 0 ? ',' : '') . '"' . $key . '":"' . $this->escapeJsonString($val) . '"';
                  }
               }
               if ($key == 'id') {
                  $id .= ',"id":"' . $this->escapeJsonString($val) . '"';
               }
            }

            $rowOutput .= $props . '}';
            $rowOutput .= $id;
            $rowOutput .= '}';
            $output .= $rowOutput;
         }

        $output = '{ "type": "FeatureCollection", "features": [ ' . $output . ' ]}';
        if (strlen($output)){ 
            Cache::put($sig, $output, 60);
        }
      }
      // echo $output;
      $json_string = json_encode(json_decode($output));
      //$json_string = json_encode(json_decode($output), JSON_PRETTY_PRINT);
      $type='application/json'; // ->header('Content-Type', $type);

      $response = new Response();
      $response->header('charset', 'utf-8');

      return response()->json($json_string);
      // return (new Response($json_string, $status))->header('Content-Type', $value);
   }

    /**
     * Store a file resource to geocode
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
   public function batch(Request $request)
   {
      $response = new Response();
      $response->header('charset', 'utf-8');

      $geotable="cells";
      $fields = "osm_id, \"mnc\", \"mcc\", \"gsm:radio\", \"gsm:cellid\", \"gsm:lac\"";

      $srid = '900913';
      if ($request->has('srid')) {
         $srid = $request->input('srid');
      } 

      // DB::enableQueryLog();
      $currentUser = JWTAuth::parseToken()->authenticate();

      $laccelldata=null;
      $dataintext=array();

      if ($request->has('laccelldata')) {
         $laccelldata = $request->input('laccelldata');
      } 
      if (empty($laccelldata)) {
         $msg=array('error' => "Empty laccelldata parameters!");
         return response()->json($msg,400);
      } else {
         $laccelldata = str_replace(',',';',$laccelldata);
         $lines = explode(PHP_EOL, $laccelldata);
         $rows = array();

         //dd($lines);

         // Preprocess the list intelligently for query and reply reason
         // Remove excessive duplicates
         $filtered= array();
         $lastline= null;
         foreach ($lines as $line) {
            if (isset($lastline)) { 
               if ($line == $lastline) { 
                  continue;
               } else {
                  $filtered[]=$line;
               }
            } else {
               $filtered[]=$line;
            }
            $lastline=$line;
         }
         //dd($filtered);exit;

         foreach ($filtered as $line) {
            $rows[] = str_getcsv($line, ';');
         }

         // Check first element syntax
         if (!empty($rows[0])) {
            if (count($rows[0])!== 2) {
               $msg=array('error' => 'Bad csv data, construct input as lac;cell pairs');
               $response = new Response();
               $response->header('charset', 'utf-8');
               return response()->json($msg,400);
            }
         }


         // $unique_rows = array_unique(dar

         // echo print_r($rows,true);exit;

         $sql  = "SELECT " . sprintf(pg_escape_string($fields)) . ", ST_AsGeoJSON(ST_Transform(" . pg_escape_string("way") . ",$srid),15,4) AS geojson FROM " . pg_escape_string($geotable);

         // dd($rows);exit;
         $in_lac=" (";
         $in_cell=" (";
         // echo print_r($rows);

         foreach ($rows as $k => $val) {
            if (empty($val[1]) || empty($val[0])) {
               continue;
            }
            $lac=$val[0]; // I know, why the xtra vars..  I like it
            $cell=$val[1];
            $in_lac.="'".$lac ."',";
            $in_cell.="'".$cell ."',";
         }

         $in_lac = substr($in_lac, 0, -1);
         $in_cell = substr($in_cell, 0, -1);

         $in_lac.=")";
         $in_cell.=")";

         $so['gsm:lac']=$in_lac;
         $so['gsm:cellid']=$in_cell;

         $where =' WHERE 1 = 1';

         $and = "";
         foreach ($so as $param => $val) {
            $and .= sprintf(' AND "%s" IN %s',pg_escape_string($param), ($val));
         }

         $sql.= $where . $and;

         //$sql .= sprintf(" WHERE " . pg_escape_string("way") . " && ST_SetSRID('BOX3D(%s %s, %s %s)'::box3d, %s)", $bbox_west, $bbox_south, $bbox_east, $bbox_north, $srid);

         //  explain SELECT osm_id, "mnc", "mcc", "gsm:radio", "gsm:cellid", "gsm:lac", ST_AsGeoJSON(ST_Transform(way,900913),15,4) 
         //  AS geojson FROM cells WHERE way && ST_SetSRID('BOX3D(383865.19328215 6635266.48025, 455219.15917643 6659993.8588968)'::box3d, 900913)
         //  explain SELECT osm_id, "mnc", "mcc", "gsm:radio", "gsm:cellid", "gsm:lac", ST_AsGeoJSON(ST_Transform(way,900913),15,4) 
         //  AS geojson FROM cells WHERE way && ST_SetSRID('BOX3D(382234.25632491 6566593.3158132, 669484.60858063 6697453.5082192)'::box3d, 900913)
         //dd($_REQUEST);
/*
      { "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0]
            ]
          },
        "properties": {
          "prop0": "value0",
          "prop1": 0.0
          }
        },
*/

         $cells = DB::select(DB::raw($sql));

         $rowOutput = '';
         $output = '';

         //dd($sql);exit;

         foreach ($cells as $k => $row) {
            $rowOutput = (strlen($rowOutput) > 0 ? ',' : '') . '{"type": "Feature", "geometry": ' . $row->geojson . ', "properties": {';
            $props = '';
            $id    = '';
            foreach ($row as $key => $val) {
               if ($key !== 'geojson') {
                  if (strlen($val)>0) {
                     $props .= (strlen($props) > 0 ? ',' : '') . '"' . $key . '":"' . $this->escapeJsonString($val) . '"';
                  }
               }
               if ($key == 'id') {
                  $id .= ',"id":"' . $this->escapeJsonString($val) . '"';
               }
            }

            $rowOutput .= $props . '}';
            $rowOutput .= $id;
            $rowOutput .= '}';
            $output .= $rowOutput;
         }

         $output = '{ "type": "FeatureCollection", "features": [ ' . $output . ' ]}';
         $json_string = json_encode(json_decode($output));
         $type='application/json'; // ->header('Content-Type', $type);
         // return response()->json($dataintext);
         return response()->json($output);
      }
   }


   public function escapeJsonString($value)
   {
   // list from www.json.org: (\b backspace, \f formfeed)
      $escapers = array("\\", "/", "\"", "\n", "\r", "\t", "\x08", "\x0c");
      $replacements = array("\\\\", "\\/", "\\\"", "\\n", "\\r", "\\t", "\\f", "\\b");
      $result = str_replace($escapers, $replacements, $value);
      return $result;
   }
}
