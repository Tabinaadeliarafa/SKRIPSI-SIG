import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { BekasiMap, type DisasterFilter, type ForecastMapData } from "@/components/BekasiMap";
import { MapLegend } from "@/components/MapLegend";
import {
  Layers,
  Search,
  Download,
  FileText,
  Map as MapIcon,
  AlertCircle,
} from "lucide-react";
import { api } from "@/services/api";

export const Route = createFileRoute("/peta")({
  head: () => ({ meta: [{ title: "Peta — SIG Bencana Kabupaten Bekasi" }] }),
  component: MapPage,
});

// ─── Konstanta ────────────────────────────────────────────────────────────────
const FILTER_LABELS: { key: DisasterFilter; label: string }[] = [
  { key: "all",     label: "Semua"   },
  { key: "banjir",  label: "Banjir"  },
  { key: "longsor", label: "Longsor" },
  { key: "gempa",   label: "Gempa"   },
];

const FILTER_TO_JENIS: Record<DisasterFilter, string> = {
  all:        "Banjir",
  banjir:     "Banjir",
  longsor:    "Longsor",
  gempa:      "Gempa",
  kekeringan: "Kekeringan",
};

// ─── Helper: nilai forecast yang aman ─────────────────────────────────────────
function safeVal(forecast: unknown): number {
  const n = Number(forecast);
  return isNaN(n) ? 0 : n;
}

function getForecastRisk(forecast: unknown): "Tinggi" | "Sedang" | "Rendah" {
  const v = safeVal(forecast);
  if (v >= 8) return "Tinggi";
  if (v >= 4) return "Sedang";
  return "Rendah";
}

