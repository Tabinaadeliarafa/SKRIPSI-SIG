<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('jenis_bencana', function (Blueprint $table) {
            $table->id();
            $table->string('nama_jenis');        // "Banjir", "Tanah Longsor", dll
            $table->string('kode_jenis')->nullable();
            $table->string('warna_peta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('jenis_bencana'); }
};