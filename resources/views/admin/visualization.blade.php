@extends('layouts.admin')
@section('title', 'Visualisasi')

@section('content')
<x-page-header title="Visualisasi Data" source="BPS 2025">
    <button class="px-3 py-1.5 bg-white border border-black/10 rounded text-sm hover:bg-bks-card">⬇ CSV</button>
    <button class="px-3 py-1.5 bg-white border border-black/10 rounded text-sm hover:bg-bks-card">⬇ Excel</button>
    <button class="px-3 py-1.5 bg-bks-primary text-white rounded text-sm hover:bg-bks-primary/90">📄 PDF</button>
</x-page-header>

<div class="p-6">
    @include('public.visualization', ['rows' => $rows ?? collect()])
</div>
@endsection
