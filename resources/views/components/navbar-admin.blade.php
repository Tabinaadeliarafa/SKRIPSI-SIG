@php $current = Route::currentRouteName(); @endphp
<nav class="bg-bks-primary text-white h-14 flex items-center px-4 shadow">
    <a href="{{ route('admin.dashboard') }}" class="flex items-center gap-2 font-bold">
        <span class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-bks-orange text-white text-sm">🗺️</span>
        <span>SIG BKS</span>
        <span class="ml-2 text-[10px] tracking-widest bg-bks-orange/90 text-white px-2 py-0.5 rounded">ADMIN</span>
    </a>

    <div class="hidden md:flex items-center gap-1 ml-8">
        @php $tabs = [
            'admin.dashboard'     => ['Dashboard', route('admin.dashboard')],
            'admin.map'           => ['Peta',     route('admin.map')],
            'admin.visualization' => ['Visualisasi', route('admin.visualization')],
            'admin.report'        => ['Laporan',  route('admin.report')],
        ]; @endphp
        @foreach ($tabs as $key => [$label, $url])
            <a href="{{ $url }}"
               class="px-3 py-2 text-sm rounded-md
                      {{ str_starts_with((string)$current, $key) ? 'bg-white/15' : 'text-white/80 hover:bg-white/10' }}">
                {{ $label }}
            </a>
        @endforeach
    </div>

    <div class="ml-auto flex items-center gap-3">
        <button class="relative p-2 rounded-md hover:bg-white/10" aria-label="Notifikasi">
            🔔
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-bks-orange rounded-full"></span>
        </button>

        <div class="relative group">
            <button class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/10">
                <span class="w-8 h-8 rounded-full bg-bks-accent flex items-center justify-center text-xs font-bold">
                    {{ strtoupper(substr(auth()->user()->name ?? 'A', 0, 2)) }}
                </span>
                <span class="text-sm">{{ auth()->user()->name ?? 'Admin' }}</span>
                <span class="text-xs">▾</span>
            </button>
            <div class="absolute right-0 mt-1 w-44 bg-white text-bks-text rounded-md shadow-lg border border-black/5 hidden group-hover:block">
                <a href="{{ route('home') }}" class="block px-4 py-2 text-sm hover:bg-bks-bg">Lihat Situs Publik</a>
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button class="w-full text-left px-4 py-2 text-sm hover:bg-bks-bg text-red-600">Logout</button>
                </form>
            </div>
        </div>
    </div>
</nav>
