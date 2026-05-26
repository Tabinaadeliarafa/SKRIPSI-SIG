import type { DisasterFilter } from "@/services/types";

const ITEMS = [
  { key: "banjir", label: "Banjir", color: "#2d6ca8" },
  { key: "longsor", label: "Longsor", color: "#7a4a2a" },
  { key: "gempa", label: "Gempa", color: "#4a8a5e" },
  { key: "kekeringan", label: "Kekeringan", color: "#e8b84a" },
] as const;

const LEVELS = [
  { label: "Aman", color: "#9aa7b3", opacity: 0.25 },
  { label: "Rendah", color: "#4a8a5e", opacity: 0.45 },
  { label: "Sedang", color: "#e8a23a", opacity: 0.65 },
  { label: "Tinggi", color: "#c0522a", opacity: 0.85 },
];

export function MapLegend({ filter }: { filter: DisasterFilter }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-4 px-2 py-2 text-[11px] text-navy/80">
      <div className="flex items-center gap-2">
        <span className="font-bold uppercase tracking-wider text-navy">Jenis</span>
        {ITEMS.map((i) => (
          <span key={i.key} className="inline-flex items-center gap-1.5">
            <i className="inline-block h-3 w-3 rounded-sm border border-black/10" style={{ background: i.color, opacity: filter === "all" || filter === i.key ? 1 : 0.25 }} />
            {i.label}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold uppercase tracking-wider text-navy">Tingkat Bahaya</span>
        {LEVELS.map((l) => (
          <span key={l.label} className="inline-flex items-center gap-1.5">
            <i className="inline-block h-3 w-3 rounded-sm border border-black/10" style={{ background: l.color, opacity: l.opacity }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
