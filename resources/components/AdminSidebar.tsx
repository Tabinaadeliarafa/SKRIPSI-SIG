import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Map, Database, Droplets, Mountain, Activity, Layers, Microscope, BarChart3, FileDown, Settings, ShieldCheck } from "lucide-react";

const groups = [
  {
    label: "Menu Utama",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/peta", label: "Peta", icon: Map },
    ],
  },
  {
    label: "Manajemen Data",
    items: [
      { to: "/admin/dashboard", label: "Data Bencana", icon: Database },
      { to: "/admin/form", label: "Data Banjir", icon: Droplets },
      { to: "/admin/form", label: "Data Longsor", icon: Mountain },
      { to: "/admin/form", label: "Data Gempa", icon: Activity },
    ],
  },
  {
    label: "Data Spasial",
    items: [
      { to: "/admin/dashboard", label: "Layer QGIS", icon: Layers },
      { to: "/admin/visualisasi", label: "Analisis", icon: Microscope },
    ],
  },
  {
    label: "Laporan",
    items: [
      { to: "/admin/visualisasi", label: "Statistik", icon: BarChart3 },
      { to: "/laporan", label: "Export", icon: FileDown },
    ],
  },
] as const;

export function AdminSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-navy-deep text-white shrink-0 sticky top-0 h-screen">
      <div className="px-6 h-16 flex items-center gap-2 border-b border-white/10">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange to-[#a8401e] grid place-items-center shadow-md">
          <ShieldCheck className="h-4.5 w-4.5" />
        </div>
        <div className="leading-tight">
          <div className="font-display font-bold">SIG BKS</div>
          <div className="text-[10px] uppercase tracking-widest text-white/50">Admin Panel</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="px-3 mb-1.5 text-[10px] uppercase tracking-widest text-white/40 font-semibold">{g.label}</div>
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = path === it.to;
                return (
                  <li key={it.label}>
                    <Link to={it.to} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? "bg-orange text-white shadow" : "text-white/75 hover:bg-white/5 hover:text-white"}`}>
                      <it.icon className="h-4 w-4" /> {it.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/75 hover:bg-white/5">
          <Settings className="h-4 w-4" /> Pengaturan
        </Link>
      </div>
    </aside>
  );
}
