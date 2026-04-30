<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'SIG Bencana Kab. Bekasi')</title>
    <meta name="description" content="@yield('description', 'Sistem Informasi Geografis Bencana Alam Kabupaten Bekasi — data BPS 2025.')">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🗺️</text></svg>">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @stack('head')
</head>
<body class="bg-bks-bg text-bks-text antialiased min-h-screen flex flex-col">
    @yield('navbar')

    <main class="flex-1">
        @if (session('success'))
            <div class="mx-auto max-w-7xl px-4 mt-4">
                <div class="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800 text-sm">
                    {{ session('success') }}
                </div>
            </div>
        @endif
        @if ($errors->any())
            <div class="mx-auto max-w-7xl px-4 mt-4">
                <div class="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-red-800 text-sm">
                    <ul class="list-disc pl-5">
                        @foreach ($errors->all() as $err)<li>{{ $err }}</li>@endforeach
                    </ul>
                </div>
            </div>
        @endif

        @yield('content')
    </main>

    <footer class="bg-bks-primary text-white/80 text-xs py-3 px-6 mt-auto">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <span>© {{ date('Y') }} Pemerintah Kabupaten Bekasi — SIG Bencana</span>
            <span>Sumber data: BPS Kabupaten Bekasi 2025 · QGIS Analysis</span>
        </div>
    </footer>
    @stack('scripts')
</body>
</html>