<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>SIG Bencana Kabupaten Bekasi</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/tsx/main.tsx'])
</head>
<body>
    <div id="root"></div>
</body>
</html>