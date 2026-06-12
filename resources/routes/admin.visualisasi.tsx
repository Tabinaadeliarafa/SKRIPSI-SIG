import { createFileRoute } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopbar } from "@/components/AdminTopBar";
import { useRingkasan } from "@/hooks/use-Bencana";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Download, FileSpreadsheet, FileText, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/visualisasi")({
  head: () => ({ meta: [{ title: "Admin Visualisasi — SIG BKS" }] }),
  component: AdminViz,
});

function AdminViz() {
  const [chart, setChart] = useState<"bar" | "stacked">("bar");

  // Ambil data dari API melalui hook React Query
  const { data: kecamatanList = [], isLoading } = useRingkasan(2025);

  const data = useMemo(() =>
    kecamatanList.map((k) => ({
        name: k.nama_kecamatan,
        banjir: k.banjir,
        longsor: k.longsor,
        gempa: k.gempa,
        total: k.total
    })), [kecamatanList]);

  const totals = useMemo(() => [
    { name: "Banjir", value: kecamatanList.reduce((s, k) => s + k.banjir, 0), fill: "#2d6ca8" },
    { name: "Longsor", value: kecamatanList.reduce((s, k) => s + k.longsor, 0), fill: "#c0522a" },
  ], [kecamatanList]);

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <AdminTopbar title="Statistik & Visualisasi" />
        <main className="p-4 lg:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-2xl text-navy">Analisis Visual</h2>
              <p className="text-sm text-muted-foreground">Konfigurasi chart dan ekspor laporan.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2 text-sm font-semibold hover:bg-milk-dark transition"><FileSpreadsheet className="h-4 w-4 text-success" /> Export Excel</button>
              <button className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-2 text-sm font-semibold hover:bg-milk-dark transition"><Download className="h-4 w-4 text-sky" /> Export CSV</button>
              <button className="inline-flex items-center gap-2 rounded-full bg-orange text-white px-4 py-2 text-sm font-semibold shadow-lg hover:brightness-110 transition"><FileText className="h-4 w-4" /> Export PDF</button>
            </div>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">Memuat data visualisasi...</div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 premium-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-navy">Sebaran per Kecamatan</h3>
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                    <div className="inline-flex bg-milk-dark/50 rounded-full p-0.5 text-xs">
                      {(["bar","stacked"] as const).map((c) => (
                        <button key={c} onClick={() => setChart(c)} className={`px-3 py-1 rounded-full font-semibold capitalize ${chart === c ? "bg-navy text-white" : "text-muted-foreground"}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="h-[420px]">
                  <ResponsiveContainer>
                    <BarChart data={data}>
                      <CartesianGrid stroke="#e2dfd9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#1a3a5c" }} angle={-40} textAnchor="end" height={90} interval={0} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 12 }} />
                      <Legend />
                      {chart === "bar" ? (
                        <>
                          <Bar dataKey="banjir" fill="#2d6ca8" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="longsor" fill="#c0522a" radius={[6, 6, 0, 0]} />
                        </>
                      ) : (
                        <>
                          <Bar dataKey="banjir" stackId="a" fill="#2d6ca8" />
                          <Bar dataKey="longsor" stackId="a" fill="#c0522a" radius={[6, 6, 0, 0]} />
                        </>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="premium-card p-5">
                <h3 className="font-display font-bold text-navy mb-4">Komposisi</h3>
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
                      <b className="text-navy">{t.value}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
