import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { BekasiMap, type DisasterFilter, type ForecastMapData } from "@/components/BekasiMap";
import { MapLegend } from "@/components/MapLegend";
import { Layers, Search, Download, FileText, Map as MapIcon, AlertCircle } from "lucide-react";
import { api } from "@/services/api";

export const Route = createFileRoute("/peta")({
    head: () => ({ meta: [{ title: "Peta — SIG Bencana Kabupaten Bekasi" }] }),
    component: MapPage,
});

// ─── Konstanta ────────────────────────────────────────────────────────────────
const FILTER_LABELS: { key: DisasterFilter; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "banjir", label: "Banjir" },
    { key: "longsor", label: "Longsor" },
    { key: "gempa", label: "Gempa" },
];

// Menggunakan null untuk 'all' agar bisa di-handle di useEffect
const FILTER_TO_JENIS: Record<DisasterFilter, string | null> = {
    all: null,
    banjir: "Banjir",
    longsor: "Longsor",
    gempa: "Gempa",
    kekeringan: "Kekeringan",
};

// ─── Helper ───────────────────────────────────────────────────────────────────
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

// ─── Halaman Utama ────────────────────────────────────────────────────────────
function MapPage() {
    const [filter, setFilter] = useState<DisasterFilter>("all");
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState<ForecastMapData | null>(null);
    const [kecamatanList, setKecamatanList] = useState<ForecastMapData[]>([]);
    const [apiError, setApiError] = useState(false);

    // Ambil data sidebar
    useEffect(() => {
        const jenis = FILTER_TO_JENIS[filter];
        const params = jenis ? { jenis_bencana: jenis } : {};

        api
            .get<ForecastMapData[]>("/forecast-map", { params })
            .then((r) => {
                const clean = (r.data ?? []).map((d) => ({
                    ...d,
                    forecast: safeVal(d.forecast),
                }));
                setKecamatanList(clean);
                setApiError(false);
            })
            .catch(() => setApiError(true));
    }, [filter]);

    useEffect(() => { setSelected(null); }, [filter]);

    const filtered = kecamatanList.filter((k) =>
        (k.nama_kecamatan ?? "").toLowerCase().includes(q.toLowerCase())
    );

    const ranking = [...kecamatanList]
        .sort((a, b) => safeVal(b.forecast) - safeVal(a.forecast))
        .slice(0, 5);

    const activeLabel = FILTER_LABELS.find((f) => f.key === filter)?.label ?? "Semua";

    return (
        <div className="min-h-screen flex flex-col">
            <PublicNavbar />
            <div className="flex-1 grid grid-cols-12 gap-3 p-3 lg:p-4">
                {/* LEFT PANEL */}
                <aside className="col-span-12 lg:col-span-3 rounded-2xl bg-navy-deep text-white p-5 space-y-5 shadow-xl">
                    <div>
                        <div className="text-[11px] uppercase tracking-widest text-white/50">Panel Kontrol</div>
                        <h2 className="font-display font-bold text-xl mt-1">Peta Bencana</h2>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
                            <Layers className="h-4 w-4" /> Filter Jenis
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {FILTER_LABELS.map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${filter === f.key ? "bg-orange text-white" : "bg-white/5 hover:bg-white/10"
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Cari kecamatan..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky"
                            />
                        </div>
                        <div className="mt-3 max-h-[280px] overflow-auto pr-1 space-y-1 scrollbar-thin">
                            {apiError && <div className="text-xs text-white/60 py-2">Gagal memuat data.</div>}
                            {filtered.map((k) => (
                                <button
                                    key={k.kecamatan_id}
                                    onClick={() => setSelected(k)}
                                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm ${selected?.kecamatan_id === k.kecamatan_id ? "bg-orange/20 ring-1 ring-orange" : "hover:bg-white/5"
                                        }`}
                                >
                                    <span className="truncate text-left">{k.nama_kecamatan}</span>
                                    <span className="text-[11px] text-white/60 ml-2">{safeVal(k.forecast).toFixed(1)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* MAP */}
                <main className="col-span-12 lg:col-span-6 premium-card p-3 min-h-[600px] flex flex-col">
                    <BekasiMap
                        height="calc(100vh - 180px)"
                        filter={filter}
                        jenisBencana={FILTER_TO_JENIS[filter] ?? undefined}
                        onSelect={setSelected}
                        selectedId={selected?.kecamatan_id ?? null}
                    />
                    <MapLegend filter={filter} />
                </main>

                {/* RIGHT PANEL */}
                <aside className="col-span-12 lg:col-span-3 space-y-3">
                    <div className="premium-card p-5">
                        <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Detail Wilayah</div>
                        {selected ? (
                            <>
                                <div className="font-display font-bold text-2xl text-navy mt-1">{selected.nama_kecamatan}</div>
                                <div className="mt-2"><RiskBadge risk={getForecastRisk(selected.forecast)} /></div>
                                <div className="rounded-xl bg-milk-dark/50 p-3 text-center mt-4">
                                    <div className="text-3xl font-bold font-display text-sky">{safeVal(selected.forecast).toFixed(2)}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Forecast SMA ({activeLabel})</div>
                                </div>
                            </>
                        ) : (
                            <div className="mt-3 py-8 text-center text-muted-foreground"><MapIcon className="h-10 w-10 mx-auto opacity-30 mb-2" />Pilih kecamatan</div>
                        )}
                    </div>

                    <div className="premium-card p-5">
                        <h4 className="font-semibold text-navy mb-3">Ranking Risiko — {activeLabel}</h4>
                        <ol className="space-y-2 text-sm">
                            {ranking.map((k, i) => (
                                <li key={k.kecamatan_id} className="flex items-center justify-between">
                                    <span className="flex items-center gap-2"><span className="text-xs font-bold w-4">{i + 1}</span>{k.nama_kecamatan}</span>
                                    <RiskBadge risk={getForecastRisk(k.forecast)} />
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="premium-card p-5">
                        <h4 className="font-semibold text-navy mb-4 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange" />
                            Top Desa Dengan {filter == 'all' ? 'Bencana' : filter} Terbanyak
                        </h4>
                        <div className="space-y-4">
                            {[...kecamatanList]
                                .sort((a, b) => safeVal(b.total_desa_terdampak) - safeVal(a.total_desa_terdampak))
                                .slice(0, 5)
                                .map((k, i) => {
                                    const val = safeVal(k.total_desa_terdampak);
                                    const max = safeVal(kecamatanList[0]?.total_desa_terdampak || 1);
                                    const pct = (val / max) * 100;

                                    return (
                                        <div key={k.kecamatan_id} className="group">
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="flex items-center gap-2 font-medium text-navy">
                                                    <span className="text-[10px] bg-navy/10 text-navy w-5 h-5 flex items-center justify-center rounded-full font-bold">
                                                        {i + 1}
                                                    </span>
                                                    {k.nama_kecamatan}
                                                </span>
                                                <span className="font-bold text-navy text-xs bg-milk-dark/50 px-2 py-0.5 rounded">
                                                    {val.toFixed(0)}
                                                </span>
                                            </div>
                                            {/* Bar Indicator */}
                                            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-sky transition-all duration-500 ease-out"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    );
}
