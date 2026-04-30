<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bencana extends Model
{
    protected $table = 'import_bencana';

    protected $fillable = [
        'kecamatan_id', 'desa_kelurahan', 'tahun', 'jenis_bencana',
        'jumlah_desa', 'latitude', 'longitude', 'tingkat_risiko',
        'sumber_data', 'status', 'keterangan',
    ];

    public function kecamatan(): BelongsTo
    {
        return $this->belongsTo(Kecamatan::class);
    }

    public static function calcRisiko(int $total): string
    {
        return match (true) {
            $total >= 7 => 'tinggi',
            $total >= 3 => 'sedang',
            $total >= 1 => 'rendah',
            default     => 'aman',
        };
    }
}
