import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, ArrowLeft, ShieldCheck, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Login Admin — SIG BKS" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [show, setShow] = useState(false);
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-navy-deep text-white p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #2d6ca8 0%, transparent 50%), radial-gradient(circle at 80% 80%, #c0522a 0%, transparent 50%)" }} />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-orange to-[#a8401e] grid place-items-center shadow-xl">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display font-bold text-xl">SIG BKS</div>
              <div className="text-xs text-white/60 uppercase tracking-widest">Admin Portal</div>
            </div>
          </div>
        </div>
        <div className="relative">
          <h2 className="font-display text-4xl font-bold leading-tight">Sistem Informasi<br />Geografis Bencana</h2>
          <p className="mt-4 text-white/70 max-w-sm">Kelola data bencana 23 kecamatan Kabupaten Bekasi melalui dashboard terpadu berbasis QGIS dan BPS 2025.</p>
          <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm">
            {[["23","Kecamatan"],["72","Desa"],["100%","Geo"]].map(([v, l]) => (
              <div key={l as string} className="rounded-xl bg-white/5 backdrop-blur p-3 border border-white/10">
                <div className="font-display font-bold text-2xl">{v}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/60">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-white/50">© 2025 BPBD Kab. Bekasi</div>
      </div>

      {/* RIGHT login */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy mb-8 transition">
            <ArrowLeft className="h-4 w-4" /> Kembali ke website
          </Link>
          <div className="premium-card p-8">
            <h1 className="font-display font-bold text-2xl text-navy">Selamat datang kembali</h1>
            <p className="text-sm text-muted-foreground mt-1">Masuk ke panel admin SIG Bencana.</p>

            <form className="mt-7 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="email" defaultValue="admin@bekasi.go.id" className="w-full bg-milk-dark/40 border border-border rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type={show ? "text" : "password"} defaultValue="••••••••" className="w-full bg-milk-dark/40 border border-border rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
                  <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-[var(--orange)]" /> Ingat saya
                </label>
                <a href="#" className="text-sky font-medium hover:underline">Lupa password?</a>
              </div>
              <Link to="/admin/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange text-white py-3 font-semibold shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition-all">
                Login
              </Link>
            </form>
            <p className="text-center text-xs text-muted-foreground mt-6">Demo: tombol Login mengarah langsung ke dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
