<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeder untuk mengisi data latitude & longitude 23 kecamatan Kabupaten Bekasi.
 * Jalankan dengan: php artisan db:seed --class=KecamatanLatLngSeeder
 */
class KecamatanLatLngSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['nama' => 'Babelan',          'latitude' => -6.120, 'longitude' => 107.050],
            ['nama' => 'Karangbahagia',    'latitude' => -6.230, 'longitude' => 107.120],
            ['nama' => 'Cikarang Utara',   'latitude' => -6.260, 'longitude' => 107.150],
            ['nama' => 'Sukakarya',        'latitude' => -6.100, 'longitude' => 107.200],
            ['nama' => 'Cikarang Timur',   'latitude' => -6.290, 'longitude' => 107.210],
            ['nama' => 'Tambun Utara',     'latitude' => -6.210, 'longitude' => 107.000],
            ['nama' => 'Setu',             'latitude' => -6.360, 'longitude' => 107.060],
            ['nama' => 'Tambun Selatan',   'latitude' => -6.260, 'longitude' => 107.000],
            ['nama' => 'Serang Baru',      'latitude' => -6.390, 'longitude' => 107.090],
            ['nama' => 'Cikarang Pusat',   'latitude' => -6.320, 'longitude' => 107.150],
            ['nama' => 'Cibitung',         'latitude' => -6.270, 'longitude' => 107.060],
            ['nama' => 'Kedungwaringin',   'latitude' => -6.200, 'longitude' => 107.270],
            ['nama' => 'Cikarang Selatan', 'latitude' => -6.360, 'longitude' => 107.170],
            ['nama' => 'Tambelang',        'latitude' => -6.170, 'longitude' => 107.180],
            ['nama' => 'Cibarusah',        'latitude' => -6.400, 'longitude' => 107.120],
            ['nama' => 'Bojongmangu',      'latitude' => -6.450, 'longitude' => 107.180],
            ['nama' => 'Sukawangi',        'latitude' => -6.140, 'longitude' => 107.230],
            ['nama' => 'Sukatani',         'latitude' => -6.160, 'longitude' => 107.260],
            ['nama' => 'Pebayuran',        'latitude' => -6.130, 'longitude' => 107.320],
            ['nama' => 'Cabangbungin',     'latitude' => -6.160, 'longitude' => 107.290],
            ['nama' => 'Muara Gembong',    'latitude' => -6.020, 'longitude' => 107.070],
            ['nama' => 'Tarumajaya',       'latitude' => -6.090, 'longitude' => 106.980],
            ['nama' => 'Cikarang Barat',   'latitude' => -6.300, 'longitude' => 107.090],
        ];

        foreach ($data as $item) {
            DB::table('kecamatan')
                ->where('nama', $item['nama'])
                ->update([
                    'latitude'  => $item['latitude'],
                    'longitude' => $item['longitude'],
                ]);
        }

        $this->command->info('✅ Lat/Lng kecamatan berhasil diupdate.');
    }
}