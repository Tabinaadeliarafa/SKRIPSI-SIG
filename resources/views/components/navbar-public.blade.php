@php $current = Route::currentRouteName(); @endphp
<nav class="bg-bks-primary text-white shadow-md">
    <div class="max-w-7xl mx-auto flex items-center justify-between px-4 h-14">
        <a href="{{ route('home') }}" class="flex items-center gap-2 font-bold tracking-wide">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-bks-accent text-white text-sm">🗺️</span>
            <span>SIG <span class="text-bks-accent">BKS</span></span>
        </a>

        <div class="hidden md:flex items-center gap-1">
            @php $links = [
                'home' => ['Beranda', route('home')],
                'map'  => ['Peta', route('map')],
                'visualization' => ['Visualisasi', route('visualization')],
                'report' => ['Laporan', route('report')],
            ]; @endphp
            @foreach ($links as $key => [$label, $url])
                <a href="{{ $url }}"
                   class="px-3 py-2 text-sm rounded-md transition
                          {{ $current === $key ? 'bg-white/15 text-white' : 'text-white/80 hover:text-white hover:bg-white/10' }}">
                    {{ $label }}
                </a>
            @endforeach
        </div>

        <a href="{{ route('login') }}"
           class="bg-bks-orange hover:bg-bks-orange/90 text-white text-sm font-medium px-4 py-2 rounded-md transition">
            Login Admin
        </a>
    </div>
</nav>
