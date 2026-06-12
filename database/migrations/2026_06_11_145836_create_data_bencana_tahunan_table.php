<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('data_bencana_tahunan', function (Blueprint $table) {
            $table->id();

            $table->foreignId('kecamatan_id')
                  ->constrained('kecamatan')
                  ->onDelete('cascade');

            $table->integer('tahun');
            $table->string('jenis_bencana');
            $table->integer('jumlah')->default(0);

            $table->timestamps();

            $table->index(['kecamatan_id', 'tahun']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_bencana_tahunan');
    }
};
