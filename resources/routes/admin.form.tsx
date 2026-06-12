import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopbar } from "@/components/AdminTopBar";
import { useKecamatan } from "@/hooks/use-Bencana";
import { getRisk, totalDesa } from "@/data/Bencana"; // Utility tetap dipakai
import { RiskChip } from "@/components/RiskChip";
import { Check, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import L from "leaflet";

export const Route = createFileRoute("/admin/form")({
  head: () => ({ meta: [{ title: "Form Data — SIG BKS" }] }),
  component: FormPage,
});

const STEPS = ["Informasi Umum", "Data Bencana", "Koordinat", "Konfirmasi"] as const;

function FormPage() {
  const [step, setStep] = useState(0);
  const { data: kecamatanList = [], isLoading } = useKecamatan();

  const [data, setData] = useState({
    kecamatan_id: 1, // Sekarang menggunakan ID untuk relasi
    desa: "",
    tahun: 2025,
    sumber: "BPS Kabupaten Bekasi",
    banjir: 0,
    longsor: 0,
    gempa: 0,
    lat: -6.2,
    lng: 107.1,
  });

  const set = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) => setData((d) => ({ ...d, [k]: v }));

  // Helper untuk mendapatkan nama kecamatan saat ini
  const namaKecamatan = useMemo(() =>
    kecamatanList.find(k => k.id === data.kecamatan_id)?.nama_kecamatan ?? "Pilih Kecamatan",
    [kecamatanList, data.kecamatan_id]
  );

  const total = data.banjir + data.longsor + data.gempa;

  // Mock object untuk perhitungan risiko sementara
  const tempObj = { banjir: data.banjir, longsor: data.longsor, gempa: data.gempa };
  const risiko = total >= 6 ? "Tinggi" : total >= 3 ? "Sedang" : total >= 1 ? "Rendah" : "Aman";
  const riskClr = { Tinggi: "text-orange", Sedang: "text-warning", Rendah: "text-sky", Aman: "text-success" }[risiko];

  if (isLoading) return <div className="p-8">Memuat data form...</div>;

  return (
    <div className="min-h-screen flex bg-background">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <AdminTopbar title="Tambah / Edit Data Bencana" />
        <main className="p-4 lg:p-8 max-w-5xl mx-auto">
          {/* Stepper */}
          <ol className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-5 right-5 top-5 h-0.5 bg-milk-dark -z-0" />
            <div className="absolute left-5 top-5 h-0.5 bg-orange transition-all -z-0" style={{ width: `calc(${(step / (STEPS.length - 1)) * 100}% - ${step === 0 ? 0 : 0}px)` }} />
            {STEPS.map((s, i) => (
              <li key={s} className="relative z-10 flex flex-col items-center">
                <div className={`h-10 w-10 rounded-full grid place-items-center font-bold text-sm transition-all ${i < step ? "bg-orange text-white" : i === step ? "bg-navy text-white ring-4 ring-navy/15" : "bg-white border border-border text-muted-foreground"}`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <div className="mt-2 text-[11px] sm:text-xs font-semibold text-center max-w-[80px] text-foreground">{s}</div>
              </li>
            ))}
          </ol>

          <div className="premium-card p-6 lg:p-8">
            {step === 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Kecamatan">
                  <select value={data.kecamatan_id} onChange={(e) => set("kecamatan_id", +e.target.value)} className={inputCls}>
                    {kecamatanList.map((k) => <option key={k.id} value={k.id}>{k.nama_kecamatan}</option>)}
                  </select>
                </Field>
                <Field label="Desa"><input value={data.desa} onChange={(e) => set("desa", e.target.value)} placeholder="Nama desa" className={inputCls} /></Field>
                <Field label="Tahun"><input type="number" value={data.tahun} onChange={(e) => set("tahun", +e.target.value)} className={inputCls} /></Field>
                <Field label="Sumber Data"><input value={data.sumber} onChange={(e) => set("sumber", e.target.value)} className={inputCls} /></Field>
              </div>
            )}

            {step === 1 && (
              <div className="grid sm:grid-cols-3 gap-4">
                {(["banjir","longsor","gempa"] as const).map((k) => (
                  <Field key={k} label={`Jumlah ${k}`}>
                    <input type="number" min={0} value={data[k]} onChange={(e) => set(k, +e.target.value)} className={inputCls} />
                  </Field>
                ))}
                <div className="sm:col-span-3 mt-2 rounded-xl bg-milk-dark/40 border border-border p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Total desa terdampak</div>
                    <div className="font-display font-bold text-3xl text-navy">{total}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Risiko</div>
                    <div className={`font-display font-bold text-3xl ${riskClr}`}>{risiko}</div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && <CoordStep data={data} setLat={(v) => set("lat", v)} setLng={(v) => set("lng", v)} />}

            {step === 3 && (
              <div>
                <h3 className="font-display font-bold text-navy text-lg mb-4">Tinjau & Konfirmasi</h3>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {[["Kecamatan", namaKecamatan],["Desa", data.desa || "-"],["Tahun", data.tahun],["Sumber", data.sumber],["Banjir", data.banjir],["Longsor", data.longsor],["Gempa", data.gempa],["Koordinat", `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`]].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between border-b border-border/60 py-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-semibold text-navy">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Tombol Navigasi tetap sama */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
              <Link to="/admin/dashboard" className="px-4 py-2 rounded-full text-sm font-semibold text-muted-foreground hover:bg-milk-dark transition">Batal</Link>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-1 rounded-full bg-white border border-border px-4 py-2 text-sm font-semibold hover:bg-milk-dark transition">
                    <ChevronLeft className="h-4 w-4" /> Sebelumnya
                  </button>
                )}
                {step < STEPS.length - 1 ? (
                  <button onClick={() => setStep((s) => s + 1)} className="inline-flex items-center gap-1 rounded-full bg-navy text-white px-5 py-2 text-sm font-semibold shadow-lg hover:bg-navy-deep transition">
                    Selanjutnya <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button className="inline-flex items-center gap-1 rounded-full bg-orange text-white px-5 py-2 text-sm font-semibold shadow-lg hover:brightness-110 transition">
                    <Check className="h-4 w-4" /> Publikasi
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-milk-dark/40 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

// Komponen CoordStep tetap sama, hanya memastikan props sesuai
function CoordStep({ data, setLat, setLng }: { data: { lat: number; lng: number }; setLat: (v: number) => void; setLng: (v: number) => void }) {
    // ... (logic tetap sama seperti sebelumnya)
    return (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Latitude"><input type="number" step="0.0001" value={data.lat} onChange={(e) => setLat(+e.target.value)} className={inputCls} /></Field>
            <Field label="Longitude"><input type="number" step="0.0001" value={data.lng} onChange={(e) => setLng(+e.target.value)} className={inputCls} /></Field>
          </div>
          {/* ... sisa peta */}
        </div>
    );
}
