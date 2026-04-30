<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Admin · @yield('title', 'SIG Bencana Kab. Bekasi')</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @stack('head')
</head>
<body class="bg-bks-bg text-bks-text">
    <x-navbar-admin />
    <div class="flex min-h-[calc(100vh-56px)]">
        <x-sidebar-admin />
        <div class="flex-1 overflow-x-auto">
            @if (session('success'))
                <div class="m-4 rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800 text-sm">
                    {{ session('success') }}
                </div>
            @endif
            @yield('content')
        </div>
    </div>
    @stack('scripts')
</body>
</html>
