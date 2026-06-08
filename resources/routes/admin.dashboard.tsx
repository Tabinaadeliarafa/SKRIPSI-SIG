import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopbar } from "@/components/AdminTopBar";
//import { StatCard } from "@/components/StatCard";
import { RiskChip } from "@/components/RiskChip";
import { KECAMATAN, TOTALS, totalDesa, getRisk } from "@/data/Bencana";
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
        <AdminTopbar title="Dashboard" />
        <main className="p-4 lg:p-8 space-y-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-navy">Dashboard</h2>
            <p className="text-sm text-muted-foreground">Ringkasan data bencana kecamatan Kabupaten Bekasi</p>
          </div>

          <div className="premium-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-navy">Tabel Data Bencana</h3>
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/40 backdrop-blur-sm p-4">
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
