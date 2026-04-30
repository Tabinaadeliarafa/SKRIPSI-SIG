@extends('layouts.app')

@section('title', 'Visualisasi Data · SIG BKS')
@section('navbar')<x-navbar-public />@endsection

@section('content')
<div class="max-w-7xl mx-auto px-6 py-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
        <h1 class="text-2xl font-bold text-bks-primary">Visualisasi Data Bencana</h1>
        <div class="flex gap-2">
            <button class="px-3 py-1.5 bg-white border border-black/10 rounded text-sm hover:bg-bks-card">⬇ Unduh PNG</button>
            <button class="px-3 py-1.5 bg-bks-primary text-white rounded text-sm hover:bg-bks-primary/90">📄 Ekspor PDF</button>
        </div>
    </div>

    {{-- Tabs --}}
    <div class="mt-4 border-b border-black/10 flex gap-1">
        @foreach (['Ringkasan','Per Kecamatan','Perbandingan','Tren'] as $i => $tab)
            <button data-tab="{{ $i }}"
                    class="px-4 py-2 text-sm border-b-2 -mb-px {{ $i === 0 ? 'border-bks-accent text-bks-primary font-semibold' : 'border-transparent text-bks-text/60 hover:text-bks-primary' }}">
                {{ $tab }}
            </button>
        @endforeach
    </div>

    {{-- Top row --}}
    <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="bg-bks-card rounded-lg p-4">
            <h3 class="font-semibold text-bks-primary mb-3">Banjir per Kecamatan</h3>
            <canvas id="chart-banjir-bar" height="280"></canvas>
        </div>

        <div class="space-y-4">
            <div class="bg-bks-card rounded-lg p-4">
                <h3 class="font-semibold text-bks-primary mb-3">Proporsi Banjir vs Longsor</h3>
                <canvas id="chart-donut" height="180"></canvas>
            </div>
            <div class="bg-bks-card rounded-lg p-4">
                <h3 class="font-semibold text-bks-primary mb-3">Top 3 Kecamatan</h3>
                <ol class="space-y-2">
                    @foreach ($rows->take(3) as $i => $r)
                        <li class="flex items-center gap-3 bg-white rounded px-3 py-2">
                            <span class="w-7 h-7 rounded-full bg-bks-accent text-white flex items-center justify-center text-sm font-bold">{{ $i+1 }}</span>
                            <span class="flex-1 font-medium">{{ $r->nama }}</span>
                            <span class="text-bks-accent font-bold">{{ (int)$r->banjir }} desa</span>
                        </li>
                    @endforeach
                </ol>
            </div>
        </div>
    </div>

    {{-- Bottom row --}}
    <div class="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 bg-bks-card rounded-lg p-4">
            <h3 class="font-semibold text-bks-primary mb-3">Banjir vs Longsor per Kecamatan</h3>
            <canvas id="chart-grouped" height="220"></canvas>
        </div>
        <div class="bg-bks-card rounded-lg p-4">
            <h3 class="font-semibold text-bks-primary mb-3">Klasifikasi Risiko</h3>
            <table class="w-full text-sm">
                <thead class="text-xs uppercase text-bks-text/60">
                    <tr><th class="text-left py-1">Kecamatan</th><th class="text-right py-1">Total</th><th class="text-right py-1">Level</th></tr>
                </thead>
                <tbody class="divide-y divide-black/5">
                    @foreach ($rows as $r)
                        @php $total = (int)$r->banjir + (int)$r->longsor + (int)$r->gempa; @endphp
                        <tr>
                            <td class="py-1.5">{{ $r->nama }}</td>
                            <td class="py-1.5 text-right font-semibold">{{ $total }}</td>
                            <td class="py-1.5 text-right"><x-risk-chip :level="\App\Models\Bencana::calcRisiko($total)" /></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>

@push('scripts')
    <script>
        window.__VIZ_DATA__ = @json($rows);
    </script>
    @vite(['resources/js/charts.js'])
@endpush
@endsection
