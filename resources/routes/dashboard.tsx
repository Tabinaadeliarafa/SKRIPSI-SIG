import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { MapDashboard } from "@/components/MapDashboard";
import { FilterBar } from "@/components/FilterBar";
import { MapLegend } from "@/components/MapLegend";
import { SidePanel } from "@/components/SidePanel";
import { StatsCard } from "@/components/StatsCard";
import { useRingkasan, useDashboardStats } from "@/hooks/use-Bencana";
import type { DisasterFilter, RingkasanKecamatan } from "@/services/types";
import { Building2, Droplets, Mountain, Activity, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard SIG — SIG Bencana Kabupaten Bekasi" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const [filter, setFilter] = useState<DisasterFilter>("all");
  const [tahun, setTahun] = useState<number>(2025);
  const [selectedNama, setSelectedNama] = useState<string | null>(null);

  // Mengambil data dari API melalui hooks React Query
  const { data: ringkasanApi = [], isError: ringkasanErr, isLoading } = useRingkasan(tahun);
  const { data: statsApi, isError: statsErr } = useDashboardStats();

  // Data ringkasan sekarang murni dari API
  const ringkasan = useMemo(() => ringkasanApi, [ringkasanApi]);

  const filtered = useMemo(() => {
    if (filter === "all") return ringkasan;
    return ringkasan.map((r) => ({
      ...r,
      total: filter === "banjir" ? r.banjir : filter === "longsor" ? r.longsor : r.gempa,
    }));
  }, [ringkasan, filter]);

  const ranking = useMemo(
    () => [...ringkasan].sort((a, b) => b.total - a.total),
    [ringkasan]
  );

  // Jika statsApi belum ada, tampilkan 0 atau loading state
  const stats = statsApi ?? {
    total_kecamatan: ringkasan.length,
    total_kejadian: ringkasan.reduce((s, r) => s + (r.total || 0), 0),
    total_banjir: ringkasan.reduce((s, r) => s + (r.banjir || 0), 0),
    total_longsor: ringkasan.reduce((s, r) => s + (r.longsor || 0), 0),
    total_gempa: ringkasan.reduce((s, r) => s + (r.gempa || 0), 0),
  };

  const selected = useMemo(
    () => (selectedNama ? ringkasan.find((r) => r.nama_kecamatan.toLowerCase() === selectedNama.toLowerCase()) ?? null : null),
    [selectedNama, ringkasan]
  );

  const isOffline = ringkasanErr || statsErr;

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1 p-3 lg:p-5 space-y-4">
        {isOffline && (
          <div className="premium-card p-3 flex items-start gap-3 border-l-4 border-orange">
            <AlertCircle className="h-5 w-5 text-orange mt-0.5" />
            <div className="text-sm">
              <b className="text-navy">Peringatan:</b> Gagal memuat data dari server.
              Pastikan API Laravel berjalan di <code className="px-1 rounded bg-milk-dark/60">{import.meta.env.VITE_API_BASE_URL ?? "/api"}</code>.
            </div>
          </div>
        )}

        <FilterBar filter={filter} onChange={setFilter} tahun={tahun} onTahunChange={setTahun} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Kecamatan" value={stats.total_kecamatan} icon={<Building2 className="h-5 w-5" />} accent="navy" />
          <StatsCard label="Banjir" value={stats.total_banjir} icon={<Droplets className="h-5 w-5" />} accent="sky" />
          <StatsCard label="Longsor" value={stats.total_longsor} icon={<Mountain className="h-5 w-5" />} accent="orange" />
          <StatsCard label="Gempa" value={stats.total_gempa} icon={<Activity className="h-5 w-5" />} accent="success" />
        </div>

        <div className="grid grid-cols-12 gap-4">
          <section className="col-span-12 lg:col-span-9 premium-card p-3">
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <h2 className="font-display font-bold text-navy">Peta Sebaran Bencana</h2>
              <span className="text-xs text-muted-foreground">
                {isLoading ? "Memuat data..." : `${filtered.length} kecamatan • Tahun ${tahun}`}
              </span>
            </div>
            <MapDashboard
              height="calc(100vh - 320px)"
              ringkasan={filtered}
              selectedNama={selectedNama}
              onSelect={setSelectedNama}
              filter={filter}
              tahun={tahun}
            />
            <MapLegend filter={filter} />
          </section>
          <aside className="col-span-12 lg:col-span-3">
            <SidePanel selected={selected} ranking={ranking} />
          </aside>
        </div>
      </main>
    </div>
  );
}
