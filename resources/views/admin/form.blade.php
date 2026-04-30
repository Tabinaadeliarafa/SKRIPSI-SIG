@extends('layouts.admin')
@section('title', $bencana ? 'Edit Data' : 'Tambah Data')

@section('content')
@php
    $isEdit = (bool) $bencana;
    $action = $isEdit ? route('admin.bencana.update', $bencana) : route('admin.bencana.store');
@endphp

<x-page-header title="{{ $isEdit ? 'Edit Data Bencana' : 'Tambah Data Baru' }}"
               :breadcrumb="['Data Bencana', $isEdit ? 'Edit' : 'Tambah Data Baru']" />

<form id="bencana-form" method="POST" action="{{ $action }}" class="p-6 space-y-6 max-w-4xl">
    @csrf
    @if ($isEdit) @method('PUT') @endif

    {{-- Stepper --}}
    <ol class="flex items-center gap-2 text-xs">
        @foreach (['Info Umum','Data Bencana','Koordinat','Konfirmasi'] as $i => $name)
            <li class="flex items-center gap-2">
                <span data-step="{{ $i+1 }}" class="w-7 h-7 rounded-full flex items-center justify-center font-bold
                    {{ $i === 0 ? 'bg-bks-accent text-white' : 'bg-white border border-black/10 text-bks-text/60' }}">{{ $i+1 }}</span>
                <span class="font-medium {{ $i === 0 ? 'text-bks-primary' : 'text-bks-text/60' }}">{{ $name }}</span>
                @if ($i < 3)<span class="w-10 h-px bg-black/10"></span>@endif
            </li>
        @endforeach
    </ol>

    {{-- Section 1 --}}
    <fieldset data-section="1" class="bg-white rounded-lg p-5 border border-black/5 space-y-4">
        <legend class="font-semibold text-bks-primary px-1">1. Informasi Umum</legend>
        <div class="grid md:grid-cols-2 gap-4">
            <label class="text-sm">Kecamatan
                <select name="kecamatan_id" required class="mt-1 w-full border border-black/10 rounded px-3 py-2 bg-white">
                    @foreach ($kecamatan as $k)
                        <option value="{{ $k->id }}" @selected(old('kecamatan_id', $bencana?->kecamatan_id) == $k->id)>{{ $k->nama }}</option>
                    @endforeach
                </select>
            </label>
            <label class="text-sm">Desa / Kelurahan
                <input name="desa_kelurahan" value="{{ old('desa_kelurahan', $bencana?->desa_kelurahan) }}"
                       class="mt-1 w-full border border-black/10 rounded px-3 py-2">
            </label>
            <label class="text-sm">Tahun Data
                <select name="tahun" class="mt-1 w-full border border-black/10 rounded px-3 py-2 bg-white">
                    @foreach ([2025,2024,2023] as $y)
                        <option value="{{ $y }}" @selected(old('tahun', $bencana?->tahun ?? 2025) == $y)>{{ $y }}</option>
                    @endforeach
                </select>
            </label>
            <label class="text-sm">Sumber Data
                <select name="sumber_data" class="mt-1 w-full border border-black/10 rounded px-3 py-2 bg-white">
                    @foreach (['BPS Kabupaten Bekasi','BPBD','Survei Lapangan','Laporan Kecamatan'] as $s)
                        <option @selected(old('sumber_data', $bencana?->sumber_data) === $s)>{{ $s }}</option>
                    @endforeach
                </select>
            </label>
        </div>
    </fieldset>

    {{-- Section 2 --}}
    <fieldset class="bg-white rounded-lg p-5 border border-black/5 space-y-4">
        <legend class="font-semibold text-bks-primary px-1">2. Data Bencana</legend>
        <label class="text-sm block">Jenis Bencana
            <select name="jenis_bencana" class="mt-1 w-full border border-black/10 rounded px-3 py-2 bg-white">
                @foreach (['banjir' => 'Banjir', 'longsor' => 'Tanah Longsor', 'gempa' => 'Gempa Bumi'] as $v => $l)
                    <option value="{{ $v }}" @selected(old('jenis_bencana', $bencana?->jenis_bencana) === $v)>{{ $l }}</option>
                @endforeach
            </select>
        </label>

        <div class="grid md:grid-cols-2 gap-4">
            <div>
                <label class="text-sm block mb-1">Jumlah Desa Terdampak</label>
                <div class="inline-flex items-center border border-black/10 rounded">
                    <button type="button" data-step="-1" class="px-3 py-1.5 hover:bg-bks-bg">−</button>
                    <input id="jumlah_desa" name="jumlah_desa" type="number" min="0"
                           value="{{ old('jumlah_desa', $bencana?->jumlah_desa ?? 0) }}"
                           class="w-20 text-center border-x border-black/10 py-1.5 outline-none">
                    <button type="button" data-step="1" class="px-3 py-1.5 hover:bg-bks-bg">＋</button>
                </div>
            </div>

            <label class="text-sm">Tingkat Risiko (otomatis)
                <select id="tingkat_risiko" name="tingkat_risiko" disabled class="mt-1 w-full border border-black/10 rounded px-3 py-2 bg-bks-bg">
                    @foreach (['tinggi' => 'Tinggi (7-9)', 'sedang' => 'Sedang (3-6)', 'rendah' => 'Rendah (1-2)', 'aman' => 'Aman (0)'] as $v => $l)
                        <option value="{{ $v }}" @selected(($bencana?->tingkat_risiko ?? 'aman') === $v)>{{ $l }}</option>
                    @endforeach
                </select>
            </label>

            <label class="text-sm">Status
                <select name="status" class="mt-1 w-full border border-black/10 rounded px-3 py-2 bg-white">
                    @foreach (['terverifikasi' => 'Terverifikasi BPS', 'draft' => 'Draft', 'perlu_verifikasi' => 'Perlu Verifikasi'] as $v => $l)
                        <option value="{{ $v }}" @selected(old('status', $bencana?->status ?? 'terverifikasi') === $v)>{{ $l }}</option>
                    @endforeach
                </select>
            </label>
        </div>

        <label class="text-sm block">Keterangan
            <textarea name="keterangan" rows="3" class="mt-1 w-full border border-black/10 rounded px-3 py-2">{{ old('keterangan', $bencana?->keterangan) }}</textarea>
        </label>
    </fieldset>

    {{-- Section 3 --}}
    <fieldset class="bg-white rounded-lg p-5 border border-black/5 space-y-4">
        <legend class="font-semibold text-bks-primary px-1">3. Koordinat Geografis</legend>
        <div class="grid md:grid-cols-2 gap-4">
            <label class="text-sm">Latitude
                <input name="latitude" placeholder="-6.xxxxxx" value="{{ old('latitude', $bencana?->latitude) }}"
                       class="mt-1 w-full border border-black/10 rounded px-3 py-2">
            </label>
            <label class="text-sm">Longitude
                <input name="longitude" placeholder="107.xxxxxx" value="{{ old('longitude', $bencana?->longitude) }}"
                       class="mt-1 w-full border border-black/10 rounded px-3 py-2">
            </label>
        </div>
        <x-leaflet-map id="picker-map" height="280px" />
        <div class="space-y-1.5 text-sm">
            <label class="flex items-center gap-2"><input type="checkbox" checked> Masukkan ke layer Banjir</label>
            <label class="flex items-center gap-2"><input type="checkbox"> Masukkan ke layer Longsor</label>
            <label class="flex items-center gap-2"><input type="checkbox" checked> Tampilkan di peta publik</label>
        </div>
    </fieldset>

    <div class="flex items-center justify-between gap-2 pt-2">
        <a href="{{ route('admin.dashboard') }}" class="px-4 py-2 text-sm bg-white border border-black/10 rounded hover:bg-bks-card">Batal</a>
        <div class="flex gap-2">
            <button name="status" value="draft" class="px-4 py-2 text-sm bg-bks-card border border-black/10 rounded hover:bg-bks-bg">Simpan Draft</button>
            <button class="px-5 py-2 text-sm bg-bks-orange text-white rounded hover:bg-bks-orange/90 font-semibold">Simpan & Publikasi →</button>
        </div>
    </div>
</form>

@push('scripts')@vite(['resources/js/admin.js'])@endpush
@endsection
