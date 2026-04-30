<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login Admin · SIG BKS</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen flex items-center justify-center bg-gradient-to-br from-bks-primary via-bks-sidebar to-black p-4">
    <div class="w-full max-w-md bg-bks-sidebar text-white rounded-2xl shadow-2xl border border-white/10 p-8">
        <div class="text-center">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-bks-orange text-white text-2xl">🗺️</div>
            <h1 class="mt-4 text-xl font-bold">SIG Bencana Kab. Bekasi</h1>
            <p class="text-sm text-white/60 mt-1">Panel Admin</p>
        </div>

        @if ($errors->any())
            <div class="mt-4 bg-red-500/15 border border-red-500/30 text-red-200 text-sm rounded px-3 py-2">
                {{ $errors->first() }}
            </div>
        @endif

        <form method="POST" action="{{ route('login') }}" class="mt-6 space-y-4">
            @csrf
            <div>
                <label class="block text-xs uppercase tracking-wide text-white/60 mb-1">Email</label>
                <input type="email" name="email" value="{{ old('email') }}" required autofocus
                       class="w-full bg-white/5 border border-white/15 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-bks-accent">
            </div>
            <div>
                <label class="block text-xs uppercase tracking-wide text-white/60 mb-1">Password</label>
                <input type="password" name="password" required
                       class="w-full bg-white/5 border border-white/15 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-bks-accent">
            </div>
            <label class="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" name="remember" class="accent-bks-orange"> Ingat saya
            </label>
            <button class="w-full bg-bks-orange hover:bg-bks-orange/90 text-white font-semibold py-2.5 rounded-md transition">
                Masuk
            </button>
        </form>

        <div class="mt-6 text-center">
            <a href="{{ route('home') }}" class="text-xs text-white/50 hover:text-white">← Kembali ke situs publik</a>
        </div>
    </div>
</body>
</html>
