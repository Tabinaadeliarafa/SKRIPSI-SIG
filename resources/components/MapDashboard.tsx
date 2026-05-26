/**
 * MapDashboard - peta utama dashboard.
 * - Base tile CARTO light
 * - Layer GeoJSON batas kecamatan (dari /public/geo/kecamatan.geojson hasil export QGIS)
 * - Warna polygon = risiko (dari API /ringkasan-kecamatan)
 * - Klik polygon -> flyTo + highlight + emit onSelect
 * - Fallback: jika GeoJSON kosong, render circleMarker dari ringkasan (lat/lng dummy disuplai parent)
 */
import { useEffect, useRef } from "react";
import L from "leaflet";
import { renderKecamatanLayer } from "./leaflet/KecamatanLayer";
import { loadKecamatanGeoJSON } from "@/services/geojson";
import type { DisasterFilter, RingkasanKecamatan } from "@/services/types";

// Default leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  height?: string;
  ringkasan: RingkasanKecamatan[];
  selectedNama: string | null;
  onSelect: (nama: string) => void;
  filter?: DisasterFilter;
  tahun?: number;
}

export function MapDashboard({ height = "560px", ringkasan, selectedNama, onSelect, filter = "all", tahun }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);

  // init map
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { zoomControl: true, attributionControl: false }).setView(
      [-6.23, 107.13],
      10
    );
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap, &copy; CARTO",
    }).addTo(map);
    mapRef.current = map;
  }, []);

  // load geojson + render layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let cancelled = false;
    (async () => {
      try {
        const fc = await loadKecamatanGeoJSON();
        if (cancelled || !fc.features?.length) return;
        if (layerRef.current) {
          map.removeLayer(layerRef.current);
          layerRef.current = null;
        }
        layerRef.current = renderKecamatanLayer(
          map,
          fc,
          ringkasan,
          { onSelect: (nama) => onSelect(nama) },
          selectedNama,
          { filter, tahun }
        );
      } catch (e) {
        console.warn("[MapDashboard] GeoJSON belum tersedia:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ringkasan, selectedNama, onSelect, filter, tahun]);

  return <div ref={ref} style={{ height, width: "100%" }} className="rounded-2xl overflow-hidden" />;
}
