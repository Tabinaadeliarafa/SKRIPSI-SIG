import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopbar } from "@/components/AdminTopbar";
import { StatCard } from "@/components/StatCard";
import { RiskChip } from "@/components/RiskChip";
import { KECAMATAN, TOTALS, totalDesa, getRisk } from "@/data/bencana";
import { Building2, Droplets, Mountain, Activity, Plus, Upload, Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — SIG BKS" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [confirm, setConfirm] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <AdminTopbar title="Data Bencana Kecamatan" />
        <main className="p-4 lg:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-2xl text-navy">Manajemen Data Bencana</h2>
              <p className="text-sm text-muted-foreground">Sumber: BPS Kabupaten Bekasi 2025 · 23 kecamatan</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-milk-dark transition"><Download className="h-4 w-4" /> Export CSV</button>
              <button className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-milk-dark transition"><Upload className="h-4 w-4" /> Import BPS</button>
              <Link to="/admin/form" className="inline-flex items-center gap-2 rounded-full bg-orange text-white px-4 py-2 text-sm font-semibold shadow-lg hover:brightness-110 transition"><Plus className="h-4 w-4" /> Tambah Data</Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Kecamatan" value={TOTALS.kecamatan} icon={<Building2 className="h-5 w-5" />} accent="navy" />
            <StatCard label="Desa Banjir" value={TOTALS.banjir} icon={<Droplets className="h-5 w-5" />} accent="sky" delta="12%" />
            <StatCard label="Desa Longsor" value={TOTALS.longsor} icon={<Mountain className="h-5 w-5" />} accent="orange" />
            <StatCard label="Desa Gempa" value={TOTALS.gempa} icon={<Activity className="h-5 w-5" />} accent="success" />
          </div>

          <div className="premium-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-navy">Tabel Data</h3>
              <span className="text-xs text-muted-foreground">{KECAMATAN.length} entri</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-milk-dark/50 text-navy">
                    {["#","Kecamatan","Banjir","Longsor","Gempa","Total","Risiko","Aksi"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {KECAMATAN.map((k, i) => (
                    <tr key={k.id} className="border-t border-border hover:bg-milk-dark/20 transition">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-navy">{k.nama}</td>
                      <td className="px-4 py-3 font-bold text-sky">{k.banjir}</td>
                      <td className="px-4 py-3 font-bold text-orange">{k.longsor}</td>
                      <td className="px-4 py-3 font-bold">{k.gempa}</td>
                      <td className="px-4 py-3 font-bold text-navy">{totalDesa(k)}</td>
                      <td className="px-4 py-3"><RiskChip risk={getRisk(k)} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button title="View" className="p-1.5 rounded-lg text-sky hover:bg-sky/10"><Eye className="h-4 w-4" /></button>
                          <Link to="/admin/form" title="Edit" className="p-1.5 rounded-lg text-navy hover:bg-navy/10"><Pencil className="h-4 w-4" /></Link>
                          <button title="Delete" onClick={() => setConfirm(k.nama)} className="p-1.5 rounded-lg text-orange hover:bg-orange/10"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/40 backdrop-blur-sm p-4 animate-[fade-in_0.2s_ease-out]">
          <div className="premium-card p-6 max-w-sm w-full">
            <div className="h-12 w-12 rounded-full bg-orange/15 grid place-items-center text-orange mb-3"><Trash2 className="h-5 w-5" /></div>
            <h3 className="font-display font-bold text-navy text-lg">Hapus data?</h3>
            <p className="text-sm text-muted-foreground mt-1">Yakin ingin menghapus data <b>{confirm}</b>? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setConfirm(null)} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-milk-dark">Batal</button>
              <button onClick={() => setConfirm(null)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-orange text-white">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
