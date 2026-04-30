<?php

namespace App\Http\Controllers;

use App\Models\Kecamatan;
use App\Models\Bencana;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    public function index()
    {
        $totalKec     = Kecamatan::count();

        $totalBanjir  = (int) Bencana::where('jenis_bencana', 1)->sum('jumlah');
        $totalLongsor = (int) Bencana::where('jenis_bencana', 2)->sum('jumlah');
        $totalGempa   = (int) Bencana::where('jenis_bencana', 3)->sum('jumlah');

        $topBanjir = DB::table('import_bencana')
            ->where('jenis_bencana', 1)
            ->select('kecamatan', 'jumlah')
            ->orderByDesc('jumlah')
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