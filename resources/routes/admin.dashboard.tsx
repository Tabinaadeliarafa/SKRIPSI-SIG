import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopbar } from "@/components/AdminTopBar";
import { StatCard } from "@/components/StatCard";
import { RiskChip } from "@/components/RiskChip";
import { useKecamatan, useDashboardStats } from "@/hooks/use-Bencana";
import { KECAMATAN, TOTALS, totalDesa, getRisk } from "@/data/Bencana";
import { Building2, Droplets, Mountain, Activity, Plus, Upload, Download, Eye, Pencil, Trash2, FileText, Search } from "lucide-react";
import { useState, useRef, useMemo } from "react";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — SIG BKS" }] }),
  component: AdminDashboard,
});

// ── Helpers Export ──────────────────────────────────────────────────────────────
function buildCSV(rows: typeof KECAMATAN) {
  const headers = ["No", "Kecamatan", "Banjir", "Longsor", "Gempa", "Total", "Risiko"];
  const data = rows.map((k, i) => [i + 1, k.nama, k.banjir, k.longsor, k.gempa, totalDesa(k), getRisk(k)]);
  return [headers, ...data].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
}

function downloadCSV(rows: typeof KECAMATAN) {
  const content = "\uFEFF" + buildCSV(rows);
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `data-bencana-bekasi-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(rows: typeof KECAMATAN) {
  const now = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const tableRows = rows.map((k, i) => {
    const risk = getRisk(k);
    const rc = risk === "Tinggi" ? "#c0522a" : risk === "Sedang" ? "#e08a3c" : risk === "Rendah" ? "#2d6ca8" : "#4a8a5e";
    return `<tr style="border-bottom:1px solid #e2dfd9">
      <td style="padding:8px 12px;color:#666">${i + 1}</td>
      <td style="padding:8px 12px;font-weight:600;color:#1a3a5c">${k.nama}</td>
      <td style="padding:8px 12px;font-weight:700;color:#2d6ca8">${k.banjir}</td>
      <td style="padding:8px 12px;font-weight:700;color:#c0522a">${k.longsor}</td>
      <td style="padding:8px 12px;font-weight:700">${k.gempa}</td>
      <td style="padding:8px 12px;font-weight:700;color:#1a3a5c">${totalDesa(k)}</td>
      <td style="padding:8px 12px"><span style="background:${rc}20;color:${rc};border:1px solid ${rc}40;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:700">${risk}</span></td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/>
<title>Laporan Data Bencana — Kabupaten Bekasi</title>
<style>
  @media print { .no-print { display:none; } }
  body { font-family:'Segoe UI',Arial,sans-serif; color:#1a3a5c; margin:40px; }
  h1 { font-size:22px; font-weight:800; margin:0; }
  .sub { color:#666; font-size:13px; margin-top:4px; }
  .meta { margin-top:24px; background:#f5f3ef; border-radius:12px; padding:16px 20px; display:flex; gap:40px; }
  .meta-item label { font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:#999; font-weight:600; display:block; }
  .meta-item span { font-size:28px; font-weight:800; }
  table { width:100%; border-collapse:collapse; margin-top:24px; }
  thead tr { background:#1a3a5c; }
  th { text-align:left; padding:10px 12px; font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#fff; font-weight:700; }
  .footer { margin-top:32px; text-align:center; color:#999; font-size:12px; }
  .btn { display:inline-flex;align-items:center;gap:8px;background:#c0522a;color:#fff;border:none;border-radius:999px;padding:10px 24px;font-size:14px;font-weight:600;cursor:pointer;margin-top:24px; }
</style></head><body>
<div style="display:flex;align-items:flex-start;justify-content:space-between">
  <div><h1>Laporan Data Bencana</h1><p class="sub">Kabupaten Bekasi — Sumber: BPS 2025 · Dicetak: ${now}</p></div>
  <button class="btn no-print" onclick="window.print()">🖨️ Cetak / Save PDF</button>
</div>
<div class="meta">
  <div class="meta-item"><label>Kecamatan</label><span style="color:#1a3a5c">${rows.length}</span></div>
  <div class="meta-item"><label>Total Banjir</label><span style="color:#2d6ca8">${rows.reduce((s, k) => s + k.banjir, 0)}</span></div>
  <div class="meta-item"><label>Total Longsor</label><span style="color:#c0522a">${rows.reduce((s, k) => s + k.longsor, 0)}</span></div>
  <div class="meta-item"><label>Total Gempa</label><span style="color:#4a8a5e">${rows.reduce((s, k) => s + k.gempa, 0)}</span></div>
</div>
<table><thead><tr><th>#</th><th>Kecamatan</th><th>Banjir</th><th>Longsor</th><th>Gempa</th><th>Total</th><th>Risiko</th></tr></thead>
<tbody>${tableRows}</tbody></table>
<div class="footer">SIG Bencana Kabupaten Bekasi — Data bersumber dari BPS Kabupaten Bekasi 2025</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
}

function AdminDashboard() {
  const [confirm, setConfirm] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Data dari hook API (untuk stats card dari backend)
  const { data: stats } = useDashboardStats();

  // Data dari konstanta lokal (data utama tabel)
  const rows = useMemo(() => {
    if (!q) return KECAMATAN;
    return KECAMATAN.filter((k) => k.nama.toLowerCase().includes(q.toLowerCase()));
  }, [q]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploading(true);
      const res = await fetch("/api/bencana/import", {
        method: "POST",
        body: formData,
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Import gagal");
      alert(`Import berhasil: ${json.jumlah_import ?? 0} data`);
      window.location.reload();
    } catch (err: any) {
      alert(err?.message ?? "Import gagal. Pastikan format CSV benar.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <AdminTopbar title="Data Bencana Kecamatan" />
        <main className="p-4 lg:p-8 space-y-6">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-2xl text-navy">Manajemen Data Bencana</h2>
              <p className="text-sm text-muted-foreground">
                Sumber: BPS Kabupaten Bekasi 2025 · {KECAMATAN.length} kecamatan
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
              <button
                onClick={() => downloadCSV(rows)}
                className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-milk-dark transition"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
              <button
                onClick={() => downloadPDF(rows)}
                className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-milk-dark transition"
              >
                <FileText className="h-4 w-4 text-orange" /> Export PDF
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-milk-dark transition disabled:opacity-50"
              >
                <Upload className="h-4 w-4" /> {uploading ? "Mengunggah..." : "Import Data"}
              </button>
              <Link
                to="/admin/form"
                className="inline-flex items-center gap-2 rounded-full bg-orange text-white px-4 py-2 text-sm font-semibold shadow-lg hover:brightness-110 transition"
              >
                <Plus className="h-4 w-4" /> Tambah Data
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Kecamatan"    value={stats?.total_kecamatan ?? TOTALS.banjir + 0 === 0 ? KECAMATAN.length : (stats?.total_kecamatan ?? KECAMATAN.length)} icon={<Building2 className="h-5 w-5" />} accent="navy" />
            <StatCard label="Desa Banjir"  value={stats?.total_banjir  ?? TOTALS.banjir}  icon={<Droplets  className="h-5 w-5" />} accent="sky"     />
            <StatCard label="Desa Longsor" value={stats?.total_longsor ?? TOTALS.longsor} icon={<Mountain  className="h-5 w-5" />} accent="orange"  />
            <StatCard label="Desa Gempa"   value={stats?.total_gempa   ?? TOTALS.gempa}   icon={<Activity  className="h-5 w-5" />} accent="success" />
          </div>

          {/* Filter + Search */}
          <div className="premium-card p-4 flex flex-wrap items-center gap-3">
            <h3 className="font-display font-semibold text-navy">Tabel Data Bencana</h3>
            <div className="ml-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari kecamatan..."
                className="bg-white border border-border rounded-full pl-9 pr-4 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-sky"
              />
            </div>
          </div>

          {/* Tabel */}
          <div className="premium-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-navy">Data per Kecamatan</h3>
              <span className="text-xs text-muted-foreground">{rows.length} entri</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-milk-dark/50 text-navy">
                    {["#", "Kecamatan", "Banjir", "Longsor", "Gempa", "Total", "Risiko", "Aksi"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Tidak ada data ditemukan.</td></tr>
                  ) : rows.map((k, i) => (
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
                          <button title="Lihat" className="p-1.5 rounded-lg text-sky hover:bg-sky/10"><Eye className="h-4 w-4" /></button>
                          <Link to="/admin/form" title="Edit" className="p-1.5 rounded-lg text-navy hover:bg-navy/10"><Pencil className="h-4 w-4" /></Link>
                          <button title="Hapus" onClick={() => setConfirm(k.nama)} className="p-1.5 rounded-lg text-orange hover:bg-orange/10"><Trash2 className="h-4 w-4" /></button>
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

      {/* Modal Hapus */}
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
