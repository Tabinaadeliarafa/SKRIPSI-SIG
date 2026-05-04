import type { Risk } from "@/data/bencana";

const styles: Record<Risk, string> = {
  Tinggi: "bg-orange/15 text-orange border-orange/30",
  Sedang: "bg-warning/20 text-[#7a5510] border-warning/40",
  Rendah: "bg-sky/15 text-sky border-sky/30",
  Aman: "bg-success/15 text-success border-success/30",
};

export function RiskChip({ risk, size = "sm" }: { risk: Risk; size?: "sm" | "md" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${styles[risk]} ${size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {risk}
    </span>
  );
}
