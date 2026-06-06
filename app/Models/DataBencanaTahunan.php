<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataBencanaTahunan extends Model
{
    protected $table = 'data_bencana_tahunan';

    protected $fillable = [
        'kecamatan_id',
        'tahun',
        'jenis_bencana',
        'jumlah'
    ];

    public function kecamatan()
    {
        return $this->belongsTo(Kecamatan::class);
    }
}