<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bencana;
use App\Models\Kecamatan;
use App\Models\KejadianBencana;
use App\Models\JenisBencana;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Imports\BencanaImport;
use Maatwebsite\Excel\Facades\Excel;

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

    public function ringkasan(): JsonResponse
    {
        $data = KejadianBencana::with(['kecamatan', 'jenisBencana'])
            ->where('tahun', 2025)
            ->get()
            ->groupBy('kecamatan.nama_kecamatan')
            ->map(function ($items, $namaKecamatan) {
                return [
                    'kecamatan'     => $namaKecamatan,
                    'total_desa'    => $items->sum('jumlah_desa_terdampak'),
                    'jenis_bencana' => $items->map(fn($i) => [
                        'jenis'  => $i->jenisBencana->nama_jenis,
                        'jumlah' => $i->jumlah_desa_terdampak,
                    ])->values(),
                ];
            })
            ->sortByDesc('total_desa')
            ->values();

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }

    public function jenisBencana(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => JenisBencana::all(['id', 'nama_jenis', 'kode_jenis', 'warna_peta']),
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,txt'
        ]);

        $file = fopen(
            $request->file('file')->getRealPath(),
            'r'
        );

        // Skip header
        fgetcsv($file);

        $jumlahImport = 0;

        while (($row = fgetcsv($file, 1000, ",")) !== false) {

            if (count($row) < 5) {
                continue;
            }

            KejadianBencana::create([
                'kecamatan_id' => (int)$row[0],
                'jenis_bencana_id' => (int)$row[1],
                'jumlah_desa_terdampak' => (int)$row[2],
                'tahun' => (int)$row[3],
                'keterangan' => $row[4],
            ]);

            $jumlahImport++;
        }

        fclose($file);

        return response()->json([
            'success' => true,
            'jumlah_import' => $jumlahImport
        ]);
    }
}
