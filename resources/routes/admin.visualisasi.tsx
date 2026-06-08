import { createFileRoute } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopbar } from "@/components/AdminTopBar";
import { TrenForecast } from "@/components/TrenForecast";
import { KECAMATAN, totalDesa } from "@/data/Bencana";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useState } from "react";

export const Route = createFileRoute("/admin/visualisasi")({
  head: () => ({ meta: [{ title: "Analisis & Statistik — SIG BKS" }] }),
  component: AdminViz,
});

const TABS = ["Ringkasan", "Perbandingan", "Tren & Prediksi"] as const;

function AdminViz() {
  const [tab, setTab] = useState<typeof TABS[number]>("Ringkasan");

  const ranked = [...KECAMATAN].sort((a, b) => totalDesa(b) - totalDesa(a));
  const topBars = ranked.slice(0, 10).map((k) => ({ name: k.nama, banjir: k.banjir, longsor: k.longsor, gempa: k.gempa }));
  const totals = [
    { name: "Banjir", value: KECAMATAN.reduce((s, k) => s + k.banjir, 0), fill: "#2d6ca8" },
    { name: "Longsor", value: KECAMATAN.reduce((s, k) => s + k.longsor, 0), fill: "#c0522a" },
    { name: "Gempa", value: KECAMATAN.reduce((s, k) => s + k.gempa, 0) || 0.001, fill: "#4a8a5e" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <AdminTopbar title="Analisis & Statistik" />
        <main className="p-4 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-2xl text-navy">Analisis & Statistik</h2>
              <p className="text-sm text-muted-foreground">Visualisasi dan prediksi sebaran bencana 23 kecamatan Kabupaten Bekasi.</p>
            </div>
            <div className="inline-flex p-1 bg-white border border-border rounded-full shadow-sm overflow-x-auto">
              {TABS.map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm rounded-full font-semibold whitespace-nowrap transition ${tab === t ? "bg-navy text-white shadow" : "text-foreground/70 hover:text-navy"}`}>{t}</button>
              ))}
            </div>
          </div>

          {tab === "Ringkasan" && (
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 premium-card p-5">
                <h3 className="font-display font-bold text-navy mb-4">Top 10 Kecamatan Terdampak</h3>
                <div className="h-[360px]">
                  <ResponsiveContainer>
                    <BarChart data={topBars} layout="vertical" margin={{ left: 12 }}>
                      <CartesianGrid stroke="#e2dfd9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#666" }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#1a3a5c" }} width={120} />
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
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={totals} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={3}>
                        {totals.map((t) => <Cell key={t.name} fill={t.fill} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {totals.map((t) => (
                    <div key={t.name} className="flex items-center justify-between rounded-lg bg-milk-dark/40 px-3 py-2">
                      <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: t.fill }} /> {t.name}</span>
                      <b className="text-navy">{Math.round(t.value)}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "Perbandingan" && (
            <div className="premium-card p-5">
              <h3 className="font-display font-bold text-navy mb-4">Perbandingan Banjir vs Longsor (semua kecamatan)</h3>
              <div className="h-[480px]">
                <ResponsiveContainer>
                  <BarChart data={KECAMATAN.map((k) => ({ name: k.nama, banjir: k.banjir, longsor: k.longsor }))}>
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

          {tab === "Tren & Prediksi" && <TrenForecast />}
        </main>
      </div>
    </div>
  );
}
