@extends('layouts.app')

@section('title', 'Beranda · SIG Bencana Kab. Bekasi')
@section('navbar')
    <x-navbar-public />
@endsection

@section('content')
{{-- Hero --}}
<section class="bg-gradient-to-br from-bks-primary via-bks-primary to-bks-sidebar text-white">
    <div class="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-8 items-center">
        <div>
            <span class="inline-block text-[10px] tracking-widest uppercase bg-white/10 px-2 py-1 rounded">BPS Kabupaten Bekasi 2025</span>
            <h1 class="mt-3 text-4xl md:text-5xl font-bold leading-tight">Bencana Alam Kab. Bekasi</h1>
            <p class="mt-2 text-bks-accent font-semibold">Sistem Informasi Geografis</p>
            <p class="mt-4 text-white/75 max-w-lg">
                Visualisasi interaktif sebaran desa/kelurahan terdampak bencana di 23 kecamatan
                Kabupaten Bekasi. Bersumber dari data resmi BPS dan analisis spasial QGIS.
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
                <a href="{{ route('map') }}" class="bg-bks-accent hover:bg-bks-accent/90 px-5 py-2.5 rounded-md font-medium">Lihat Peta Interaktif</a>
                <a href="{{ route('report') }}" class="bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-md font-medium border border-white/20">Unduh Data BPS</a>
            </div>
        </div>
        <div class="hidden md:block">
            <div class="aspect-square rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex items-center justify-center text-9xl">🗺️</div>
        </div>
    </div>
</section>

{{-- Stats --}}
<section class="max-w-7xl mx-auto px-6 -mt-8">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <x-stat-card label="Total Kecamatan" :value="$totalKec" tone="primary" icon="🏘️" />
        <x-stat-card label="Desa Banjir"     :value="$totalBanjir" tone="banjir" icon="💧" />
        <x-stat-card label="Desa Longsor"    :value="$totalLongsor" tone="longsor" icon="⛰️" />
        <x-stat-card label="Desa Gempa"      :value="$totalGempa" tone="gempa" icon="🌐" />
    </div>
</section>

{{-- Sidebar + Map --}}
<section class="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[210px_1fr] gap-4">
    <aside class="bg-bks-card rounded-lg p-4 space-y-5 text-sm">
        <div>
            <div class="text-xs font-semibold uppercase text-bks-text/60 mb-2">Filter Bencana</div>
            <div class="flex flex-wrap gap-1.5">
                @foreach (['Semua' => $totalBanjir + $totalLongsor + $totalGempa, 'Banjir' => $totalBanjir, 'Longsor' => $totalLongsor, 'Gempa' => $totalGempa] as $name => $count)
                    <button class="px-2.5 py-1 rounded-full bg-white border border-black/10 text-xs hover:border-bks-accent">
                        {{ $name }} <span class="ml-1 text-bks-accent font-semibold">{{ $count }}</span>
                    </button>
                @endforeach
            </div>
        </div>

        <div>
            <div class="text-xs font-semibold uppercase text-bks-text/60 mb-2">Top 6 Banjir</div>
            <div class="space-y-1.5">
                @foreach ($topBanjir as $row)
                    <div class="text-xs">
                        <div class="flex justify-between">
                            <span>{{ $row->kecamatan }}</span>
                            <span class="font-semibold">{{ $row->jumlah }}</span>
                        </div>

                        <div class="h-1.5 bg-white rounded-full overflow-hidden">
                            <div class="h-full bg-bks-accent"
                                style="width: {{ ($row->jumlah / 9) * 100 }}%">
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>

        <div>
            <div class="text-xs font-semibold uppercase text-bks-text/60 mb-2">Tahun Data</div>
            <input type="range" min="2023" max="2025" value="2025" class="w-full accent-bks-accent">
            <div class="flex justify-between text-[10px] text-bks-text/60"><span>2023</span><span>2024</span><span class="font-bold text-bks-accent">2025</span></div>
        </div>
    </aside>

    <div class="bg-bks-card rounded-lg p-2 relative">
        <x-leaflet-map id="home-map" height="520px" />
        <div class="absolute top-4 right-4 bg-white/95 rounded-md shadow border border-black/10 text-xs p-2 space-y-1 z-[400]">
            <div class="font-semibold mb-1">Layer</div>
            <label class="flex items-center gap-1.5"><input type="checkbox" checked> Banjir</label>
            <label class="flex items-center gap-1.5"><input type="checkbox" checked> Longsor</label>
            <label class="flex items-center gap-1.5"><input type="checkbox"> Gempa</label>
        </div>
        <div class="absolute bottom-4 left-4 bg-white/95 rounded-md shadow border border-black/10 text-xs p-3 z-[400]">
            <div class="font-semibold mb-1">Jumlah Desa Terdampak</div>
            <div class="flex items-center gap-1">
                @foreach (['#d0ccc6'=>'0','#b8d4ec'=>'1-2','#8ab8e0'=>'3-4','#4a88c8'=>'5-6','#1a4870'=>'7-9'] as $c => $l)
                    <div class="text-center">
                        <div class="w-7 h-3" style="background: {{ $c }}"></div>
                        <div class="text-[10px] mt-0.5">{{ $l }}</div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</section>
@endsection
