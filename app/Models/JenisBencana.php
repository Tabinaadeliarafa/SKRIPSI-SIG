<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisBencana extends Model
{
    protected $table = 'jenis_bencana';

    protected $fillable = ['nama_jenis', 'kode_jenis', 'warna_peta'];

    public function kejadianBencana()
    {
        return $this->hasMany(KejadianBencana::class, 'jenis_bencana_id');
    }
}