<?php

namespace Database\Seeders;

use App\Models\Kecamatan;
use App\Models\DataBencanaTahunan;
use App\Models\KejadianBencana;
use Illuminate\Database\Seeder;

class DataBencanaTahunanSeeder extends Seeder
{
    public function run(): void
    {
        DataBencanaTahunan::truncate();

        $mapJenis = [
            1 => 'Banjir',
            2 => 'Longsor',
            3 => 'Gempa',
            4 => 'Kekeringan',
        ];

        // Ambil semua data dari tabel lama
        $dataLama = KejadianBencana::all();

        foreach ($dataLama as $item) {
            $namaJenis = $mapJenis[$item->jenis_bencana_id] ?? 'Lainnya';

            DataBencanaTahunan::create([
                'kecamatan_id'  => $item->kecamatan_id,
                'tahun'         => $item->tahun,
                'jenis_bencana' => $namaJenis,
                'jumlah'        => $item->jumlah_desa_terdampak,
                'created_at'    => $item->created_at,
                'updated_at'    => $item->updated_at,
            ]);
        }

        $this->command->info("Migrasi data ke DataBencanaTahunan selesai!");
    }
}
