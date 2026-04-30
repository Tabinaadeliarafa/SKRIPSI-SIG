@extends('layouts.app')

@section('title', 'Peta Interaktif · SIG BKS')
@section('navbar')<x-navbar-public />@endsection

@section('content')
<div class="flex h-[calc(100vh-56px-44px)]">
    {{-- Left: dark layer panel --}}
    <aside class="w-[260px] bg-bks-sidebar text-white/85 overflow-y-auto p-4 space-y-5">
        <div>
            <div class="text-[10px] tracking-widest uppercase text-white/50 mb-2">Layer Peta</div>
            @php $layers = [
                ['Banjir', true, 'bg-blue-500'],
                ['Longsor', true, 'bg-amber-500'],
                ['Gempa', false, 'bg-red-500'],
                ['Batas Kecamatan', true, 'bg-white/40'],
                ['Sungai', false, 'bg-cyan-400'],
                ['Zona Risiko QGIS', false, 'bg-fuchsia-500'],
            ]; @endphp
            @foreach ($layers as [$name, $on, $col])
                <label class="flex items-center justify-between py-1.5 text-sm">
                    <span class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-sm {{ $col }}"></span>{{ $name }}</span>
                    <input type="checkbox" {{ $on ? 'checked' : '' }} class="accent-bks-accent">
                </label>
            @endforeach
        </div>

        <div>
            <div class="text-[10px] tracking-widest uppercase text-white/50 mb-2">23 Kecamatan</div>
            <div class="space-y-1.5">
                @foreach ($kecamatan as $kec)
                    @php $b = $kec->totalBanjir(); @endphp
                    <button class="w-full text-left text-xs hover:bg-white/5 rounded px-1.5 py-1">
                        <div class="flex justify-between"><span class="truncate">{{ $kec->nama }}</span><span class="font-semibold text-bks-accent">{{ $b }}</span></div>
                        <div class="h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                            <div class="h-full bg-bks-accent" style="width:{{ min(100, $b * 11) }}%"></div>
                        </div>
                    </button>
                @endforeach
            </div>
        </div>
    </aside>

    {{-- Map --}}
    <div class="flex-1 relative">
        <x-leaflet-map id="public-map" height="100%" />

        {{-- Top: basemap switcher --}}
        <div class="absolute top-3 left-1/2 -translate-x-1/2 z-[450] bg-white rounded-md shadow border border-black/10 text-xs flex">
            @foreach (['OSM','Dark','Topo','Satelit'] as $b)
                <button data-basemap="{{ strtolower($b) }}" class="px-3 py-1.5 hover:bg-bks-bg first:rounded-l-md last:rounded-r-md">{{ $b }}</button>
            @endforeach
        </div>

        {{-- Legend --}}
        <div class="absolute bottom-4 left-4 bg-white/95 rounded-md shadow border border-black/10 text-xs p-3 z-[400]">
            <div class="font-semibold mb-1">Choropleth · Jumlah Desa</div>
            <div class="flex items-center gap-1">
                @foreach (['#d0ccc6'=>'0','#b8d4ec'=>'1-2','#8ab8e0'=>'3-4','#4a88c8'=>'5-6','#1a4870'=>'7-9'] as $c => $l)
                    <div class="text-center"><div class="w-7 h-3" style="background:{{ $c }}"></div><div class="text-[10px]">{{ $l }}</div></div>
                @endforeach
            </div>
            <div class="mt-2 text-[10px] text-bks-text/60">© OpenStreetMap · BPS 2025 · QGIS</div>
        </div>
    </div>

    {{-- Right: detail panel --}}
    <aside class="w-[260px] bg-bks-card overflow-y-auto p-4 space-y-5 text-sm border-l border-black/5">
        <div>
            <div class="text-[10px] tracking-widest uppercase text-bks-text/50 mb-1">Kecamatan Terpilih</div>
            <div id="sel-name" class="text-lg font-bold text-bks-primary">— Pilih di peta —</div>
            <div class="grid grid-cols-3 gap-2 mt-3">
                <div class="bg-white rounded p-2 text-center"><div class="text-[10px] text-bks-text/60">Banjir</div><div id="sel-banjir" class="font-bold text-blue-700">0</div></div>
                <div class="bg-white rounded p-2 text-center"><div class="text-[10px] text-bks-text/60">Longsor</div><div id="sel-longsor" class="font-bold text-amber-700">0</div></div>
                <div class="bg-white rounded p-2 text-center"><div class="text-[10px] text-bks-text/60">Gempa</div><div id="sel-gempa" class="font-bold text-red-700">0</div></div>
            </div>
        </div>

        <div>
            <div class="text-[10px] tracking-widest uppercase text-bks-text/50 mb-2">Top 5 Terdampak</div>
            @php $top = $kecamatan->sortByDesc(fn($k) => $k->totalBanjir() + $k->totalLongsor())->take(5); @endphp
            <ol class="space-y-1.5">
                @foreach ($top as $i => $k)
                    <li class="flex items-center justify-between text-xs bg-white rounded px-2 py-1.5">
                        <span><span class="text-bks-accent font-bold mr-1">{{ $i+1 }}.</span>{{ $k->nama }}</span>
                        <span class="font-semibold">{{ $k->totalBanjir() + $k->totalLongsor() }}</span>
                    </li>
                @endforeach
            </ol>
        </div>

        <div>
            <div class="text-[10px] tracking-widest uppercase text-bks-text/50 mb-2">Ekspor</div>
            <div class="grid grid-cols-3 gap-2">
                <button class="bg-bks-primary text-white text-xs py-1.5 rounded hover:bg-bks-primary/90">PNG</button>
                <button class="bg-bks-primary text-white text-xs py-1.5 rounded hover:bg-bks-primary/90">PDF</button>
                <button class="bg-bks-primary text-white text-xs py-1.5 rounded hover:bg-bks-primary/90">GeoJSON</button>
            </div>
        </div>
    </aside>
</div>
@endsection
