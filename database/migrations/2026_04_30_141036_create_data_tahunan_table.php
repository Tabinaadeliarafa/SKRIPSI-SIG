<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('data_tahunan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kecamatan_id')->constrained('kecamatan');
            $table->integer('tahun');
            $table->integer('total_bencana')->default(0);
            $table->integer('total_desa_terdampak')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('data_tahunan'); }
};