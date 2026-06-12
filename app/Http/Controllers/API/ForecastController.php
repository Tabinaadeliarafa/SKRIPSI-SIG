<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DataBencanaTahunan;
use App\Models\Kecamatan;
use App\Models\KejadianBencana;

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
        $jenisBencana = $request->get('jenis_bencana', 'Banjir');
        $tahunAwal    = (int) $request->get('tahun_awal', 2019);
        $tahunAkhir   = (int) $request->get('tahun_akhir', date('Y'));

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

            // 1. Menghitung Forecast (Moving Average)
            $window = min(5, count($values));
            $forecast = $window > 0
                ? array_sum(array_slice($values, -$window)) / $window
                : 0;

            // 2. Menghitung Total Desa Terdampak selama rentang tahun yang dipilih
            $totalDesaTerdampak = $dataKecamatan->sum('jumlah');

            $lastRow = $dataKecamatan->last();
            $namaKecamatan = $lastRow->kecamatan->nama_kecamatan ?? null;

            if (!$namaKecamatan) continue;

            $result[] = [
                'kecamatan_id'       => (int) $kecamatanId,
                'nama_kecamatan'     => $namaKecamatan,
                'forecast'           => round($forecast, 2),
                'total_desa_terdampak' => (int) $totalDesaTerdampak,
                'tahun_prediksi'     => ($lastRow->tahun ?? (int) date('Y')) + 1,
            ];
        }

        usort($result, fn($a, $b) => $b['forecast'] <=> $a['forecast']);

        return response()->json($result);
    }


    public function getHistoris()
    {
        $kecamatans = Kecamatan::pluck('nama_kecamatan')->toArray();
        $years = KejadianBencana::distinct()->orderBy('tahun', 'asc')->pluck('tahun')->toArray();

        $data = KejadianBencana::with('kecamatan')
            ->select('kecamatan_id', 'tahun', 'jenis_bencana_id', 'jumlah_desa_terdampak')
            ->get();

        $records = [];
        foreach ($kecamatans as $nama) {
            foreach ($years as $tahun) {
                $kec = Kecamatan::where('nama_kecamatan', $nama)->first();
                $items = $data->where('kecamatan_id', $kec->id)->where('tahun', $tahun);

                $records[] = [
                    'kecamatan' => $nama,
                    'tahun'     => $tahun,
                    'banjir'    => (int) $items->where('jenis_bencana_id', 1)->sum('jumlah_desa_terdampak'),
                    'longsor'   => (int) $items->where('jenis_bencana_id', 2)->sum('jumlah_desa_terdampak'),
                    'gempa'     => (int) $items->where('jenis_bencana_id', 3)->sum('jumlah_desa_terdampak'),
                    'total'     => (int) $items->sum('jumlah_desa_terdampak'),
                ];
            }
        }

        return response()->json([
            'source'    => 'Database SIG Bencana Kabupaten Bekasi',
            'years'     => $years,
            'kecamatan' => $kecamatans,
            'records'   => $records
        ]);
    }
}
