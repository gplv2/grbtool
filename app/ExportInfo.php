<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ExportInfo extends Model
{
    public function dataexport()
    {
        return $this->belongsTo(DataExport::Class);
    }
}
