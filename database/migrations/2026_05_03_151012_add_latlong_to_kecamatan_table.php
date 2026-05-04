<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration ini menambahkan kolom latitude & longitude ke tabel kecamatan
 * JIKA BELUM ADA. Jalankan hanya jika kolom tsb belum ada di tabel Anda.
 *
 * php artisan migrate
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kecamatan', function (Blueprint $table) {
            // Cek dan tambah hanya jika belum ada
            if (!Schema::hasColumn('kecamatan', 'latitude')) {
                $table->decimal('latitude', 10, 7)->nullable()->after('nama');
            }
            if (!Schema::hasColumn('kecamatan', 'longitude')) {
                $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            }
        });
    }

    public function down(): void
    {
        Schema::table('kecamatan', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude']);
        });
    }
};