<?php

namespace App\Http\Controllers;

use App\Models\Kecamatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KecamatanGeoJsonController extends Controller
{
    //
    public function index()
    {
        $kecamatans = Kecamatan::all();

        $features = $kecamatans->map(function ($kecamatan) {
            return [
                'type' => 'Feature',
                'properties' => [
                    'id' => $kecamatan->id,
                    'nama_kecamatan' => $kecamatan->nama_kecamatan,
                ],
                'geometry' => json_decode(DB::selectOne("SELECT ST_AsGeoJSON(?) as geom", [$kecamatan->geom])->geom),
            ];
        });

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features
        ]);
    }
}
