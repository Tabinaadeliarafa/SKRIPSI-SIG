import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { RiskChip } from "@/components/RiskChip";
import { getRisk, type KecamatanData } from "@/data/Bencana";
import { Calendar, Download, Filter, Search, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { api } from "@/services/api";

export const Route = createFileRoute("/laporan")({
  head: () => ({ meta: [{ title: "Laporan — SIG Bencana Kabupaten Bekasi" }] }),
  component: ReportPage,
});

const PER_PAGE = 10;

// ── Export helpers ──────────────────────────────────────────────────────────────
function exportCSV(rows: KecamatanData[], from: string, to: string) {
  const headers = ["No", "Kecamatan", "Banjir", "Longsor", "Gempa", "Total", "Risiko"];
  const data = rows.map((k, i) => {
    const total = (k.banjir || 0) + (k.longsor || 0) + (k.gempa || 0);
    return [i + 1, k.nama_kecamatan, k.banjir || 0, k.longsor || 0, k.gempa || 0, total, getRisk(k)];
  });
  const csv = "\uFEFF" + [headers, ...data].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `laporan-bencana-bekasi-${from}-${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(rows: KecamatanData[], from: string, to: string) {
  const now = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const totalBanjir  = rows.reduce((s, k) => s + (k.banjir  || 0), 0);
  const totalLongsor = rows.reduce((s, k) => s + (k.longsor || 0), 0);
  const totalGempa   = rows.reduce((s, k) => s + (k.gempa   || 0), 0);

  const tableRows = rows.map((k, i) => {
    const total = (k.banjir || 0) + (k.longsor || 0) + (k.gempa || 0);
    const risk  = getRisk(k);
    const rc    = risk === "Tinggi" ? "#c0522a" : risk === "Sedang" ? "#e08a3c" : risk === "Rendah" ? "#2d6ca8" : "#4a8a5e";
    return `<tr style="border-bottom:1px solid #e2dfd9">
      <td style="padding:8px 12px;color:#666">${i + 1}</td>
      <td style="padding:8px 12px;font-weight:600;color:#1a3a5c">${k.nama_kecamatan}</td>
      <td style="padding:8px 12px;font-weight:700;color:#2d6ca8">${k.banjir || 0}</td>
      <td style="padding:8px 12px;font-weight:700;color:#c0522a">${k.longsor || 0}</td>
      <td style="padding:8px 12px;font-weight:700;color:#4a8a5e">${k.gempa || 0}</td>
      <td style="padding:8px 12px;font-weight:700;color:#1a3a5c">${total}</td>
      <td style="padding:8px 12px"><span style="background:${rc}22;color:${rc};border:1px solid ${rc}44;border-radius:999px;padding:2px 10px;font-size:11px;font-weight:700">${risk}</span></td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/>
<title>Laporan Bencana Kabupaten Bekasi</title>
<style>
  @media print { .no-print{display:none} body{margin:24px} }
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1a3a5c;margin:40px}
  h1{font-size:22px;font-weight:800;margin:0}
  .sub{color:#666;font-size:13px;margin-top:4px}
  .period{display:inline-block;background:#f5f3ef;border-radius:8px;padding:4px 12px;font-size:12px;margin-top:8px;color:#555}
  .meta{margin-top:20px;background:#1a3a5c;border-radius:12px;padding:16px 20px;display:flex;gap:40px}
  .meta-item label{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.6);font-weight:600;display:block}
  .meta-item span{font-size:28px;font-weight:800;color:#fff}
  table{width:100%;border-collapse:collapse;margin-top:20px;font-size:13px}
  thead tr{background:#f5f3ef}
  th{text-align:left;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#1a3a5c;font-weight:700;border-bottom:2px solid #e2dfd9}
  .footer{margin-top:28px;text-align:center;color:#aaa;font-size:11px;border-top:1px solid #eee;padding-top:12px}
  .btn{display:inline-flex;align-items:center;gap:8px;background:#c0522a;color:#fff;border:none;border-radius:999px;padding:10px 24px;font-size:14px;font-weight:600;cursor:pointer;margin-top:20px}
  .btn-csv{background:#1a3a5c;margin-left:8px}
</style></head><body>
<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
  <div>
    <h1>Laporan Bencana Kabupaten Bekasi</h1>
    <p class="sub">Rekap data bencana per kecamatan · Dicetak: ${now}</p>
    <span class="period">📅 Periode: ${from} s/d ${to}</span>
  </div>
  <button class="btn no-print" onclick="window.print()">🖨️ Cetak / Save PDF</button>
</div>
<div class="meta">
  <div class="meta-item"><label>Kecamatan</label><span>${rows.length}</span></div>
  <div class="meta-item"><label>Total Banjir</label><span style="color:#90c8f0">${totalBanjir}</span></div>
  <div class="meta-item"><label>Total Longsor</label><span style="color:#f9a87d">${totalLongsor}</span></div>
  <div class="meta-item"><label>Total Gempa</label><span style="color:#86efac">${totalGempa}</span></div>
</div>
<table>
  <thead><tr><th>#</th><th>Kecamatan</th><th>Banjir</th><th>Longsor</th><th>Gempa</th><th>Total</th><th>Risiko</th></tr></thead>
  <tbody>${tableRows}</tbody>
</table>
<div class="footer">SIG Bencana Kabupaten Bekasi — Data bersumber dari BPS Kabupaten Bekasi</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Popup diblokir browser. Mohon izinkan popup untuk situs ini.");
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 600);
}

// ── Komponen ────────────────────────────────────────────────────────────────────
function ReportPage() {
  const [kecamatanList, setKecamatanList] = useState<KecamatanData[]>([]);
  const [from, setFrom] = useState("2025-01-01");
  const [to, setTo]     = useState("2025-12-31");
  const [kec, setKec]   = useState("all");
  const [page, setPage] = useState(1);
  const [q, setQ]       = useState("");
  const [loading, setLoading] = useState(true);
  const [exportMenu, setExportMenu] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get<KecamatanData[]>("/kecamatan-laporan-stats", { params: { from, to } })
      .then((res) => setKecamatanList(res.data || []))
      .catch((err) => {
        console.error("Gagal load laporan:", err);
        // Fallback ke data statis jika API gagal
        import("@/data/Bencana").then(({ KECAMATAN }) => {
          const fallback = KECAMATAN.map((k) => ({
            ...k,
            nama_kecamatan: k.nama,
          })) as unknown as KecamatanData[];
          setKecamatanList(fallback);
        });
      })
      .finally(() => setLoading(false));
  }, [from, to]);

  const rows = useMemo(() => {
    let list = kecamatanList;
    if (kec !== "all") list = list.filter((k) => k.nama_kecamatan === kec);
    if (q) list = list.filter((k) => (k.nama_kecamatan ?? "").toLowerCase().includes(q.toLowerCase()));
    return list;
  }, [kecamatanList, kec, q]);

  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const slice = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="min-h-screen" onClick={() => setExportMenu(false)}>
      <PublicNavbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-navy">Laporan Bencana</h1>
            <p className="text-muted-foreground mt-1">Rekap data bencana per kecamatan, format tabel siap unduh.</p>
          </div>

          {/* Tombol Export - dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setExportMenu((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full bg-orange text-white px-5 py-2.5 font-semibold shadow-lg hover:brightness-110 transition"
            >
              <Download className="h-4 w-4" /> Export ▾
            </button>
            {exportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-[fade-in_0.15s_ease-out]">
                <button
                  onClick={() => { exportCSV(rows, from, to); setExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-navy hover:bg-milk-dark transition"
                >
                  <Download className="h-4 w-4 text-sky" /> Unduh CSV
                </button>
                <button
                  onClick={() => { exportPDF(rows, from, to); setExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-navy hover:bg-milk-dark transition border-t border-border"
                >
                  <FileText className="h-4 w-4 text-orange" /> Export PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="premium-card p-5 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dari</label>
              <div className="mt-1 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }}
                  className="w-full bg-milk-dark/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sampai</label>
              <div className="mt-1 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }}
                  className="w-full bg-milk-dark/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kecamatan</label>
              <div className="mt-1 relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select value={kec} onChange={(e) => { setKec(e.target.value); setPage(1); }}
                  className="w-full bg-milk-dark/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky appearance-none">
                  <option value="all">Semua Kecamatan</option>
                  {kecamatanList.map((k) => <option key={k.id} value={k.nama_kecamatan}>{k.nama_kecamatan}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cari</label>
              <div className="mt-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Nama kecamatan..."
                  className="w-full bg-milk-dark/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="premium-card overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Memuat data laporan...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy text-white">
                    {["No", "Kecamatan", "Banjir", "Longsor", "Gempa", "Total", "Risiko"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slice.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Tidak ada data untuk filter ini.</td></tr>
                  ) : slice.map((k, i) => (
                    <tr key={k.id} className="border-t border-border hover:bg-milk-dark/30 transition">
                      <td className="px-4 py-3 text-muted-foreground">{(page - 1) * PER_PAGE + i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-navy">{k.nama_kecamatan}</td>
                      <td className="px-4 py-3"><span className="font-bold text-sky">{k.banjir || 0}</span></td>
                      <td className="px-4 py-3"><span className="font-bold text-orange">{k.longsor || 0}</span></td>
                      <td className="px-4 py-3 font-bold">{k.gempa || 0}</td>
                      <td className="px-4 py-3 font-bold text-navy">{(k.banjir || 0) + (k.longsor || 0) + (k.gempa || 0)}</td>
                      <td className="px-4 py-3"><RiskChip risk={getRisk(k)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-milk-dark/20 text-sm">
            <span className="text-muted-foreground">Menampilkan {slice.length} dari {rows.length} kecamatan</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg hover:bg-white disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-xs font-semibold ${p === page ? "bg-navy text-white" : "hover:bg-white"}`}>{p}</button>
              ))}
              <button disabled={page === pages} onClick={() => setPage(page + 1)} className="p-2 rounded-lg hover:bg-white disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
