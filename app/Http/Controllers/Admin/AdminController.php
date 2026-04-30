<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bencana;
use App\Models\Kecamatan;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        $rows = DB::table('kecamatan')
            ->leftJoin('bencana', 'kecamatan.id', '=', 'bencana.kecamatan_id')
            ->select(
                'kecamatan.id',
                'kecamatan.nama',
                DB::raw("COALESCE(SUM(CASE WHEN jenis_bencana='banjir'  THEN jumlah_desa ELSE 0 END),0) AS banjir"),
                DB::raw("COALESCE(SUM(CASE WHEN jenis_bencana='longsor' THEN jumlah_desa ELSE 0 END),0) AS longsor"),
                DB::raw("COALESCE(SUM(CASE WHEN jenis_bencana='gempa'   THEN jumlah_desa ELSE 0 END),0) AS gempa")
            )
            ->groupBy('kecamatan.id', 'kecamatan.nama')
            ->orderByDesc('banjir')
            ->paginate(8);

        $rows->getCollection()->transform(function ($r) {
            $r->total  = $r->banjir + $r->longsor + $r->gempa;
            $r->risiko = Bencana::calcRisiko($r->total);
            return $r;
        });

        $totalKec     = Kecamatan::count();
        $totalBanjir  = (int) Bencana::where('jenis_bencana', 'banjir')->sum('jumlah_desa');
        $totalLongsor = (int) Bencana::where('jenis_bencana', 'longsor')->sum('jumlah_desa');
        $totalGempa   = (int) Bencana::where('jenis_bencana', 'gempa')->sum('jumlah_desa');

        return view('admin.dashboard', compact('rows', 'totalKec', 'totalBanjir', 'totalLongsor', 'totalGempa'));
    }

    public function map()
    {
        return view('admin.map', ['kecamatan' => Kecamatan::with('bencana')->get()]);
    }

    public function visualization()
    {
        return app(\App\Http\Controllers\VisualizationController::class)->index()->name('admin.visualization');
    }

    public function report()
    {
        return app(\App\Http\Controllers\ReportController::class)->index();
    }
}
