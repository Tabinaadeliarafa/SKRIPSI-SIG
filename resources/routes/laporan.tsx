import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { KECAMATAN, totalDesa, getRisk } from "@/data/Bencana";
import { RiskChip } from "@/components/RiskChip";
import {
  Calendar, Download, Filter, Search,
  ChevronLeft, ChevronRight, FileText,
} from "lucide-react";

export const Route = createFileRoute("/laporan")({
  head: () => ({ meta: [{ title: "Laporan — SIG Bencana Kabupaten Bekasi" }] }),
  component: ReportPage,
});

const PER_PAGE = 10;

// ── CSV download ──────────────────────────────────────────────────────────────
function downloadCSV(rows: typeof KECAMATAN, from: string, to: string) {
  const headers = ["No", "Kecamatan", "Banjir", "Longsor", "Gempa", "Total", "Risiko"];
  const body = rows.map((k, i) => [
    i + 1, k.nama, k.banjir, k.longsor, k.gempa, totalDesa(k), getRisk(k),
  ]);
  const csv = [headers, ...body].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `laporan-bencana-bekasi_${from}_${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── PDF (print) ───────────────────────────────────────────────────────────────
function downloadPDF(rows: typeof KECAMATAN, from: string, to: string, kec: string) {
  const filterLabel =
    kec === "all" ? "Semua Kecamatan" : kec;

  const tableRows = rows
    .map(
      (k, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${k.nama}</td>
        <td>${k.banjir}</td>
        <td>${k.longsor}</td>
        <td>${k.gempa}</td>
        <td><b>${totalDesa(k)}</b></td>
        <td>${getRisk(k)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Laporan Bencana — Kabupaten Bekasi</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #1a3a5c; padding: 32px; }

    /* Kop surat */
    .header { display: flex; align-items: center; gap: 16px; border-bottom: 3px solid #1a3a5c; padding-bottom: 16px; margin-bottom: 20px; }
    .header-logo { width: 56px; height: 56px; background: linear-gradient(135deg,#2d6ca8,#1a3a5c); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; }
    .header-text h1 { font-size: 18px; font-weight: bold; }
    .header-text p  { font-size: 11px; color: #64748b; margin-top: 2px; }

    /* Meta info */
    .meta { display: flex; gap: 24px; margin-bottom: 18px; font-size: 12px; }
    .meta-item { background: #f1f5f9; border-radius: 8px; padding: 8px 14px; }
    .meta-item span { color: #64748b; display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; }
    .meta-item b { color: #1a3a5c; }

    /* Tabel */
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead tr { background: #1a3a5c; color: white; }
    th { padding: 9px 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #f8fafc; }

    /* Risiko warna */
    td.tinggi { color: #dc2626; font-weight: bold; }
    td.sedang  { color: #d97706; font-weight: bold; }
    td.rendah  { color: #16a34a; font-weight: bold; }
    td.aman    { color: #0284c7; font-weight: bold; }

    .footer { margin-top: 24px; font-size: 10px; color: #94a3b8; text-align: right; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-logo">SIG</div>
    <div class="header-text">
      <h1>Laporan Data Bencana Kabupaten Bekasi</h1>
      <p>Sistem Informasi Geografis Bencana — BPBD Kabupaten Bekasi</p>
    </div>
  </div>

  <div class="meta">
    <div class="meta-item"><span>Periode</span><b>${from} s/d ${to}</b></div>
    <div class="meta-item"><span>Filter Kecamatan</span><b>${filterLabel}</b></div>
    <div class="meta-item"><span>Jumlah Kecamatan</span><b>${rows.length} kecamatan</b></div>
    <div class="meta-item"><span>Tanggal Cetak</span><b>${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</b></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>No</th>
        <th>Kecamatan</th>
        <th>Banjir</th>
        <th>Longsor</th>
        <th>Gempa</th>
        <th>Total</th>
        <th>Risiko</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div class="footer">
    Dicetak dari SIG BKS — Sumber: BPS Kabupaten Bekasi 2025
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("Pop-up diblokir browser. Izinkan pop-up untuk halaman ini lalu coba lagi.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

// ── Komponen utama ────────────────────────────────────────────────────────────
function ReportPage() {
  const [from, setFrom] = useState("2025-01-01");
  const [to,   setTo  ] = useState("2025-12-31");
  const [kec,  setKec ] = useState("all");
  const [page, setPage] = useState(1);
  const [q,    setQ   ] = useState("");

  const rows = useMemo(() => {
    let list = KECAMATAN;
    if (kec !== "all") list = list.filter((k) => k.nama === kec);
    if (q)             list = list.filter((k) => k.nama.toLowerCase().includes(q.toLowerCase()));
    return list;
  }, [kec, q]);

  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const slice = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Warna badge risiko inline (agar terlihat di tabel)
  const riskClass: Record<string, string> = {
    Tinggi: "bg-red-100 text-red-700",
    Sedang: "bg-amber-100 text-amber-700",
    Rendah: "bg-sky-100 text-sky-700",
    Aman:   "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-navy">
              Laporan Bencana
            </h1>
            <p className="text-muted-foreground mt-1">
              Rekap data bencana per kecamatan, format tabel siap unduh.
            </p>
          </div>

          {/* Tombol export */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => downloadCSV(rows, from, to)}
              className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-5 py-2.5 font-semibold text-navy shadow hover:bg-milk-dark transition text-sm"
            >
              <Download className="h-4 w-4 text-sky" /> Export CSV
            </button>
            <button
              onClick={() => downloadPDF(rows, from, to, kec)}
              className="inline-flex items-center gap-2 rounded-full bg-orange text-white px-5 py-2.5 font-semibold shadow-lg hover:brightness-110 transition text-sm"
            >
              <FileText className="h-4 w-4" /> Export PDF
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="premium-card p-5 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Dari Tanggal
              </label>
              <div className="mt-1 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full bg-milk-dark/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sampai
              </label>
              <div className="mt-1 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-milk-dark/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Kecamatan
              </label>
              <div className="mt-1 relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  value={kec}
                  onChange={(e) => { setKec(e.target.value); setPage(1); }}
                  className="w-full bg-milk-dark/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky appearance-none"
                >
                  <option value="all">Semua Kecamatan</option>
                  {KECAMATAN.map((k) => (
                    <option key={k.id} value={k.nama}>{k.nama}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cari
              </label>
              <div className="mt-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
                  placeholder="Nama kecamatan..."
                  className="w-full bg-milk-dark/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  {["No", "Kecamatan", "Banjir", "Longsor", "Gempa", "Total", "Risiko"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.map((k, i) => {
                  const risk = getRisk(k);
                  return (
                    <tr key={k.id} className="border-t border-border hover:bg-milk-dark/30 transition">
                      <td className="px-4 py-3 text-muted-foreground">
                        {(page - 1) * PER_PAGE + i + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold text-navy">{k.nama}</td>
                      <td className="px-4 py-3"><span className="font-bold text-sky">{k.banjir}</span></td>
                      <td className="px-4 py-3"><span className="font-bold text-orange">{k.longsor}</span></td>
                      <td className="px-4 py-3 font-bold">{k.gempa}</td>
                      <td className="px-4 py-3 font-bold text-navy">{totalDesa(k)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${riskClass[risk] ?? "bg-slate-100 text-slate-600"}`}>
                          {risk}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-milk-dark/20 text-sm">
            <span className="text-muted-foreground">
              Menampilkan {slice.length} dari {rows.length} kecamatan
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg hover:bg-white disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold ${
                    p === page ? "bg-navy text-white" : "hover:bg-white"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === pages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg hover:bg-white disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}