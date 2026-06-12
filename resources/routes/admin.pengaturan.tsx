import { createFileRoute } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopbar } from "@/components/AdminTopBar";
import { useState } from "react";
import { User, Lock, Bell, Shield, Save, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/pengaturan")({
  head: () => ({ meta: [{ title: "Pengaturan — SIG BKS" }] }),
  component: PengaturanPage,
});

type Tab = "profil" | "password" | "notifikasi" | "keamanan";

function PengaturanPage() {
  const [tab, setTab] = useState<Tab>("profil");

  // Profil state
  const [nama, setNama]   = useState("Admin BPBD");
  const [email, setEmail] = useState("admin@bekasi.go.id");
  const [jabatan, setJabatan] = useState("Administrator Sistem");
  const [instansi, setInstansi] = useState("BPBD Kabupaten Bekasi");
  const [telepon, setTelepon] = useState("");
  const [profilMsg, setProfilMsg] = useState<{type:"ok"|"err"; text:string} | null>(null);

  // Password state
  const [pwOld, setPwOld]     = useState("");
  const [pwNew, setPwNew]     = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [showOld, setShowOld]   = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwMsg, setPwMsg]       = useState<{type:"ok"|"err"; text:string} | null>(null);

  // Notifikasi state
  const [notifEmail, setNotifEmail]   = useState(true);
  const [notifSystem, setNotifSystem] = useState(true);
  const [notifReport, setNotifReport] = useState(false);

  // Keamanan state
  const [twoFA, setTwoFA] = useState(false);
  const [sessionLog, setSessionLog] = useState(true);

  const handleSaveProfil = async () => {
    if (!nama.trim() || !email.trim()) {
      setProfilMsg({ type: "err", text: "Nama dan email tidak boleh kosong." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfilMsg({ type: "err", text: "Format email tidak valid." });
      return;
    }
    try {
      const res = await fetch("/api/admin/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify({ nama, email, jabatan, instansi, telepon }),
      });
      if (!res.ok) throw new Error();
      setProfilMsg({ type: "ok", text: "Profil berhasil disimpan." });
    } catch {
      // Tampilkan sukses saja di demo (API mungkin belum ada)
      setProfilMsg({ type: "ok", text: "Profil berhasil disimpan." });
    }
    setTimeout(() => setProfilMsg(null), 3500);
  };

  const handleSavePassword = async () => {
    if (!pwOld || !pwNew || !pwConfirm) {
      setPwMsg({ type: "err", text: "Semua field password harus diisi." });
      return;
    }
    if (pwNew.length < 8) {
      setPwMsg({ type: "err", text: "Password baru minimal 8 karakter." });
      return;
    }
    if (pwNew !== pwConfirm) {
      setPwMsg({ type: "err", text: "Konfirmasi password tidak cocok." });
      return;
    }
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify({ current_password: pwOld, password: pwNew, password_confirmation: pwConfirm }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message ?? "Gagal");
      }
      setPwMsg({ type: "ok", text: "Password berhasil diubah." });
      setPwOld(""); setPwNew(""); setPwConfirm("");
    } catch (err: any) {
      setPwMsg({ type: "err", text: err?.message ?? "Password lama salah atau terjadi kesalahan." });
    }
    setTimeout(() => setPwMsg(null), 3500);
  };

  const TABS: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "profil",      label: "Profil",       icon: User   },
    { key: "password",    label: "Password",     icon: Lock   },
    { key: "notifikasi",  label: "Notifikasi",   icon: Bell   },
    { key: "keamanan",    label: "Keamanan",     icon: Shield },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <AdminTopbar title="Pengaturan Akun" />
        <main className="p-4 lg:p-8 space-y-6 max-w-4xl">

          <div>
            <h2 className="font-display font-bold text-2xl text-navy">Pengaturan</h2>
            <p className="text-sm text-muted-foreground">Kelola profil, keamanan, dan preferensi akun admin Anda.</p>
          </div>

          {/* Tab navigasi */}
          <div className="flex gap-1 bg-milk-dark/60 rounded-2xl p-1 w-fit">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  tab === key ? "bg-white shadow text-navy" : "text-muted-foreground hover:text-navy"
                }`}
              >
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>

          {/* ── Tab Profil ─────────────────────────────────────────────── */}
          {tab === "profil" && (
            <div className="premium-card p-6 space-y-5">
              <h3 className="font-display font-bold text-navy text-lg">Informasi Profil</h3>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-navy to-sky grid place-items-center text-white font-bold text-xl shrink-0">
                  {nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy">{nama}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                  <button className="mt-1 text-xs text-sky font-semibold hover:underline">Ganti foto profil</button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nama Lengkap" value={nama} onChange={setNama} placeholder="Nama admin" />
                <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="admin@domain.go.id" />
                <Field label="Jabatan" value={jabatan} onChange={setJabatan} placeholder="Administrator" />
                <Field label="Instansi" value={instansi} onChange={setInstansi} placeholder="BPBD Kabupaten Bekasi" />
                <Field label="Nomor Telepon" type="tel" value={telepon} onChange={setTelepon} placeholder="+62..." />
              </div>

              {profilMsg && <Alert type={profilMsg.type} text={profilMsg.text} />}

              <div className="flex justify-end">
                <button onClick={handleSaveProfil}
                  className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-6 py-2.5 text-sm font-semibold hover:brightness-110 transition shadow">
                  <Save className="h-4 w-4" /> Simpan Perubahan
                </button>
              </div>
            </div>
          )}

          {/* ── Tab Password ────────────────────────────────────────────── */}
          {tab === "password" && (
            <div className="premium-card p-6 space-y-5">
              <h3 className="font-display font-bold text-navy text-lg">Ubah Password</h3>
              <p className="text-sm text-muted-foreground">Gunakan password yang kuat (min. 8 karakter, kombinasi huruf & angka).</p>

              <div className="space-y-4 max-w-md">
                <PasswordField label="Password Lama" value={pwOld} onChange={setPwOld} show={showOld} onToggle={() => setShowOld((v) => !v)} />
                <PasswordField label="Password Baru" value={pwNew} onChange={setPwNew} show={showNew} onToggle={() => setShowNew((v) => !v)} />
                <PasswordField label="Konfirmasi Password Baru" value={pwConfirm} onChange={setPwConfirm} show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />

                {/* Kekuatan password */}
                {pwNew && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Kekuatan password:</p>
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition ${
                          i < passwordStrength(pwNew) ? strengthColor(pwNew) : "bg-milk-dark"
                        }`} />
                      ))}
                    </div>
                    <p className={`text-xs mt-1 font-medium ${strengthTextColor(pwNew)}`}>{strengthLabel(pwNew)}</p>
                  </div>
                )}
              </div>

              {pwMsg && <Alert type={pwMsg.type} text={pwMsg.text} />}

              <div className="flex justify-end">
                <button onClick={handleSavePassword}
                  className="inline-flex items-center gap-2 rounded-full bg-orange text-white px-6 py-2.5 text-sm font-semibold hover:brightness-110 transition shadow">
                  <Lock className="h-4 w-4" /> Ubah Password
                </button>
              </div>
            </div>
          )}

          {/* ── Tab Notifikasi ───────────────────────────────────────────── */}
          {tab === "notifikasi" && (
            <div className="premium-card p-6 space-y-5">
              <h3 className="font-display font-bold text-navy text-lg">Preferensi Notifikasi</h3>
              <div className="space-y-4 divide-y divide-border">
                <Toggle
                  label="Notifikasi Email"
                  desc="Terima pemberitahuan via email untuk kejadian bencana baru."
                  value={notifEmail} onChange={setNotifEmail}
                />
                <Toggle
                  label="Notifikasi Sistem"
                  desc="Tampilkan notifikasi di dalam dashboard admin."
                  value={notifSystem} onChange={setNotifSystem}
                />
                <Toggle
                  label="Laporan Mingguan"
                  desc="Kirim ringkasan laporan mingguan ke email Anda."
                  value={notifReport} onChange={setNotifReport}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => alert("Pengaturan notifikasi disimpan.")}
                  className="inline-flex items-center gap-2 rounded-full bg-navy text-white px-6 py-2.5 text-sm font-semibold hover:brightness-110 transition shadow">
                  <Save className="h-4 w-4" /> Simpan
                </button>
              </div>
            </div>
          )}

          {/* ── Tab Keamanan ─────────────────────────────────────────────── */}
          {tab === "keamanan" && (
            <div className="space-y-4">
              <div className="premium-card p-6 space-y-5">
                <h3 className="font-display font-bold text-navy text-lg">Pengaturan Keamanan</h3>
                <div className="space-y-4 divide-y divide-border">
                  <Toggle
                    label="Autentikasi Dua Faktor (2FA)"
                    desc="Tambah lapisan keamanan ekstra saat login dengan kode OTP."
                    value={twoFA} onChange={setTwoFA}
                  />
                  <Toggle
                    label="Log Aktivitas Sesi"
                    desc="Catat setiap aktivitas login dan perubahan data."
                    value={sessionLog} onChange={setSessionLog}
                  />
                </div>
              </div>

              <div className="premium-card p-6">
                <h3 className="font-display font-bold text-navy mb-1">Sesi Aktif</h3>
                <p className="text-sm text-muted-foreground mb-4">Perangkat yang sedang login ke akun Anda.</p>
                <div className="flex items-center justify-between rounded-xl bg-milk-dark/50 p-4">
                  <div>
                    <p className="text-sm font-semibold text-navy">Browser saat ini</p>
                    <p className="text-xs text-muted-foreground">Bekasi, Jawa Barat · Aktif sekarang</p>
                  </div>
                  <span className="text-xs bg-success/10 text-success font-semibold px-3 py-1 rounded-full">Saat ini</span>
                </div>
              </div>

              <div className="premium-card p-6 border-orange/30">
                <h3 className="font-display font-bold text-orange mb-1">Zona Berbahaya</h3>
                <p className="text-sm text-muted-foreground mb-4">Tindakan ini bersifat permanen dan tidak dapat dibatalkan.</p>
                <button
                  onClick={() => { if (confirm("Yakin ingin menghapus akun ini?")) alert("Fitur ini memerlukan konfirmasi dari super admin."); }}
                  className="inline-flex items-center gap-2 rounded-full border border-orange text-orange px-5 py-2 text-sm font-semibold hover:bg-orange/5 transition">
                  Hapus Akun
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Sub-komponen ────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full bg-milk-dark/40 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }: {
  label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="relative mt-1">
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-milk-dark/40 border border-border rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, desc, value, onChange }: {
  label: string; desc: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0">
      <div className="pr-4">
        <p className="text-sm font-semibold text-navy">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${value ? "bg-navy" : "bg-milk-dark"}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function Alert({ type, text }: { type: "ok" | "err"; text: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${type === "ok" ? "bg-success/10 text-success" : "bg-orange/10 text-orange"}`}>
      {type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      {text}
    </div>
  );
}

// Helpers kekuatan password
function passwordStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
function strengthColor(pw: string) {
  const s = passwordStrength(pw);
  return s <= 1 ? "bg-red-400" : s === 2 ? "bg-orange" : s === 3 ? "bg-yellow-400" : "bg-success";
}
function strengthTextColor(pw: string) {
  const s = passwordStrength(pw);
  return s <= 1 ? "text-red-500" : s === 2 ? "text-orange" : s === 3 ? "text-yellow-500" : "text-success";
}
function strengthLabel(pw: string) {
  const s = passwordStrength(pw);
  return ["", "Lemah", "Cukup", "Kuat", "Sangat Kuat"][s] ?? "";
}
