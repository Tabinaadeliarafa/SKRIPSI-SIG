<?php

namespace Database\Seeders;

use App\Models\Kecamatan;
use App\Models\JenisBencana;
use App\Models\KejadianBencana;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class KejadianBencanaSeeder extends Seeder
{
    public function run(): void
    {
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

        $path = public_path('geo/kecamatan.geojson');
        $geoData = File::exists($path) ? json_decode(File::get($path), true)['features'] : [];

        $banjirId  = JenisBencana::where('kode_jenis', 'BNJ')->first()->id;
        $longsorId = JenisBencana::where('kode_jenis', 'TLS')->first()->id;
        $gempaId   = JenisBencana::where('kode_jenis', 'GMB')->first()->id;

        foreach ($dataBPS as $row) {
            $geoFeature = collect($geoData)->firstWhere('properties.NAME_3', $row['kecamatan']);
            $geometry = $geoFeature ? json_encode($geoFeature['geometry']) : null;

            $kecamatan = Kecamatan::updateOrCreate(
                ['nama_kecamatan' => $row['kecamatan']],
                [
                    'geom' => $geometry ? DB::raw("ST_GeomFromGeoJSON('$geometry')") : null,
                    'latitude' => $geometry ? DB::raw("ST_Y(ST_Centroid(ST_GeomFromGeoJSON('$geometry')))") : null,
                    'longitude' => $geometry ? DB::raw("ST_X(ST_Centroid(ST_GeomFromGeoJSON('$geometry')))") : null,
                ]
            );
        }
    }
}
