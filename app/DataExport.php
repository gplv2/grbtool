<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DataExport extends Model
{
   public function exports()
   {
       return $this->hasMany('App\User');
   }
}
