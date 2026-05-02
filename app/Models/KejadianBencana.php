<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KejadianBencana extends Model
{
    protected $table = 'kejadian_bencana';

    protected $fillable = [
        'kecamatan_id',
        'jenis_bencana_id',
        'jumlah_desa_terdampak',
        'tahun',
        'keterangan',
    ];

    public function kecamatan()
    {
        return $this->belongsTo(Kecamatan::class, 'kecamatan_id');
    }

    public function jenisBencana()
    {
        return $this->belongsTo(JenisBencana::class, 'jenis_bencana_id');
    }
}
