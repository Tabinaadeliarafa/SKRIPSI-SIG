import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopbar } from "@/components/AdminTopbar";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { KECAMATAN } from "@/data/bencana";
import L from "leaflet";

export const Route = createFileRoute("/admin/form")({
  head: () => ({ meta: [{ title: "Form Data — SIG BKS" }] }),
  component: FormPage,
});

const STEPS = ["Informasi Umum", "Data Bencana", "Koordinat", "Konfirmasi"] as const;

function FormPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    kecamatan: "Babelan", desa: "", tahun: 2025, sumber: "BPS Kabupaten Bekasi",
    banjir: 0, longsor: 0, gempa: 0,
    lat: -6.2, lng: 107.1,
  });
  const set = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) => setData((d) => ({ ...d, [k]: v }));

  const total = data.banjir + data.longsor + data.gempa;
  const risiko = total >= 6 ? "Tinggi" : total >= 3 ? "Sedang" : total >= 1 ? "Rendah" : "Aman";
  const riskClr = { Tinggi: "text-orange", Sedang: "text-warning", Rendah: "text-sky", Aman: "text-success" }[risiko];

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
                  <select value={data.kecamatan} onChange={(e) => set("kecamatan", e.target.value)} className={inputCls}>
                    {KECAMATAN.map((k) => <option key={k.id}>{k.nama}</option>)}
                  </select>
                </Field>
                <Field label="Desa">
                  <input value={data.desa} onChange={(e) => set("desa", e.target.value)} placeholder="Nama desa" className={inputCls} />
                </Field>
                <Field label="Tahun">
                  <input type="number" value={data.tahun} onChange={(e) => set("tahun", +e.target.value)} className={inputCls} />
                </Field>
                <Field label="Sumber Data">
                  <input value={data.sumber} onChange={(e) => set("sumber", e.target.value)} className={inputCls} />
                </Field>
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
                    <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Risiko (auto)</div>
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
                  {[["Kecamatan", data.kecamatan],["Desa", data.desa || "-"],["Tahun", data.tahun],["Sumber", data.sumber],["Banjir", data.banjir],["Longsor", data.longsor],["Gempa", data.gempa],["Koordinat", `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`],["Total", total],["Risiko", risiko]].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between border-b border-border/60 py-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-semibold text-navy">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
              <Link to="/admin/dashboard" className="px-4 py-2 rounded-full text-sm font-semibold text-muted-foreground hover:bg-milk-dark transition">Batal</Link>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-1 rounded-full bg-white border border-border px-4 py-2 text-sm font-semibold hover:bg-milk-dark transition">
                    <ChevronLeft className="h-4 w-4" /> Sebelumnya
                  </button>
                )}
                <button className="rounded-full bg-white border border-border px-4 py-2 text-sm font-semibold hover:bg-milk-dark transition">Simpan Draft</button>
                {step < STEPS.length - 1 ? (
                  <button onClick={() => setStep((s) => s + 1)} className="inline-flex items-center gap-1 rounded-full bg-navy text-white px-5 py-2 text-sm font-semibold shadow-lg hover:bg-navy-deep transition">
                    Selanjutnya <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Link to="/admin/dashboard" className="inline-flex items-center gap-1 rounded-full bg-orange text-white px-5 py-2 text-sm font-semibold shadow-lg hover:brightness-110 transition">
                    <Check className="h-4 w-4" /> Publikasi
                  </Link>
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

function CoordStep({ data, setLat, setLng }: { data: { lat: number; lng: number }; setLat: (v: number) => void; setLng: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const latRef = useRef(setLat);
  const lngRef = useRef(setLng);
  useEffect(() => { latRef.current = setLat; lngRef.current = setLng; });

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current).setView([data.lat, data.lng], 11);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png").addTo(map);
    const m = L.marker([data.lat, data.lng], { draggable: true }).addTo(map);
    m.on("dragend", () => { const ll = m.getLatLng(); latRef.current(ll.lat); lngRef.current(ll.lng); });
    map.on("click", (e: L.LeafletMouseEvent) => { m.setLatLng(e.latlng); latRef.current(e.latlng.lat); lngRef.current(e.latlng.lng); });
    mapRef.current = map; markerRef.current = m;
  }, []);

  const coordText = useMemo(() => `${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}`, [data.lat, data.lng]);
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Latitude"><input type="number" step="0.0001" value={data.lat} onChange={(e) => { const v = +e.target.value; setLat(v); markerRef.current?.setLatLng([v, data.lng]); }} className={inputCls} /></Field>
        <Field label="Longitude"><input type="number" step="0.0001" value={data.lng} onChange={(e) => { const v = +e.target.value; setLng(v); markerRef.current?.setLatLng([data.lat, v]); }} className={inputCls} /></Field>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <div ref={ref} style={{ height: 360 }} />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" /> Klik atau geser pin di peta · {coordText}
      </div>
    </div>
  );
}
