<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kecamatan extends Model
{
    protected $table = 'kecamatan';

    protected $fillable = [
        'nama', 'kode_bps', 'latitude', 'longitude', 'geojson_path',
    ];

    public function bencana(): HasMany
    {
        return $this->hasMany(Bencana::class);
    }

    public function totalBanjir(): int
    {
        return (int) $this->bencana()->where('jenis_bencana', 'banjir')->sum('jumlah_desa');
    }

    public function totalLongsor(): int
    {
        return (int) $this->bencana()->where('jenis_bencana', 'longsor')->sum('jumlah_desa');
    }

    public function totalGempa(): int
    {
        return (int) $this->bencana()->where('jenis_bencana', 'gempa')->sum('jumlah_desa');
    }
}
