<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('kejadian_bencana', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kecamatan_id')->constrained('kecamatan');
            $table->foreignId('jenis_bencana_id')->constrained('jenis_bencana');
            $table->integer('jumlah_desa_terdampak')->default(0);
            $table->integer('tahun');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('kejadian_bencana'); }
};