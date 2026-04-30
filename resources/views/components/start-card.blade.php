@props(['label', 'value', 'icon' => null, 'tone' => 'primary'])

@php
$tones = [
    'primary' => 'border-bks-accent text-bks-primary',
    'banjir'  => 'border-blue-500 text-blue-700',
    'longsor' => 'border-amber-500 text-amber-700',
    'gempa'   => 'border-red-500 text-red-700',
];

$cls = $tones[$tone] ?? $tones['primary'];
@endphp

<div {{ $attributes->merge(['class' => "bg-bks-card rounded-lg border-l-4 $cls px-4 py-3 shadow-sm"]) }}>
    <div class="flex items-center justify-between">
        <span class="text-xs uppercase tracking-wide text-bks-text/60">{{ $label }}</span>
        @if($icon)
            <span class="text-xl">{{ $icon }}</span>
        @endif
    </div>

    <div class="mt-1 text-2xl font-bold">{{ $value }}</div>
</div>