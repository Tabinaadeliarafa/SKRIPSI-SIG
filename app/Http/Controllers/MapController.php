<?php

namespace App\Http\Controllers;

use App\Models\Kecamatan;

class MapController extends Controller
{
    public function index()
    {
        $kecamatan = Kecamatan::with('bencana')->orderBy('nama')->get();
        return view('public.map', compact('kecamatan'));
    }
}
