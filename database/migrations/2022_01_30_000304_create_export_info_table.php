<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateExportInfoTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('export_infos', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('data_export_id')->unique();
            //$table->string('filename')->unique();
            $table->string('bbox');
            $table->string('areaname')->nullable();
            $table->string('info');
            $table->timestamps();
	    ///$table->index('data_exports_id');
	    $table->foreign('data_export_id')->references('id')->on('data_exports');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
