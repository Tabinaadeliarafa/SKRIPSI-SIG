<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\BencanaController;
use App\Http\Controllers\Admin\SigDashboardController;

/*
|--------------------------------------------------------------------------
| AUTH (Laravel tetap handle)
|--------------------------------------------------------------------------
*/
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

/*
|--------------------------------------------------------------------------
| ADMIN (Laravel Blade / Controller)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/sig-dashboard', [SigDashboardController::class, 'index'])->name('sig-dashboard');
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/peta', [AdminController::class, 'map'])->name('map');
        Route::get('/visualisasi', [AdminController::class, 'visualization'])->name('visualization');
        Route::get('/laporan', [AdminController::class, 'report'])->name('report');

        Route::resource('bencana', BencanaController::class);
    });

/*
|--------------------------------------------------------------------------
| REACT SPA (SEMUA HALAMAN PUBLIK)
|--------------------------------------------------------------------------
*/
Route::get('/{any}', function () {
    return view('app'); // ini file React mount
})->where('any', '^(?!admin|login|api).*$');
