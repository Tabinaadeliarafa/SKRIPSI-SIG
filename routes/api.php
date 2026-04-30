<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BencanaApiController;
use App\Http\Controllers\Api\KecamatanApiController;

Route::get('/bencana', [BencanaApiController::class, 'index']);
Route::get('/bencana/geojson', [BencanaApiController::class, 'geojson']);
Route::get('/kecamatan', [KecamatanApiController::class, 'index']);
