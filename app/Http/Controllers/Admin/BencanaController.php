<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bencana;
use App\Models\Kecamatan;
use Illuminate\Http\Request;

class BencanaController extends Controller
{
    public function index()
    {
        return redirect()->route('admin.dashboard');
    }

    public function create()
    {
        return view('admin.form', [
            'bencana'   => null,
            'kecamatan' => Kecamatan::orderBy('nama')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['tingkat_risiko'] = Bencana::calcRisiko((int) $data['jumlah_desa']);
        Bencana::create($data);
        return redirect()->route('admin.dashboard')->with('success', 'Data bencana berhasil ditambahkan.');
    }

    public function show(Bencana $bencana)
    {
        return redirect()->route('admin.bencana.edit', $bencana);
    }

    public function edit(Bencana $bencana)
    {
        return view('admin.form', [
            'bencana'   => $bencana,
            'kecamatan' => Kecamatan::orderBy('nama')->get(),
        ]);
    }

    public function update(Request $request, Bencana $bencana)
    {
        $data = $this->validateData($request);
        $data['tingkat_risiko'] = Bencana::calcRisiko((int) $data['jumlah_desa']);
        $bencana->update($data);
        return redirect()->route('admin.dashboard')->with('success', 'Data berhasil diperbarui.');
    }

    public function destroy(Bencana $bencana)
    {
        $bencana->delete();
        return back()->with('success', 'Data berhasil dihapus.');
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'kecamatan_id'   => ['required', 'exists:kecamatan,id'],
            'desa_kelurahan' => ['nullable', 'string', 'max:120'],
            'tahun'          => ['required', 'integer', 'min:2000', 'max:2100'],
            'jenis_bencana'  => ['required', 'in:banjir,longsor,gempa'],
            'jumlah_desa'    => ['required', 'integer', 'min:0'],
            'latitude'       => ['nullable', 'numeric'],
            'longitude'      => ['nullable', 'numeric'],
            'sumber_data'    => ['required', 'string', 'max:120'],
            'status'         => ['required', 'in:terverifikasi,draft,perlu_verifikasi'],
            'keterangan'     => ['nullable', 'string'],
        ]);
    }
}
