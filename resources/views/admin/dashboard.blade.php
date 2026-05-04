<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>SIG Bencana Kab. Bekasi — Dashboard</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Bebas+Neue&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#060d18;overflow:hidden}

@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse-ring{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.8);opacity:0}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes spin{to{transform:rotate(360deg)}}

body{
  font-family:'DM Sans',system-ui,sans-serif;
  background:#060d18;
  color:#e2e8f0;
  display:flex;
  flex-direction:column;
  height:100vh;
}

/* NAV */
.nav{
  display:flex;align-items:center;gap:12px;
  padding:0 24px;height:54px;
  background:rgba(10,18,35,.97);
  border-bottom:1px solid rgba(255,255,255,.07);
  flex-shrink:0;z-index:200;
}
.brand{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;color:#fff}
.brand span{color:#3b9ae1}
.badge{font-size:9px;font-weight:600;letter-spacing:1.5px;padding:2px 8px;
  background:rgba(59,154,225,.12);border:1px solid rgba(59,154,225,.3);
  color:#3b9ae1;border-radius:4px;text-transform:uppercase}
.nav-right{margin-left:auto;display:flex;align-items:center;gap:16px;font-size:11px;color:rgba(255,255,255,.4)}
.live-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;
  box-shadow:0 0 8px #22c55e;animation:float 2s ease-in-out infinite;flex-shrink:0}
.nav-back{font-size:12px;color:rgba(255,255,255,.4);text-decoration:none;
  padding:4px 10px;border:1px solid rgba(255,255,255,.1);border-radius:6px;
  transition:all .2s;display:flex;align-items:center;gap:5px}
.nav-back:hover{color:#fff;border-color:rgba(255,255,255,.25);background:rgba(255,255,255,.05)}

/* STATS */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px 22px 0;flex-shrink:0}
.stat-card{
  background:rgba(255,255,255,.04);
  border:1.5px solid rgba(255,255,255,.07);
  border-radius:14px;padding:12px 16px;
  display:flex;align-items:center;gap:14px;
  cursor:pointer;transition:all .25s cubic-bezier(.4,0,.2,1);
  animation:fadeUp .5s ease both;
  position:relative;overflow:hidden;
}
.stat-card:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.15)}
.stat-card.active{border-color:var(--c);box-shadow:0 0 24px -8px var(--g)}
.stat-icon{
  width:42px;height:42px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;
}
.stat-label{font-size:10px;font-weight:500;color:rgba(255,255,255,.4);letter-spacing:.3px;text-transform:uppercase}
.stat-val{font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:1px;line-height:1;color:#fff;transition:color .25s}
.stat-sub{font-size:10px;color:rgba(255,255,255,.25);margin-top:2px}

/* BODY */
.body{
  flex:1;display:grid;
  grid-template-columns:220px 1fr 220px;
  gap:10px;padding:10px 22px 14px;
  min-height:0;
  transition:grid-template-columns .45s cubic-bezier(.4,0,.2,1);
}
.body.fl{grid-template-columns:400px 1fr 180px}
.body.fr{grid-template-columns:180px 1fr 400px}

/* PANELS */
.panel{display:flex;flex-direction:column;gap:8px;overflow:hidden;min-height:0}
.pcard{
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.07);
  border-radius:14px;overflow:hidden;
  transition:all .3s cubic-bezier(.4,0,.2,1);
  cursor:pointer;
  animation:fadeUp .55s ease both;
  flex-shrink:0;
}
.pcard:hover{border-color:rgba(59,154,225,.3);background:rgba(59,154,225,.05)}
.pcard.exp{flex:1;border-color:rgba(59,154,225,.35)!important;overflow:hidden}
.pcard.grow{flex:1;overflow:hidden}
.phead{
  padding:9px 14px;display:flex;align-items:center;gap:7px;
  border-bottom:1px solid rgba(255,255,255,.05);
  font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;
  color:rgba(255,255,255,.55);flex-shrink:0;
}
.pdot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.pbody{padding:8px 14px;overflow-y:auto}
.pchevron{margin-left:auto;font-size:10px;color:rgba(255,255,255,.3)}

/* RANK ROW */
.rrow{
  display:flex;align-items:center;gap:7px;
  padding:4px 0;font-size:11.5px;
  border-bottom:1px solid rgba(255,255,255,.04);
  cursor:pointer;transition:color .15s;
}
.rrow:last-child{border-bottom:none}
.rrow:hover{color:#fff}
.rrow:hover .rbar-fill{filter:brightness(1.3)}
.rnum{width:14px;text-align:center;font-size:10px;font-weight:700;color:rgba(255,255,255,.22)}
.rname{flex:1;color:rgba(255,255,255,.7)}
.rval{font-weight:700;font-size:13px;width:16px;text-align:right}
.rbar-bg{height:3px;background:rgba(255,255,255,.06);border-radius:2px;margin:2px 0 3px;overflow:hidden}
.rbar-fill{height:100%;border-radius:2px;transition:width .9s cubic-bezier(.4,0,.2,1)}

/* KEC INFO */
.kec-info{
  background:rgba(59,154,225,.09);border:1px solid rgba(59,154,225,.2);
  border-radius:10px;padding:10px 12px;margin-bottom:8px;
  animation:fadeIn .25s ease;flex-shrink:0;
}
.kec-name{font-weight:700;font-size:13px;color:#fff;display:flex;align-items:center;gap:6px;margin-bottom:8px}
.kec-tag{font-size:8px;background:#3b9ae1;color:#fff;padding:1px 5px;border-radius:3px;letter-spacing:1px;text-transform:uppercase}
.kec-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px}
.kec-cell{background:rgba(255,255,255,.05);border-radius:7px;padding:6px 8px}
.kec-cl{font-size:10px;color:rgba(255,255,255,.38)}
.kec-cv{font-family:'Bebas Neue',sans-serif;font-size:20px;line-height:1.1}

/* MAP */
.map-wrap{display:flex;flex-direction:column;gap:8px;min-height:0}
.filter-bar{display:flex;align-items:center;justify-content:center;gap:8px;flex-shrink:0;animation:fadeUp .4s ease both}
.fbtn{
  display:flex;align-items:center;gap:7px;
  padding:6px 16px;border-radius:40px;font-size:12px;font-weight:600;
  border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);
  color:rgba(255,255,255,.5);cursor:pointer;
  transition:all .2s cubic-bezier(.4,0,.2,1);
  position:relative;overflow:hidden;white-space:nowrap;
  font-family:'DM Sans',sans-serif;
}
.fbtn:hover{border-color:rgba(255,255,255,.22);color:#fff;transform:translateY(-1px)}
.fbtn.active{border-color:var(--fc);color:#fff;background:rgba(255,255,255,.07);box-shadow:0 0 18px -4px var(--fg)}
.ficon{font-size:15px;position:relative;z-index:1}
.flabel{position:relative;z-index:1}
.aring{
  position:absolute;inset:-4px;border-radius:50px;
  border:2px solid var(--fc);
  animation:pulse-ring .9s ease-out infinite;
  pointer-events:none;
}

.map-box{
  flex:1;border-radius:16px;overflow:hidden;
  border:1px solid rgba(255,255,255,.08);
  position:relative;min-height:0;
  animation:fadeIn .8s ease both;
  box-shadow:0 0 60px -20px rgba(45,108,168,.4);
}
.map-ol{
  position:absolute;z-index:500;
  background:rgba(6,13,24,.88);
  border:1px solid rgba(255,255,255,.09);
  border-radius:10px;padding:8px 12px;
  backdrop-filter:blur(10px);
  font-size:11px;animation:fadeIn 1s ease .5s both;
}
.map-ol.tl{top:12px;left:12px}
.map-ol.br{bottom:44px;right:12px}
.map-ol.tr{top:12px;right:12px;min-width:120px}
.ol-title{font-size:9px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:4px}
.leg-row{display:flex;align-items:center;gap:6px;margin-top:3px;font-size:10.5px;color:rgba(255,255,255,.55)}
.leg-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}

.sel-badge{position:absolute;top:12px;right:12px;z-index:500;
  background:rgba(6,13,24,.92);border:1px solid rgba(59,154,225,.38);
  border-radius:8px;padding:5px 10px;animation:fadeIn .25s ease;backdrop-filter:blur(8px)}

/* SUMMARY */
.risk-row{display:flex;justify-content:space-between;align-items:center;font-size:11px;padding:3px 0}
.risk-dot-sm{width:6px;height:6px;border-radius:50%;flex-shrink:0}

/* Loader */
.loader{display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:14px}
.spinner{width:40px;height:40px;border:3px solid rgba(59,154,225,.15);border-top-color:#3b9ae1;border-radius:50%;animation:spin 1s linear infinite}
.loader-text{font-size:11px;color:rgba(255,255,255,.3);letter-spacing:1px;text-transform:uppercase}

/* scrollbar */
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}

/* Leaflet overrides */
.leaflet-popup-content-wrapper{background:rgba(6,13,24,.97)!important;border:1px solid rgba(59,154,225,.3)!important;border-radius:10px!important;box-shadow:0 8px 32px rgba(0,0,0,.5)!important;color:#e2e8f0!important}
.leaflet-popup-tip{background:rgba(6,13,24,.97)!important}
.leaflet-popup-close-button{color:rgba(255,255,255,.45)!important}
.leaflet-control-zoom a{background:rgba(6,13,24,.92)!important;border-color:rgba(255,255,255,.1)!important;color:#fff!important}
.leaflet-control-zoom a:hover{background:rgba(59,154,225,.2)!important}
.leaflet-attribution-flag{display:none!important}
.leaflet-control-attribution{background:rgba(6,13,24,.6)!important;color:rgba(255,255,255,.25)!important;font-size:9px!important}
</style>
</head>
<body>

<!-- NAV -->
<nav class="nav">
  <div class="brand">SIG <span>BKS</span></div>
  <div class="badge">Disaster Monitoring</div>
  <div class="nav-right">
    <div style="display:flex;align-items:center;gap:6px">
      <div class="live-dot"></div>
      <span>Live · BPS {{ $tahun ?? date('Y') }}</span>
    </div>
    <span>Kabupaten Bekasi, Jawa Barat</span>
    <a href="{{ route('admin.dashboard') }}" class="nav-back">← Admin</a>
  </div>
</nav>

<!-- STATS -->
<div class="stats" id="stats"></div>

<!-- BODY -->
<div class="body" id="body">
  <!-- LEFT -->
  <div class="panel" id="panel-left">
    <div class="pcard exp grow" id="card-top-banjir" onclick="togglePanel('left')">
      <div class="phead">
        <div class="pdot" style="background:#3b9ae1"></div>
        Top Banjir {{ $tahun ?? date('Y') }}
        <span class="pchevron" id="chev-left">▼</span>
      </div>
      <div class="pbody" id="top-banjir-list"></div>
    </div>
    <div class="pcard" style="animation-delay:.12s">
      <div class="phead"><div class="pdot" style="background:#22c55e"></div>Ringkasan</div>
      <div class="pbody" id="summary-body"></div>
    </div>
  </div>

  <!-- MAP CENTER -->
  <div class="map-wrap">
    <div class="filter-bar" id="filter-bar"></div>
    <div class="map-box" id="map-box">
      <div class="loader" id="map-loader">
        <div class="spinner"></div>
        <div class="loader-text">Memuat peta...</div>
      </div>
      <div id="map" style="width:100%;height:100%;display:none"></div>
      <div class="map-ol tl" id="legend-ol" style="display:none">
        <div class="ol-title">Legenda Banjir</div>
        <div class="leg-row"><div class="leg-dot" style="background:#64b5f6"></div>7–9 desa</div>
        <div class="leg-row"><div class="leg-dot" style="background:#4a88c8"></div>5–6 desa</div>
        <div class="leg-row"><div class="leg-dot" style="background:#2d6ca8"></div>3–4 desa</div>
        <div class="leg-row"><div class="leg-dot" style="background:#2d5f8a"></div>1–2 desa</div>
        <div class="leg-row"><div class="leg-dot" style="background:#1e3a5f"></div>0 desa</div>
      </div>
      <div class="map-ol br" id="src-ol" style="display:none">
        <div class="ol-title">Sumber Data</div>
        <div style="font-size:11px;color:rgba(255,255,255,.55)">BPS Kab. Bekasi {{ $tahun ?? date('Y') }}</div>
        <div style="font-size:10px;color:rgba(255,255,255,.28);margin-top:2px">© CartoDB Dark Matter</div>
      </div>
      <div class="map-ol tr sel-badge" id="sel-badge" style="display:none">
        <div class="ol-title">Fokus</div>
        <div id="sel-name" style="font-weight:700;font-size:13px;color:#fff"></div>
      </div>
    </div>
  </div>

  <!-- RIGHT -->
  <div class="panel" id="panel-right">
    <div class="pcard grow" id="card-all-kec" style="animation-delay:.1s;flex:1" onclick="togglePanel('right')">
      <div class="phead">
        <div class="pdot" style="background:#f59e0b"></div>
        Semua Kecamatan
        <span class="pchevron" id="chev-right">▼</span>
      </div>
      <div class="pbody" id="all-kec-list" style="max-height:260px"></div>
    </div>
    <div class="pcard" style="animation-delay:.18s">
      <div class="phead"><div class="pdot" style="background:#d85a30"></div>Longsor & Multi</div>
      <div class="pbody" id="longsor-body"></div>
    </div>
  </div>
</div>

<script>
// ── Data dari Laravel (di-inject via controller) ──────────────────────────────
const DATA = @json($kecamatanData);

const RISK_COLOR = {Tinggi:"#ef4444",Sedang:"#f59e0b",Rendah:"#22c55e",Aman:"#6b7280"};
const FILTERS = [
  {type:"all",    icon:"🗺️", label:"Semua",   fc:"#2d6ca8", fg:"rgba(45,108,168,.4)"},
  {type:"banjir", icon:"💧", label:"Banjir",  fc:"#3b9ae1", fg:"rgba(59,154,225,.4)"},
  {type:"longsor",icon:"⛰️", label:"Longsor", fc:"#d85a30", fg:"rgba(216,90,48,.4)"},
  {type:"gempa",  icon:"🌐", label:"Gempa",   fc:"#c0522a", fg:"rgba(192,82,42,.4)"},
];
const STATS_CFG = [
  {label:"Total Kecamatan",val:DATA.length,    icon:"🏘️",c:"#2d6ca8",g:"rgba(45,108,168,.35)",type:"all",    sub:"23 wilayah"},
  {label:"Desa Banjir",    val:null,           icon:"💧",c:"#3b9ae1",g:"rgba(59,154,225,.35)",type:"banjir", sub:"desa/kelurahan"},
  {label:"Desa Longsor",   val:null,           icon:"⛰️",c:"#d85a30",g:"rgba(216,90,48,.35)", type:"longsor",sub:"desa/kelurahan"},
  {label:"Desa Gempa",     val:null,           icon:"🌐",c:"#c0522a",g:"rgba(192,82,42,.35)", type:"gempa",  sub:"desa/kelurahan"},
];

const totals = DATA.reduce((a,k)=>({banjir:a.banjir+k.banjir,longsor:a.longsor+k.longsor,gempa:a.gempa+k.gempa}),{banjir:0,longsor:0,gempa:0});
STATS_CFG[1].val = totals.banjir;
STATS_CFG[2].val = totals.longsor;
STATS_CFG[3].val = totals.gempa;

// ── State ─────────────────────────────────────────────────────────────────────
let activeFilter = "all";
let selectedKec  = null;
let focusPanel   = null;
let mapInstance  = null;
let markers      = [];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getVal(k,type){return type==="banjir"?k.banjir:type==="longsor"?k.longsor:type==="gempa"?k.gempa:k.total}
function getColor(v,type){
  if(type==="longsor") return v>0?"#d85a30":"#1e3a5f";
  if(type==="gempa")   return v>0?"#c0522a":"#1e3a5f";
  if(v===0) return "#1e3a5f";
  if(v<=2)  return "#2d5f8a";
  if(v<=4)  return "#2d6ca8";
  if(v<=6)  return "#4a88c8";
  return "#64b5f6";
}

// ── Render stats ──────────────────────────────────────────────────────────────
function renderStats(){
  const el = document.getElementById("stats");
  el.innerHTML = STATS_CFG.map((s,i)=>`
    <div class="stat-card ${activeFilter===s.type?"active":""}"
         style="--c:${s.c};--g:${s.g};animation-delay:${i*.08}s;${activeFilter===s.type?`box-shadow:0 0 24px -8px ${s.g}`:""}"
         onclick="setFilter('${s.type}')">
      <div class="stat-icon" style="background:${s.c}22">${s.icon}</div>
      <div>
        <div class="stat-label">${s.label}</div>
        <div class="stat-val" style="color:${activeFilter===s.type?s.c:"#fff"}">${s.val}</div>
        <div class="stat-sub">${s.sub}</div>
      </div>
    </div>`).join("");
}

// ── Render filter bar ─────────────────────────────────────────────────────────
function renderFilters(){
  document.getElementById("filter-bar").innerHTML = FILTERS.map(f=>`
    <button class="fbtn ${activeFilter===f.type?"active":""}"
            style="--fc:${f.fc};--fg:${f.fg}"
            onclick="setFilter('${f.type}')">
      ${activeFilter===f.type?`<div class="aring" style="--fc:${f.fc}"></div>`:""}
      <span class="ficon">${f.icon}</span>
      <span class="flabel">${f.label}</span>
    </button>`).join("");
}

// ── Render side panels ────────────────────────────────────────────────────────
function renderPanels(){
  const infoExisting = document.getElementById("kec-info-box");
  if(infoExisting) infoExisting.remove();
  if(selectedKec){
    const box = document.createElement("div");
    box.id = "kec-info-box";
    box.className = "kec-info";
    box.innerHTML = `
      <div class="kec-name">
        <span class="kec-tag">Dipilih</span>
        ${selectedKec.name}
        <span style="margin-left:auto;font-size:10px;color:${RISK_COLOR[selectedKec.risk]};font-weight:700">● ${selectedKec.risk}</span>
      </div>
      <div class="kec-grid">
        ${[["Banjir",selectedKec.banjir,"#3b9ae1"],["Longsor",selectedKec.longsor,"#d85a30"],["Gempa",selectedKec.gempa,"#c0522a"],["Total",selectedKec.total,"#fff"]].map(([l,v,c])=>`
          <div class="kec-cell">
            <div class="kec-cl">${l}</div>
            <div class="kec-cv" style="color:${c}">${v}</div>
          </div>`).join("")}
      </div>`;
    document.getElementById("panel-left").prepend(box);
  }

  const topB = [...DATA].sort((a,b)=>b.banjir-a.banjir).slice(0,5).filter(k=>k.banjir>0);
  document.getElementById("top-banjir-list").innerHTML = topB.map((k,i)=>`
    <div class="rrow" onclick="selectKec(${k.id});event.stopPropagation()">
      <div class="rnum">${i+1}</div>
      <div style="flex:1">
        <div class="rname">${k.name}</div>
        <div class="rbar-bg"><div class="rbar-fill" style="width:${(k.banjir/9)*100}%;background:#3b9ae1"></div></div>
      </div>
      <div class="rval" style="color:#3b9ae1">${k.banjir}</div>
    </div>`).join("");

  const counts = {Tinggi:0,Sedang:0,Rendah:0,Aman:0};
  DATA.forEach(k=>counts[k.risk]++);
  document.getElementById("summary-body").innerHTML = `
    <p style="font-size:11px;color:rgba(255,255,255,.45);line-height:1.7;margin-bottom:8px">
      Data BPS Kabupaten Bekasi mencakup <strong style="color:#fff">${DATA.length} kecamatan</strong>
      dengan total <strong style="color:#3b9ae1">${totals.banjir+totals.longsor+totals.gempa} desa</strong> terdampak bencana.
    </p>
    ${Object.entries(counts).map(([r,n])=>`
      <div class="risk-row">
        <div style="display:flex;align-items:center;gap:6px">
          <div class="risk-dot-sm" style="background:${RISK_COLOR[r]}"></div>
          <span style="font-size:11px;color:rgba(255,255,255,.5)">Risiko ${r}</span>
        </div>
        <span style="font-weight:700;font-size:12px;color:${RISK_COLOR[r]}">${n}</span>
      </div>`).join("")}`;

  const sorted = [...DATA].sort((a,b)=>b.total-a.total);
  const maxH = focusPanel==="right"?"380px":"260px";
  document.getElementById("all-kec-list").style.maxHeight = maxH;
  document.getElementById("all-kec-list").innerHTML = sorted.map(k=>`
    <div class="rrow ${selectedKec?.id===k.id?"sel":""}"
         style="${selectedKec?.id===k.id?"border-color:rgba(59,154,225,.2);color:#fff":""}"
         onclick="selectKec(${k.id});event.stopPropagation()">
      <div style="width:6px;height:6px;border-radius:50%;background:${RISK_COLOR[k.risk]};flex-shrink:0"></div>
      <div class="rname" style="${selectedKec?.id===k.id?"color:#fff":""}">${k.name}</div>
      <div style="font-size:10px;color:#3b9ae1;font-weight:700">${k.total}</div>
    </div>`).join("");

  const lData = DATA.filter(k=>k.longsor>0).sort((a,b)=>b.longsor-a.longsor);
  const multiData = DATA.filter(k=>k.banjir>0&&k.longsor>0);
  document.getElementById("longsor-body").innerHTML = `
    ${lData.map((k,i)=>`
      <div class="rrow" onclick="selectKec(${k.id});event.stopPropagation()">
        <div class="rnum">${i+1}</div>
        <div style="flex:1">
          <div class="rname">${k.name}</div>
          <div class="rbar-bg"><div class="rbar-fill" style="width:${(k.longsor/2)*100}%;background:#d85a30"></div></div>
        </div>
        <div class="rval" style="color:#d85a30">${k.longsor}</div>
      </div>`).join("")}
    ${multiData.map(k=>`
      <div style="margin-top:6px;padding:5px 8px;background:rgba(216,90,48,.08);border-radius:6px;font-size:11px">
        <span style="color:rgba(255,255,255,.45)">Multi: </span>
        <strong style="color:#fff">${k.name}</strong>
        <span style="color:rgba(255,255,255,.3)"> (banjir+longsor)</span>
      </div>`).join("")}`;

  const sb = document.getElementById("sel-badge");
  const sn = document.getElementById("sel-name");
  if(selectedKec){ sb.style.display="block"; sn.textContent=selectedKec.name; }
  else { sb.style.display="none"; }
}

// ── Map ───────────────────────────────────────────────────────────────────────
function buildMarkers(){
  if(!mapInstance) return;
  markers.forEach(m=>{try{mapInstance.removeLayer(m)}catch{}});
  markers=[];
  DATA.forEach(k=>{
    const val = getVal(k,activeFilter);
    const color = getColor(val,activeFilter);
    const opacity = (activeFilter!=="all"&&val===0)?.18:.85;
    const radius = Math.max(7, Math.min(26, 7+val*2.8));
    const c = L.circleMarker([k.lat,k.lng],{
      radius,fillColor:color,color:"rgba(255,255,255,.55)",
      weight:1.5,opacity:1,fillOpacity:opacity,
    });
    c.bindPopup(`
      <div style="font-family:'DM Sans',sans-serif;min-width:180px;padding:4px 2px">
        <div style="font-size:13px;font-weight:700;color:#90c8f0;margin-bottom:6px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:6px">📍 ${k.name}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;font-size:11px">
          <div style="background:rgba(59,154,225,.12);border-radius:5px;padding:4px 7px">
            <div style="color:rgba(255,255,255,.4)">Banjir</div>
            <div style="font-weight:700;color:#3b9ae1;font-size:17px">${k.banjir}</div>
          </div>
          <div style="background:rgba(216,90,48,.12);border-radius:5px;padding:4px 7px">
            <div style="color:rgba(255,255,255,.4)">Longsor</div>
            <div style="font-weight:700;color:#d85a30;font-size:17px">${k.longsor}</div>
          </div>
          <div style="background:rgba(192,82,42,.12);border-radius:5px;padding:4px 7px">
            <div style="color:rgba(255,255,255,.4)">Gempa</div>
            <div style="font-weight:700;color:#c0522a;font-size:17px">${k.gempa}</div>
          </div>
          <div style="background:rgba(255,255,255,.06);border-radius:5px;padding:4px 7px">
            <div style="color:rgba(255,255,255,.4)">Total</div>
            <div style="font-weight:700;color:#fff;font-size:17px">${k.total}</div>
          </div>
        </div>
        <div style="margin-top:6px;text-align:center;font-size:10px;color:rgba(255,255,255,.35)">
          Risiko: <strong style="color:${RISK_COLOR[k.risk]}">${k.risk}</strong>
        </div>
      </div>`, {maxWidth:220});
    c.on("click",()=>selectKec(k.id));
    c.addTo(mapInstance);
    markers.push(c);
  });
}

function initMap(){
  const loader = document.getElementById("map-loader");
  const mapEl  = document.getElementById("map");
  loader.style.display = "none";
  mapEl.style.display  = "block";
  document.getElementById("legend-ol").style.display = "block";
  document.getElementById("src-ol").style.display    = "block";

  mapInstance = L.map("map",{
    center:[-6.25,107.15],zoom:10,
    zoomControl:false,attributionControl:true,
  });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_matter/{z}/{x}/{y}{r}.png",{maxZoom:19}).addTo(mapInstance);
  L.control.zoom({position:"bottomright"}).addTo(mapInstance);
  buildMarkers();
}

// ── Actions ───────────────────────────────────────────────────────────────────
function setFilter(type){
  activeFilter = type;
  selectedKec  = null;
  renderStats();
  renderFilters();
  buildMarkers();
  if(type!=="all"){
    const top = [...DATA].sort((a,b)=>getVal(b,type)-getVal(a,type))[0];
    if(getVal(top,type)>0 && mapInstance){
      mapInstance.flyTo([top.lat,top.lng],12,{animate:true,duration:1.2,easeLinearity:.25});
    }
  } else if(mapInstance){
    mapInstance.flyTo([-6.25,107.15],10,{animate:true,duration:1.2});
  }
  renderPanels();
}

function selectKec(idOrKec){
  const k = typeof idOrKec==="number" ? DATA.find(d=>d.id===idOrKec) : idOrKec;
  if(!k) return;
  selectedKec = k;
  if(mapInstance) mapInstance.flyTo([k.lat,k.lng],13,{animate:true,duration:1.2,easeLinearity:.25});
  renderPanels();
}

function togglePanel(side){
  focusPanel = focusPanel===side ? null : side;
  const body = document.getElementById("body");
  body.className = "body" + (focusPanel==="left"?" fl":focusPanel==="right"?" fr":"");
  document.getElementById("chev-left").textContent  = focusPanel==="left"  ? "▲" : "▼";
  document.getElementById("chev-right").textContent = focusPanel==="right" ? "▲" : "▼";
  setTimeout(()=>{ if(mapInstance) mapInstance.invalidateSize(); }, 500);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
renderStats();
renderFilters();
renderPanels();

if(typeof L !== "undefined"){
  setTimeout(initMap, 200);
} else {
  const check = setInterval(()=>{
    if(typeof L!=="undefined"){ clearInterval(check); initMap(); }
  },100);
}
</script>
</body>
</html>