<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kecamatan extends Model
{
    protected $table = 'kecamatan';

    protected $fillable = [
        'nama_kecamatan',
        'kode_kecamatan',
        'geom',
    ];

    public function kejadianBencana(): HasMany
    {
        return $this->hasMany(KejadianBencana::class, 'kecamatan_id');
    }

    public function dataTahunan(): HasMany
    {
        return $this->hasMany(DataTahunan::class, 'kecamatan_id');
    }
}