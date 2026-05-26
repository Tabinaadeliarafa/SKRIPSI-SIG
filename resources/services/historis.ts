/**
 * Loader + Simple Moving Average forecasting untuk dataset historis BPS
 * (public/data/historis-bencana.json). Data: 23 kecamatan, 2019/2020/2021/2024/2025.
 */
export type JenisBencana = "banjir" | "longsor" | "gempa" | "total";

export interface HistorisRecord {
  kecamatan: string;
  tahun: number;
  banjir: number;
  longsor: number;
  gempa: number;
  total: number;
}

export interface HistorisPayload {
  source: string;
  years: number[];
  kecamatan: string[];
  records: HistorisRecord[];
}

let cache: HistorisPayload | null = null;
export async function loadHistoris(): Promise<HistorisPayload> {
  if (cache) return cache;
  const res = await fetch("/data/historis-bencana.json");
  if (!res.ok) throw new Error("Gagal memuat dataset historis");
  cache = (await res.json()) as HistorisPayload;
  return cache;
}

/** Agregasi seri per tahun (gabung semua kec atau filter satu kec, untuk satu jenis). */
export function buildSeries(
  payload: HistorisPayload,
  jenis: JenisBencana,
  kecamatan: string | "ALL",
  range?: [number, number]
): { tahun: number; value: number }[] {
  const [lo, hi] = range ?? [payload.years[0], payload.years[payload.years.length - 1]];
  const years = payload.years.filter((y) => y >= lo && y <= hi);
  return years.map((y) => {
    const rows = payload.records.filter(
      (r) => r.tahun === y && (kecamatan === "ALL" || r.kecamatan === kecamatan)
    );
    const value = rows.reduce((s, r) => s + (r[jenis] ?? 0), 0);
    return { tahun: y, value };
  });
}

/**
 * Simple Moving Average forecast.
 * Window = min(5, jumlah data tersedia). Memprediksi tahun setelah tahun terakhir.
 */
export function smaForecast(
  series: { tahun: number; value: number }[],
  windowMax = 5
): { tahun: number; value: number; sma: number | null; forecast: number | null }[] {
  const window = Math.min(windowMax, series.length);
  const enriched = series.map((p, i) => {
    const slice = series.slice(Math.max(0, i - window + 1), i + 1);
    const sma = slice.reduce((s, x) => s + x.value, 0) / slice.length;
    return { tahun: p.tahun, value: p.value, sma, forecast: null as number | null };
  });
  if (series.length === 0) return enriched;
  const last = series[series.length - 1];
  const tail = series.slice(-window);
  const fc = Math.round(tail.reduce((s, x) => s + x.value, 0) / tail.length);
  // titik penyambung supaya garis forecast nyambung
  enriched[enriched.length - 1] = { ...enriched[enriched.length - 1], forecast: last.value };
  enriched.push({ tahun: last.tahun + 1, value: NaN, sma: NaN, forecast: fc });
  return enriched;
}

export interface ForecastAnalysis {
  nextYear: number;
  predicted: number;
  lastActual: number;
  deltaPct: number;
  trend: "naik" | "turun" | "stabil";
  rawanKecamatan: { nama: string; total: number } | null;
  totalPrediksi: number;
}

export function analyzeForecast(
  payload: HistorisPayload,
  jenis: JenisBencana,
  kecamatan: string | "ALL",
  range?: [number, number]
): ForecastAnalysis | null {
  const series = buildSeries(payload, jenis, kecamatan, range);
  if (series.length === 0) return null;
  const enriched = smaForecast(series);
  const fcPoint = enriched[enriched.length - 1];
  const lastActual = series[series.length - 1].value;
  const predicted = fcPoint.forecast ?? 0;
  const deltaPct = lastActual === 0 ? 0 : ((predicted - lastActual) / lastActual) * 100;
  const trend: ForecastAnalysis["trend"] =
    Math.abs(deltaPct) < 2 ? "stabil" : deltaPct > 0 ? "naik" : "turun";

  // kecamatan paling rawan (rata-rata pada range, jenis ini)
  const [lo, hi] = range ?? [payload.years[0], payload.years[payload.years.length - 1]];
  const perKec = payload.kecamatan.map((k) => {
    const rows = payload.records.filter(
      (r) => r.kecamatan === k && r.tahun >= lo && r.tahun <= hi
    );
    const total = rows.reduce((s, r) => s + (r[jenis] ?? 0), 0);
    return { nama: k, total };
  });
  perKec.sort((a, b) => b.total - a.total);
  return {
    nextYear: fcPoint.tahun,
    predicted,
    lastActual,
    deltaPct,
    trend,
    rawanKecamatan: perKec[0] ?? null,
    totalPrediksi: predicted,
  };
}
