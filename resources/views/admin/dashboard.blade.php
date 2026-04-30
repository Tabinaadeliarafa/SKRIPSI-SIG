@extends('layouts.admin')

@section('title', 'Dashboard')

@section('content')
<x-page-header title="Data Bencana Kecamatan" source="BPS 2025">
    <button class="px-3 py-1.5 bg-white border border-black/10 rounded text-sm hover:bg-bks-card">⬇ Ekspor CSV</button>
    <button class="px-3 py-1.5 bg-white border border-black/10 rounded text-sm hover:bg-bks-card">⬆ Import BPS</button>
    <a href="{{ route('admin.bencana.create') }}" class="px-3 py-1.5 bg-bks-orange text-white rounded text-sm hover:bg-bks-orange/90">＋ Tambah Data</a>
</x-page-header>

<div class="p-6 space-y-5">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <x-stat-card label="Kecamatan" :value="$totalKec" tone="primary" icon="🏘️" />
        <x-stat-card label="Desa Banjir" :value="$totalBanjir" tone="banjir" icon="💧" />
        <x-stat-card label="Desa Longsor" :value="$totalLongsor" tone="longsor" icon="⛰️" />
        <x-stat-card label="Desa Gempa" :value="$totalGempa" tone="gempa" icon="🌐" />
    </div>

    <div class="flex items-center gap-2 flex-wrap">
        <div class="relative flex-1 min-w-[220px]">
            <input type="search" placeholder="Cari kecamatan…" class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-black/10 rounded-md focus:outline-none focus:border-bks-accent">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-bks-text/40">🔍</span>
        </div>
        <select class="text-sm border border-black/10 bg-white rounded-md px-3 py-2">
            <option>Semua Risiko</option><option>Tinggi</option><option>Sedang</option><option>Rendah</option><option>Aman</option>
        </select>
        <select class="text-sm border border-black/10 bg-white rounded-md px-3 py-2">
            <option>Urut: Banjir Tertinggi</option><option>Nama A-Z</option><option>Total Tertinggi</option>
        </select>
    </div>

    <div class="overflow-x-auto bg-white rounded-lg border border-black/5 shadow-sm">
        <table class="min-w-full text-sm">
            <thead class="bg-bks-card text-xs uppercase text-bks-text/70">
                <tr>
                    <th class="px-3 py-2 text-left">#</th>
                    <th class="px-3 py-2 text-left">Kecamatan</th>
                    <th class="px-3 py-2 text-left">Banjir (desa)</th>
                    <th class="px-3 py-2 text-right">Longsor</th>
                    <th class="px-3 py-2 text-right">Gempa</th>
                    <th class="px-3 py-2 text-right">Total</th>
                    <th class="px-3 py-2 text-center">Risiko</th>
                    <th class="px-3 py-2 text-right">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-black/5">
                @foreach ($rows as $i => $r)
                    <tr class="hover:bg-bks-bg/40">
                        <td class="px-3 py-2 text-bks-text/50">{{ ($rows->firstItem() ?? 1) + $i }}</td>
                        <td class="px-3 py-2 font-medium">{{ $r->nama }}</td>
                        <td class="px-3 py-2">
                            <div class="flex items-center gap-2">
                                <span class="w-6 text-right font-semibold">{{ (int)$r->banjir }}</span>
                                <div class="flex-1 h-1.5 bg-bks-bg rounded-full overflow-hidden max-w-[140px]">
                                    <div class="h-full bg-bks-accent" style="width: {{ ((int)$r->banjir / 9) * 100 }}%"></div>
                                </div>
                            </div>
                        </td>
                        <td class="px-3 py-2 text-right">{{ (int)$r->longsor }}</td>
                        <td class="px-3 py-2 text-right">{{ (int)$r->gempa }}</td>
                        <td class="px-3 py-2 text-right font-bold">{{ $r->total }}</td>
                        <td class="px-3 py-2 text-center"><x-risk-chip :level="$r->risiko" /></td>
                        <td class="px-3 py-2 text-right">
                            <div class="inline-flex items-center gap-1">
                                <button class="w-7 h-7 rounded hover:bg-bks-bg" title="Lihat">👁</button>
                                <a href="#" class="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-bks-bg" title="Edit">✎</a>
                                <button class="w-7 h-7 rounded hover:bg-red-50 text-red-600" title="Hapus" data-delete>✕</button>
                            </div>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="flex items-center justify-between text-xs text-bks-text/60">
        <span>Menampilkan {{ $rows->firstItem() }}–{{ $rows->lastItem() }} dari {{ $rows->total() }}</span>
        <div>{{ $rows->links() }}</div>
    </div>
</div>

{{-- Delete confirm modal --}}
<div id="delete-modal" class="hidden fixed inset-0 z-50 bg-black/40 items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-5">
        <h3 class="font-bold text-bks-primary">Hapus Data?</h3>
        <p class="text-sm text-bks-text/70 mt-1">Tindakan ini tidak dapat dibatalkan.</p>
        <div class="flex justify-end gap-2 mt-4">
            <button data-cancel class="px-3 py-1.5 text-sm bg-bks-bg rounded hover:bg-bks-card">Batal</button>
            <button data-confirm class="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700">Hapus</button>
        </div>
    </div>
</div>

@push('scripts')@vite(['resources/js/admin.js'])@endpush
@endsection
