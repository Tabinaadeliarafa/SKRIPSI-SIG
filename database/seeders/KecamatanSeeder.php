<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class KecamatanSeeder extends Seeder
{
    public function run(): void
    {
        $path = public_path('geo/kecamatan.geojson');

        if (!File::exists($path)) {
            $this->command->error("File tidak ditemukan di: {$path}");
            return;
        }

        $json = File::get($path);
        $data = json_decode($json, true);

        DB::transaction(function () use ($data) {
            foreach ($data['features'] as $feature) {
                $props = $feature['properties'];

                if (empty($props['CC_3'])) continue;

                $geometry = json_encode($feature['geometry']);

                DB::statement("
                    INSERT INTO public.kecamatan
                    (nama_kecamatan, kode_kecamatan, created_at, updated_at, latitude, longitude, geom)
                    VALUES (?, ?, NOW(), NOW(),
                            ST_Y(ST_Centroid(ST_GeomFromGeoJSON(?))),
                            ST_X(ST_Centroid(ST_GeomFromGeoJSON(?))),
                            ST_GeomFromGeoJSON(?))
                    ON CONFLICT (kode_kecamatan)
                    DO UPDATE SET
                        nama_kecamatan = EXCLUDED.nama_kecamatan,
                        updated_at = NOW(),
                        latitude = EXCLUDED.latitude,
                        longitude = EXCLUDED.longitude,
                        geom = EXCLUDED.geom
                ", [
                    $props['NAME_3'],
                    $props['CC_3'],
                    $geometry,
                    $geometry,
                    $geometry
                ]);
            }
        });

        $this->command->info("Data kecamatan berhasil di-upsert!");
    }
}
