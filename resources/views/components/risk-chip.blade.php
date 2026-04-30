@props(['level' => 'aman'])
@php
    $map = [
        'tinggi' => ['Tinggi', 'bg-red-100 text-red-700 border-red-200'],
        'sedang' => ['Sedang', 'bg-amber-100 text-amber-700 border-amber-200'],
        'rendah' => ['Rendah', 'bg-emerald-100 text-emerald-700 border-emerald-200'],
        'aman'   => ['Aman',   'bg-gray-100 text-gray-600 border-gray-200'],
    ];
    [$label, $cls] = $map[$level] ?? $map['aman'];
@endphp
<span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border {{ $cls }}">
    {{ $label }}
</span>
