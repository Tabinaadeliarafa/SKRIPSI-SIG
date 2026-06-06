import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getKecamatanData, getForecast } from "@/services/api";

import {
  KECAMATAN,
  type KecamatanData,
  getRisk,
  riskColor,
  totalDesa,
} from "@/data/Bencana";

// FIX DEFAULT MARKER ICON
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Interface Forecast ───────────────────────────────────────────────────────
interface ForecastMapData {
  kecamatan_id: number;
  nama_kecamatan: string;
  forecast: number;
  tahun_prediksi: number;
}

// ─── Helper Choropleth ────────────────────────────────────────────────────────
function getForecastRisk(forecast: number) {
  if (forecast >= 8) return "Tinggi";
  if (forecast >= 4) return "Sedang";
  return "Rendah";
}

function getForecastColor(forecast: number) {
  if (forecast >= 8) return "#dc2626"; // merah
  if (forecast >= 4) return "#f59e0b"; // oranye
  return "#22c55e";                    // hijau
}

interface Props {
  height?: string;
  filter?: "all" | "banjir" | "longsor" | "gempa" | "kekeringan";
  onSelect?: (k: KecamatanData) => void;
  selectedId?: number | null;
}

export function BekasiMap({
  height = "520px",
  filter = "all",
  onSelect,
  selectedId,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [kecamatanDb, setKecamatanDb] = useState<any[]>([]);
  const [forecastDb, setForecastDb] = useState<any[]>([]);

  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);

  // ─── State forecast dengan tipe yang benar ──────────────────────────────────
  const [forecastData, setForecastData] = useState<ForecastMapData[]>([]);

  // ─── Fetch forecast dari /api/forecast-map ──────────────────────────────────
  useEffect(() => {
    async function loadForecast() {
      try {
        const response = await fetch("/api/forecast-map");
        const data = await response.json();
        setForecastData(data);
      } catch (error) {
        console.error("Gagal mengambil forecast map", error);
      }
    }
    loadForecast();
  }, []);

  // ─── INIT MAP ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ref.current || mapRef.current) return;

    const map = L.map(ref.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([-6.23, 107.13], 10);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      }
    ).addTo(map);

    mapRef.current = map;

    geoJsonRef.current = L.geoJSON().addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
  }, []);

  // ─── LOAD GEOJSON + CHOROPLETH ──────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (geoJsonRef.current) {
      geoJsonRef.current.remove();
    }

    fetch("/geo/kab.bekasi.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        const geoLayer = L.geoJSON(geojson, {
          style: (feature: any) => {
            const namaKecamatan =
              feature.properties.WADMKC ||
              feature.properties.nama ||
              feature.properties.NAMOBJ;

            const data = forecastData.find(
              (d) =>
                d.nama_kecamatan.toLowerCase() ===
                String(namaKecamatan).toLowerCase()
            );

            if (!data) {
              return {
                color: "#999",
                weight: 1,
                fillColor: "#ccc",
                fillOpacity: 0.2,
              };
            }

            return {
              color: "#ffffff",
              weight: 1.5,
              fillColor: getForecastColor(data.forecast),
              fillOpacity: 0.8,
            };

            const risk = getForecastRisk(data.forecast);
            const fillColor = getForecastColor(data.forecast);

            // Opacity berdasarkan risiko
            let opacity = 0.35;
            if (risk === "Tinggi") opacity = 0.9;
            else if (risk === "Sedang") opacity = 0.7;
            else if (risk === "Rendah") opacity = 0.5;

            return {
              color: "#ffffff",
              weight: selectedId === data.kecamatan_id ? 3 : 1.5,
              fillColor,
              fillOpacity: opacity,
            };
          },

          onEachFeature: (feature: any, layer) => {
            const namaKecamatan =
              feature.properties.WADMKC ||
              feature.properties.nama ||
              feature.properties.NAMOBJ;

            const data = forecastData.find(
              (d) =>
                d.nama_kecamatan.toLowerCase() ===
                String(namaKecamatan).toLowerCase()
            );

            if (!data) return;

            const risk = getForecastRisk(data.forecast);

            layer.bindPopup(`
              <div style="font-family:sans-serif;min-width:220px">
                <div style="font-weight:700;font-size:15px;margin-bottom:8px">
                  ${data.nama_kecamatan}
                </div>
                <div style="font-size:13px;line-height:1.6">
                  <div><b>Forecast SMA:</b> ${data.forecast}</div>
                  <div><b>Risiko:</b> ${risk}</div>
                  <div><b>Tahun Prediksi:</b> ${data.tahun_prediksi}</div>
                </div>
              </div>
            `);

            layer.on("click", () => {
              // onSelect membutuhkan KecamatanData — sesuaikan jika sudah ada mapping-nya
              // onSelect?.(data);
            });
          },
        });

        geoLayer.addTo(map);
        geoJsonRef.current = geoLayer;

        // ─── Marker dummy dinonaktifkan sementara ─────────────────────────────
        // Fokus saat ini: Choropleth dari Forecast SMA
        /*
        const markerLayer = markerLayerRef.current;
        if (!markerLayer) return;
        markerLayer.clearLayers();

        KECAMATAN.forEach((k) => {
          const value =
            filter === "banjir"
              ? k.banjir
              : filter === "longsor"
              ? k.longsor
              : filter === "gempa"
              ? k.gempa
              : totalDesa(k);

          if (filter !== "all" && value === 0) return;

          const risk = getRisk(k);
          const color = riskColor(risk);
          const radius = 8 + Math.min(value, 10) * 1.6;
          const isSelected = selectedId === k.id;

          const marker = L.circleMarker([k.lat, k.lng], {
            radius,
            color: isSelected ? "#1a3a5c" : "#ffffff",
            weight: isSelected ? 3 : 2,
            fillColor: color,
            fillOpacity: 0.9,
          });

          marker.bindPopup(`
            <div style="font-family:sans-serif;min-width:180px">
              <div style="font-weight:700;font-size:14px;margin-bottom:6px">
                ${k.nama}
              </div>
              <div style="display:grid;grid-template-columns:1fr auto;gap:4px;font-size:12px">
                <span>Banjir</span><b>${k.banjir}</b>
                <span>Longsor</span><b>${k.longsor}</b>
                <span>Gempa</span><b>${k.gempa}</b>
              </div>
              <div style="margin-top:8px;padding-top:8px;border-top:1px solid #eee;font-size:11px">
                Risiko: <b style="color:${color}">${risk}</b>
              </div>
            </div>
          `);

          marker.on("click", () => {
            onSelect?.(k);
          });

          marker.addTo(markerLayer);
        });
        */
      });
  }, [filter, selectedId, onSelect, forecastData]); // ← forecastData ditambahkan

  // ─── Load data kecamatan & forecast dari API internal ──────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const kecamatan = await getKecamatanData();
        const forecast = await getForecast({
          jenis_bencana: "Banjir",
          tahun_awal: 2019,
          tahun_akhir: 2025,
        });
        setKecamatanDb(kecamatan.data);
        setForecastDb(forecast.historis);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  return (
    <div
      ref={ref}
      style={{ height, width: "100%" }}
      className="rounded-2xl overflow-hidden"
    />
  );
}