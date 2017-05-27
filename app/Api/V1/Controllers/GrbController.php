<?php


namespace App\Api\V1\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use JWTAuth;
// use App\User;
use App\Grb;
use DB;
use Dingo\Api\Routing\Helpers;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Cache;

class GrbController extends Controller
{
   protected $hidden = ['password', 'remember_token'];

   use Helpers;
   //

   public function index(Request $request)
   {
      // DB::enableQueryLog();
      $currentUser = JWTAuth::parseToken()->authenticate();


      $geotable = 'planet_osm_polygon';
      $geomfield = 'way';


      $geotable="planet_osm_polygon";

      $fields = "osm_id, \"addr:housename\", \"addr:housenumber\", \"addr:interpolation\", \"addr:street\", \"addr:flats\", man_made, building, highway , %s, \"source:geometry:entity\", \"source:geometry:date\", \"source:geometry:oidn\", \"source:geometry\", \"source:geometry:uidn\", source";
      $tags="tags -> 'building:levels' AS \"building:levels\" , tags -> 'building:min_level' AS \"building:min_level\"";

      $srid = '900913';
      if ($request->has('srid')) {
         $srid = $request->input('srid');
      } 

      $limit=500;
      $sql_limit = '';

      $bbox='423893.71236239,6652130.399613,426123.52379659,6652903.1301958';

      if ($request->has('bbox')) {
         $bbox = pg_escape_string($request->input('bbox'));
      } 

      $sig = md5($srid . '|'. $bbox . '|' . $fields);

      $output = Cache::get($sig,'');
      $output = "";

      if(!strlen($output)) {
         list($bbox_west, $bbox_south, $bbox_east, $bbox_north) = preg_split("/,/", $bbox);

         // gsm:lac umts:lac lte:lac
         // Build RAW SQL SELECT statement and return the geometry as a GeoJSON element in EPSG: 4326
         $sql  = "SELECT " . sprintf(pg_escape_string($fields), $tags) . ", ST_AsGeoJSON(ST_Transform(" . pg_escape_string($geomfield) . ",$srid),15,4) AS geojson FROM " . pg_escape_string($geotable);
         $sql .= sprintf(" WHERE " . pg_escape_string("way") . " && ST_SetSRID('BOX3D(%s %s, %s %s)'::box3d, %s)", $bbox_west, $bbox_south, $bbox_east, $bbox_north, $srid);
         // $sql  = "SELECT " . sprintf(pg_escape_string($fields)) . ", ST_AsGeoJSON(ST_Transform(" . pg_escape_string("way") . ",$srid),15,4) AS geojson FROM " . pg_escape_string($geotable);

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

         //$sql .= sprintf(" WHERE " . pg_escape_string("way") . " && ST_SetSRID('BOX3D(%s %s, %s %s)'::box3d, %s)", $bbox_west, $bbox_south, $bbox_east, $bbox_north, $srid);


         $grb = DB::select(DB::raw($sql));

         // dd( DB::getQueryLog());
         // $rec_count = count ( $grb );
         $rowOutput = '';
         $output = '';

         foreach ($grb as $k => $row) {
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

   public function escapeJsonString($value)
   {
   // list from www.json.org: (\b backspace, \f formfeed)
      $escapers = array("\\", "/", "\"", "\n", "\r", "\t", "\x08", "\x0c");
      $replacements = array("\\\\", "\\/", "\\\"", "\\n", "\\r", "\\t", "\\f", "\\b");
      $result = str_replace($escapers, $replacements, $value);
      return $result;
   }
}
