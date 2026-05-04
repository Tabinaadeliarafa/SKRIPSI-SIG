<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bencana;
use App\Models\Kecamatan;
use Illuminate\Support\Facades\DB;

class SigDashboardController extends Controller
{
    /**
     * Tampilkan halaman SIG Dashboard interaktif (full-screen dark map).
     * Route: GET /admin/sig-dashboard
     */
    public function index()
    {
        // Ambil semua kecamatan + agregasi bencana per jenis
        $rows = DB::table('kecamatan')
            ->leftJoin('bencana', 'kecamatan.id', '=', 'bencana.kecamatan_id')
            ->select(
                'kecamatan.id',
                'kecamatan.nama',
                'kecamatan.latitude',
                'kecamatan.longitude',
                DB::raw("COALESCE(SUM(CASE WHEN jenis_bencana='banjir'  THEN jumlah_desa ELSE 0 END),0) AS banjir"),
                DB::raw("COALESCE(SUM(CASE WHEN jenis_bencana='longsor' THEN jumlah_desa ELSE 0 END),0) AS longsor"),
                DB::raw("COALESCE(SUM(CASE WHEN jenis_bencana='gempa'   THEN jumlah_desa ELSE 0 END),0) AS gempa")
            )
            ->groupBy('kecamatan.id', 'kecamatan.nama', 'kecamatan.latitude', 'kecamatan.longitude')
            ->orderByDesc('banjir')
            ->get();

        // Transform ke format yang dibutuhkan JavaScript di blade
        $kecamatanData = $rows->map(function ($r, $index) {
            $total = (int)$r->banjir + (int)$r->longsor + (int)$r->gempa;
            return [
                'id'      => $r->id,
                'name'    => $r->nama,
                'lat'     => (float) $r->latitude,
                'lng'     => (float) $r->longitude,
                'banjir'  => (int) $r->banjir,
                'longsor' => (int) $r->longsor,
                'gempa'   => (int) $r->gempa,
                'total'   => $total,
                'risk'    => Bencana::calcRisiko($total),
            ];
        })->values();

        $tahun = date('Y');

        return view('admin.sig_dashboard', compact('kecamatanData', 'tahun'));
    }
}