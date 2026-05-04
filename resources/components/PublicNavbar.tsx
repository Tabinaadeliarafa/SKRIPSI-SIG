import { Link, useRouterState } from "@tanstack/react-router";
import { Map as MapIcon, BarChart3, FileText, Home, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Beranda", icon: Home },
  { to: "/peta", label: "Peta", icon: MapIcon },
  { to: "/visualisasi", label: "Visualisasi", icon: BarChart3 },
  { to: "/laporan", label: "Laporan", icon: FileText },
] as const;

export function PublicNavbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-navy to-sky grid place-items-center text-white shadow-md group-hover:scale-105 transition-transform">
            <MapIcon className="h-4.5 w-4.5" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-navy tracking-tight">SIG BKS</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Bencana Bekasi</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <Link key={l.to} to={l.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active ? "bg-navy text-white shadow-md" : "text-foreground/70 hover:bg-milk-dark hover:text-navy"}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/admin/login"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-sm font-semibold text-white shadow-md hover:brightness-110 hover:-translate-y-0.5 transition-all">
            <LogIn className="h-4 w-4" /> Login Admin
          </Link>
          <button onClick={() => setOpen((v) => !v)} className="md:hidden p-2 rounded-lg hover:bg-milk-dark">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background px-4 py-3 space-y-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-milk-dark">
              {l.label}
            </Link>
          ))}
          <Link to="/admin/login" onClick={() => setOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-orange">Login Admin</Link>
        </div>
      )}
    </header>
  );
}
