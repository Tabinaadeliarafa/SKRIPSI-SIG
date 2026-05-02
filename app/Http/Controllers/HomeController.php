<?php

namespace App\Http\Controllers;

use App\Models\Kecamatan;
use App\Models\JenisBencana;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function index()
    {
        $totalKec = Kecamatan::count();

        $totalBanjir = (int) DB::table('kejadian_bencana')
            ->where('jenis_bencana_id', 1)
            ->sum('jumlah_kejadian');

        $totalLongsor = (int) DB::table('kejadian_bencana')
            ->where('jenis_bencana_id', 2)
            ->sum('jumlah_kejadian');

        $totalGempa = (int) DB::table('kejadian_bencana')
            ->where('jenis_bencana_id', 3)
            ->sum('jumlah_kejadian');

        $topBanjir = DB::table('kejadian_bencana as k')
            ->join('kecamatan as kc', 'k.kecamatan_id', '=', 'kc.id')
            ->where('k.jenis_bencana_id', 1)
            ->select('kc.nama_kecamatan as kecamatan', 'k.jumlah_kejadian as jumlah')
            ->orderByDesc('k.jumlah_kejadian')
            ->limit(6)
            ->get();

        return view('public.home', compact(
            'totalKec',
            'totalBanjir',
            'totalLongsor',
            'totalGempa',
            'topBanjir'
        ));
    }
}