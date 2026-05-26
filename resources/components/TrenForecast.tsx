/**
 * Tab "Tren" — historical + Simple Moving Average (SMA) forecast.
 * Memakai dataset BPS 2019-2025 di /public/data/historis-bencana.json.
 */
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  analyzeForecast,
  buildSeries,
  loadHistoris,
  smaForecast,
  type JenisBencana,
} from "@/services/historis";

const JENIS_LABEL: Record<JenisBencana, string> = {
  banjir: "Banjir",
  longsor: "Tanah Longsor",
  gempa: "Gempa Bumi",
  total: "Semua Bencana",
};
const JENIS_COLOR: Record<JenisBencana, string> = {
  banjir: "#2d6ca8",
  longsor: "#c0522a",
  gempa: "#b3261e",
  total: "#1a3a5c",
};

export function TrenForecast() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["historis-bencana"],
    queryFn: loadHistoris,
    staleTime: Infinity,
  });

  const [jenis, setJenis] = useState<JenisBencana>("banjir");
  const [kecamatan, setKecamatan] = useState<string | "ALL">("ALL");
  const years = data?.years ?? [];
  const [range, setRange] = useState<[number, number] | null>(null);
  const effectiveRange: [number, number] | undefined = range ?? (years.length ? [years[0], years[years.length - 1]] : undefined);

  const chartData = useMemo(() => {
    if (!data) return [];
    const series = buildSeries(data, jenis, kecamatan, effectiveRange);
    return smaForecast(series).map((p) => ({
      tahun: String(p.tahun),
      historis: Number.isNaN(p.value) ? null : p.value,
      sma: Number.isNaN(p.sma as number) ? null : p.sma,
      prediksi: p.forecast,
    }));
  }, [data, jenis, kecamatan, effectiveRange]);

  const analysis = useMemo(
    () => (data ? analyzeForecast(data, jenis, kecamatan, effectiveRange) : null),
    [data, jenis, kecamatan, effectiveRange]
  );

  if (isLoading) {
    return (
      <div className="premium-card p-10 text-center text-muted-foreground animate-pulse">
        Memuat dataset historis BPS 2019–2025…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="premium-card p-10 text-center text-orange">
        Dataset belum tersedia di <code>/public/data/historis-bencana.json</code>.
      </div>
    );
  }

  const isEmpty = chartData.every((d) => !d.historis);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filter */}
      <div className="premium-card p-4 flex flex-wrap items-end gap-3">
        <Field label="Jenis Bencana">
          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value as JenisBencana)}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-sky/40"
          >
            {(Object.keys(JENIS_LABEL) as JenisBencana[]).map((j) => (
              <option key={j} value={j}>{JENIS_LABEL[j]}</option>
            ))}
          </select>
        </Field>
        <Field label="Kecamatan">
          <select
            value={kecamatan}
            onChange={(e) => setKecamatan(e.target.value)}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium min-w-[180px]"
          >
            <option value="ALL">Semua Kecamatan ({data.kecamatan.length})</option>
            {data.kecamatan.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>
        <Field label="Tahun Awal">
          <select
            value={effectiveRange?.[0]}
            onChange={(e) => setRange([Number(e.target.value), effectiveRange?.[1] ?? years[years.length - 1]])}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <Field label="Tahun Akhir">
          <select
            value={effectiveRange?.[1]}
            onChange={(e) => setRange([effectiveRange?.[0] ?? years[0], Number(e.target.value)])}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <div className="ml-auto text-xs text-muted-foreground max-w-xs">
          Metode: <b>Simple Moving Average</b> (window ≤ 5). Prediksi otomatis untuk tahun berikutnya.
        </div>
      </div>

      {/* Analysis cards */}
      {analysis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AnalysisCard
            title={`Prediksi ${analysis.nextYear}`}
            value={`${analysis.predicted}`}
            sub={`${JENIS_LABEL[jenis]} • ${kecamatan === "ALL" ? "Semua Kec." : kecamatan}`}
            accent={JENIS_COLOR[jenis]}
          />
          <AnalysisCard
            title="Tren"
            value={analysis.trend === "naik" ? "▲ Naik" : analysis.trend === "turun" ? "▼ Turun" : "● Stabil"}
            sub={`${analysis.deltaPct >= 0 ? "+" : ""}${analysis.deltaPct.toFixed(1)}% vs ${effectiveRange?.[1]}`}
            accent={analysis.trend === "naik" ? "#c0522a" : analysis.trend === "turun" ? "#4a8a5e" : "#9aa7b3"}
          />
          <AnalysisCard
            title="Kecamatan Paling Rawan"
            value={analysis.rawanKecamatan?.nama ?? "—"}
            sub={`${analysis.rawanKecamatan?.total ?? 0} desa terdampak (rentang dipilih)`}
            accent="#1a3a5c"
          />
          <AnalysisCard
            title="Total Prediksi Desa Terdampak"
            value={`${analysis.totalPrediksi}`}
            sub={`Skala ${kecamatan === "ALL" ? "kabupaten" : "kecamatan"}`}
            accent="#2d6ca8"
          />
        </div>
      )}

      {/* Chart */}
      <div className="premium-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-navy">
            Tren Historis &amp; Prediksi — {JENIS_LABEL[jenis]}
          </h3>
          <span className="text-xs text-muted-foreground">
            Sumber: {data.source}
          </span>
        </div>
        <div className="h-[420px]">
          {isEmpty ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Tidak ada data untuk filter ini.
            </div>
          ) : (
            <ResponsiveContainer>
              <ComposedChart data={chartData} margin={{ top: 10, right: 24, bottom: 8, left: 0 }}>
                <CartesianGrid stroke="#e2dfd9" strokeDasharray="3 3" />
                <XAxis dataKey="tahun" tick={{ fontSize: 12, fill: "#1a3a5c" }} />
                <YAxis tick={{ fontSize: 11, fill: "#666" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2dfd9" }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="historis"
                  name="Data Historis"
                  stroke={JENIS_COLOR[jenis]}
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  isAnimationActive
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="sma"
                  name="Moving Average"
                  stroke="#9aa7b3"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="prediksi"
                  name={`Prediksi SMA (tahun ${analysis?.nextYear ?? ""})`}
                  stroke="#c0522a"
                  strokeWidth={3}
                  strokeDasharray="6 4"
                  dot={{ r: 6, fill: "#c0522a" }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>
      {children}
    </label>
  );
}

function AnalysisCard({
  title, value, sub, accent,
}: { title: string; value: string; sub: string; accent: string }) {
  return (
    <div className="premium-card p-4 hover:-translate-y-0.5 transition">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{title}</div>
      <div className="mt-1 font-display text-2xl font-extrabold" style={{ color: accent }}>
        {value}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
      <div className="mt-3 h-1 rounded-full" style={{ background: accent, opacity: 0.25 }} />
    </div>
  );
}
