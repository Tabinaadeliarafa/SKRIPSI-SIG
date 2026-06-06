import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// import { getKecamatanData, getForecast } from "@/services/api";

// import {
//   KECAMATAN,
//   type KecamatanData,
//   getRisk,
//   riskColor,
//   totalDesa,
// } from "@/data/Bencana";

// FIX DEFAULT MARKER ICON
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
}

export type DisasterFilter = "all" | "banjir" | "longsor" | "gempa" | "kekeringan";

interface Props {
  height?: string;
  filter?: DisasterFilter;
  jenisBencana?: string; // untuk query ke API, mis: "Banjir", "Longsor", "Gempa"
  onSelect?: (data: ForecastMapData) => void;
  selectedId?: number | null;
}

// ─── Warna dan label risiko ───────────────────────────────────────────────────
function getForecastRisk(forecast: number): "Tinggi" | "Sedang" | "Rendah" {
  if (forecast >= 8) return "Tinggi";
  if (forecast >= 4) return "Sedang";
  return "Rendah";
}

/**
 * Warna choropleth per jenis bencana (filter) + tingkat risiko.
 * - Mode "all"       → skala merah/oranye/hijau berdasarkan forecast SMA
 * - Mode filter jenis → gradasi warna khas jenis bencana
 */
function getForecastColor(
  forecast: number,
  filter: DisasterFilter = "all"
): string {
  const value = Number(forecast ?? 0);

  let fillColor = "#22c55e"; // hijau

  if (value >= 10) {
    fillColor = "#dc2626"; // merah
  } else if (value >= 5) {
    fillColor = "#f59e0b"; // kuning
  }

  return fillColor;
}

function getForecastOpacity(forecast: number): number {
  const risk = getForecastRisk(forecast);
  if (risk === "Tinggi") return 0.85;
  if (risk === "Sedang") return 0.65;
  return 0.45;
}

// Nama jenis bencana untuk query API berdasarkan filter UI
const FILTER_TO_JENIS: Record<DisasterFilter, string> = {
  all: "Banjir",
  banjir: "Banjir",
  longsor: "Longsor",
  gempa: "Gempa",
  kekeringan: "Kekeringan",
};

