<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BencanaApiController;
use App\Http\Controllers\Api\KecamatanApiController;
use App\Http\Controllers\Api\BencanaController;
use App\Http\Controllers\Api\KecamatanController;
use App\Http\Controllers\Api\ForecastController;
use App\Http\Controllers\KecamatanGeoJsonController;

Route::get('/bencana',           [BencanaApiController::class, 'index']);
Route::get('/bencana/geojson',   [BencanaApiController::class, 'geojson']);
Route::get('/bencana/ringkasan', [BencanaApiController::class, 'ringkasan']);
Route::get('/jenis-bencana',     [BencanaApiController::class, 'jenisBencana']);
Route::get('/kecamatan',         [KecamatanApiController::class, 'index']);
Route::get('/kecamatan-stats', [KecamatanApiController::class, "getStats"]);
Route::get('/kecamatan-laporan-stats', [KecamatanApiController::class, "getLaporanStats"]);
Route::get('/kecamatan/geojson', [KecamatanApiController::class, 'geojson']);
Route::get('/kecamatan/list',    [KecamatanApiController::class, 'indexApi']);
Route::get('/forecast',          [ForecastController::class, 'forecast']);
Route::get('/forecast-map',      [ForecastController::class, 'forecastMap']);
Route::get('/statistik-bencana',[ForecastController::class, 'getHistoris']);
Route::get('/kecamatan/geojson', [KecamatanGeoJsonController::class, 'index']);

Route::prefix('v1')->group(function () {
    // Bencana
    Route::get('/bencana',           [BencanaController::class, 'index']);
    Route::get('/bencana/ringkasan', [BencanaController::class, 'ringkasan']);
    Route::get('/jenis-bencana',     [BencanaController::class, 'jenisBencana']);

    // Kecamatan
    Route::get('/kecamatan',         [KecamatanController::class, 'index']);
    Route::get('/kecamatan/geojson', [KecamatanController::class, 'geojson']);
});

// /bencana/geojson dan /bencana/ringkasan selalu di atas kalau nanti ada route /bencana/{id}, karena Laravel membaca route dari atas ke bawah. File di atas sudah diurutkan dengan benar.
