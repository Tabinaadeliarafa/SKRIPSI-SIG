export type Risk = "Tinggi" | "Sedang" | "Rendah" | "Aman";

export interface KecamatanData {
  id: number;
  nama: string;
  banjir: number;
  longsor: number;
  gempa: number;
  desa: number;
  lat: number;
  lng: number;
}

// 23 kecamatan Kabupaten Bekasi (BPS 2025 - illustrative figures)
export const KECAMATAN: KecamatanData[] = [
  { id: 1, nama: "Babelan", banjir: 8, longsor: 0, gempa: 0, desa: 9, lat: -6.121, lng: 107.024 },
  { id: 2, nama: "Bojongmangu", banjir: 0, longsor: 1, gempa: 0, desa: 6, lat: -6.327, lng: 107.236 },
  { id: 3, nama: "Cabangbungin", banjir: 4, longsor: 0, gempa: 0, desa: 8, lat: -6.085, lng: 107.156 },
  { id: 4, nama: "Cibarusah", banjir: 0, longsor: 1, gempa: 0, desa: 7, lat: -6.378, lng: 107.111 },
  { id: 5, nama: "Cibitung", banjir: 5, longsor: 0, gempa: 0, desa: 7, lat: -6.272, lng: 107.094 },
  { id: 6, nama: "Cikarang Barat", banjir: 3, longsor: 0, gempa: 0, desa: 11, lat: -6.272, lng: 107.114 },
  { id: 7, nama: "Cikarang Pusat", banjir: 2, longsor: 0, gempa: 0, desa: 6, lat: -6.327, lng: 107.165 },
  { id: 8, nama: "Cikarang Selatan", banjir: 1, longsor: 0, gempa: 0, desa: 7, lat: -6.341, lng: 107.146 },
  { id: 9, nama: "Cikarang Timur", banjir: 4, longsor: 0, gempa: 0, desa: 8, lat: -6.288, lng: 107.214 },
  { id: 10, nama: "Cikarang Utara", banjir: 3, longsor: 0, gempa: 0, desa: 11, lat: -6.241, lng: 107.151 },
  { id: 11, nama: "Karangbahagia", banjir: 2, longsor: 0, gempa: 0, desa: 8, lat: -6.234, lng: 107.213 },
  { id: 12, nama: "Kedungwaringin", banjir: 4, longsor: 0, gempa: 0, desa: 7, lat: -6.275, lng: 107.245 },
  { id: 13, nama: "Muara Gembong", banjir: 6, longsor: 0, gempa: 0, desa: 6, lat: -6.001, lng: 107.067 },
  { id: 14, nama: "Pebayuran", banjir: 7, longsor: 0, gempa: 0, desa: 13, lat: -6.158, lng: 107.249 },
  { id: 15, nama: "Serang Baru", banjir: 1, longsor: 0, gempa: 0, desa: 8, lat: -6.339, lng: 107.108 },
  { id: 16, nama: "Setu", banjir: 2, longsor: 0, gempa: 0, desa: 11, lat: -6.346, lng: 107.058 },
  { id: 17, nama: "Sukakarya", banjir: 3, longsor: 0, gempa: 0, desa: 7, lat: -6.146, lng: 107.207 },
  { id: 18, nama: "Sukatani", banjir: 5, longsor: 0, gempa: 0, desa: 7, lat: -6.187, lng: 107.197 },
  { id: 19, nama: "Sukawangi", banjir: 4, longsor: 0, gempa: 0, desa: 7, lat: -6.139, lng: 107.103 },
  { id: 20, nama: "Tambelang", banjir: 3, longsor: 0, gempa: 0, desa: 7, lat: -6.158, lng: 107.131 },
  { id: 21, nama: "Tambun Selatan", banjir: 1, longsor: 0, gempa: 0, desa: 10, lat: -6.262, lng: 107.053 },
  { id: 22, nama: "Tambun Utara", banjir: 1, longsor: 0, gempa: 0, desa: 8, lat: -6.222, lng: 107.073 },
  { id: 23, nama: "Tarumajaya", banjir: 0, longsor: 0, gempa: 0, desa: 8, lat: -6.094, lng: 106.985 },
];

export const TOTALS = {
  kecamatan: KECAMATAN.length,
  banjir: KECAMATAN.reduce((s, k) => s + k.banjir, 0),
  longsor: KECAMATAN.reduce((s, k) => s + k.longsor, 0),
  gempa: KECAMATAN.reduce((s, k) => s + k.gempa, 0),
};

export function totalDesa(k: KecamatanData) {
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
    case "Aman": return "#4a8a5e";
  }
}
