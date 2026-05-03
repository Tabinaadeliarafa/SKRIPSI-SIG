<?php

namespace App\Http\Controllers;

use App\Models\Bencana;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index()
    {
        $rows = DB::table('kecamatan')
            ->leftJoin('bencana', 'kecamatan.id', '=', 'bencana.kecamatan_id')
            ->select(
                'kecamatan.id',
                'kecamatan.nama_kecamatan as nama',
                DB::raw("COALESCE(SUM(CASE WHEN jenis_bencana='banjir'  THEN jumlah_desa ELSE 0 END),0) AS banjir"),
                DB::raw("COALESCE(SUM(CASE WHEN jenis_bencana='longsor' THEN jumlah_desa ELSE 0 END),0) AS longsor"),
                DB::raw("COALESCE(SUM(CASE WHEN jenis_bencana='gempa'   THEN jumlah_desa ELSE 0 END),0) AS gempa")
            )
            ->groupBy('kecamatan.id', 'kecamatan.nama_kecamatan')
            ->orderBy('kecamatan.nama_kecamatan')
            ->get()
            ->map(function ($r) {
                $r->total   = $r->banjir + $r->longsor + $r->gempa;
                $r->risiko  = Bencana::calcRisiko($r->total);
                return $r;
            });

        $totalKec     = $rows->count();
        $totalBanjir  = (int) $rows->sum('banjir');
        $totalLongsor = (int) $rows->sum('longsor');
        $mostAffected = $rows->sortByDesc('total')->first();

        return view('public.report', compact('rows', 'totalKec', 'totalBanjir', 'totalLongsor', 'mostAffected'));
    }
}
