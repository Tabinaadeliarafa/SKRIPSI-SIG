import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Map,
  Database,
  FilePen,
  BarChart3,
  FileDown,
  Settings,
  ShieldCheck,
} from "lucide-react";

const groups = [
  {
    label: "Menu Utama",
    items: [
      { to: "/admin/dashboard", label: "Dashboard",  icon: LayoutDashboard },
      { to: "/admin/peta",      label: "Peta",        icon: Map             },
    ],
  },
  {
    label: "Manajemen Data",
    items: [
      { to: "/admin/bencana", label: "Data Bencana",        icon: Database },
      { to: "/admin/form",    label: "Tambah/Edit Bencana",  icon: FilePen  },
    ],
  },
  {
    label: "Analisis & Laporan",
    items: [
      { to: "/admin/analisis", label: "Statistik & Analisis", icon: BarChart3 },
      { to: "/admin/export",   label: "Export Data",           icon: FileDown  },
    ],
  },
] as const;

export function AdminSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) =>
    path === to || (to !== "/admin/dashboard" && path.startsWith(to));

  return (
    // Diperlebar: w-72 (288px) dari sebelumnya w-64 (256px)
    <aside className="hidden lg:flex flex-col w-72 bg-navy-deep text-white shrink-0 sticky top-0 h-screen">

      {/* Logo */}
      <div className="px-7 h-16 flex items-center gap-3 border-b border-white/10">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange to-[#a8401e] grid place-items-center shadow-md shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="font-display font-bold text-base">SIG BKS</div>
          <div className="text-[11px] uppercase tracking-widest text-white/50">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {groups.map((g) => (
          <div key={g.label}>
            {/* Label grup — lebih besar */}
            <div className="px-3 mb-2 text-[11px] uppercase tracking-widest text-white/40 font-bold">
              {g.label}
            </div>
            <ul className="space-y-1">
              {g.items.map((it) => {
                const active = isActive(it.to);
                return (
                  <li key={it.label}>
                    <Link
                      to={it.to}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition ${
                        active
                          ? "bg-orange text-white shadow-md"
                          : "text-white/75 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <it.icon className="h-[18px] w-[18px] shrink-0" />
                      {it.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <Link
          to="/admin/dashboard"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-white/70 hover:bg-white/8 hover:text-white transition"
        >
          <Settings className="h-[18px] w-[18px]" />
          Pengaturan
        </Link>
      </div>
    </aside>
  );
}