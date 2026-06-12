import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── FIX DEFAULT MARKER ICON ──────────────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ForecastMapData {
  kecamatan_id: number;
  nama_kecamatan: string;
  forecast: number;
  tahun_prediksi: number;
  total_desa_terdampak : number;
}

export type DisasterFilter = "all" | "banjir" | "longsor" | "gempa" | "kekeringan";

interface Props {
  height?: string;
  filter?: DisasterFilter;
  jenisBencana?: string;
  onSelect?: (data: ForecastMapData) => void;
  selectedId?: number | null;
}

// ─── Constants & Utils ─────────────────────────────────────────────────────────
const FILTER_TO_JENIS: Record<DisasterFilter, string> = {
  all: "Banjir",
  banjir: "Banjir",
  longsor: "Longsor",
  gempa: "Gempa",
  kekeringan: "Kekeringan",
};

function getForecastColor(forecast: number): string {
  const value = Number(forecast ?? 0);
  if (value >= 10) return "#dc2626"; // Merah (Tinggi)
  if (value >= 5) return "#f59e0b";  // Kuning (Sedang)
  return "#22c55e";                 // Hijau (Rendah)
}

function getForecastOpacity(forecast: number): number {
  if (forecast >= 8) return 0.85;
  if (forecast >= 4) return 0.65;
  return 0.45;
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export function BekasiMap({
  height = "520px",
  filter = "all",
  jenisBencana,
  onSelect,
  selectedId,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  const [forecastData, setForecastData] = useState<ForecastMapData[]>([]);
  const [loading, setLoading] = useState(true);

  const activeJenis = jenisBencana ?? FILTER_TO_JENIS[filter];

  // 1. Fetch Forecast Data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function loadForecast() {
      try {
        const params = new URLSearchParams({ jenis_bencana: activeJenis });
        const response = await fetch(`/api/forecast-map?${params}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: ForecastMapData[] = await response.json();
        if (!cancelled) setForecastData(data);
      } catch (error) {
        console.error("[BekasiMap] Gagal load forecast:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadForecast();
    return () => { cancelled = true; };
  }, [activeJenis]);

  // 2. Initialize Map
  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const map = L.map(ref.current, {
        zoomControl: true,
        attributionControl: false
    }).setView([-6.23, 107.13], 10);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19
    }).addTo(map);

    mapRef.current = map;
  }, []);

  // 3. Render GeoJSON Choropleth dari API Laravel
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (geoJsonRef.current) {
        map.removeLayer(geoJsonRef.current);
    }

    const lookup = new Map<string, ForecastMapData>(
      forecastData.map((d) => [d.nama_kecamatan.toLowerCase().trim(), d])
    );

    // Langsung fetch ke API backend yang menggunakan kolom `geom` di DB
    fetch("/api/kecamatan/geojson")
      .then((res) => res.json())
      .then((geojson) => {
        const geoLayer = L.geoJSON(geojson, {
          style: (feature: any) => {
            const nama = feature.properties.nama_kecamatan?.toLowerCase().trim() ?? "";
            const data = lookup.get(nama);

            if (!data) return { color: "#94a3b8", weight: 1, fillColor: "#e2e8f0", fillOpacity: 0.3 };

            const isSelected = selectedId === data.kecamatan_id;
            return {
              color: isSelected ? "#1e293b" : "#ffffff",
              weight: isSelected ? 3 : 1.5,
              fillColor: getForecastColor(data.forecast),
              fillOpacity: isSelected ? Math.min(getForecastOpacity(data.forecast) + 0.1, 0.95) : getForecastOpacity(data.forecast),
            };
          },
          onEachFeature: (feature: any, layer) => {
            const data = lookup.get(feature.properties.nama_kecamatan?.toLowerCase().trim());
            if (data) {
              layer.bindTooltip(data.nama_kecamatan, { sticky: true });
              layer.bindPopup(`
                <div style="font-family:sans-serif;min-width:180px">
                  <div style="font-weight:700;font-size:14px;margin-bottom:6px">${data.nama_kecamatan}</div>
                  <div style="font-size:12px">
                    <b>Forecast:</b> ${data.forecast}<br/>
                    <b>Tahun:</b> ${data.tahun_prediksi}
                  </div>
                </div>
              `);
              layer.on({
                mouseover: (e) => (e.target as L.Path).setStyle({ weight: 2.5, fillOpacity: 0.95 }),
                mouseout: (e) => geoLayer.resetStyle(e.target),
                click: () => onSelect?.(data),
              });
            }
          },
        }).addTo(map);
        geoJsonRef.current = geoLayer;
      })
      .catch(err => console.error("Gagal load GeoJSON API:", err));
  }, [filter, selectedId, onSelect, forecastData]);

  return (
    <div style={{ position: "relative", height, width: "100%" }}>
      <div
        ref={ref}
        style={{ height: "100%", width: "100%" }}
        className="rounded-2xl overflow-hidden shadow-lg"
      />
      {loading && (
        <div style={{
            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.9)", padding: "8px 16px", borderRadius: 20,
            fontSize: 12, zIndex: 1000, boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
        }}>
          Memuat data...
        </div>
      )}
    </div>
  );
}
