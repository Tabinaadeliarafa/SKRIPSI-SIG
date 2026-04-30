<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kecamatan;

class KecamatanApiController extends Controller
{
    public function index()
    {
        return Kecamatan::orderBy('nama')->get();
    }
}
