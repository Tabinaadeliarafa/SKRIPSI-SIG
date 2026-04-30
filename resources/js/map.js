import L from 'leaflet';

// Fix default marker icon paths under Vite
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({ iconRetinaUrl: marker2x, iconUrl: marker, shadowUrl: shadow });

// Choropleth color scale (jumlah desa)
function colorFor(n) {
  if (n >= 7) return '#1a4870';
  if (n >= 5) return '#4a88c8';
  if (n >= 3) return '#8ab8e0';
  if (n >= 1) return '#b8d4ec';
  return '#d0ccc6';
}

const BASEMAPS = {
  osm:  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }),
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '© CARTO' }),
  topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '© OpenTopoMap' }),
  satelit: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri' }),
};

function popupHtml(p) {
  return `
    <div class="bks-popup">
      <div class="bks-popup-title">${p.nama}</div>
      <div class="bks-popup-row"><span>Banjir</span><b>${p.banjir} desa</b></div>
      <div class="bks-popup-row"><span>Longsor</span><b>${p.longsor} desa</b></div>
      <div class="bks-popup-row"><span>Gempa</span><b>${p.gempa} desa</b></div>
      <div class="bks-popup-row" style="margin-top:6px"><span>Risiko</span><b style="text-transform:capitalize">${p.risiko}</b></div>
      <div style="margin-top:8px;display:flex;gap:6px">
        <button class="bks-detail" style="background:#2d6ca8;color:#fff;border:0;padding:4px 8px;border-radius:4px;font-size:11px">Lihat Detail</button>
      </div>
    </div>
  `;
}

function styleFeature(feature) {
  const total = feature.properties.banjir + feature.properties.longsor;
  return {
    color: '#162f4a',
    weight: 1,
    fillColor: colorFor(total || feature.properties.banjir || 0),
    fillOpacity: 0.75,
  };
}

async function initMap(el) {
  const center = JSON.parse(el.dataset.center || '[-6.2,107.1]');
  const zoom = Number(el.dataset.zoom || 11);
  const map = L.map(el, { center, zoom, zoomControl: true });

  let currentBase = BASEMAPS.osm.addTo(map);

  try {
    const res = await fetch('/api/bencana/geojson');
    const geo = await res.json();
    const layer = L.geoJSON(geo, {
      style: styleFeature,
      pointToLayer: (feat, latlng) => L.circleMarker(latlng, {
        radius: 8 + (feat.properties.banjir || 0),
        ...styleFeature(feat),
      }),
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindPopup(popupHtml(p));
        layer.on('click', () => updateRightPanel(p));
      },
    }).addTo(map);

    if (layer.getBounds().isValid()) map.fitBounds(layer.getBounds(), { padding: [20, 20] });
  } catch (e) {
    console.warn('GeoJSON load failed:', e);
  } finally {
    el.querySelector('[data-loading]')?.remove();
  }

  // Basemap switcher buttons
  document.querySelectorAll('[data-basemap]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = BASEMAPS[btn.dataset.basemap];
      if (!next) return;
      map.removeLayer(currentBase);
      currentBase = next.addTo(map);
    });
  });

  return map;
}

function updateRightPanel(p) {
  const set = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };
  set('sel-name', p.nama);
  set('sel-banjir', p.banjir);
  set('sel-longsor', p.longsor);
  set('sel-gempa', p.gempa);
}

document.querySelectorAll('[id$="map"], #leaflet-map, #home-map, #public-map, #admin-map, #picker-map').forEach((el) => {
  if (el.dataset.initialized) return;
  el.dataset.initialized = '1';
  initMap(el);
});
