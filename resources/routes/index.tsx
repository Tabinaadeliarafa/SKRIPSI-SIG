import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Droplets, Mountain, Activity, Building2, MapPin, Download, ArrowRight, Filter, TrendingUp } from "lucide-react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { StatCard } from "@/components/StatCard";
import { RiskChip } from "@/components/RiskChip";
import { BekasiMap } from "@/components/BekasiMap";
import { getRisk, totalDesa, type KecamatanData, type Risk } from "@/data/Bencana";
import { api } from "@/services/api"; // Pastikan sudah disetup

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Beranda — SIG Bencana Kabupaten Bekasi" }] }),
  component: HomePage,
});

function HomePage() {
  const [filter, setFilter] = useState<"all" | "banjir" | "longsor" | "gempa">("all");
  const [year, setYear] = useState(2025);
  const [kecamatanList, setKecamatanList] = useState<KecamatanData[]>([]);
  const [selected, setSelected] = useState<KecamatanData | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data Dinamis
  useEffect(() => {
    setLoading(true);
    api.get<KecamatanData[]>("/kecamatan-stats", { params: { tahun: year } })
      .then((res) => {
        setKecamatanList(res.data);
        if (res.data.length > 0 && !selected) setSelected(res.data[0]);
      })
      .finally(() => setLoading(false));
  }, [year]);

  // 2. Kalkulasi Dinamis (Gantikan TOTALS)
  const totals = useMemo(() => ({
    kecamatan: kecamatanList.length,
    banjir: kecamatanList.reduce((s, k) => s + k.banjir, 0),
    longsor: kecamatanList.reduce((s, k) => s + k.longsor, 0),
    gempa: kecamatanList.reduce((s, k) => s + k.gempa, 0),
  }), [kecamatanList]);

  // 3. Sorting Dinamis
  const topBanjir = useMemo(() =>
    [...kecamatanList].sort((a, b) => b.banjir - a.banjir).slice(0, 6),
    [kecamatanList]
  );

  return (
    <div className="min-h-screen">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white/70 px-3 py-1 text-xs font-semibold text-navy">
                <span className="h-1.5 w-1.5 rounded-full bg-orange animate-pulse" />
                Data BPS Kabupaten Bekasi · {year}
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy leading-[1.05]">
                Bencana Alam <span className="bg-gradient-to-r from-sky to-orange bg-clip-text text-transparent">Kab. Bekasi</span>
              </h1>
              <p className="mt-3 text-lg text-foreground/70 font-medium">Website pemantauan bencana Kabupaten Bekasi yang menampilkan data, peta interaktif, dan prediksi risiko bencana secara informatif.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/peta" className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-5 py-3 font-semibold shadow-lg transition-all hover:-translate-y-0.5">
                  <MapPin className="h-4 w-4" /> Lihat Peta Interaktif <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* HERO STATS */}
            <div className="lg:col-span-5">
              {topBanjir.length > 0 && (
                <div className="glass-card p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Risiko Tertinggi</div>
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
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Kecamatan" value={totals.kecamatan} icon={<Building2 className="h-5 w-5" />} accent="navy" />
          <StatCard label="Total Banjir" value={totals.banjir} icon={<Droplets className="h-5 w-5" />} accent="sky" />
          <StatCard label="Total Longsor" value={totals.longsor} icon={<Mountain className="h-5 w-5" />} accent="orange" />
          <StatCard label="Total Gempa" value={totals.gempa} icon={<Activity className="h-5 w-5" />} accent="success" />
        </div>
      </section>

      {/* DASHBOARD */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-12 gap-4">
          <aside className="col-span-12 lg:col-span-3 space-y-4">
            <div className="premium-card p-5">
              <h3 className="font-display font-semibold text-navy mb-4">Tahun Data: {year}</h3>
              <input type="range" min={2020} max={2025} value={year} onChange={(e) => setYear(+e.target.value)} className="w-full accent-orange" />
            </div>
          </aside>

          <main className="col-span-12 lg:col-span-6">
            <div className="premium-card p-4">
              {loading ? (
                <div className="h-[500px] flex items-center justify-center">Memuat Peta...</div>
              ) : (
                <BekasiMap height="500px" filter={filter} onSelect={setSelected} selectedId={selected?.id} />
              )}
            </div>
          </main>

          <aside className="col-span-12 lg:col-span-3">
             {selected && (
                <div className="premium-card p-5">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Kecamatan</div>
                  <div className="font-display font-bold text-2xl text-navy mt-1">{selected.nama}</div>
                  <div className="mt-2"><RiskChip risk={getRisk(selected)} size="md" /></div>
                </div>
             )}
          </aside>
        </div>
      </section>
    </div>
  );
}
