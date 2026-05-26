/**
 * Loader GeoJSON batas wilayah kecamatan (export dari QGIS).
 * Letakkan file di: public/geo/kecamatan.geojson
 * Properti yang dicari di tiap feature: nama_kecamatan | NAMOBJ | WADMKC | nama
 */
import type { FeatureCollection, Geometry } from 'geojson';

export type KecamatanFeature = GeoJSON.Feature<
  GeoJSON.Polygon | GeoJSON.MultiPolygon,
  Record<string, unknown>
>;

export interface KecamatanFC extends GeoJSON.FeatureCollection {
  features: KecamatanFeature[];
}

export async function loadKecamatanGeoJSON(): Promise<KecamatanFC> {
  const res = await fetch("/geo/kecamatan.geojson", { cache: "force-cache" });
  if (!res.ok) throw new Error("Gagal memuat GeoJSON kecamatan");
  return (await res.json()) as KecamatanFC;
}

export function getNamaFromFeature(f: KecamatanFeature): string {
  const p = f.properties ?? {};
  return String(
    (p as any).nama_kecamatan ??
      (p as any).NAMOBJ ??
      (p as any).WADMKC ??
      (p as any).nama ??
      "Tidak diketahui"
  );
}
