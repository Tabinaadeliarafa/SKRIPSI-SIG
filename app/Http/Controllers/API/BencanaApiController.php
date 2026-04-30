<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bencana;
use App\Models\Kecamatan;
use Illuminate\Support\Facades\DB;

class BencanaApiController extends Controller
{
    public function index()
    {
        return Bencana::with('kecamatan')->get();
    }

    public function geojson()
    {
        $rows = DB::table('kecamatan')
            ->leftJoin('bencana', 'kecamatan.id', '=', 'bencana.kecamatan_id')
            ->select(
                'kecamatan.id',
                'kecamatan.nama',
                'kecamatan.kode_bps',
                'kecamatan.latitude',
                'kecamatan.longitude',
                DB::raw("COALESCE(SUM(CASE WHEN jenis_bencana='banjir'  THEN jumlah_desa ELSE 0 END),0) AS banjir"),
                DB::raw("COALESCE(SUM(CASE WHEN jenis_bencana='longsor' THEN jumlah_desa ELSE 0 END),0) AS longsor"),
                DB::raw("COALESCE(SUM(CASE WHEN jenis_bencana='gempa'   THEN jumlah_desa ELSE 0 END),0) AS gempa")
            )
            ->groupBy('kecamatan.id', 'kecamatan.nama', 'kecamatan.kode_bps', 'kecamatan.latitude', 'kecamatan.longitude')
            ->get();

        // Try to merge with polygon GeoJSON file if available
        $path = public_path('geojson/kecamatan.geojson');
        if (file_exists($path)) {
            $geo = json_decode(file_get_contents($path), true);
            foreach ($geo['features'] as &$f) {
                $kode = $f['properties']['kode_bps'] ?? $f['properties']['KODE_BPS'] ?? null;
                $nama = $f['properties']['nama']     ?? $f['properties']['NAMOBJ']   ?? null;
                $match = $rows->first(fn ($r) => $r->kode_bps === $kode || strcasecmp($r->nama, (string) $nama) === 0);
                if ($match) {
                    $f['properties'] = array_merge($f['properties'], (array) $match);
                    $total = $match->banjir + $match->longsor + $match->gempa;
                    $f['properties']['total']  = $total;
                    $f['properties']['risiko'] = Bencana::calcRisiko($total);
                }
            }
            return response()->json($geo);
        }

        // Fallback: point features
        $features = $rows->map(function ($r) {
            $total = $r->banjir + $r->longsor + $r->gempa;
            return [
                'type'       => 'Feature',
                'geometry'   => ['type' => 'Point', 'coordinates' => [(float) $r->longitude, (float) $r->latitude]],
                'properties' => [
                    'id'       => $r->id,
                    'nama'     => $r->nama,
                    'kode_bps' => $r->kode_bps,
                    'banjir'   => (int) $r->banjir,
                    'longsor'  => (int) $r->longsor,
                    'gempa'    => (int) $r->gempa,
                    'total'    => $total,
                    'risiko'   => Bencana::calcRisiko($total),
                ],
            ];
        });

        return response()->json(['type' => 'FeatureCollection', 'features' => $features]);
    }
}
