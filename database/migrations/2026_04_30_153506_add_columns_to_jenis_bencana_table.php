<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('jenis_bencana', function (Blueprint $table) {
            $table->string('kode_jenis')->nullable()->after('nama_bencana');
            $table->string('warna_peta')->nullable()->after('kode_jenis');
        });
    }

    public function down(): void
    {
        Schema::table('jenis_bencana', function (Blueprint $table) {
            $table->dropColumn(['kode_jenis', 'warna_peta']);
        });
    }
};