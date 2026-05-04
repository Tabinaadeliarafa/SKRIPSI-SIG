import { useEffect, useRef } from "react";
import L from "leaflet";
import { KECAMATAN, type KecamatanData, getRisk, riskColor, totalDesa } from "@/data/bencana";

// fix default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  height?: string;
  filter?: "all" | "banjir" | "longsor" | "gempa";
  onSelect?: (k: KecamatanData) => void;
  selectedId?: number | null;
}

export function BekasiMap({ height = "520px", filter = "all", onSelect, selectedId }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { zoomControl: true, attributionControl: false }).setView([-6.23, 107.13], 10);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap, &copy; CARTO",
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    KECAMATAN.forEach((k) => {
      const value = filter === "banjir" ? k.banjir : filter === "longsor" ? k.longsor : filter === "gempa" ? k.gempa : totalDesa(k);
      if (filter !== "all" && value === 0) return;
      const risk = getRisk(k);
      const color = riskColor(risk);
      const radius = 8 + Math.min(value, 10) * 1.6;
      const isSelected = selectedId === k.id;
      const marker = L.circleMarker([k.lat, k.lng], {
        radius,
        color: isSelected ? "#1a3a5c" : color,
        weight: isSelected ? 3 : 1.5,
        fillColor: color,
        fillOpacity: 0.7,
      });
      marker.bindPopup(`
        <div style="font-family:Plus Jakarta Sans,sans-serif;min-width:180px">
          <div style="font-weight:700;color:#1a3a5c;font-size:14px;margin-bottom:6px">${k.nama}</div>
          <div style="display:grid;grid-template-columns:1fr auto;gap:4px;font-size:12px;color:#444">
            <span>Banjir</span><b style="color:#2d6ca8">${k.banjir} desa</b>
            <span>Longsor</span><b style="color:#c0522a">${k.longsor} desa</b>
            <span>Gempa</span><b>${k.gempa} desa</b>
          </div>
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid #eee;font-size:11px">
            Risiko: <b style="color:${color}">${risk}</b>
          </div>
        </div>`);
      marker.on("click", () => onSelect?.(k));
      marker.addTo(layer);
    });
  }, [filter, onSelect, selectedId]);

  return <div ref={ref} style={{ height, width: "100%" }} className="rounded-2xl overflow-hidden" />;
}
