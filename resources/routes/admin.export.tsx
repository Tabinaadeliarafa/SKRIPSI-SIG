import { createFileRoute } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopbar } from "@/components/AdminTopBar";
import { getRisk, totalDesa, KECAMATAN } from "@/data/Bencana";
import { Download, FileText, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin/export")({
  head: () => ({ meta: [{ title: "Export Data — SIG BKS" }] }),
  component: AdminExport,
});

function downloadCSV() {
  const headers = ["No", "Kecamatan", "Banjir", "Longsor", "Gempa", "Total", "Risiko"];
  const rows = KECAMATAN.map((k, i) => [
    i + 1,
    k.nama,
    k.banjir,
    k.longsor,
    k.gempa,
    totalDesa(k),
    getRisk(k),
  ]);

  const csvContent =
    [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `data-bencana-bekasi-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF() {
  // Build HTML content for the PDF
  const now = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const rows = KECAMATAN.map((k, i) => {
    const risk = getRisk(k);
    const riskColor =
      risk === "Tinggi" ? "#c0522a"
      : risk === "Sedang" ? "#e08a3c"
      : risk === "Rendah" ? "#2d6ca8"
      : "#4a8a5e";
    return `
      <tr style="border-bottom:1px solid #e2dfd9;">
        <td style="padding:8px 12px;color:#666;">${i + 1}</td>
        <td style="padding:8px 12px;font-weight:600;color:#1a3a5c;">${k.nama}</td>
        <td style="padding:8px 12px;font-weight:700;color:#2d6ca8;">${k.banjir}</td>
        <td style="padding:8px 12px;font-weight:700;color:#c0522a;">${k.longsor}</td>
        <td style="padding:8px 12px;font-weight:700;">${k.gempa}</td>
        <td style="padding:8px 12px;font-weight:700;color:#1a3a5c;">${totalDesa(k)}</td>
        <td style="padding:8px 12px;"><span style="background:${riskColor}20;color:${riskColor};border:1px solid ${riskColor}40;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:700;">${risk}</span></td>
      </tr>`;
  }).join("");

  const totalBanjir = KECAMATAN.reduce((s, k) => s + k.banjir, 0);
  const totalLongsor = KECAMATAN.reduce((s, k) => s + k.longsor, 0);
  const totalGempa = KECAMATAN.reduce((s, k) => s + k.gempa, 0);

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<title>Laporan Data Bencana — Kabupaten Bekasi</title>
<style>
  @media print { body { margin: 0; } .no-print { display: none; } }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a3a5c; margin: 40px; }
  h1 { font-size: 24px; font-weight: 800; margin: 0; }
  .sub { color: #666; font-size: 13px; margin-top: 4px; }
  .meta { margin-top: 24px; background: #f5f3ef; border-radius: 12px; padding: 16px 20px; display: flex; gap: 40px; }
  .meta-item label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #999; font-weight: 600; display: block; }
  .meta-item span { font-size: 28px; font-weight: 800; color: #1a3a5c; }
  table { width: 100%; border-collapse: collapse; margin-top: 24px; }
  thead tr { background: #f5f3ef; }
  th { text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #1a3a5c; font-weight: 700; }
  .footer { margin-top: 32px; text-align: center; color: #999; font-size: 12px; }
  .print-btn { display: inline-flex; align-items: center; gap: 8px; background: #c0522a; color: #fff; border: none; border-radius: 999px; padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 24px; }
</style>
</head>
<body>
<div style="display:flex;align-items:flex-start;justify-content:space-between;">
  <div>
    <h1>Laporan Data Bencana</h1>
    <p class="sub">Kabupaten Bekasi — Sumber: BPS 2025 · Dicetak: ${now}</p>
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Cetak / Save PDF</button>
</div>

<div class="meta">
  <div class="meta-item"><label>Kecamatan</label><span>${KECAMATAN.length}</span></div>
  <div class="meta-item"><label>Total Banjir</label><span style="color:#2d6ca8">${totalBanjir}</span></div>
  <div class="meta-item"><label>Total Longsor</label><span style="color:#c0522a">${totalLongsor}</span></div>
  <div class="meta-item"><label>Total Gempa</label><span style="color:#4a8a5e">${totalGempa}</span></div>
</div>

<table>
  <thead>
    <tr>
      <th>#</th><th>Kecamatan</th><th>Banjir</th><th>Longsor</th><th>Gempa</th><th>Total</th><th>Risiko</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<div class="footer">SIG Bencana Kabupaten Bekasi — Data bersumber dari BPS Kabupaten Bekasi 2025</div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onload = () => {
      setTimeout(() => {
        win.print();
        URL.revokeObjectURL(url);
      }, 500);
    };
  }
}

function AdminExport() {
  const [csvDone, setCsvDone] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);

  const handleCSV = () => {
    downloadCSV();
    setCsvDone(true);
    setTimeout(() => setCsvDone(false), 3000);
  };

  const handlePDF = () => {
    downloadPDF();
    setPdfDone(true);
    setTimeout(() => setPdfDone(false), 3000);
  };

  const stats = [
    { label: "Total Kecamatan", value: KECAMATAN.length, color: "#1a3a5c" },
    { label: "Desa Banjir", value: KECAMATAN.reduce((s, k) => s + k.banjir, 0), color: "#2d6ca8" },
    { label: "Desa Longsor", value: KECAMATAN.reduce((s, k) => s + k.longsor, 0), color: "#c0522a" },
    { label: "Desa Gempa", value: KECAMATAN.reduce((s, k) => s + k.gempa, 0), color: "#4a8a5e" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <AdminTopbar title="Export Data" />
        <main className="p-4 lg:p-8 space-y-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-navy">Export Data</h2>
            <p className="text-sm text-muted-foreground">Unduh data bencana dalam format CSV atau PDF siap cetak.</p>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="premium-card p-4">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
                <div className="font-display text-3xl font-extrabold mt-1" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Export Buttons */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="premium-card p-6 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 grid place-items-center">
                <FileSpreadsheet className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-display font-bold text-navy text-lg">Export CSV</h3>
                <p className="text-sm text-muted-foreground mt-1">File CSV berisi seluruh data bencana per kecamatan. Dapat dibuka di Microsoft Excel, Google Sheets, atau LibreOffice Calc.</p>
              </div>
              <div className="text-xs text-muted-foreground bg-milk-dark/60 rounded-lg px-3 py-2">
                📄 data-bencana-bekasi-{new Date().toISOString().slice(0, 10)}.csv · {KECAMATAN.length} baris · Encoding UTF-8
              </div>
              <button
                onClick={handleCSV}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow transition ${csvDone ? "bg-success text-white" : "bg-white border border-border text-navy hover:bg-milk-dark"}`}
              >
                {csvDone ? <><CheckCircle2 className="h-4 w-4" /> Berhasil diunduh!</> : <><Download className="h-4 w-4" /> Unduh CSV</>}
              </button>
            </div>

            <div className="premium-card p-6 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-orange/10 grid place-items-center">
                <FileText className="h-6 w-6 text-orange" />
              </div>
              <div>
                <h3 className="font-display font-bold text-navy text-lg">Export PDF</h3>
                <p className="text-sm text-muted-foreground mt-1">Laporan PDF berformat tabel siap cetak, lengkap dengan ringkasan statistik dan keterangan risiko per kecamatan.</p>
              </div>
              <div className="text-xs text-muted-foreground bg-milk-dark/60 rounded-lg px-3 py-2">
                📑 Halaman cetak akan terbuka di tab baru. Gunakan Print → Save as PDF di browser Anda.
              </div>
              <button
                onClick={handlePDF}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow transition ${pdfDone ? "bg-success text-white" : "bg-orange text-white hover:brightness-110"}`}
              >
                {pdfDone ? <><CheckCircle2 className="h-4 w-4" /> Berhasil dibuka!</> : <><FileText className="h-4 w-4" /> Buka & Cetak PDF</>}
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="premium-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-navy">Preview Data yang akan Diexport</h3>
              <span className="text-xs text-muted-foreground">{KECAMATAN.length} baris</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-milk-dark/50">
                    {["#", "Kecamatan", "Banjir", "Longsor", "Gempa", "Total", "Risiko"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-navy">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {KECAMATAN.slice(0, 8).map((k, i) => (
                    <tr key={k.id} className="border-t border-border hover:bg-milk-dark/20">
                      <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-2.5 font-semibold text-navy">{k.nama}</td>
                      <td className="px-4 py-2.5 font-bold text-sky">{k.banjir}</td>
                      <td className="px-4 py-2.5 font-bold text-orange">{k.longsor}</td>
                      <td className="px-4 py-2.5 font-bold">{k.gempa}</td>
                      <td className="px-4 py-2.5 font-bold text-navy">{totalDesa(k)}</td>
                      <td className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">{getRisk(k)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-border bg-milk-dark/30">
                    <td colSpan={7} className="px-4 py-2.5 text-xs text-center text-muted-foreground">
                      … dan {KECAMATAN.length - 8} baris lainnya akan tersimpan di file
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
