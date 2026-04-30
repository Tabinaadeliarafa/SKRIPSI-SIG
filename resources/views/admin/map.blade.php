@extends('layouts.admin')
@section('title', 'Peta')

@section('content')
<x-page-header title="Peta Leaflet — Admin" source="QGIS" />
<div class="p-6">
    <x-leaflet-map id="admin-map" height="calc(100vh - 220px)" />
</div>
@endsection
