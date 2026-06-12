import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { getRisk, totalDesa, type KecamatanData } from "@/data/Bencana";
import { RiskChip } from "@/components/RiskChip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrenForecast } from "@/components/TrenForecast";
import { Calendar } from "lucide-react"; // Import ikon kalender
import { api } from "@/services/api";

export const Route = createFileRoute("/visualisasi")({
  head: () => ({ meta: [{ title: "Visualisasi — SIG Bencana Kabupaten Bekasi" }] }),
  component: VizPage,
});

const TABS = ["Ringkasan", "Per Kecamatan", "Perbandingan", "Tren"] as const;

function VizPage() {
  const [tab, setTab] = useState<typeof TABS[number]>("Ringkasan");
  const [tahun, setTahun] = useState<number>(2025);
  const [kecamatanList, setKecamatanList] = useState<KecamatanData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<KecamatanData[]>(`/kecamatan-stats?tahun=${tahun}`)
      .then((res) => {
        setKecamatanList(res.data || []);
      })
      .catch((err) => console.error("Gagal load viz data:", err))
      .finally(() => setLoading(false));
  }, [tahun]);

  const ranked = useMemo(() =>
    [...kecamatanList].sort((a, b) => totalDesa(b) - totalDesa(a)),
    [kecamatanList]
  );

  const topBars = useMemo(() =>
    ranked.slice(0, 10).map((k) => ({
      name: k.nama_kecamatan ?? "Unknown",
      banjir: k.banjir ?? 0,
      longsor: k.longsor ?? 0,
      gempa: k.gempa ?? 0
    })), [ranked]
  );

  const totals = useMemo(() => [
    { name: "Banjir", value: kecamatanList.reduce((s, k) => s + (k.banjir || 0), 0), fill: "#2d6ca8" },
    { name: "Longsor", value: kecamatanList.reduce((s, k) => s + (k.longsor || 0), 0), fill: "#c0522a" },
    { name: "Gempa", value: kecamatanList.reduce((s, k) => s + (k.gempa || 0), 0) || 0.001, fill: "#4a8a5e" },
  ], [kecamatanList]);

  const totalDesaValue = useMemo(() => totals.reduce((s, t) => s + t.value, 0), [totals]);

  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-navy">Visualisasi Data</h1>
            <p className="text-muted-foreground mt-1">Analisis sebaran bencana kecamatan Kabupaten Bekasi.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tahun */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={tahun}
                onChange={(e) => setTahun(Number(e.target.value))}
                className="pl-9 pr-8 py-2 bg-white border border-border rounded-full text-sm font-semibold text-navy focus:outline-none appearance-none cursor-pointer hover:border-navy transition shadow-sm"
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Tab Filter */}
            <div className="inline-flex p-1 bg-white border border-border rounded-full shadow-sm overflow-x-auto">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm rounded-full font-semibold whitespace-nowrap transition ${tab === t ? "bg-navy text-white shadow" : "text-foreground/70 hover:text-navy"}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
            <div className="h-[400px] flex items-center justify-center">Memuat data visualisasi...</div>
        ) : (
            <>
                {tab === "Ringkasan" && (
                <div className="grid lg:grid-cols-3 gap-4">
                    <div className="premium-card p-5 lg:col-span-2">
                    <h3 className="font-display font-bold text-navy mb-4">Top 10 Kecamatan Terdampak</h3>
                    <div className="h-[360px]">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topBars} layout="vertical" margin={{ left: 12 }}>
                            <CartesianGrid stroke="#e2dfd9" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11, fill: "#666" }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#1a3a5c" }} width={110} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2dfd9" }} />
                            <Legend />
                            <Bar dataKey="banjir" stackId="a" fill="#2d6ca8" />
                            <Bar dataKey="longsor" stackId="a" fill="#c0522a" />
                            <Bar dataKey="gempa" stackId="a" fill="#4a8a5e" radius={[0, 6, 6, 0]} />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                    </div>
                    <div className="premium-card p-5">
                    <h3 className="font-display font-bold text-navy mb-4">Komposisi Bencana</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={totals} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={3}>
                            {totals.map((t) => <Cell key={t.name} fill={t.fill} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center -mt-32 pointer-events-none">
                        <div className="font-display text-3xl font-bold text-navy">{totalDesaValue}</div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">Total desa</div>
                    </div>
                    </div>
                </div>
                )}

                {tab === "Per Kecamatan" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ranked.map((k) => (
                    <div key={k.id} className="premium-card p-5">
                        <div className="flex items-start justify-between">
                            <div className="font-display font-bold text-navy text-lg text-black">{k.nama_kecamatan}</div>
                            <RiskChip risk={getRisk(k)} />
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                            <div className="rounded-lg bg-sky/10 p-2"><div className="text-xl font-bold text-sky">{k.banjir || 0}</div><div className="text-[10px] uppercase text-muted-foreground">Banjir</div></div>
                            <div className="rounded-lg bg-orange/10 p-2"><div className="text-xl font-bold text-orange">{k.longsor || 0}</div><div className="text-[10px] uppercase text-muted-foreground">Longsor</div></div>
                            <div className="rounded-lg bg-success/10 p-2"><div className="text-xl font-bold text-success">{k.gempa || 0}</div><div className="text-[10px] uppercase text-muted-foreground">Gempa</div></div>
                        </div>
                    </div>
                    ))}
                </div>
                )}

                {tab === "Perbandingan" && (
                <div className="premium-card p-5">
                    <h3 className="font-display font-bold text-navy mb-4">Perbandingan Banjir vs Longsor</h3>
                    <div className="h-[480px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={kecamatanList.map((k) => ({ name: k.nama_kecamatan, banjir: k.banjir || 0, longsor: k.longsor || 0 }))}>
                        <CartesianGrid stroke="#e2dfd9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#1a3a5c" }} angle={-40} textAnchor="end" height={90} interval={0} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: 12 }} />
                        <Legend />
                        <Bar dataKey="banjir" fill="#2d6ca8" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="longsor" fill="#c0522a" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    </div>
                </div>
                )}

                {tab === "Tren" && <TrenForecast />}
            </>
        )}
      </div>
    </div>
  );
}
