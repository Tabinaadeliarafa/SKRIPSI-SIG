<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\VisualizationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\BencanaController;

// Public
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/peta', [MapController::class, 'index'])->name('map');
Route::get('/visualisasi', [VisualizationController::class, 'index'])->name('visualization');
Route::get('/laporan', [ReportController::class, 'index'])->name('report');

// Auth
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Admin
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/peta', [AdminController::class, 'map'])->name('map');
    Route::get('/visualisasi', [AdminController::class, 'visualization'])->name('visualization');
    Route::get('/laporan', [AdminController::class, 'report'])->name('report');
    Route::resource('bencana', BencanaController::class);
});
