<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kecamatan;
use Illuminate\Http\JsonResponse;

class KecamatanApiController extends Controller
{
    public function index()
    {
        return Kecamatan::orderBy('nama')->get();
    }

    public function indexApi(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => Kecamatan::all(['id', 'nama_kecamatan', 'kode_kecamatan']),
        ]);
    }

    public function geojson(): JsonResponse
    {
        $kecamatanList = Kecamatan::with(['kejadianBencana.jenisBencana'])
            ->selectRaw("id, nama_kecamatan, kode_kecamatan, ST_AsGeoJSON(geom)::json as geometry")
            ->get();

        $features = $kecamatanList->map(function ($k) {
            $totalDesa = $k->kejadianBencana->sum('jumlah_desa_terdampak');

            return [
                'type'     => 'Feature',
                'geometry' => $k->geometry,
                'properties' => [
                    'id'             => $k->id,
                    'nama_kecamatan' => $k->nama_kecamatan,
                    'total_desa'     => $totalDesa,
                    'bencana'        => $k->kejadianBencana->map(fn($b) => [
                        'jenis'  => $b->jenisBencana->nama_jenis,
                        'jumlah' => $b->jumlah_desa_terdampak,
                    ]),
                ],
            ];
        });

        return response()->json([
            'type'     => 'FeatureCollection',
            'features' => $features,
        ]);
    }
}