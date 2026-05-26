import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PublicNavbar } from "@/components/PublicNavbar";
import { KECAMATAN, totalDesa, getRisk } from "@/data/Bencana";
import { RiskChip } from "@/components/RiskChip";
import { Calendar, Download, Filter, Search, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/laporan")({
  head: () => ({ meta: [{ title: "Laporan — SIG Bencana Kabupaten Bekasi" }] }),
  component: ReportPage,
});

const PER_PAGE = 10;

function ReportPage() {
  const [from, setFrom] = useState("2025-01-01");
  const [to, setTo] = useState("2025-12-31");
  const [kec, setKec] = useState("all");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    let list = KECAMATAN;
    if (kec !== "all") list = list.filter((k) => k.nama === kec);
    if (q) list = list.filter((k) => k.nama.toLowerCase().includes(q.toLowerCase()));
    return list;
  }, [kec, q]);

  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const slice = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-navy">Laporan Bencana</h1>
            <p className="text-muted-foreground mt-1">Rekap data bencana per kecamatan, format tabel siap unduh.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-orange text-white px-5 py-2.5 font-semibold shadow-lg hover:brightness-110 transition">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>

        <div className="premium-card p-5 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dari Tanggal</label>
              <div className="mt-1 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full bg-milk-dark/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sampai</label>
              <div className="mt-1 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full bg-milk-dark/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kecamatan</label>
              <div className="mt-1 relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select value={kec} onChange={(e) => { setKec(e.target.value); setPage(1); }}
                  className="w-full bg-milk-dark/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky appearance-none">
                  <option value="all">Semua Kecamatan</option>
                  {KECAMATAN.map((k) => <option key={k.id} value={k.nama}>{k.nama}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cari</label>
              <div className="mt-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Nama kecamatan..."
                  className="w-full bg-milk-dark/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
              </div>
            </div>
          </div>
        </div>

        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy text-white">
                  {["No","Kecamatan","Banjir","Longsor","Gempa","Total","Risiko"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.map((k, i) => (
                  <tr key={k.id} className="border-t border-border hover:bg-milk-dark/30 transition">
                    <td className="px-4 py-3 text-muted-foreground">{(page - 1) * PER_PAGE + i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-navy">{k.nama}</td>
                    <td className="px-4 py-3"><span className="font-bold text-sky">{k.banjir}</span></td>
                    <td className="px-4 py-3"><span className="font-bold text-orange">{k.longsor}</span></td>
                    <td className="px-4 py-3 font-bold">{k.gempa}</td>
                    <td className="px-4 py-3 font-bold text-navy">{totalDesa(k)}</td>
                    <td className="px-4 py-3"><RiskChip risk={getRisk(k)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-milk-dark/20 text-sm">
            <span className="text-muted-foreground">Menampilkan {slice.length} dari {rows.length} kecamatan</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg hover:bg-white disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-xs font-semibold ${p === page ? "bg-navy text-white" : "hover:bg-white"}`}>{p}</button>
              ))}
              <button disabled={page === pages} onClick={() => setPage(page + 1)} className="p-2 rounded-lg hover:bg-white disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