// ─── Komponen utama ───────────────────────────────────────────────────────────
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

  // Tentukan jenis bencana yang di-query (dari prop atau dari filter UI)
  const activeJenis = jenisBencana ?? FILTER_TO_JENIS[filter];

  // ─── Fetch data forecast dari API ──────────────────────────────────────────
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
        console.error("[BekasiMap] Gagal mengambil forecast-map:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadForecast();
    return () => { cancelled = true; };
  }, [activeJenis]);

  // ─── Init peta sekali saja ──────────────────────────────────────────────────
  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const map = L.map(ref.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([-6.23, 107.13], 10);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, attribution: "&copy; OpenStreetMap &copy; CARTO" }
    ).addTo(map);

    mapRef.current = map;
    geoJsonRef.current = L.geoJSON().addTo(map);
  }, []);

  // ─── Render / re-render GeoJSON choropleth ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Hapus layer lama
    if (geoJsonRef.current) {
      map.removeLayer(geoJsonRef.current);
      geoJsonRef.current = null;
    }

    // Lookup cepat: nama kecamatan lowercase → ForecastMapData
    const lookup = new Map<string, ForecastMapData>(
      forecastData.map((d) => [d.nama_kecamatan.toLowerCase().trim(), d])
    );

    // Fetch GeoJSON batas kecamatan
    // Prioritas: /geo/kecamatan.geojson (per-kecamatan) → /api/kecamatan/geojson (dari DB)
    const geoUrl = "/geo/kecamatan.geojson";

    fetch(geoUrl)
      .then((res) => {
        if (!res.ok) throw new Error("GeoJSON kecamatan tidak ditemukan");
        return res.json();
      })
      .catch(() => {
        // Fallback: ambil dari API Laravel yang generate dari DB
        return fetch("/api/kecamatan/geojson").then((r) => r.json());
      })
      .then((geojson) => {
        const geoLayer = L.geoJSON(geojson, {
          // ── Style polygon choropleth ────────────────────────────────────────
          style: (feature: any) => {
            const namaKecamatan =
              feature.properties.NAME_3 ||
              feature.properties.WADMKC ||
              feature.properties.nama ||
              feature.properties.NAMOBJ;
              "??";
              // console.log(
              //   "GeoJSON:",
              //   namaKecamatan,
              //   "Forecast:",
              //   forecastData.find(
              //     (d) =>
              //       d.nama_kecamatan?.toLowerCase() ===
              //       String(namaKecamatan).toLowerCase()
              //   )
              // );

            const data = lookup.get(namaKecamatan.toLowerCase().trim());

            // Tidak ada data forecast → abu-abu
            if (!data) {
              return { color: "#94a3b8", weight: 1, fillColor: "#e2e8f0", fillOpacity: 0.3 };
            }

            const isSelected  = selectedId === data.kecamatan_id;
            const fillColor   = getForecastColor(data.forecast, filter);
            const fillOpacity = getForecastOpacity(data.forecast);

            return {
              color:       isSelected ? "#1e293b" : "#ffffff",
              weight:      isSelected ? 3 : 1.5,
              fillColor,
              fillOpacity: isSelected ? Math.min(fillOpacity + 0.1, 0.95) : fillOpacity,
            };
          },

          // ── Tooltip + popup + events ─────────────────────────────────────────
          onEachFeature: (feature: any, layer) => {
            const namaRaw: string =
              feature?.properties?.nama_kecamatan ??
              feature?.properties?.NAME_3 ??
              feature?.properties?.WADMKC ??
              feature?.properties?.NAMOBJ ??
              feature?.properties?.nama ??
              "Tidak diketahui";

            const data        = lookup.get(namaRaw.toLowerCase().trim());
            const displayNama = data?.nama_kecamatan ?? namaRaw;

            // Tooltip hover
            (layer as L.Path).bindTooltip(displayNama, {
              sticky:    true,
              className: "kec-tooltip",
            });


            // Popup dengan info forecast
            if (data) {
              const risk = getForecastRisk(data.forecast);
              const riskColor = getForecastColor(data.forecast, filter);

              layer.bindPopup(`
                <div style="font-family:sans-serif;min-width:220px">
                  <div style="font-weight:700;font-size:15px;margin-bottom:8px">
                    ${data.nama_kecamatan}
                  </div>

                  <div style="font-size:13px;line-height:1.6">
                    <div>
                      <b>Forecast SMA:</b> ${data.forecast}
                    </div>

                    <div>
                      <b>Tahun Prediksi:</b> ${data.tahun_prediksi}
                    </div>
                  </div>
                </div>
                `);

              layer.on({
                mouseover: (e) => {
                  const l = e.target as L.Path;
                  l.setStyle({ weight: 2.5, fillOpacity: 0.95 });
                },
                mouseout: (e) => {
                  geoLayer.resetStyle(e.target);
                },
                click: () => {
                  onSelect?.(data);
                },
              });
            }
          },
        });

        geoLayer.addTo(map);
        geoJsonRef.current = geoLayer;
      })
      .catch((err) => {
        console.error("[BekasiMap] Gagal load GeoJSON:", err);
      });
  }, [filter, selectedId, onSelect, forecastData, activeJenis]);

  return (
    <div style={{ position: "relative", height, width: "100%" }}>
      <div
        ref={ref}
        style={{ height: "100%", width: "100%" }}
        className="rounded-2xl overflow-hidden"
      />

      {/* Loading overlay */}
      {loading && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,255,255,0.92)",
            borderRadius: 8,
            padding: "6px 14px",
            fontSize: 12,
            color: "#64748b",
            fontFamily: "sans-serif",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          Memuat data forecast...
        </div>
      )}
    </div>
  );
}
