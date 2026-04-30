<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('kecamatan', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kecamatan');
            $table->string('kode_kecamatan')->nullable();
            // Kolom geometry PostGIS — tambahkan manual via raw SQL
            $table->timestamps();
        });

        // Tambahkan kolom geometry PostGIS setelah tabel dibuat
        DB::statement('ALTER TABLE kecamatan ADD COLUMN geom geometry(MultiPolygon, 4326)');
        DB::statement('CREATE INDEX kecamatan_geom_idx ON kecamatan USING GIST (geom)');
    }

    public function down(): void
    {
        Schema::dropIfExists('kecamatan');
    }
};