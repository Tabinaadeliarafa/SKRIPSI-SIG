import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Droplets, Mountain, Activity, Building2,
  MapPin, Download, ArrowRight, Filter, TrendingUp, FileText,
} from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { StatCard } from "@/components/StatCard";
import { RiskChip } from "@/components/RiskChip";
import { BekasiMap } from "@/components/BekasiMap";
import { KECAMATAN, TOTALS, getRisk, totalDesa, type KecamatanData } from "@/data/Bencana";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Beranda — SIG Bencana Kabupaten Bekasi" }] }),
  component: HomePage,
});

// ─── Helpers download ─────────────────────────────────────────────────────────

function downloadCSV(kec?: KecamatanData | null) {
  const headers = ["No", "Kecamatan", "Banjir", "Longsor", "Gempa", "Total Desa", "Risiko", "Lat", "Lng"];
  const list = kec ? [kec] : KECAMATAN;
  const rows = list.map((k, i) => [
    i + 1,
    k.nama,
    k.banjir,
    k.longsor,
    k.gempa,
    totalDesa(k),
    getRisk(k),
    k.lat,
    k.lng,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = kec
    ? `data-bencana-${kec.nama.toLowerCase().replace(/\s+/g, "-")}.csv`
    : "data-bencana-kab-bekasi.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(kec?: KecamatanData | null) {
  const list  = kec ? [kec] : KECAMATAN;
  const title = kec ? `Laporan Bencana — ${kec.nama}` : "Laporan Data Bencana Kabupaten Bekasi";

  const tableRows = list.map((k, i) => {
    const risk    = getRisk(k);
    const riskClr = risk === "Tinggi" ? "#dc2626" : risk === "Sedang" ? "#d97706" : risk === "Rendah" ? "#2563eb" : "#16a34a";
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${k.nama}</td>
        <td style="color:#2563eb;font-weight:bold">${k.banjir}</td>
        <td style="color:#c0522a;font-weight:bold">${k.longsor}</td>
        <td style="font-weight:bold">${k.gempa}</td>
        <td style="font-weight:bold">${totalDesa(k)}</td>
        <td style="color:${riskClr};font-weight:bold">${risk}</td>
        <td style="font-family:monospace;font-size:10px">${k.lat}, ${k.lng}</td>
      </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="id"><head>
<meta charset="utf-8"/>
<title>${title}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;color:#1a3a5c;padding:32px;font-size:13px}

  .kop{display:flex;align-items:center;gap:16px;border-bottom:3px solid #1a3a5c;padding-bottom:16px;margin-bottom:20px}
  .logo{width:52px;height:52px;background:linear-gradient(135deg,#2d6ca8,#1a3a5c);border-radius:10px;
        display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:13px}
  .kop-text h1{font-size:17px;font-weight:bold}
  .kop-text p{font-size:11px;color:#64748b;margin-top:2px}

  .meta{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:18px}
  .meta-box{background:#f1f5f9;border-radius:8px;padding:8px 14px;font-size:12px}
  .meta-box span{display:block;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:.05em}
  .meta-box b{color:#1a3a5c}

  table{width:100%;border-collapse:collapse;font-size:12px}
  thead tr{background:#1a3a5c;color:#fff}
  th{padding:9px 10px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
  td{padding:8px 10px;border-bottom:1px solid #e2e8f0}
  tr:nth-child(even) td{background:#f8fafc}

  .footer{margin-top:24px;font-size:10px;color:#94a3b8;text-align:right;border-top:1px solid #e2e8f0;padding-top:10px}
  @media print{body{padding:16px}}
</style>
</head><body>
<div class="kop">
  <div class="logo">SIG</div>
  <div class="kop-text">
    <h1>${title}</h1>
    <p>Sistem Informasi Geografis Bencana — BPBD Kabupaten Bekasi</p>
  </div>
</div>
<div class="meta">
  <div class="meta-box"><span>Sumber Data</span><b>BPS Kabupaten Bekasi 2025</b></div>
  <div class="meta-box"><span>Jumlah Kecamatan</span><b>${list.length} kecamatan</b></div>
  <div class="meta-box"><span>Tanggal Cetak</span><b>${new Date().toLocaleDateString("id-ID",{day:"2-digit",month:"long",year:"numeric"})}</b></div>
</div>
<table>
  <thead>
    <tr>
      <th>No</th><th>Kecamatan</th><th>Banjir</th><th>Longsor</th>
      <th>Gempa</th><th>Total</th><th>Risiko</th><th>Koordinat</th>
    </tr>
  </thead>
  <tbody>${tableRows}</tbody>
</table>
<div class="footer">Dicetak dari SIG BKS · Data: BPS Kabupaten Bekasi 2025</div>
<script>window.onload=()=>{window.print()}<\/script>
</body></html>`;

  const win = window.open("", "_blank", "width=960,height=720");
  if (!win) {
    alert("Pop-up diblokir browser. Izinkan pop-up untuk halaman ini lalu coba lagi.");
    return;
  }
  win.document.write(html);
  win.document.close();
}

// ─── Modal pilihan format unduh ───────────────────────────────────────────────
function DownloadModal({
  kec,
  onClose,
}: {
  kec?: KecamatanData | null;
  onClose: () => void;
}) {
  const label = kec ? kec.nama : "Semua Kecamatan";
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-navy/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="premium-card p-6 max-w-sm w-full animate-[pop_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display font-bold text-navy text-lg">Unduh Data</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-5">
          Pilih format untuk <b>{label}</b>
        </p>

        <div className="space-y-2">
          <button
            onClick={() => { downloadCSV(kec); onClose(); }}
            className="w-full flex items-center justify-between rounded-xl bg-milk-dark/60 hover:bg-milk-dark px-4 py-3 text-sm font-semibold transition"
          >
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4 text-sky" />
              Unduh CSV
            </span>
            <span className="text-xs text-muted-foreground">Spreadsheet / Excel</span>
          </button>

          <button
            onClick={() => { downloadPDF(kec); onClose(); }}
            className="w-full flex items-center justify-between rounded-xl bg-navy text-white hover:bg-navy-deep px-4 py-3 text-sm font-semibold transition"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Unduh PDF
            </span>
            <span className="text-xs text-white/60">Laporan siap cetak</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-xs text-muted-foreground hover:text-navy transition"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

// ─── Halaman utama ────────────────────────────────────────────────────────────
function HomePage() {
  const [filter,   setFilter  ] = useState<"all" | "banjir" | "longsor" | "gempa">("all");
  const [year,     setYear    ] = useState(2025);
  const [selected, setSelected] = useState<KecamatanData | null>(KECAMATAN[0]);
  const [dlModal,  setDlModal ] = useState<"all" | "selected" | null>(null);

  const topBanjir = useMemo(
    () => [...KECAMATAN].sort((a, b) => b.banjir - a.banjir).slice(0, 6),
    []
  );

  return (
    <div className="min-h-screen">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 animate-[slide-up_0.6s_ease-out]">
              <span className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white/70 backdrop-blur px-3 py-1 text-xs font-semibold text-navy">
                <span className="h-1.5 w-1.5 rounded-full bg-orange animate-pulse" />
                Data BPS Kabupaten Bekasi · 2025
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy leading-[1.05]">
                Bencana Alam{" "}
                <span className="bg-gradient-to-r from-sky to-orange bg-clip-text text-transparent">
                  Kab. Bekasi
                </span>
              </h1>
              <p className="mt-3 text-lg text-foreground/70 font-medium">
                Sistem Informasi Geografis
              </p>
              <p className="mt-3 max-w-xl text-foreground/70">
                Dashboard informasi bencana berbasis data BPS Kabupaten Bekasi 2025. Pantau sebaran
                banjir, tanah longsor, dan gempa bumi di 23 kecamatan secara interaktif.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/peta"
                  className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-5 py-3 font-semibold shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
                >
                  <MapPin className="h-4 w-4" /> Lihat Peta Interaktif <ArrowRight className="h-4 w-4" />
                </Link>
                {/* ← Tombol unduh hero: buka modal semua kecamatan */}
                <button
                  onClick={() => setDlModal("all")}
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-5 py-3 font-semibold text-navy hover:bg-milk-dark transition-all"
                >
                  <Download className="h-4 w-4" /> Unduh Data BPS
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="glass-card p-6 relative animate-[pop_0.6s_ease-out]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                      Risiko tertinggi
                    </div>
                    <div className="font-display text-2xl font-bold text-navy mt-1">
                      {topBanjir[0].nama}
                    </div>
                  </div>
                  <RiskChip risk={getRisk(topBanjir[0])} size="md" />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    { l: "Banjir",  v: topBanjir[0].banjir,  c: "text-sky"        },
                    { l: "Longsor", v: topBanjir[0].longsor, c: "text-orange"      },
                    { l: "Gempa",   v: topBanjir[0].gempa,   c: "text-foreground"  },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl bg-white/60 p-3 border border-white">
                      <div className={`text-2xl font-bold font-display ${s.c}`}>{s.v}</div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 h-1.5 rounded-full bg-milk-dark overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky to-orange"
                    style={{ width: `${(totalDesa(topBanjir[0]) / 12) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Indeks paparan bencana relatif</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Kecamatan"       value={TOTALS.kecamatan} hint="Wilayah administratif"    icon={<Building2 className="h-5 w-5" />} accent="navy"    />
          <StatCard label="Desa Terdampak Banjir" value={TOTALS.banjir}    hint="Risiko hidrometeorologi"  icon={<Droplets  className="h-5 w-5" />} accent="sky"     delta="12%" />
          <StatCard label="Desa Tanah Longsor"    value={TOTALS.longsor}   hint="Wilayah perbukitan"       icon={<Mountain  className="h-5 w-5" />} accent="orange"  />
          <StatCard label="Desa Gempa Bumi"       value={TOTALS.gempa}     hint="Tidak ada laporan 2025"   icon={<Activity  className="h-5 w-5" />} accent="success" />
        </div>
      </section>

      {/* DASHBOARD 3-col */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-12 gap-4">

          {/* LEFT */}
          <aside className="col-span-12 lg:col-span-3 space-y-4">
            <div className="premium-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-4 w-4 text-navy" />
                <h3 className="font-display font-semibold text-navy">Filter Bencana</h3>
              </div>
              <div className="space-y-2">
                {([ ["all","Semua"], ["banjir","Banjir"], ["longsor","Tanah Longsor"], ["gempa","Gempa Bumi"] ] as const).map(([k, l]) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                      filter === k ? "bg-navy text-white shadow" : "bg-milk-dark/50 hover:bg-milk-dark text-foreground/80"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="premium-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-navy">Top 6 Banjir</h3>
                <TrendingUp className="h-4 w-4 text-orange" />
              </div>
              <ol className="space-y-2.5">
                {topBanjir.map((k, i) => {
                  const max = topBanjir[0].banjir || 1;
                  return (
                    <li key={k.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span className={`h-5 w-5 rounded-md grid place-items-center text-[10px] font-bold ${i === 0 ? "bg-orange text-white" : "bg-milk-dark text-navy"}`}>
                            {i + 1}
                          </span>
                          <span className="font-medium">{k.nama}</span>
                        </span>
                        <span className="font-bold text-navy text-xs">{k.banjir}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-milk-dark overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-sky to-navy transition-all" style={{ width: `${(k.banjir / max) * 100}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="premium-card p-5">
              <h3 className="font-display font-semibold text-navy mb-2">Tahun Data</h3>
              <input
                type="range" min={2020} max={2025} value={year}
                onChange={(e) => setYear(+e.target.value)}
                className="w-full accent-[var(--orange)]"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>2020</span>
                <span className="font-bold text-navy text-base">{year}</span>
                <span>2025</span>
              </div>
            </div>
          </aside>

          {/* CENTER MAP */}
          <main className="col-span-12 lg:col-span-6">
            <div className="premium-card p-4">
              <div className="flex items-center justify-between mb-3 px-2">
                <div>
                  <h3 className="font-display font-bold text-navy text-lg">Peta Sebaran Bencana</h3>
                  <p className="text-xs text-muted-foreground">Choropleth · Kabupaten Bekasi</p>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  {[["#c0522a","Tinggi"],["#e08a3c","Sedang"],["#2d6ca8","Rendah"],["#4a8a5e","Aman"]].map(([c, l]) => (
                    <span key={l} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{l}
                    </span>
                  ))}
                </div>
              </div>
              <BekasiMap height="500px" filter={filter} onSelect={setSelected} selectedId={selected?.id} />
            </div>
          </main>

          {/* RIGHT */}
          <aside className="col-span-12 lg:col-span-3 space-y-4">
            <div className="premium-card p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Kecamatan terpilih
              </div>
              <div className="font-display font-bold text-navy text-2xl mt-1">{selected?.nama}</div>
              {selected && <div className="mt-2"><RiskChip risk={getRisk(selected)} size="md" /></div>}
            </div>

            {selected && (
              <div className="premium-card p-5 space-y-3">
                <h4 className="font-semibold text-navy">Ringkasan</h4>
                {[
                  ["Total desa", selected.desa  ],
                  ["Banjir",     selected.banjir ],
                  ["Longsor",    selected.longsor],
                  ["Gempa",      selected.gempa  ],
                ].map(([l, v]) => (
                  <div key={l as string} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-bold text-navy">{v}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground">Koordinat</div>
                  <div className="font-mono text-xs text-foreground/80">
                    {selected.lat?.toFixed(3)}, {selected.lng?.toFixed(3)}
                  </div>
                </div>
              </div>
            )}

            {/* ── Panel Unduh Data ──────────────────────────────────── */}
            <div className="premium-card p-5">
              <h4 className="font-semibold text-navy mb-1">Unduh Data</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Seluruh data 23 kecamatan Kabupaten Bekasi
              </p>

              <div className="space-y-2">
                {/* CSV semua kecamatan */}
                <button
                  onClick={() => downloadCSV(null)}
                  className="w-full flex items-center justify-between rounded-xl bg-milk-dark/60 hover:bg-milk-dark px-3 py-2.5 text-sm font-semibold transition"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-sky" />
                    CSV Semua Kecamatan
                  </span>
                </button>

                {/* PDF semua kecamatan */}
                <button
                  onClick={() => downloadPDF(null)}
                  className="w-full flex items-center justify-between rounded-xl bg-navy text-white hover:bg-navy-deep px-3 py-2.5 text-sm font-semibold transition"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Semua Kecamatan
                  </span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-white/40 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© 2025 SIG Bencana Kabupaten Bekasi</span>
          <span>Data: BPS Kabupaten Bekasi · Layer: QGIS GeoJSON</span>
        </div>
      </footer>

      {/* Modal unduh dari tombol hero */}
      {dlModal === "all" && (
        <DownloadModal kec={null} onClose={() => setDlModal(null)} />
      )}
    </div>
  );
}