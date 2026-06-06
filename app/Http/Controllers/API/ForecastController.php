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
        $tahunAwal = $request->tahun_awal;
        $tahunAkhir = $request->tahun_akhir;

        $data = DataBencanaTahunan::query()
            ->when($kecamatanId, function ($q) use ($kecamatanId) {
                $q->where('kecamatan_id', $kecamatanId);
            })
            ->when($jenisBencana, function ($q) use ($jenisBencana) {
                $q->where('jenis_bencana', $jenisBencana);
            })
            ->whereBetween('tahun', [$tahunAwal, $tahunAkhir])
            ->orderBy('tahun')
            ->get();

        $values = $data->pluck('jumlah')->toArray();

        $window = min(5, count($values));

        $forecast = 0;

        if ($window > 0) {
            $forecast = array_sum(
                array_slice($values, -$window)
            ) / $window;
        }

        return response()->json([
            'historis' => $data,
            'forecast' => round($forecast, 2),
            'tahun_prediksi' => $tahunAkhir + 1
        ]);
    }

    public function forecastMap(Request $request)
    {
        $jenisBencana = $request->get('jenis_bencana', 'Banjir');

        $rows = DataBencanaTahunan::with('kecamatan')
            ->where('jenis_bencana', $jenisBencana)
            ->orderBy('kecamatan_id')
            ->orderBy('tahun')
            ->get()
            ->groupBy('kecamatan_id');

        $result = [];

        foreach ($rows as $kecamatanId => $dataKecamatan) {

            $values = $dataKecamatan->pluck('jumlah')->toArray();

            $window = min(5, count($values));

            $forecast = 0;

            if ($window > 0) {
                $forecast = array_sum(
                    array_slice($values, -$window)
                ) / $window;
            }

            $lastRow = $dataKecamatan->last();

            $result[] = [
                'kecamatan_id' => $kecamatanId,
                'nama_kecamatan' => $lastRow->kecamatan->nama_kecamatan ?? null,
                'forecast' => round($forecast, 2),
                'tahun_prediksi' => ($lastRow->tahun ?? date('Y')) + 1,
            ];
        }

        return response()->json($result);
    }
}