import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { KECAMATAN, totalDesa, getRisk, riskColor } from "@/data/Bencana";
import { RiskChip } from "@/components/RiskChip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrenForecast } from "@/components/TrenForecast";

export const Route = createFileRoute("/visualisasi")({
  head: () => ({ meta: [{ title: "Visualisasi — SIG Bencana Kabupaten Bekasi" }] }),
  component: VizPage,
});

const TABS = ["Ringkasan", "Per Kecamatan", "Perbandingan", "Tren"] as const;

function VizPage() {
  const [tab, setTab] = useState<typeof TABS[number]>("Ringkasan");

  const ranked = [...KECAMATAN].sort((a, b) => totalDesa(b) - totalDesa(a));
  const topBars = ranked.slice(0, 10).map((k) => ({ name: k.nama, banjir: k.banjir, longsor: k.longsor, gempa: k.gempa }));
  const totals = [
    { name: "Banjir", value: KECAMATAN.reduce((s, k) => s + k.banjir, 0), fill: "#2d6ca8" },
    { name: "Longsor", value: KECAMATAN.reduce((s, k) => s + k.longsor, 0), fill: "#c0522a" },
    { name: "Gempa", value: KECAMATAN.reduce((s, k) => s + k.gempa, 0) || 0.001, fill: "#4a8a5e" },
  ];

  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-navy">Visualisasi Data</h1>
            <p className="text-muted-foreground mt-1">Analisis sebaran bencana 23 kecamatan Kabupaten Bekasi.</p>
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
            <div className="premium-card p-5 lg:col-span-2">
              <h3 className="font-display font-bold text-navy mb-4">Top 10 Kecamatan Terdampak</h3>
              <div className="h-[360px]">
                <ResponsiveContainer>
                  <BarChart data={topBars} layout="vertical" margin={{ left: 12 }}>
                    <CartesianGrid stroke="#e2dfd9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#666" }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#1a3a5c" }} width={110} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2dfd9" }} />
                    <Legend />
                    <Bar dataKey="banjir" stackId="a" fill="#2d6ca8" radius={[0, 0, 0, 0]} />
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
              <div className="text-center -mt-32 pointer-events-none">
                <div className="font-display text-3xl font-bold text-navy">{totals[0].value + totals[1].value}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Total desa</div>
              </div>
            </div>
          </div>
        )}

        {tab === "Per Kecamatan" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ranked.slice(0, 12).map((k, i) => (
              <div key={k.id} className="premium-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">#{i + 1}</div>
                    <div className="font-display font-bold text-navy text-lg">{k.nama}</div>
                  </div>
                  <RiskChip risk={getRisk(k)} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-sky/10 p-2"><div className="text-xl font-bold text-sky">{k.banjir}</div><div className="text-[10px] uppercase text-muted-foreground">Banjir</div></div>
                  <div className="rounded-lg bg-orange/10 p-2"><div className="text-xl font-bold text-orange">{k.longsor}</div><div className="text-[10px] uppercase text-muted-foreground">Longsor</div></div>
                  <div className="rounded-lg bg-success/10 p-2"><div className="text-xl font-bold text-success">{k.gempa}</div><div className="text-[10px] uppercase text-muted-foreground">Gempa</div></div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-milk-dark overflow-hidden">
                  <div className="h-full" style={{ width: `${(totalDesa(k) / 10) * 100}%`, background: riskColor(getRisk(k)) }} />
                </div>
              </div>
            ))}
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

        {tab === "Tren" && <TrenForecast />}
      </div>
    </div>
  );
}
