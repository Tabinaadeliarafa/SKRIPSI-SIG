<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DataBencanaTahunan;

class ForecastController extends Controller
{
     public function forecast(Request $request)
    {
        $kecamatanId = $request->kecamatan_id;
        $jenisBencana = $request->jenis_bencana;
        $tahunAwal = (int) ($request->tahun_awal ?? 2019);
        $tahunAkhir = (int) ($request->tahun_akhir ?? date('Y'));

        $data = DataBencanaTahunan::query()
            ->when($kecamatanId, fn($q) => $q->where('kecamatan_id', $kecamatanId))
            ->when($jenisBencana, fn($q) => $q->where('jenis_bencana', $jenisBencana))
            ->whereBetween('tahun', [$tahunAwal, $tahunAkhir])
            ->orderBy('tahun')
            ->get();

        $values = $data->pluck('jumlah')->toArray();
        $window = min(5, count($values));
        $forecast = $window > 0
            ? array_sum(array_slice($values, -$window)) / $window
            : 0;

        return response()->json([
            'historis'      => $data,
            'forecast'      => round($forecast, 2),
            'tahun_prediksi' => $tahunAkhir + 1,
        ]);
    }

    public function forecastMap(Request $request)
    {
        // Validasi input
        $jenisBencana = $request->get('jenis_bencana', 'Banjir');
        $tahunAwal    = (int) $request->get('tahun_awal', 2019);
        $tahunAkhir   = (int) $request->get('tahun_akhir', date('Y'));

        // Ambil semua data dalam rentang tahun + jenis bencana
        $rows = DataBencanaTahunan::with('kecamatan')
            ->where('jenis_bencana', $jenisBencana)
            ->whereBetween('tahun', [$tahunAwal, $tahunAkhir])
            ->orderBy('kecamatan_id')
            ->orderBy('tahun')
            ->get()
            ->groupBy('kecamatan_id');

        $result = [];

        foreach ($rows as $kecamatanId => $dataKecamatan) {
            $values = $dataKecamatan->pluck('jumlah')->toArray();
            $window = min(5, count($values));
            $forecast = $window > 0
                ? array_sum(array_slice($values, -$window)) / $window
                : 0;

            $lastRow = $dataKecamatan->last();
            $namaKecamatan = $lastRow->kecamatan->nama_kecamatan ?? null;

            // Lewati kecamatan tanpa relasi (data kotor)
            if (!$namaKecamatan) continue;

            $result[] = [
                'kecamatan_id'   => (int) $kecamatanId,
                'nama_kecamatan' => $namaKecamatan,
                'forecast'       => round($forecast, 2),
                'tahun_prediksi' => ($lastRow->tahun ?? (int) date('Y')) + 1,
            ];
        }

        // Urutkan berdasarkan forecast tertinggi
        usort($result, fn($a, $b) => $b['forecast'] <=> $a['forecast']);

        return response()->json($result);
    }
}
