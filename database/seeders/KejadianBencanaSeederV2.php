<?php

namespace Database\Seeders;

use App\Models\JenisBencana;
use App\Models\Kecamatan;
use App\Models\KejadianBencana;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class KejadianBencanaSeederV2 extends Seeder
{
    public function run(): void
    {
        $path = public_path('data/historis-bencana.json');
        if (!File::exists($path)) {
            $this->command->error("File historis-bencana.json tidak ditemukan di database/data/");
            return;
        }

        $json = json_decode(File::get($path), true);
        $records = $json['records'];

        $kecamatans = Kecamatan::all();
        $banjirId  = JenisBencana::where('kode_jenis', 'BNJ')->first()->id;
        $longsorId = JenisBencana::where('kode_jenis', 'TLS')->first()->id;
        $gempaId   = JenisBencana::where('kode_jenis', 'GMB')->first()->id;

        foreach ($kecamatans as $kecamatan) {

            $kecamatanRecords = array_filter($records, function ($r) use ($kecamatan) {
                return $r['kecamatan'] === $kecamatan->nama_kecamatan;
            });

            foreach ($kecamatanRecords as $record) {
                $jenisMapping = [
                    $banjirId  => $record['banjir'],
                    $longsorId => $record['longsor'],
                    $gempaId   => $record['gempa'],
                ];

                foreach ($jenisMapping as $jenisId => $jumlah) {
                    KejadianBencana::updateOrCreate(
                        [
                            'kecamatan_id'     => $kecamatan->id,
                            'jenis_bencana_id' => $jenisId,
                            'tahun'            => $record['tahun'],
                        ],
                        [
                            'jumlah_desa_terdampak' => $jumlah ?? 0,
                            'keterangan' => 'Data Historis BPS'
                        ]
                    );
                }
            }
        }
        $this->command->info("Seeding data historis selesai!");
    }
}
