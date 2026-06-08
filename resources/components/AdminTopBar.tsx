import { Bell, Search, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";

interface Props {
  title: string;
}

export function AdminTopbar({ title }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    // Hapus session/token jika ada
    localStorage.removeItem("admin_token");
    sessionStorage.clear();
    // Redirect ke halaman login
    router.navigate({ to: "/admin/login" });
  }

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border h-16 flex items-center justify-between px-4 lg:px-8">
      {/* Kiri: judul halaman */}
      <div className="flex items-center gap-3">
        <h1 className="font-display font-bold text-navy text-lg sm:text-xl">{title}</h1>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-orange/15 text-orange text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest">
          Admin
        </span>
      </div>

      {/* Kanan: search + notif + akun */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Cari data..."
            className="bg-white border border-border rounded-full pl-9 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-sky"
          />
        </div>

        {/* Notifikasi */}
        <button className="relative p-2 rounded-full hover:bg-milk-dark transition">
          <Bell className="h-5 w-5 text-navy" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange" />
        </button>

        {/* Avatar + dropdown logout */}
        <div className="relative pl-3 border-l border-border" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 hover:bg-milk-dark rounded-xl px-2 py-1.5 transition"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-navy to-sky grid place-items-center text-white font-bold text-sm shrink-0">
              AD
            </div>
            <div className="hidden sm:block leading-tight text-left">
              <div className="text-sm font-semibold text-navy">Admin BPBD</div>
              <div className="text-[10px] text-muted-foreground">admin@bekasi.go.id</div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown menu */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-border rounded-2xl shadow-xl overflow-hidden z-50 animate-[fade-in_0.15s_ease-out]">
              {/* Info akun */}
              <div className="px-4 py-3 border-b border-border bg-milk-dark/40">
                <div className="text-xs font-semibold text-navy">Admin BPBD</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">admin@bekasi.go.id</div>
              </div>

              {/* Menu items */}
              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar / Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}