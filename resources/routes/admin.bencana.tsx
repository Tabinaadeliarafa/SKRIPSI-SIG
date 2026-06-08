/**
 * /admin/bencana
 * Manajemen Data Bencana lengkap: stats + filter per jenis + tabel + tambah/edit/hapus.
 * Tombol Export CSV & PDF berfungsi.
 */
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopbar } from "@/components/AdminTopBar";
import { StatCard } from "@/components/StatCard";
import { RiskChip } from "@/components/RiskChip";
import { KECAMATAN, TOTALS, totalDesa, getRisk } from "@/data/Bencana";
import {
  Building2, Droplets, Mountain, Activity,
  Plus, Upload, Download, Eye, Pencil, Trash2, FileText, Search,
} from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/bencana")({
  head: () => ({ meta: [{ title: "Data Bencana — SIG BKS" }] }),
  component: DataBencanaPage,
});

type JenisFilter = "all" | "banjir" | "longsor" | "gempa";

const JENIS_TABS: { key: JenisFilter; label: string }[] = [
  { key: "all",     label: "Semua"   },
  { key: "banjir",  label: "Banjir"  },
  { key: "longsor", label: "Longsor" },
  { key: "gempa",   label: "Gempa"   },
];

// ── Export helpers ─────────────────────────────────────────────────────────────
function buildCSV(rows: typeof KECAMATAN, jenis: JenisFilter) {
  const headers =
    jenis === "all"
      ? ["No", "Kecamatan", "Banjir", "Longsor", "Gempa", "Total", "Risiko"]
      : ["No", "Kecamatan", jenis.charAt(0).toUpperCase() + jenis.slice(1), "Risiko"];

  const data = rows.map((k, i) => {
    const base = [i + 1, k.nama];
    if (jenis === "all") return [...base, k.banjir, k.longsor, k.gempa, totalDesa(k), getRisk(k)];
    const val = jenis === "banjir" ? k.banjir : jenis === "longsor" ? k.longsor : k.gempa;
    return [...base, val, getRisk(k)];
  });

  return [headers, ...data].map((r) => r.join(",")).join("\n");
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(rows: typeof KECAMATAN, jenis: JenisFilter) {
  // Buat HTML sederhana lalu trigger print-to-PDF
  const jenisLabel = jenis === "all" ? "Semua Bencana" : jenis.charAt(0).toUpperCase() + jenis.slice(1);
  const tableRows = rows.map((k, i) => {
    const val = jenis === "all"
      ? `<td>${k.banjir}</td><td>${k.longsor}</td><td>${k.gempa}</td><td>${totalDesa(k)}</td>`
      : `<td>${jenis === "banjir" ? k.banjir : jenis === "longsor" ? k.longsor : k.gempa}</td>`;
    return `<tr><td>${i + 1}</td><td>${k.nama}</td>${val}<td>${getRisk(k)}</td></tr>`;
  }).join("");

  const headers = jenis === "all"
    ? "<th>#</th><th>Kecamatan</th><th>Banjir</th><th>Longsor</th><th>Gempa</th><th>Total</th><th>Risiko</th>"
    : `<th>#</th><th>Kecamatan</th><th>${jenisLabel}</th><th>Risiko</th>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
  <title>Laporan Bencana — ${jenisLabel}</title>
  <style>
    body{font-family:sans-serif;padding:24px;color:#1a3a5c}
    h1{font-size:20px;margin-bottom:4px}
    p{color:#666;font-size:12px;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{background:#1a3a5c;color:white;padding:8px 10px;text-align:left}
    td{padding:7px 10px;border-bottom:1px solid #e5e7eb}
    tr:nth-child(even) td{background:#f9fafb}
  </style></head><body>
  <h1>Data Bencana Kabupaten Bekasi</h1>
  <p>Jenis: ${jenisLabel} · ${rows.length} kecamatan · Dicetak: ${new Date().toLocaleDateString("id-ID")}</p>
  <table><thead><tr>${headers}</tr></thead><tbody>${tableRows}</tbody></table>
  </body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 500);
}

// ── Komponen halaman ──────────────────────────────────────────────────────────
function DataBencanaPage() {
  const [jenis,   setJenis  ] = useState<JenisFilter>("all");
  const [q,       setQ      ] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);

  const rows = useMemo(() => {
    let list = [...KECAMATAN];
    if (q) list = list.filter((k) => k.nama.toLowerCase().includes(q.toLowerCase()));
    return list;
  }, [q]);

  const title =
    jenis === "all"     ? "Data Bencana"
    : jenis === "banjir"  ? "Data Banjir"
    : jenis === "longsor" ? "Data Longsor"
    : "Data Gempa";

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
              <button
                onClick={() => downloadCSV(buildCSV(rows, jenis), `data-${jenis}-bekasi.csv`)}
                className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-milk-dark transition"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
              <button
                onClick={() => downloadPDF(rows, jenis)}
                className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-milk-dark transition"
              >
                <FileText className="h-4 w-4 text-orange" /> Export PDF
              </button>
              <button className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-milk-dark transition">
                <Upload className="h-4 w-4" /> Import BPS
              </button>
              <Link
                to="/admin/form"
                className="inline-flex items-center gap-2 rounded-full bg-orange text-white px-4 py-2 text-sm font-semibold shadow-lg hover:brightness-110 transition"
              >
                <Plus className="h-4 w-4" /> Tambah Data
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Kecamatan"    value={TOTALS.kecamatan} icon={<Building2 className="h-5 w-5" />} accent="navy"    />
            <StatCard label="Desa Banjir"  value={TOTALS.banjir}    icon={<Droplets  className="h-5 w-5" />} accent="sky"     delta="12%" />
            <StatCard label="Desa Longsor" value={TOTALS.longsor}   icon={<Mountain  className="h-5 w-5" />} accent="orange"  />
            <StatCard label="Desa Gempa"   value={TOTALS.gempa}     icon={<Activity  className="h-5 w-5" />} accent="success" />
          </div>

          {/* Filter tab jenis + search */}
          <div className="premium-card p-4 flex flex-wrap items-center gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {JENIS_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setJenis(t.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                    jenis === t.key
                      ? "bg-navy text-white shadow"
                      : "bg-milk-dark/60 text-navy hover:bg-milk-dark"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
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
              <h3 className="font-display font-bold text-navy">{title}</h3>
              <span className="text-xs text-muted-foreground">{rows.length} entri</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-milk-dark/50 text-navy">
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Kecamatan</th>
                    {jenis === "all" || jenis === "banjir"  ? <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-sky">Banjir</th>   : null}
                    {jenis === "all" || jenis === "longsor" ? <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-orange">Longsor</th> : null}
                    {jenis === "all" || jenis === "gempa"   ? <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Gempa</th>   : null}
                    {jenis === "all" && <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Total</th>}
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Risiko</th>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((k, i) => (
                    <tr key={k.id} className="border-t border-border hover:bg-milk-dark/20 transition">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-navy">{k.nama}</td>
                      {jenis === "all" || jenis === "banjir"  ? <td className="px-4 py-3 font-bold text-sky">{k.banjir}</td>   : null}
                      {jenis === "all" || jenis === "longsor" ? <td className="px-4 py-3 font-bold text-orange">{k.longsor}</td> : null}
                      {jenis === "all" || jenis === "gempa"   ? <td className="px-4 py-3 font-bold">{k.gempa}</td>   : null}
                      {jenis === "all" && <td className="px-4 py-3 font-bold text-navy">{totalDesa(k)}</td>}
                      <td className="px-4 py-3"><RiskChip risk={getRisk(k)} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button title="Lihat"  className="p-1.5 rounded-lg text-sky hover:bg-sky/10"><Eye   className="h-4 w-4" /></button>
                          <Link   to="/admin/form" title="Edit" className="p-1.5 rounded-lg text-navy hover:bg-navy/10"><Pencil className="h-4 w-4" /></Link>
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

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/40 backdrop-blur-sm p-4">
          <div className="premium-card p-6 max-w-sm w-full">
            <div className="h-12 w-12 rounded-full bg-orange/15 grid place-items-center text-orange mb-3">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3 className="font-display font-bold text-navy text-lg">Hapus data?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Yakin menghapus <b>{confirm}</b>? Tidak dapat dibatalkan.
            </p>
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