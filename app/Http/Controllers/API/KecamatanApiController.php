<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kecamatan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function getStats(Request $request)
    {
        $tahun = $request->query('tahun', 2026);

        $from = $request->query('from');
        $to   = $request->query('to');

        return Kecamatan::with(['kejadianBencana' => function ($q) use ($tahun, $from, $to) {
            $q->where('tahun', $tahun);

            if ($from && $to) {
                $q->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59']);
            }
        }])->get()->map(function ($k) {
            $kejadian = $k->kejadianBencana;

            return [
                'id'             => $k->id,
                'nama'           => $k->nama_kecamatan,
                'nama_kecamatan'           => $k->nama_kecamatan,
                'banjir'         => (int) $kejadian->where('jenis_bencana_id', 1)->sum('jumlah_desa_terdampak'),
                'longsor'        => (int) $kejadian->where('jenis_bencana_id', 2)->sum('jumlah_desa_terdampak'),
                'gempa'          => (int) $kejadian->where('jenis_bencana_id', 3)->sum('jumlah_desa_terdampak'),
                'kekeringan'     => (int) $kejadian->where('jenis_bencana_id', 4)->sum('jumlah_desa_terdampak'),
                'total'          => (int) $kejadian->sum('jumlah_desa_terdampak'),
                'lat'            => (float) ($k->lat ?? 0),
                'lng'            => (float) ($k->lng ?? 0),
                'desa'           => (int) ($k->jumlah_desa_administrasi ?? 0), // Sesuaikan jika ada kolom ini
            ];
        });
    }

    public function getLaporanStats(Request $request)
    {
        $tahun = $request->query('tahun', 2025);

        return Kecamatan::query()
            ->withSum(['kejadianBencana as banjir' => function ($q) use ($tahun) {
                $q->where('jenis_bencana_id', 1)
                    ->where('tahun', $tahun);
            }], 'jumlah_desa_terdampak')
            ->withSum(['kejadianBencana as longsor' => function ($q) use ($tahun) {
                $q->where('jenis_bencana_id', 2)
                    ->where('tahun', $tahun);
            }], 'jumlah_desa_terdampak')
            ->withSum(['kejadianBencana as gempa' => function ($q) use ($tahun) {
                $q->where('jenis_bencana_id', 3)
                    ->where('tahun', $tahun);
            }], 'jumlah_desa_terdampak')
            ->get()
            ->map(function ($k) {
                return [
                    'id'             => $k->id,
                    'nama_kecamatan' => $k->nama_kecamatan,
                    'banjir'         => (int) ($k->banjir ?? 0),
                    'longsor'        => (int) ($k->longsor ?? 0),
                    'gempa'          => (int) ($k->gempa ?? 0),
                ];
            });
    }
}
