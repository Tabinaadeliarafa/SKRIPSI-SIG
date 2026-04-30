@php
    $current = Route::currentRouteName();
    $sections = [
        'Menu Utama' => [
            ['admin.dashboard', 'Dashboard',    '🏠', null],
            ['admin.map',       'Peta Leaflet', '🗺️', null],
        ],
        'Manajemen Data' => [
            ['admin.bencana.index', 'Data Bencana', '📋', 72],
            ['admin.bencana.index', 'Data Banjir',  '💧', 69],
            ['admin.bencana.index', 'Data Longsor', '⛰️', 3],
            ['admin.bencana.index', 'Data Gempa',   '🌐', 0],
        ],
        'Data Spasial' => [
            ['admin.map', 'Layer QGIS',     '🧭', null],
            ['admin.map', 'Analisis QGIS',  '📐', null],
        ],
        'Laporan' => [
            ['admin.visualization', 'Statistik',       '📊', null],
            ['admin.report',        'Ekspor Laporan',  '📄', null],
        ],
    ];
@endphp
<aside class="w-[196px] shrink-0 bg-bks-sidebar text-white/85 flex flex-col">
    <div class="flex-1 overflow-y-auto py-3">
        @foreach ($sections as $title => $items)
            <div class="px-4 pt-3 pb-1 text-[10px] tracking-widest uppercase text-white/40">{{ $title }}</div>
            @foreach ($items as [$route, $label, $icon, $badge])
                @php $active = $current === $route; @endphp
                <a href="{{ route($route) }}"
                   class="flex items-center gap-2 px-4 py-2 text-sm border-l-[3px] transition
                          {{ $active
                                ? 'border-bks-accent bg-[rgba(45,108,168,0.18)] text-white'
                                : 'border-transparent hover:bg-white/5 hover:text-white' }}">
                    <span class="w-4 text-center">{{ $icon }}</span>
                    <span class="flex-1 truncate">{{ $label }}</span>
                    @if ($badge !== null)
                        <span class="text-[10px] bg-bks-accent/80 text-white rounded-full px-1.5 py-0.5">{{ $badge }}</span>
                    @endif
                </a>
            @endforeach
        @endforeach
    </div>
    <a href="#" class="flex items-center gap-2 px-4 py-3 text-sm border-t border-white/10 hover:bg-white/5">
        <span>⚙️</span> Pengaturan
    </a>
</aside>
