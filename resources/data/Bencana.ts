export type Risk = "Tinggi" | "Sedang" | "Rendah" | "Aman";

export interface KecamatanData {
  id: number;
  nama: string;
  /** Alias dari API endpoint laporan */
  nama_kecamatan?: string;
  banjir: number;
  longsor: number;
  gempa: number;
}

export const KECAMATAN: KecamatanData[] = [
  { id: 1,  nama: "Tambun Selatan",   banjir: 8, longsor: 1, gempa: 2 },
  { id: 2,  nama: "Tambun Utara",     banjir: 5, longsor: 0, gempa: 1 },
  { id: 3,  nama: "Bekasi Kota",      banjir: 6, longsor: 0, gempa: 2 },
  { id: 4,  nama: "Cikarang Barat",   banjir: 3, longsor: 2, gempa: 1 },
  { id: 5,  nama: "Cikarang Utara",   banjir: 4, longsor: 1, gempa: 2 },
  { id: 6,  nama: "Cikarang Selatan", banjir: 2, longsor: 3, gempa: 1 },
  { id: 7,  nama: "Cikarang Timur",   banjir: 1, longsor: 2, gempa: 0 },
  { id: 8,  nama: "Cikarang Pusat",   banjir: 2, longsor: 1, gempa: 1 },
  { id: 9,  nama: "Sukawangi",        banjir: 1, longsor: 1, gempa: 0 },
  { id: 10, nama: "Tarumajaya",       banjir: 4, longsor: 0, gempa: 1 },
  { id: 11, nama: "Babelan",          banjir: 5, longsor: 0, gempa: 2 },
  { id: 12, nama: "Cabangbungin",     banjir: 2, longsor: 1, gempa: 0 },
  { id: 13, nama: "Muaragembong",     banjir: 6, longsor: 0, gempa: 1 },
  { id: 14, nama: "Pebayuran",        banjir: 3, longsor: 1, gempa: 0 },
  { id: 15, nama: "Sukatani",         banjir: 2, longsor: 2, gempa: 1 },
  { id: 16, nama: "Sukakarya",        banjir: 1, longsor: 1, gempa: 0 },
  { id: 17, nama: "Tambelang",        banjir: 1, longsor: 2, gempa: 0 },
  { id: 18, nama: "Kedungwaringin",   banjir: 2, longsor: 0, gempa: 1 },
  { id: 19, nama: "Bojongmangu",      banjir: 0, longsor: 3, gempa: 1 },
  { id: 20, nama: "Serang Baru",      banjir: 1, longsor: 2, gempa: 0 },
  { id: 21, nama: "Setu",             banjir: 2, longsor: 1, gempa: 0 },
  { id: 22, nama: "Cibarusah",        banjir: 1, longsor: 3, gempa: 0 },
  { id: 23, nama: "Bojong Gede",      banjir: 3, longsor: 0, gempa: 1 },
];

export const TOTALS = {
  kecamatan: KECAMATAN.length,
  banjir:  KECAMATAN.reduce((s, k) => s + k.banjir,  0),
  longsor: KECAMATAN.reduce((s, k) => s + k.longsor, 0),
  gempa:   KECAMATAN.reduce((s, k) => s + k.gempa,   0),
  get total() { return this.banjir + this.longsor + this.gempa; },
};

export function totalDesa(k: KecamatanData): number {
  return k.banjir + k.longsor + k.gempa;
}

export function getRisk(k: KecamatanData): Risk {
  const t = totalDesa(k);
  if (t >= 6) return "Tinggi";
  if (t >= 3) return "Sedang";
  if (t >= 1) return "Rendah";
  return "Aman";
}

export function riskColor(r: Risk): string {
  switch (r) {
    case "Tinggi": return "#c0522a";
    case "Sedang": return "#e08a3c";
    case "Rendah": return "#2d6ca8";
    case "Aman":   return "#4a8a5e";
  }
}