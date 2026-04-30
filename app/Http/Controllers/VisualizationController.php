<?php

namespace App\Http\Controllers;

use App\Models\Kecamatan;
use Illuminate\Support\Facades\DB;

class VisualizationController extends Controller
{
    public function index()
    {
        $rows = DB::table('kecamatan')
            ->leftJoin('bencana', 'kecamatan.id', '=', 'bencana.kecamatan_id')
            ->select(
                'kecamatan.nama',
                DB::raw("SUM(CASE WHEN jenis_bencana='banjir'  THEN jumlah_desa ELSE 0 END) AS banjir"),
                DB::raw("SUM(CASE WHEN jenis_bencana='longsor' THEN jumlah_desa ELSE 0 END) AS longsor"),
                DB::raw("SUM(CASE WHEN jenis_bencana='gempa'   THEN jumlah_desa ELSE 0 END) AS gempa")
            )
            ->groupBy('kecamatan.id', 'kecamatan.nama')
            ->orderByDesc('banjir')
            ->get();

        return view('public.visualization', compact('rows'));
    }
}
