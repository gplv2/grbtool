<?php

namespace App\Api\V1\Controllers;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Mail\Message;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\User;
use App;
use App\DataExport;
use App\ExportInfo;
use Storage;
use DB;
//use Dingo\Api\Routing\Helpers;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Cache;
use Roumen;

class FeedController extends Controller
{
    //use Helpers;
    /**
    * Instance of Feed.
    *
    * @var Roumen\Feed\Facades\Feed
    */
    private $feed;

    /**
    * Whether it is a RSS Feed.
    *
    * @var bool
    */
    private $isRss;

    public function __construct()
    {
        $this->feed = new Roumen\Feed\Feed;

    }

    public function rssFeed(Request $request)
    {
        $type='application/xml'; // ->header('Content-Type', $type);
        $response = new Response();
        $response->header('charset', 'utf-8');
        /* create new feed */
	    //$feed = App::make('feed');

        //$this->feed->setCache(15, 'laravelFeedKey');
        $this->feed->setCache(10, 'laravelFeedKey3sdfsdf');

        if (1==1 || !$this->feed->isCached())
        {
            /* Take out 15 exports from database to create feed */
            $exports = DataExport::orderBy('created_at' ,'desc')->take(15)->get();

            //return response()->json($exports);
            //return response()->json(compact('exports'),200);

            /* Set feed's title, description, link, publish date and language */
            $this->feed->title = 'Building exports';
            $this->feed->description = 'Exports of buildings';
            $this->feed->logo = url('img/app_final_150.png');
            $this->feed->link = url('api/rss-feed');
            $this->feed->setDateFormat('datetime');
            $this->feed->pubdate = $exports[0]->created_at;
            $this->feed->lang = 'en';
            $this->feed->setShortening(true);
            $this->feed->copyright = 'All rights reserved by Foobar Corporation';
            $this->feed->setTextLimit(100);

			    //dd($exports[0]->dataexport);
            //$this->feed->caching(true);

            //dd($this->feed);
            // {"id":8084,"user_id":"54","filename":"b2911194269dcf94aa09d00b61f5bd6b.osm","created_at":"2022-01-29 12:52:38","updated_at":"2022-01-29 12:52:38"},
            //debug($export);
            foreach ($exports as $export)
	    {
		    //if ($export->id==8093){
			    //dd($export->exportinfo);
		    //}
                $this->feed->add('Export nr: ' . $export->id ,$export->user->name, url('public/'.$export->filename), $export->created_at,'description','content');
            }
        }
        return $this->feed->render('atom');
    }
}
