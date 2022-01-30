<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Storage;
use Helpers;

use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class Osmium extends Command
{

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'osmium:info {dataexport.filename?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Analyse/Update exports for detailed information';
    /**
     * Osmium var
     *
     * @var string
     */

    protected $osmium;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    //public function __construct(DataExport $osmium)
    public function __construct()
    {
        parent::__construct();
        //$this->osmium = $osmium;
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    private function osmium($file)
    {
        // run this : osmium fileinfo -e /var/www/grbtool_staging/storage/app/public/f001be0f7f561b1c347f036a1532a811.osm --no-progress
        //dd($file);
        $process = new Process(['osmium','fileinfo','-e', $file,'--no-progress']);
        $process->run();
        //$this->info($process->getOutput());
        if (!$process->isSuccessful()) {
            $this->error("Error with: " . $file);
            throw new ProcessFailedException($process);
        } else {
            // $this->info($process->getOutput());
            // Bounding box: (3.498817,51.1357629,3.508385,51.140247)
            preg_match_all('/Bounding box: \((.+)\)/', $process->getOutput(), $matches);
            $bbox=array_pop($matches[1]);
            // Number of nodes: 208
            preg_match_all('/Number of nodes: (.+)/', $process->getOutput(), $matches);
            $nodes=array_pop($matches[1]);
            // Number of ways: 31
            preg_match_all('/Number of ways: (.+)/', $process->getOutput(), $matches);
            $ways=array_pop($matches[1]);
            // Number of relations: 0
            preg_match_all('/Number of relations: (.+)/', $process->getOutput(), $matches);
            $relations=array_pop($matches[1]);
            //dd($matches);
        }
        $res = array('bbox' => $bbox, 'nodes' => $nodes, 'ways' => $ways, 'relations' => $relations);
        //dd($res);
        return ($res);
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        if (!empty($this->argument('dataexport.filename'))) {
            $filename = $this->argument('dataexport.filename');

            $time = Storage::disk('public')->lastModified($filename);

            if (!empty($time)) {
                $export=\App\DataExport::where('filename', '=', $filename)->first();

                if (is_null($export)) {
                    $this->info(sprintf("Skipping File %s has no database entry (old export)",$filename));
                } else {
                    \App\ExportInfo::unguard();
                    // see if an entry exists, skip it if already have this info
                    $export_info=\App\ExportInfo::where('data_export_id', '=', $export->id)->first();
                    if (!empty($export_info->id)) {
                        // skip and do next (so none in single file mode)
                        return;
                    }

                    // Check with osmium
                    // $this->info($export->filename);
                    $path = Storage::disk('public')->getAdapter()->getPathPrefix();
                    $res = $this->osmium($path . $export->filename);
                    if (!empty($res)) {
                        // bbox           | character varying(255)         |           | not null | 
                        // areaname       | character varying(255)         |           | not null | 
                        // info           | character varying(255)         |           | not null | 

                        $exportinfo = new \App\ExportInfo([
                            'data_export_id' => $export->id,
                            'bbox' => $res['bbox'],
                            'info' => sprintf("Exported %d nodes, %d ways and %d relations",$res['nodes'], $res['ways'], $res['relations'])
                        ]);

                        $exportinfo->save();
                    }
                    \App\ExportInfo::reguard();
                }
            }
        } else {
            $exports = \App\DataExport::all();

            if (empty($exports)) {
                $this->error("Cannot find any export!");
            }

            \App\ExportInfo::unguard();
            foreach($exports as $e){
                //dd($e);
                $time = Storage::disk('public')->lastModified($e->filename);
                if (empty($time)) {
                    $this->error("missing on disk: " . $e->filename);
                } else {
                    // see if an entry exists, skip it if already have this info
                    $export_info=\App\ExportInfo::where('data_export_id', '=', $e->id)->first();
                    if (!empty($export_info->id)) {
                        // skip and do next
                        continue;
                    }
                    
                    // Check with osmium
                    $this->info($e->filename);
                    $path = Storage::disk('public')->getAdapter()->getPathPrefix();
                    $res = $this->osmium($path . $e->filename);
                    if (!empty($res)) {
                        // bbox           | character varying(255)         |           | not null | 
                        // areaname       | character varying(255)         |           | not null | 
                        // info           | character varying(255)         |           | not null | 

                        $exportinfo = new \App\ExportInfo([
                            'data_export_id' => $e->id,
                            'bbox' => $res['bbox'],
                            'info' => sprintf("Exported %d nodes, %d ways and %d relations",$res['nodes'], $res['ways'], $res['relations'])
                        ]);

                        $exportinfo->save();
                    }

                }
            }
            \App\ExportInfo::reguard();
            // dd($exports[0]);
        }
    }
}