// ─── Komponen badge risiko ────────────────────────────────────────────────────
function RiskBadge({ risk }: { risk: string }) {
  const cfg =
    risk === "Tinggi" ? "bg-red-100 text-red-700 border-red-200"
    : risk === "Sedang" ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-green-100 text-green-700 border-green-200";

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg}`}>
      {risk}
    </span>
  );
}

// ─── Halaman utama ────────────────────────────────────────────────────────────
function MapPage() {
  const [filter,        setFilter       ] = useState<DisasterFilter>("all");
  const [q,             setQ            ] = useState("");
  const [selected,      setSelected     ] = useState<ForecastMapData | null>(null);
  const [kecamatanList, setKecamatanList] = useState<ForecastMapData[]>([]);
  const [apiError,      setApiError     ] = useState(false);

  // Ambil data sidebar dari API (sama sumber dengan BekasiMap)
  useEffect(() => {
    const jenis = FILTER_TO_JENIS[filter];
    api
      .get<ForecastMapData[]>("/forecast-map", { params: { jenis_bencana: jenis } })
      .then((r) => {
        // Sanitasi: pastikan forecast selalu number
        const clean = (r.data ?? []).map((d) => ({
          ...d,
          forecast: safeVal(d.forecast),
        }));
        setKecamatanList(clean);
        setApiError(false);
      })
      .catch(() => setApiError(true));
  }, [filter]);

  // Reset selected saat filter berubah agar tidak mismatch data lama
  useEffect(() => {
    setSelected(null);
  }, [filter]);

  const filtered = kecamatanList.filter((k) =>
    (k.nama_kecamatan ?? "").toLowerCase().includes(q.toLowerCase())
  );

  const ranking = [...kecamatanList]
    .sort((a, b) => safeVal(b.forecast) - safeVal(a.forecast))
    .slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />

      <div className="flex-1 grid grid-cols-12 gap-3 p-3 lg:p-4">

        {/* ── LEFT DARK PANEL ───────────────────────────────────────────── */}
        <aside className="col-span-12 lg:col-span-3 rounded-2xl bg-navy-deep text-white p-5 space-y-5 shadow-xl">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/50">
              Panel Kontrol
            </div>
            <h2 className="font-display font-bold text-xl mt-1">Peta Bencana</h2>
          </div>

          {/* Filter jenis bencana */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
              <Layers className="h-4 w-4" /> Filter Jenis
            </div>
            <div className="grid grid-cols-2 gap-2">
              {FILTER_LABELS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    filter === f.key
                      ? "bg-orange text-white"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pencarian kecamatan */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari kecamatan..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm
                           placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky"
              />
            </div>

            <div className="mt-3 max-h-[280px] overflow-auto pr-1 space-y-1 scrollbar-thin">
              {apiError && (
                <div className="flex items-center gap-2 text-xs text-white/60 py-2">
                  <AlertCircle className="h-3.5 w-3.5" /> Gagal memuat data API
                </div>
              )}
              {filtered.map((k) => (
                <button
                  key={k.kecamatan_id}
                  onClick={() => setSelected(k)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                    selected?.kecamatan_id === k.kecamatan_id
                      ? "bg-orange/20 ring-1 ring-orange"
                      : "hover:bg-white/5"
                  }`}
                >
                  <span className="truncate text-left">{k.nama_kecamatan}</span>
                  {/* safeVal().toFixed() → tidak pernah crash */}
                  <span className="text-[11px] text-white/60 ml-2 flex-shrink-0">
                    {safeVal(k.forecast).toFixed(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── CENTER MAP ────────────────────────────────────────────────── */}
        <main className="col-span-12 lg:col-span-6 premium-card p-3 min-h-[600px] flex flex-col">
          <BekasiMap
            height="calc(100vh - 180px)"
            filter={filter}
            onSelect={setSelected}
            selectedId={selected?.kecamatan_id ?? null}
          />
          <MapLegend filter={filter} />
        </main>

        {/* ── RIGHT PANEL ───────────────────────────────────────────────── */}
        <aside className="col-span-12 lg:col-span-3 space-y-3">

          {/* Detail wilayah terpilih */}
          <div className="premium-card p-5">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
              Detail Wilayah
            </div>

            {selected ? (
              <>
                <div className="font-display font-bold text-2xl text-navy mt-1">
                  {selected.nama_kecamatan}
                </div>

                <div className="mt-2">
                  <RiskBadge risk={getForecastRisk(selected.forecast)} />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="rounded-xl bg-milk-dark/50 p-3 text-center col-span-2">
                    {/* safeVal().toFixed() → aman dari crash */}
                    <div className="text-3xl font-bold font-display text-sky">
                      {safeVal(selected.forecast).toFixed(2)}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                      Forecast SMA ({FILTER_TO_JENIS[filter]})
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tahun Prediksi</span>
                    <span className="font-semibold">{selected.tahun_prediksi ?? "-"}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-3 flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                <MapIcon className="h-10 w-10 opacity-30 mb-2" />
                <p className="text-sm">Pilih kecamatan pada peta</p>
              </div>
            )}
          </div>

          {/* Ranking 5 risiko tertinggi */}
          <div className="premium-card p-5">
            <h4 className="font-semibold text-navy mb-3">
              Ranking Risiko — {FILTER_TO_JENIS[filter]}
            </h4>
            {ranking.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                {apiError ? "Gagal memuat data." : "Memuat data..."}
              </p>
            ) : (
              <ol className="space-y-2 text-sm">
                {ranking.map((k, i) => (
                  <li key={k.kecamatan_id} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-4">
                        {i + 1}
                      </span>
                      <span className="truncate">{k.nama_kecamatan}</span>
                    </span>
                    <RiskBadge risk={getForecastRisk(k.forecast)} />
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Tombol export */}
          <div className="premium-card p-5 space-y-2">
            <button className="w-full flex items-center justify-between rounded-lg bg-milk-dark/60 hover:bg-milk-dark px-3 py-2 text-sm font-medium">
              <span>Export CSV</span>
              <Download className="h-4 w-4" />
            </button>
            <button className="w-full flex items-center justify-between rounded-lg bg-navy text-white px-3 py-2 text-sm font-medium hover:bg-navy-deep">
              <span>Export PDF</span>
              <FileText className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
