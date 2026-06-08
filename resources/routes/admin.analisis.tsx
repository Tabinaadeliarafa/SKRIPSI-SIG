/**
 * /admin/analisis
 * Gabungan Statistik + Analisis (sebelumnya terpisah di Analisis & Statistik).
 * Berisi: chart bar/stacked, pie chart, DAN TrenForecast (SMA) yang sama persis
 * dengan yang dipakai user umum di /visualisasi tab "Tren".
 */
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopbar } from "@/components/AdminTopBar";
import { TrenForecast } from "@/components/TrenForecast";
import { KECAMATAN, totalDesa } from "@/data/Bencana";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { BarChart3, TrendingUp, Settings2 } from "lucide-react";

export const Route = createFileRoute("/admin/analisis")({
  head: () => ({ meta: [{ title: "Statistik & Analisis — SIG BKS" }] }),
  component: AdminAnalisisPage,
});

type MainTab   = "statistik" | "tren";
type ChartType = "bar" | "stacked";

const barData = KECAMATAN.map((k) => ({
  name:    k.nama,
  banjir:  k.banjir,
  longsor: k.longsor,
  gempa:   k.gempa,
  total:   totalDesa(k),
}));

const pieData = [
  { name: "Banjir",  value: KECAMATAN.reduce((s, k) => s + k.banjir,  0), fill: "#2d6ca8" },
  { name: "Longsor", value: KECAMATAN.reduce((s, k) => s + k.longsor, 0), fill: "#c0522a" },
  { name: "Gempa",   value: KECAMATAN.reduce((s, k) => s + k.gempa,   0) || 0.001, fill: "#4a8a5e" },
];

function AdminAnalisisPage() {
  const [mainTab,   setMainTab  ] = useState<MainTab  >("statistik");
  const [chartType, setChartType] = useState<ChartType>("bar");

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <AdminTopbar title="Statistik & Analisis" />

        <main className="p-4 lg:p-8 space-y-6">
          {/* Header + tab switcher */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-2xl text-navy">Statistik & Analisis</h2>
              <p className="text-sm text-muted-foreground">
                Visualisasi data bencana dan prediksi SMA Kabupaten Bekasi.
              </p>
            </div>
            <div className="inline-flex p-1 bg-white border border-border rounded-full shadow-sm">
              <button
                onClick={() => setMainTab("statistik")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
                  mainTab === "statistik" ? "bg-navy text-white shadow" : "text-foreground/70 hover:text-navy"
                }`}
              >
                <BarChart3 className="h-4 w-4" /> Statistik
              </button>
              <button
                onClick={() => setMainTab("tren")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
                  mainTab === "tren" ? "bg-navy text-white shadow" : "text-foreground/70 hover:text-navy"
                }`}
              >
                <TrendingUp className="h-4 w-4" /> Tren & Prediksi SMA
              </button>
            </div>
          </div>

          {/* ── TAB: STATISTIK ─────────────────────────────────────────── */}
          {mainTab === "statistik" && (
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Bar chart */}
              <div className="lg:col-span-2 premium-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-navy">Sebaran per Kecamatan</h3>
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                    <div className="inline-flex bg-milk-dark/50 rounded-full p-0.5 text-xs">
                      {(["bar", "stacked"] as ChartType[]).map((c) => (
                        <button
                          key={c}
                          onClick={() => setChartType(c)}
                          className={`px-3 py-1 rounded-full font-semibold capitalize ${
                            chartType === c ? "bg-navy text-white" : "text-muted-foreground"
                          }`}
                        >
                          {c === "bar" ? "Grouped" : "Stacked"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="h-[420px]">
                  <ResponsiveContainer>
                    <BarChart data={barData}>
                      <CartesianGrid stroke="#e2dfd9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#1a3a5c" }} angle={-40} textAnchor="end" height={90} interval={0} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 12 }} />
                      <Legend />
                      {chartType === "bar" ? (
                        <>
                          <Bar dataKey="banjir"  fill="#2d6ca8" radius={[6,6,0,0]} name="Banjir"  />
                          <Bar dataKey="longsor" fill="#c0522a" radius={[6,6,0,0]} name="Longsor" />
                          <Bar dataKey="gempa"   fill="#4a8a5e" radius={[6,6,0,0]} name="Gempa"   />
                        </>
                      ) : (
                        <>
                          <Bar dataKey="banjir"  stackId="a" fill="#2d6ca8" name="Banjir"  />
                          <Bar dataKey="longsor" stackId="a" fill="#c0522a" name="Longsor" />
                          <Bar dataKey="gempa"   stackId="a" fill="#4a8a5e" radius={[6,6,0,0]} name="Gempa" />
                        </>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie chart */}
              <div className="premium-card p-5">
                <h3 className="font-display font-bold text-navy mb-4">Komposisi Bencana</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={3}>
                        {pieData.map((t) => <Cell key={t.name} fill={t.fill} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  {pieData.map((t) => (
                    <div key={t.name} className="flex items-center justify-between rounded-lg bg-milk-dark/40 px-3 py-2">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.fill }} />
                        {t.name}
                      </span>
                      <b className="text-navy">{t.value === 0.001 ? 0 : t.value}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: TREN & PREDIKSI SMA ───────────────────────────────── */}
          {mainTab === "tren" && (
            <div>
              {/* Gunakan komponen TrenForecast yang PERSIS SAMA dengan halaman user */}
              <TrenForecast />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}