<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Cell extends Model
{
   public function cells()
   {
      return $this->hasMany('App\Cell');
   }
}
