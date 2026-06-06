import type { DisasterFilter } from "@/services/types";

interface Props {
  filter?: DisasterFilter;
  jenisBencana?: string;
}

const LEGEND_CONFIG: Record<
  string,
  { label: string; levels: { color: string; text: string }[] }
> = {
  all: {
    label: "Tingkat Risiko (Gabungan)",
    levels: [
      { color: "#dc2626", text: "Tinggi (≥ 8 kejadian)" },
      { color: "#f59e0b", text: "Sedang (4 – 7 kejadian)" },
      { color: "#22c55e", text: "Rendah (< 4 kejadian)" },
      { color: "#e2e8f0", text: "Tidak ada data" },
    ],
  },
  banjir: {
    label: "Risiko Banjir",
    levels: [
      { color: "#1d4ed8", text: "Tinggi" },
      { color: "#3b82f6", text: "Sedang" },
      { color: "#93c5fd", text: "Rendah" },
      { color: "#e2e8f0", text: "Tidak ada data" },
    ],
  },
  longsor: {
    label: "Risiko Longsor",
    levels: [
      { color: "#78350f", text: "Tinggi" },
      { color: "#b45309", text: "Sedang" },
      { color: "#d97706", text: "Rendah" },
      { color: "#e2e8f0", text: "Tidak ada data" },
    ],
  },
  gempa: {
    label: "Risiko Gempa",
    levels: [
      { color: "#14532d", text: "Tinggi" },
      { color: "#16a34a", text: "Sedang" },
      { color: "#4ade80", text: "Rendah" },
      { color: "#e2e8f0", text: "Tidak ada data" },
    ],
  },
  kekeringan: {
    label: "Risiko Kekeringan",
    levels: [
      { color: "#713f12", text: "Tinggi" },
      { color: "#ca8a04", text: "Sedang" },
      { color: "#fde047", text: "Rendah" },
      { color: "#e2e8f0", text: "Tidak ada data" },
    ],
  },
};

export function MapLegend({ filter = "all" }: Props) {
  const config = LEGEND_CONFIG[filter] ?? LEGEND_CONFIG["all"];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 mt-2">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        {config.label}:
      </span>
      <div className="flex flex-wrap gap-3">
        {config.levels.map((lvl) => (
          <div key={lvl.text} className="flex items-center gap-1.5">
            <span
              style={{ background: lvl.color }}
              className="inline-block w-3.5 h-3.5 rounded-sm border border-white shadow-sm flex-shrink-0"
            />
            <span className="text-[11px] text-muted-foreground">{lvl.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
