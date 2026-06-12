<?php
namespace Database\Seeders;

use App\Models\JenisBencana;
use Illuminate\Database\Seeder;

class JenisBencanaSeeder extends Seeder
{
    public function run(): void
    {
        $jenis = [
            ['nama_jenis' => 'Banjir',        'kode_jenis' => 'BNJ', 'warna_peta' => '#3B8BD4'],
            ['nama_jenis' => 'Tanah Longsor', 'kode_jenis' => 'TLS', 'warna_peta' => '#D85A30'],
            ['nama_jenis' => 'Gempa Bumi',    'kode_jenis' => 'GMB', 'warna_peta' => '#D4537E'],
        ];

        foreach ($jenis as $item) {
            JenisBencana::firstOrCreate(['kode_jenis' => $item['kode_jenis']], $item);
        }
    }
}
