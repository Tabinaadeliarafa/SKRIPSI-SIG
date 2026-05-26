import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Droplets, Mountain, Activity, Building2, MapPin, Download, ArrowRight, Filter, TrendingUp } from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { StatCard } from "@/components/StatCard";
import { RiskChip } from "@/components/RiskChip";
import { BekasiMap } from "@/components/BekasiMap";
import { KECAMATAN, TOTALS, getRisk, totalDesa, type KecamatanData } from "@/data/Bencana";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Beranda — SIG Bencana Kabupaten Bekasi" }] }),
  component: HomePage,
});

function HomePage() {
  const [filter, setFilter] = useState<"all" | "banjir" | "longsor" | "gempa">("all");
  const [year, setYear] = useState(2025);
  const [selected, setSelected] = useState<KecamatanData | null>(KECAMATAN[0]);

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
                Bencana Alam <span className="bg-gradient-to-r from-sky to-orange bg-clip-text text-transparent">Kab. Bekasi</span>
              </h1>
              <p className="mt-3 text-lg text-foreground/70 font-medium">Sistem Informasi Geografis</p>
              <p className="mt-3 max-w-xl text-foreground/70">
                Dashboard informasi bencana berbasis data BPS Kabupaten Bekasi 2025. Pantau sebaran banjir, tanah longsor, dan gempa bumi di 23 kecamatan secara interaktif.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/peta" className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-5 py-3 font-semibold shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all">
                  <MapPin className="h-4 w-4" /> Lihat Peta Interaktif <ArrowRight className="h-4 w-4" />
                </Link>
                <button className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-5 py-3 font-semibold text-navy hover:bg-milk-dark transition-all">
                  <Download className="h-4 w-4" /> Unduh Data BPS
                </button>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="glass-card p-6 relative animate-[pop_0.6s_ease-out]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Risiko tertinggi</div>
                    <div className="font-display text-2xl font-bold text-navy mt-1">{topBanjir[0].nama}</div>
                  </div>
                  <RiskChip risk={getRisk(topBanjir[0])} size="md" />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[{ l: "Banjir", v: topBanjir[0].banjir, c: "text-sky" }, { l: "Longsor", v: topBanjir[0].longsor, c: "text-orange" }, { l: "Gempa", v: topBanjir[0].gempa, c: "text-foreground" }].map((s) => (
                    <div key={s.l} className="rounded-xl bg-white/60 p-3 border border-white">
                      <div className={`text-2xl font-bold font-display ${s.c}`}>{s.v}</div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 h-1.5 rounded-full bg-milk-dark overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky to-orange" style={{ width: `${(totalDesa(topBanjir[0]) / 12) * 100}%` }} />
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
          <StatCard label="Total Kecamatan" value={TOTALS.kecamatan} hint="Wilayah administratif" icon={<Building2 className="h-5 w-5" />} accent="navy" />
          <StatCard label="Desa Terdampak Banjir" value={TOTALS.banjir} hint="Risiko hidrometeorologi" icon={<Droplets className="h-5 w-5" />} accent="sky" delta="12%" />
          <StatCard label="Desa Tanah Longsor" value={TOTALS.longsor} hint="Wilayah perbukitan" icon={<Mountain className="h-5 w-5" />} accent="orange" />
          <StatCard label="Desa Gempa Bumi" value={TOTALS.gempa} hint="Tidak ada laporan 2025" icon={<Activity className="h-5 w-5" />} accent="success" />
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
                {([["all","Semua"],["banjir","Banjir"],["longsor","Tanah Longsor"],["gempa","Gempa Bumi"]] as const).map(([k, l]) => (
                  <button key={k} onClick={() => setFilter(k)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${filter === k ? "bg-navy text-white shadow" : "bg-milk-dark/50 hover:bg-milk-dark text-foreground/80"}`}>
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
                    <li key={k.id} className="group">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span className={`h-5 w-5 rounded-md grid place-items-center text-[10px] font-bold ${i === 0 ? "bg-orange text-white" : "bg-milk-dark text-navy"}`}>{i + 1}</span>
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
              <input type="range" min={2020} max={2025} value={year} onChange={(e) => setYear(+e.target.value)} className="w-full accent-[var(--orange)]" />
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
                    <span key={l} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{l}</span>
                  ))}
                </div>
              </div>
              <BekasiMap height="500px" filter={filter} onSelect={setSelected} selectedId={selected?.id} />
            </div>
          </main>

          {/* RIGHT */}
          <aside className="col-span-12 lg:col-span-3 space-y-4">
            <div className="premium-card p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Kecamatan terpilih</div>
              <div className="font-display font-bold text-navy text-2xl mt-1">{selected?.nama}</div>
              {selected && <div className="mt-2"><RiskChip risk={getRisk(selected)} size="md" /></div>}
            </div>
            {selected && (
              <div className="premium-card p-5 space-y-3">
                <h4 className="font-semibold text-navy">Ringkasan</h4>
                {[["Total desa", selected.desa],["Banjir", selected.banjir],["Longsor", selected.longsor],["Gempa", selected.gempa]].map(([l, v]) => (
                  <div key={l as string} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{l}</span>
                    <span className="font-bold text-navy">{v}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground">Koordinat</div>
                  <div className="font-mono text-xs text-foreground/80">{selected.lat.toFixed(3)}, {selected.lng.toFixed(3)}</div>
                </div>
              </div>
            )}
            <div className="premium-card p-5">
              <h4 className="font-semibold text-navy mb-3">Export Data</h4>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between rounded-lg bg-milk-dark/60 hover:bg-milk-dark px-3 py-2 text-sm font-medium transition">
                  <span>CSV</span><Download className="h-4 w-4" />
                </button>
                <button className="w-full flex items-center justify-between rounded-lg bg-navy text-white px-3 py-2 text-sm font-medium hover:bg-navy-deep transition">
                  <span>PDF Laporan</span><Download className="h-4 w-4" />
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
    </div>
  );
}
