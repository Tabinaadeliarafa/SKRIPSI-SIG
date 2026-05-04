import { Bell, Search } from "lucide-react";

export function AdminTopbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border h-16 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <h1 className="font-display font-bold text-navy text-lg sm:text-xl">{title}</h1>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-orange/15 text-orange text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest">Admin</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Cari data..." className="bg-white border border-border rounded-full pl-9 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-sky" />
        </div>
        <button className="relative p-2 rounded-full hover:bg-milk-dark transition">
          <Bell className="h-5 w-5 text-navy" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-navy to-sky grid place-items-center text-white font-bold text-sm">AD</div>
          <div className="hidden sm:block leading-tight">
            <div className="text-sm font-semibold text-navy">Admin BPBD</div>
            <div className="text-[10px] text-muted-foreground">admin@bekasi.go.id</div>
          </div>
        </div>
      </div>
    </header>
  );
}
