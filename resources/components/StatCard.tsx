import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  accent?: "navy" | "sky" | "orange" | "success";
  delta?: string;
}

const accentMap = {
  navy: "from-navy to-navy-deep",
  sky: "from-sky to-navy",
  orange: "from-orange to-[#a8401e]",
  success: "from-[#4a8a5e] to-[#2f6b46]",
} as const;

export function StatCard({ label, value, hint, icon, accent = "navy", delta }: Props) {
  return (
    <div className="premium-card p-5 group relative overflow-hidden animate-[fade-in_0.5s_ease-out]">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-[0.08] group-hover:opacity-[0.15] transition-opacity" style={{ backgroundImage: `var(--tw-gradient-stops)` }} />
      <div className="flex items-start justify-between">
        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${accentMap[accent]} text-white grid place-items-center shadow-lg`}>
          {icon}
        </div>
        {delta && (
          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-success bg-success/10 px-2 py-1 rounded-full">
            <ArrowUpRight className="h-3 w-3" /> {delta}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="stat-number text-navy">{value}</div>
        <div className="text-sm font-medium text-foreground mt-1">{label}</div>
        {hint && <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}
