import { api } from "./api";
import type {
  DashboardStats,
  JenisBencana,
  Kecamatan,
  KejadianBencana,
  RingkasanKecamatan,
} from "./types";

/**
 * Endpoint Laravel yang DIHARAPKAN ada di project Anda:
 *
 *  GET  /api/kecamatan                      -> Kecamatan[]   (geom = GeoJSON via ST_AsGeoJSON)
 *  GET  /api/jenis-bencana                  -> JenisBencana[]
 *  GET  /api/kejadian?tahun=&jenis=&kec=    -> KejadianBencana[]
 *  GET  /api/ringkasan-kecamatan?tahun=     -> RingkasanKecamatan[]
 *  GET  /api/dashboard/stats                -> DashboardStats
 *
 * Contoh query Laravel untuk /kecamatan:
 *   DB::select("SELECT id, nama_kecamatan, ST_AsGeoJSON(geom)::json AS geom FROM kecamatan");
 */

export const BencanaService = {
  kecamatan: () => api.get<Kecamatan[]>("/kecamatan").then((r) => r.data),
  jenis: () => api.get<JenisBencana[]>("/jenis-bencana").then((r) => r.data),
  kejadian: (params?: { tahun?: number; jenis?: string; kecamatan_id?: number }) =>
    api.get<KejadianBencana[]>("/kejadian", { params }).then((r) => r.data),
  ringkasan: (tahun?: number) =>
    api.get<RingkasanKecamatan[]>("/ringkasan-kecamatan", { params: { tahun } }).then((r) => r.data),
  stats: () => api.get<DashboardStats>("/dashboard/stats").then((r) => r.data),
};
