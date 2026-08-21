<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Home extends Model
{
    protected $fillable = ['name', 'address', 'timezone'];

    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }
}
