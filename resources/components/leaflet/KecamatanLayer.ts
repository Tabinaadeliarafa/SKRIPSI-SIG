/**
 * Layer batas wilayah kecamatan dari GeoJSON QGIS.
 * - Mode "all": polygon diwarnai berdasarkan tingkat risiko gabungan.
 * - Mode filter jenis (banjir/longsor/gempa): polygon memakai warna khas jenis
 *   tsb dengan opacity = intensitas (tingkat bahaya).
 * Popup menampilkan: nama kecamatan, jenis bencana, jumlah kejadian,
 * tingkat bahaya, dan tahun data.
 */
import L from "leaflet";
import type { KecamatanFC, KecamatanFeature } from "@/services/geojson";
import { getNamaFromFeature } from "@/services/geojson";
import type { DisasterFilter, RingkasanKecamatan } from "@/services/types";

const RISK_COLOR: Record<RingkasanKecamatan["risiko"], string> = {
  Tinggi: "#c0522a",
  Sedang: "#e8a23a",
  Rendah: "#4a8a5e",
  Aman: "#9aa7b3",
};

// Warna khas per jenis bencana (sesuai permintaan)
export const JENIS_COLOR: Record<Exclude<DisasterFilter, "all"> | "kekeringan", string> = {
  banjir: "#2d6ca8", // biru
  longsor: "#7a4a2a", // coklat
  gempa: "#4a8a5e", // hijau (tambahan)
  kekeringan: "#e8b84a", // kuning
};

const JENIS_LABEL: Record<Exclude<DisasterFilter, "all">, string> = {
  banjir: "Banjir",
  longsor: "Longsor",
  gempa: "Gempa",
};

function bahayaLevel(n: number): { label: string; opacity: number; color: string } {
  if (n <= 0) return { label: "Aman", opacity: 0.15, color: "#9aa7b3" };
  if (n <= 2) return { label: "Rendah", opacity: 0.4, color: "#4a8a5e" };
  if (n <= 4) return { label: "Sedang", opacity: 0.6, color: "#e8a23a" };
  return { label: "Tinggi", opacity: 0.8, color: "#c0522a" };
}

export interface KecamatanLayerHandlers {
  onSelect: (namaKecamatan: string, feature: KecamatanFeature) => void;
}

export interface KecamatanLayerOptions {
  filter?: DisasterFilter;
  tahun?: number;
}

export function renderKecamatanLayer(
  map: L.Map,
  fc: KecamatanFC,
  ringkasan: RingkasanKecamatan[],
  handlers: KecamatanLayerHandlers,
  selectedNama: string | null,
  options: KecamatanLayerOptions = {}
): L.GeoJSON {
  const filter = options.filter ?? "all";
  const tahun = options.tahun;
  const lookup = new Map(
    ringkasan.map((r) => [r.nama_kecamatan.toLowerCase().trim(), r])
  );

  const styleFor = (f?: KecamatanFeature): L.PathOptions => {
    if (!f) return {};
    const nama = getNamaFromFeature(f);
    const r = lookup.get(nama.toLowerCase().trim());
    const isSel = !!(selectedNama && nama.toLowerCase() === selectedNama.toLowerCase());

    if (filter !== "all") {
      const count = r ? r[filter] ?? 0 : 0;
      const lvl = bahayaLevel(count);
      const color = JENIS_COLOR[filter];
      return {
        color: isSel ? "#1a3a5c" : color,
        weight: isSel ? 3 : 1.2,
        fillColor: color,
        fillOpacity: isSel ? Math.min(lvl.opacity + 0.15, 0.95) : lvl.opacity,
      };
    }

    const color = r ? RISK_COLOR[r.risiko] : "#9aa7b3";
    return {
      color: isSel ? "#1a3a5c" : color,
      weight: isSel ? 3 : 1.2,
      fillColor: color,
      fillOpacity: isSel ? 0.55 : 0.35,
    };
  };

  const popupHTML = (nama: string, r?: RingkasanKecamatan) => {
    const rows: { jenis: string; jumlah: number; color: string }[] =
      filter === "all"
        ? [
            { jenis: "Banjir", jumlah: r?.banjir ?? 0, color: JENIS_COLOR.banjir },
            { jenis: "Longsor", jumlah: r?.longsor ?? 0, color: JENIS_COLOR.longsor },
            { jenis: "Gempa", jumlah: r?.gempa ?? 0, color: JENIS_COLOR.gempa },
          ]
        : [
            {
              jenis: JENIS_LABEL[filter],
              jumlah: (r?.[filter] as number) ?? 0,
              color: JENIS_COLOR[filter],
            },
          ];

    const lvl = bahayaLevel(
      filter === "all" ? r?.total ?? 0 : (r?.[filter] as number) ?? 0
    );

    return `<div style="font-family:Plus Jakarta Sans,sans-serif;min-width:210px">
      <div style="font-weight:700;color:#1a3a5c;font-size:14px;margin-bottom:6px">${nama}</div>
      <div style="display:grid;grid-template-columns:1fr auto;gap:4px;font-size:12px">
        ${rows
          .map(
            (x) =>
              `<span style="display:inline-flex;align-items:center;gap:6px"><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${x.color}"></i>${x.jenis}</span><b>${x.jumlah}</b>`
          )
          .join("")}
      </div>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #eee;font-size:11px;display:flex;justify-content:space-between">
        <span>Tingkat Bahaya: <b style="color:${lvl.color}">${lvl.label}</b></span>
        ${tahun ? `<span>Tahun <b>${tahun}</b></span>` : ""}
      </div>
    </div>`;
  };

  const layer = L.geoJSON(fc as any, {
    style: (f) => styleFor(f as KecamatanFeature),
    onEachFeature: (feature, lyr) => {
      const f = feature as KecamatanFeature;
      const nama = getNamaFromFeature(f);
      const r = lookup.get(nama.toLowerCase().trim());
      lyr.bindTooltip(nama, { sticky: true, className: "kec-tooltip" });
      lyr.bindPopup(popupHTML(nama, r));
      lyr.on({
        mouseover: (e) => {
          const l = e.target as L.Path;
          l.setStyle({ weight: 2.5 });
        },
        mouseout: (e) => {
          (layer as L.GeoJSON).resetStyle(e.target);
        },
        click: (e) => {
          const bounds = (e.target as L.Polygon).getBounds();
          map.flyToBounds(bounds, { padding: [40, 40], duration: 0.8 });
          handlers.onSelect(nama, f);
        },
      });
    },
  }).addTo(map);

  return layer;
}
