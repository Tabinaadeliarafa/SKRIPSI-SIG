import React, { useState } from 'react';
import { useRingkasan } from '../hooks/useBencana';
import type { RingkasanKecamatan } from '../js/bencana';

export default function TabelBencana() {
    const { data, loading, error } = useRingkasan();
    const [search, setSearch] = useState('');

    // Filter berdasarkan input search
    const filtered = data.filter((item) =>
        item.kecamatan.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="loading">Memuat data...</div>;
    if (error)   return <div className="error">Error: {error}</div>;

    return (
        <div className="tabel-bencana">
            <div className="tabel-header">
                <h2>Data Bencana BPS 2025 — Kabupaten Bekasi</h2>
                <input
                    type="text"
                    placeholder="Cari kecamatan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
            </div>

            <table>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Kecamatan</th>
                        <th>Banjir (desa)</th>
                        <th>Tanah Longsor (desa)</th>
                        <th>Gempa Bumi (desa)</th>
                        <th>Total Terdampak</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((item, idx) => (
                        <BencanaRow key={item.kecamatan} no={idx + 1} item={item} />
                    ))}
                </tbody>
            </table>

            <p className="tabel-footer">
                Menampilkan {filtered.length} dari {data.length} kecamatan
            </p>
        </div>
    );
}

function BencanaRow({ no, item }: { no: number; item: RingkasanKecamatan }) {
    const getBencana = (jenis: string) =>
        item.jenis_bencana.find((b) => b.jenis === jenis)?.jumlah ?? 0;

    const banjir  = getBencana('Banjir');
    const longsor = getBencana('Tanah Longsor');
    const gempa   = getBencana('Gempa Bumi');

    return (
        <tr className={item.total_desa > 5 ? 'high-impact' : ''}>
            <td>{no}</td>
            <td><strong>{item.kecamatan}</strong></td>
            <td className="text-center">
                {banjir > 0 ? <span className="badge badge-banjir">{banjir}</span> : '—'}
            </td>
            <td className="text-center">
                {longsor > 0 ? <span className="badge badge-longsor">{longsor}</span> : '—'}
            </td>
            <td className="text-center">
                {gempa > 0 ? <span className="badge badge-gempa">{gempa}</span> : '—'}
            </td>
            <td className="text-center total">{item.total_desa}</td>
        </tr>
    );
}