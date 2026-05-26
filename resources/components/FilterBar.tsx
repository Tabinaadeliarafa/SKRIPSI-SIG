import type { DisasterFilter } from "@/services/types";
import { Layers, Filter } from "lucide-react";

interface Props {
  filter: DisasterFilter;
  onChange: (f: DisasterFilter) => void;
  tahun: number;
  onTahunChange: (t: number) => void;
  years?: number[];
}

const TIPES: { key: DisasterFilter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "banjir", label: "Banjir" },
  { key: "longsor", label: "Longsor" },
  { key: "gempa", label: "Gempa" },
];

export function FilterBar({ filter, onChange, tahun, onTahunChange, years = [2020, 2021, 2022, 2023, 2024, 2025] }: Props) {
  return (
    <div className="premium-card p-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-navy">
        <Filter className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Filter</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {TIPES.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === t.key ? "bg-orange text-white shadow" : "bg-milk-dark/60 text-navy hover:bg-milk-dark"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Layers className="h-4 w-4 text-muted-foreground" />
        <select
          value={tahun}
          onChange={(e) => onTahunChange(Number(e.target.value))}
          className="rounded-full bg-white border border-border text-sm font-semibold text-navy px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              Tahun {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
