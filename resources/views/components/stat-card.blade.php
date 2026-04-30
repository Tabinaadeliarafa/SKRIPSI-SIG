@props(['label', 'value', 'icon' => null, 'tone' => 'primary'])

<div class="bg-white shadow rounded p-4">
    <div class="flex justify-between">
        <span>{{ $label }}</span>
        <span>{{ $icon }}</span>
    </div>

    <h2>{{ $value }}</h2>
</div>