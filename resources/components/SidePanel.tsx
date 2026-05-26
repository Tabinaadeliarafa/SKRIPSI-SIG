import { RiskChip } from "./RiskChip";
import type { RingkasanKecamatan } from "@/services/types";
import { MapPin, TrendingUp } from "lucide-react";

interface Props {
  selected: RingkasanKecamatan | null;
  ranking: RingkasanKecamatan[];
}

export function SidePanel({ selected, ranking }: Props) {
  return (
    <div className="space-y-3">
      <div className="premium-card p-5 animate-[fade-in_0.3s_ease-out]">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
          Detail Wilayah
        </div>
        {selected ? (
          <>
            <div className="font-display font-bold text-2xl text-navy mt-1">{selected.nama_kecamatan}</div>
            <div className="mt-2">
              <RiskChip risk={selected.risiko} size="md" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                ["Banjir", selected.banjir, "text-sky"],
                ["Longsor", selected.longsor, "text-orange"],
                ["Gempa", selected.gempa, "text-foreground"],
              ].map(([l, v, c]) => (
                <div key={l as string} className="rounded-xl bg-milk-dark/50 p-3 text-center">
                  <div className={`text-2xl font-bold font-display ${c}`}>{v as number}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total kejadian</span>
                <span className="font-semibold">{selected.total}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-3 flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
            <MapPin className="h-10 w-10 opacity-30 mb-2" />
            <p className="text-sm">Klik polygon kecamatan pada peta</p>
          </div>
        )}
      </div>

      <div className="premium-card p-5">
        <h4 className="font-semibold text-navy mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-orange" /> Ranking Risiko
        </h4>
        <ol className="space-y-2 text-sm">
          {ranking.slice(0, 5).map((k, i) => (
            <li key={k.kecamatan_id} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                {k.nama_kecamatan}
              </span>
              <RiskChip risk={k.risiko} />
            </li>
          ))}
          {ranking.length === 0 && (
            <li className="text-xs text-muted-foreground italic">Belum ada data</li>
          )}
        </ol>
      </div>
    </div>
  );
}
