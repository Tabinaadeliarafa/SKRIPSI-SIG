<?php
namespace Database\Seeders;

use App\Models\Kecamatan;
use App\Models\JenisBencana;
use App\Models\KejadianBencana;
use Illuminate\Database\Seeder;

class KejadianBencanaSeeder extends Seeder
{
    public function run(): void
    {
        // Data dari BPS 2025 — sesuai file CSV Anda
        // Format: ['kecamatan' => nama, 'banjir' => n, 'longsor' => n, 'gempa' => n]
        $dataBPS = [
            ['kecamatan' => 'Setu',             'banjir' => 4, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Serang Baru',       'banjir' => 3, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Cikarang Pusat',    'banjir' => 3, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Cikarang Selatan',  'banjir' => 2, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Cibarusah',         'banjir' => 0, 'longsor' => 2, 'gempa' => 0],
            ['kecamatan' => 'Bojongmangu',       'banjir' => 1, 'longsor' => 1, 'gempa' => 0],
            ['kecamatan' => 'Cikarang Timur',    'banjir' => 5, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Kedungwaringin',    'banjir' => 2, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Cikarang Utara',    'banjir' => 8, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Karangbahagia',     'banjir' => 8, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Cibitung',          'banjir' => 2, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Cikarang Barat',    'banjir' => 0, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Tambun Selatan',    'banjir' => 4, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Tambun Utara',      'banjir' => 5, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Babelan',           'banjir' => 9, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Tarumajaya',        'banjir' => 0, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Tambelang',         'banjir' => 2, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Sukawangi',         'banjir' => 1, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Sukatani',          'banjir' => 1, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Sukakarya',         'banjir' => 6, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Pebayuran',         'banjir' => 1, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Cabangbungin',      'banjir' => 1, 'longsor' => 0, 'gempa' => 0],
            ['kecamatan' => 'Muara Gembong',     'banjir' => 1, 'longsor' => 0, 'gempa' => 0],
        ];

        $banjirId  = JenisBencana::where('kode_jenis', 'BNJ')->first()->id;
        $longsorId = JenisBencana::where('kode_jenis', 'TLS')->first()->id;
        $gempaId   = JenisBencana::where('kode_jenis', 'GMB')->first()->id;

        foreach ($dataBPS as $row) {
            $kecamatan = Kecamatan::firstOrCreate(
                ['nama_kecamatan' => $row['kecamatan']]
            );

            $jenisMap = [
                'banjir'  => [$banjirId,  $row['banjir']],
                'longsor' => [$longsorId, $row['longsor']],
                'gempa'   => [$gempaId,   $row['gempa']],
            ];

            foreach ($jenisMap as [$jenisId, $jumlah]) {
                if ($jumlah > 0) {
                    KejadianBencana::updateOrCreate(
                        [
                            'kecamatan_id'    => $kecamatan->id,
                            'jenis_bencana_id' => $jenisId,
                            'tahun'           => 2025,
                        ],
                        ['jumlah_desa_terdampak' => $jumlah]
                    );
                }
            }
        }
    }
}