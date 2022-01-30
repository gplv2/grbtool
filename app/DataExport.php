<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DataExport extends Model
{
/*
   public function user()
   {
       return $this->hasMany('App\User');
   }
*/

   public function user()
   {
      return $this->belongsTo(User::Class);
   }

   public function dataexport()
   {
      return $this->hasOne(ExportInfo::Class);
   }
}
