import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { BekasiMap } from "@/components/BekasiMap";
import { RiskChip } from "@/components/RiskChip";
import { KECAMATAN, getRisk, totalDesa, type KecamatanData } from "@/data/bencana";
import { Layers, Search, Download, FileText, Map as MapIcon } from "lucide-react";

export const Route = createFileRoute("/peta")({
  head: () => ({ meta: [{ title: "Peta — SIG Bencana Kabupaten Bekasi" }] }),
  component: MapPage,
});

function MapPage() {
  const [filter, setFilter] = useState<"all" | "banjir" | "longsor" | "gempa">("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<KecamatanData | null>(null);
  const [layers, setLayers] = useState({ banjir: true, longsor: true, gempa: true });

  const filtered = KECAMATAN.filter((k) => k.nama.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <div className="flex-1 grid grid-cols-12 gap-3 p-3 lg:p-4">
        {/* LEFT DARK PANEL */}
        <aside className="col-span-12 lg:col-span-3 rounded-2xl bg-navy-deep text-white p-5 space-y-5 shadow-xl">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-white/50">Panel Kontrol</div>
            <h2 className="font-display font-bold text-xl mt-1">Peta Bencana</h2>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold"><Layers className="h-4 w-4" /> Layer</div>
            <div className="space-y-2">
              {(["banjir","longsor","gempa"] as const).map((k) => (
                <label key={k} className="flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/10 px-3 py-2 cursor-pointer transition">
                  <span className="text-sm capitalize">{k}</span>
                  <input type="checkbox" checked={layers[k]} onChange={(e) => setLayers({ ...layers, [k]: e.target.checked })} className="accent-[var(--orange)]" />
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">Filter Tipe</div>
            <div className="grid grid-cols-2 gap-2">
              {(["all","banjir","longsor","gempa"] as const).map((k) => (
                <button key={k} onClick={() => setFilter(k)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition ${filter === k ? "bg-orange text-white" : "bg-white/5 hover:bg-white/10"}`}>{k === "all" ? "Semua" : k}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kecamatan..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky" />
            </div>
            <div className="mt-3 max-h-[280px] overflow-auto pr-1 space-y-1 scrollbar-thin">
              {filtered.map((k) => (
                <button key={k.id} onClick={() => setSelected(k)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${selected?.id === k.id ? "bg-orange/20 ring-1 ring-orange" : "hover:bg-white/5"}`}>
                  <span>{k.nama}</span>
                  <span className="text-[11px] text-white/60">{totalDesa(k)} desa</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER MAP */}
        <main className="col-span-12 lg:col-span-6 premium-card p-3 min-h-[600px]">
          <BekasiMap height="calc(100vh - 140px)" filter={filter} onSelect={setSelected} selectedId={selected?.id ?? null} />
        </main>

        {/* RIGHT LIGHT PANEL */}
        <aside className="col-span-12 lg:col-span-3 space-y-3">
          <div className="premium-card p-5">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Detail Wilayah</div>
            {selected ? (
              <>
                <div className="font-display font-bold text-2xl text-navy mt-1">{selected.nama}</div>
                <div className="mt-2"><RiskChip risk={getRisk(selected)} size="md" /></div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[["Banjir", selected.banjir, "text-sky"],["Longsor", selected.longsor, "text-orange"],["Gempa", selected.gempa, "text-foreground"]].map(([l, v, c]) => (
                    <div key={l as string} className="rounded-xl bg-milk-dark/50 p-3 text-center">
                      <div className={`text-2xl font-bold font-display ${c}`}>{v}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total desa</span><span className="font-semibold">{selected.desa}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Koordinat</span><span className="font-mono">{selected.lat.toFixed(3)}, {selected.lng.toFixed(3)}</span></div>
                </div>
              </>
            ) : (
              <div className="mt-3 flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                <MapIcon className="h-10 w-10 opacity-30 mb-2" />
                <p className="text-sm">Pilih kecamatan pada peta</p>
              </div>
            )}
          </div>

          <div className="premium-card p-5">
            <h4 className="font-semibold text-navy mb-3">Ranking Risiko</h4>
            <ol className="space-y-2 text-sm">
              {[...KECAMATAN].sort((a, b) => totalDesa(b) - totalDesa(a)).slice(0, 5).map((k, i) => (
                <li key={k.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>{k.nama}</span>
                  <RiskChip risk={getRisk(k)} />
                </li>
              ))}
            </ol>
          </div>

          <div className="premium-card p-5 space-y-2">
            <button className="w-full flex items-center justify-between rounded-lg bg-milk-dark/60 hover:bg-milk-dark px-3 py-2 text-sm font-medium"><span>Export CSV</span><Download className="h-4 w-4" /></button>
            <button className="w-full flex items-center justify-between rounded-lg bg-navy text-white px-3 py-2 text-sm font-medium hover:bg-navy-deep"><span>Export PDF</span><FileText className="h-4 w-4" /></button>
          </div>
        </aside>
      </div>
    </div>
  );
}
