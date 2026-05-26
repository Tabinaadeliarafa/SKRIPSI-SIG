// Tipe data sesuai skema PostgreSQL Anda (sig_db.sql)

export interface JenisBencana {
  id: number;
  nama_bencana: string | null;
  kode_jenis: string | null;
  warna_peta: string | null;
  nama_jenis: string | null;
}

export interface Kecamatan {
  id: number;
  nama_kecamatan: string;
  // geom dikirim sebagai GeoJSON dari Laravel (ST_AsGeoJSON)
  geom?: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
}

export interface KejadianBencana {
  id: number;
  kecamatan_id: number;
  jenis_bencana_id: number;
  jumlah_kejadian: number;
  tahun: number;
  keterangan?: string | null;
  created_at?: string;
  // relasi opsional
  kecamatan?: Pick<Kecamatan, "id" | "nama_kecamatan">;
  jenis?: Pick<JenisBencana, "id" | "nama_jenis" | "kode_jenis" | "warna_peta">;
}

export interface RingkasanKecamatan {
  kecamatan_id: number;
  nama_kecamatan: string;
  banjir: number;
  longsor: number;
  gempa: number;
  total: number;
  risiko: "Tinggi" | "Sedang" | "Rendah" | "Aman";
}

export interface DashboardStats {
  total_kecamatan: number;
  total_kejadian: number;
  total_banjir: number;
  total_longsor: number;
  total_gempa: number;
  per_tahun: { tahun: number; total: number }[];
}

export type DisasterFilter = "all" | "banjir" | "longsor" | "gempa";
