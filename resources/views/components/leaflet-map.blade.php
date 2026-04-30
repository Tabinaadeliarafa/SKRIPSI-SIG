@props(['id' => 'leaflet-map', 'height' => '70vh', 'center' => '[-6.2, 107.1]', 'zoom' => 11])
<div id="{{ $id }}" data-center="{{ $center }}" data-zoom="{{ $zoom }}"
     style="height: {{ $height }};"
     class="w-full rounded-lg overflow-hidden border border-black/10 bg-bks-card relative">
    <div class="absolute inset-0 flex items-center justify-center text-bks-text/40 text-sm pointer-events-none" data-loading>
        <span class="animate-pulse">Memuat peta…</span>
    </div>
</div>
@push('scripts')
    @vite(['resources/js/map.js'])
@endpush
