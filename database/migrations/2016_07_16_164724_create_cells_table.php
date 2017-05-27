<?php

use Illuminate\Database\Migrations\Migration;
use Phaza\LaravelPostgis\Schema\Blueprint;

class CreateCellsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cells', function (Blueprint $table) 
        {
            $table->increments('id');
            $table->integer('osm_id')->index()->nullable();
            $table->string('name')->index()->nullable();
            //$table->string('address')->unique();
            //$table->polygon('polygon');
            $table->string('man_made')->nullable();
            $table->string('tower:type')->nullable();
            $table->string('operator')->index()->nullable();
            $table->string('mcc')->index();
            $table->string('mnc')->index();
            $table->string('communication:mobile_phone')->nullable();
            $table->string('gsm:radio')->nullable();
            $table->string('gsm:cellid')->index()->nullable();
            $table->string('gsm:lac')->index()->nullable();
            $table->string('umts:cellid')->index()->nullable();
            $table->string('umts:lac')->index()->nullable();
            $table->string('umts:rnc')->nullable();
            $table->string('lte:cellid')->index()->nullable();
            $table->string('lte:lac')->index()->nullable();
            $table->string('lte:enb')->nullable();
            $table->string('location')->nullable();
            $table->string('height')->nullable();
            $table->string('building')->nullable();
            $table->string('construction')->nullable();
            $table->string('covered')->nullable();
            $table->string('layer')->nullable();
            $table->string('ref')->nullable();
            $table->string('width')->nullable();
            $table->string('source')->nullable();
            //$table->point('way',3857);
            $table->timestamps();
        });
      \DB::statement(DB::raw("ALTER TABLE cells add column way geometry(Point,3857);"));
      \DB::statement(DB::raw("CREATE INDEX \"idx_point_gsm:cell\" ON cells USING gist (way) WHERE (\"gsm:cellid\" IS NOT NULL);"));
      \DB::statement(DB::raw("CREATE INDEX \"idx_point_gsm:lac\" ON cells USING gist (way) WHERE (\"gsm:lac\" IS NOT NULL);"));
      \DB::statement(DB::raw("CREATE INDEX idx_point_man_made ON cells USING gist (way) WHERE (man_made IS NOT NULL);"));
      \DB::statement(DB::raw("CREATE INDEX idx_point_name ON cells USING gist (way) WHERE (name IS NOT NULL);"));
      \DB::statement(DB::raw("CREATE INDEX idx_point_operator ON cells USING gist (way) WHERE (operator IS NOT NULL);"));
      \DB::statement(DB::raw("CREATE INDEX idx_point_tower_type ON cells USING gist (way) WHERE (\"tower:type\" IS NOT NULL);"));
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('cells');
    }
}
