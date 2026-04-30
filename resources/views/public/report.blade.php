@extends('layouts.app')

@section('title', 'Laporan · SIG BKS')
@section('navbar')<x-navbar-public />@endsection

@section('content')
<div class="max-w-7xl mx-auto px-6 py-6 print:p-0">
    <div class="flex items-center justify-between flex-wrap gap-3 print:hidden">
        <div>
            <h1 class="text-2xl font-bold text-bks-primary">Laporan Bencana Kabupaten Bekasi</h1>
            <p class="text-sm text-bks-text/60">Sumber: BPS Kabupaten Bekasi 2025</p>
        </div>
        <div class="flex flex-wrap gap-2 items-center">
            <input type="date" class="border border-black/10 rounded px-2 py-1.5 text-sm bg-white">
            <span class="text-xs">s/d</span>
            <input type="date" class="border border-black/10 rounded px-2 py-1.5 text-sm bg-white">
            <select class="border border-black/10 rounded px-2 py-1.5 text-sm bg-white">
                <option>Semua Kecamatan</option>
                @foreach ($rows as $r)<option>{{ $r->nama }}</option>@endforeach
            </select>
            <button onclick="window.print()" class="bg-bks-primary text-white text-sm px-3 py-1.5 rounded hover:bg-bks-primary/90">📄 Ekspor PDF</button>
        </div>
    </div>

    {{-- Summary --}}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <x-stat-card label="Kecamatan" :value="$totalKec" tone="primary" />
        <x-stat-card label="Total Banjir (desa)" :value="$totalBanjir" tone="banjir" />
        <x-stat-card label="Total Longsor (desa)" :value="$totalLongsor" tone="longsor" />
        <x-stat-card label="Paling Terdampak" :value="$mostAffected->nama ?? '-'" tone="orange" />
    </div>

    <div class="mt-6 bg-white rounded-lg border border-black/5 shadow-sm overflow-x-auto">
        <table class="min-w-full text-sm">
            <thead class="bg-bks-card text-xs uppercase tracking-wider text-bks-text/70">
                <tr>
                    <th class="px-3 py-2 text-left">No</th>
                    <th class="px-3 py-2 text-left">Kecamatan</th>
                    <th class="px-3 py-2 text-right">Banjir (desa)</th>
                    <th class="px-3 py-2 text-right">Tanah Longsor (desa)</th>
                    <th class="px-3 py-2 text-right">Gempa Bumi (desa)</th>
                    <th class="px-3 py-2 text-right">Total</th>
                    <th class="px-3 py-2 text-center">Tingkat Risiko</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-black/5">
                @foreach ($rows as $i => $r)
                    <tr class="hover:bg-bks-bg/50">
                        <td class="px-3 py-2">{{ $i+1 }}</td>
                        <td class="px-3 py-2 font-medium">{{ $r->nama }}</td>
                        <td class="px-3 py-2 text-right">{{ (int)$r->banjir }}</td>
                        <td class="px-3 py-2 text-right">{{ (int)$r->longsor }}</td>
                        <td class="px-3 py-2 text-right">{{ (int)$r->gempa }}</td>
                        <td class="px-3 py-2 text-right font-bold">{{ $r->total }}</td>
                        <td class="px-3 py-2 text-center"><x-risk-chip :level="$r->risiko" /></td>
                    </tr>
                @endforeach
            </tbody>
            <tfoot class="bg-bks-card font-semibold">
                <tr>
                    <td class="px-3 py-2" colspan="2">Total</td>
                    <td class="px-3 py-2 text-right">{{ $totalBanjir }}</td>
                    <td class="px-3 py-2 text-right">{{ $totalLongsor }}</td>
                    <td class="px-3 py-2 text-right">{{ (int)$rows->sum('gempa') }}</td>
                    <td class="px-3 py-2 text-right">{{ (int)$rows->sum('total') }}</td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
    </div>

    <p class="text-xs text-bks-text/50 mt-3 print:mt-6">
        Dicetak {{ now()->format('d M Y H:i') }} · Sistem Informasi Geografis Bencana Kab. Bekasi
    </p>
</div>
@endsection
