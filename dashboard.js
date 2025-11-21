// =======================================================
// 1. CONFIGURATION & API KEYS
// =======================================================
const API_KEY = "b1439b5b93805a9e9cc7737829d3b30f"; 
const SIMULATION_INTERVAL = 3000; 

// =======================================================
// 2. MOCK DATABASE (Mirrors Firebase Structure)
// =======================================================
const DB = {
  // STATIC DATA: Lake locations and details
  lakes: [
    {
      id: "SK_01", name: "South Lhonak", state: "Sikkim", 
      coords: [27.933, 88.567], type: "Moraine-dammed", basin: "Teesta",
      critical_zones: [
        { name: "Chungthang Dam", coords: [27.60, 88.65] },
        { name: "Lachen Village", coords: [27.72, 88.55] },
        { name: "NH 10 Highway", coords: [27.55, 88.50] }
      ]
    },
    {
      id: "UK_01", name: "Chorabari Tal", state: "Uttarakhand", 
      coords: [30.758, 79.056], type: "Glacial", basin: "Mandakini",
      critical_zones: [
        { name: "Kedarnath Temple", coords: [30.73, 79.06] },
        { name: "Rudraprayag Town", coords: [30.28, 78.98] }
      ]
    },
    {
      id: "HP_01", name: "Ghepan Gath", state: "Himachal Pradesh", 
      coords: [32.373, 77.250], type: "Moraine-dammed", basin: "Beas",
      critical_zones: [
        { name: "Manali Town", coords: [32.23, 77.18] },
        { name: "Sissu Helipad", coords: [32.48, 77.13] }
      ]
    }
  ],
  
  // DYNAMIC DATA: Telemetry
  telemetry: {
    "SK_01": { level: 16.5, threshold: 18, volume: 52.4, flow: 120, area: 1.02, stability: 85, growth: "+0.05" },
    "UK_01": { level: 4.2, threshold: 10, volume: 12.1, flow: 45, area: 0.15, stability: 92, growth: "Stable" },
    "HP_01": { level: 8.8, threshold: 12, volume: 30.5, flow: 88, area: 0.85, stability: 78, growth: "+0.02" }
  },
  
  // STATIC DATA: Historical Events
  history: [
    { year: "2013", title: "Chorabari Breach", loc: "Uttarakhand", date: "June 16, 2013", deaths: 5000, desc: "Catastrophic breach triggered by cloudburst leading to the Kedarnath disaster." },
    { year: "2021", title: "Chamoli Disaster", loc: "Uttarakhand", date: "Feb 7, 2021", deaths: 200, desc: "Rock-ice avalanche in Nanda Devi sanctuary caused flash floods in Rishi Ganga." },
    { year: "2023", title: "South Lhonak GLOF", loc: "Sikkim", date: "Oct 3, 2023", deaths: 40, desc: "South Lhonak Lake burst due to intense rain, destroying the Teesta III Dam." },
    { year: "2024", title: "Parechu Incident", loc: "Himachal", date: "Aug 2024", deaths: 0, desc: "Minor overflow detected early by satellite; preventive evacuation saved lives." }
  ],

  // DYNAMIC DATA: Recent Alerts
  alerts: [
    { lakeId: "SK_01", date: "2025-11-20", title: "Water Level Warning", desc: "Level rose by 0.5m in 2 hours due to upstream melt." },
    { lakeId: "SK_01", date: "2025-10-15", title: "Seismic Activity", desc: "Minor tremors detected near moraine wall." },
    { lakeId: "HP_01", date: "2025-09-01", title: "Heavy Rain Watch", desc: "IMD predicts heavy rainfall in Lahaul district." }
  ]
};

// =======================================================
// 3. GLOBAL STATE & INITIALIZATION
// =======================================================
let mapInstance = null;
let satMapInstance = null; // NEW: Global var for Satellite Map
let charts = {};
let activeLakeId = null;

document.addEventListener('DOMContentLoaded', () => {
  setupUI();
  renderNationalView();
  setupNavigation();
  startRealTimeSimulation(); 
});

function setupUI() {
  // Clock
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const clockEl = document.getElementById('clock');
    if(clockEl) clockEl.innerText = `${hours}:${minutes} ${ampm}`;
  }
  updateClock(); 
  setInterval(updateClock, 1000);

  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  
  if (localStorage.getItem('theme') === 'light') body.classList.add('light-mode');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('light-mode');
      localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
      if(activeLakeId && charts.liveMeteo) charts.liveMeteo.update();
    });
  }
}

function setupNavigation() {
  const toNational = () => renderNationalView();
  document.getElementById('back-to-national').addEventListener('click', toNational);
  document.getElementById('back-to-national-2').addEventListener('click', toNational);
  document.getElementById('back-to-state').addEventListener('click', () => {
    if(activeLakeId) {
      const lake = DB.lakes.find(l => l.id === activeLakeId);
      if(lake) renderStateView(lake.state);
    }
  });
}

function switchView(viewId) {
  document.querySelectorAll('.dashboard-view').forEach(el => el.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
}

// =======================================================
// 4. VIEW RENDERING LOGIC
// =======================================================

/* --- VIEW 1: NATIONAL --- */
function renderNationalView() {
  switchView('national-view');
  activeLakeId = null;
  renderMap('national-map', [23.0, 82.0], 4); 

  const tableBody = document.querySelector('#national-lakes-table tbody');
  tableBody.innerHTML = ''; 

  DB.lakes.forEach(lake => {
    addMarker(lake, () => renderStateView(lake.state));
    const t = DB.telemetry[lake.id];
    const risk = calculateRisk(t.level, t.threshold);
    const row = document.createElement('tr');
    row.innerHTML = `<td>${lake.name}</td><td>${lake.state}</td><td class="sev ${risk}">${risk}</td><td class="live-data">Live</td>`;
    row.onclick = () => renderStateView(lake.state);
    tableBody.appendChild(row);
  });
  renderHistoryChart();
}

/* --- VIEW 2: STATE (Updated with State Weather) --- */
async function renderStateView(stateName) {
  switchView('state-view');
  document.getElementById('state-name-breadcrumb').innerText = stateName;
  
  const stateLakes = DB.lakes.filter(l => l.state === stateName);
  if(stateLakes.length === 0) return;

  // 1. Fetch/Simulate Current State Weather
  const stateCoords = {
    "Sikkim": [27.3389, 88.6065], // Gangtok
    "Uttarakhand": [30.3165, 78.0322], // Dehradun
    "Himachal Pradesh": [31.1048, 77.1734] // Shimla
  };
  
  const coords = stateCoords[stateName] || stateLakes[0].coords;
  const stateW = await fetchWeatherData(coords[0], coords[1]);

  setText('state-live-temp', stateW.temp + "°C");
  setText('state-live-humid', stateW.humidity + "%");
  setText('state-live-wind', stateW.wind + " m/s");
  const condition = parseFloat(stateW.rain) > 2 ? "Rainy" : (parseFloat(stateW.temp) < 0 ? "Snowy" : "Clear");
  setText('state-live-condition', condition);

  // 2. Calculate Aggregated Risk Logic
  let maxRiskLevel = 0; 
  let worstLake = "None";
  let totalRain = 0;

  for(const lake of stateLakes) {
    const w = await fetchWeatherData(lake.coords[0], lake.coords[1]);
    totalRain += parseFloat(w.rain);
    const t = DB.telemetry[lake.id];
    const riskScore = t.level / t.threshold;
    if(riskScore > maxRiskLevel) {
      maxRiskLevel = riskScore;
      worstLake = lake.name;
    }
  }

  const avgRain = (totalRain / stateLakes.length).toFixed(1);
  setText('state-avg-rain', avgRain + " mm");

  const overallRisk = maxRiskLevel > 0.9 ? "High" : (maxRiskLevel > 0.7 ? "Medium" : "Low");
  const riskEl = document.getElementById('state-risk');
  riskEl.innerText = overallRisk;
  riskEl.className = `sev ${overallRisk}`;

  const worstLakeEl = document.getElementById('state-high-risk-lake');
  worstLakeEl.innerText = worstLake;
  worstLakeEl.className = `sev ${overallRisk}`;
  setText('state-last-alert', "2h ago");

  // 3. Map & Table
  const center = stateLakes[0].coords;
  renderMap('state-map', center, 8); 
  stateLakes.forEach(l => addMarker(l, () => renderLakeView(l.id)));

  const tbody = document.querySelector('#state-lakes-table tbody');
  tbody.innerHTML = '';
  stateLakes.forEach(lake => {
    const t = DB.telemetry[lake.id];
    const risk = calculateRisk(t.level, t.threshold);
    tbody.innerHTML += `<tr onclick="renderLakeView('${lake.id}')">
      <td>${lake.name}</td><td>${lake.basin}</td><td>${t.level} m</td><td class="sev ${risk}">${risk}</td>
      <td><button style="background:transparent; border:1px solid #64ffda; color:#64ffda; cursor:pointer;">View</button></td>
    </tr>`;
  });

  renderStateChart(avgRain, stateW.temp);
}

/* --- VIEW 3: LAKE VIEW --- */
async function renderLakeView(lakeId) {
  activeLakeId = lakeId;
  const lake = DB.lakes.find(l => l.id === lakeId);
  const t = DB.telemetry[lakeId];
  
  switchView('lake-view');
  setText('lake-name-breadcrumb', lake.name);
  setText('lake-id', lake.id);
  setText('lake-coords', lake.coords.join(', '));
  setText('lake-type', lake.type);
  setText('lake-basin', lake.basin);
  
  // MODIFIED: Initialize Satellite Map instead of Image
  renderSatelliteMap(lake.coords);
  
  setText('lake-ice-cover', "15% (Stable)");

  updateLakeRealTimeUI(lakeId);
  renderMap('lake-map', lake.coords, 13);
  addMarker(lake, null); 

  const w = await fetchWeatherData(lake.coords[0], lake.coords[1]);
  setText('lake-live-temp', w.temp + "°C");
  setText('lake-live-rain', w.rain + " mm");
  setText('lake-live-humid', w.humidity + "%");

  const zoneList = document.getElementById('lake-critical-zones');
  zoneList.innerHTML = lake.critical_zones.map(z => {
    const dist = getDistance(lake.coords[0], lake.coords[1], z.coords[0], z.coords[1]);
    return `<li><span style="color:var(--text-primary);">${z.name}</span>: <span style="color:var(--warning);">${dist} km</span> downstream</li>`;
  }).join('');

  const alerts = DB.alerts.filter(a => a.lakeId === lakeId);
  const alertContainer = document.getElementById('lake-alert-history');
  alertContainer.innerHTML = alerts.length ? alerts.map(a => `<div class="timeline-item"><strong>${a.title}</strong><span>${a.date}</span><p>${a.desc}</p></div>`).join('') : "<p style='color:var(--text-secondary)'>No recent alerts.</p>";

  renderLiveMeteoChart();
}

// =======================================================
// 5. HELPER FUNCTIONS
// =======================================================
function setText(id, text) { const el = document.getElementById(id); if(el) el.innerText = text; }
function calculateRisk(level, threshold) { return level >= threshold ? 'High' : (level >= threshold * 0.85 ? 'Medium' : 'Low'); }
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2);
}
function deg2rad(deg) { return deg * (Math.PI/180); }

async function fetchWeatherData(lat, lon) {
  if (API_KEY === "b1439b5b93805a9e9cc7737829d3b30f" || !API_KEY) {
    return {
      temp: (Math.random() * 15 - 5).toFixed(1),
      rain: (Math.random() * 5).toFixed(1),
      wind: (Math.random() * 20).toFixed(1),
      humidity: Math.floor(Math.random() * 50 + 40)
    };
  }
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const data = await res.json();
    return { temp: data.main.temp, humidity: data.main.humidity, wind: data.wind.speed, rain: data.rain ? data.rain['1h'] : 0 };
  } catch (e) { return { temp: "--", rain: "--", wind: "--", humidity: "--" }; }
}

function startRealTimeSimulation() {
  setInterval(() => {
    Object.keys(DB.telemetry).forEach(key => {
      const t = DB.telemetry[key];
      t.level = parseFloat((t.level + (Math.random() * 0.1 - 0.05)).toFixed(2));
      t.flow = Math.floor(t.flow + (Math.random() * 4 - 2));
    });
    if(activeLakeId && document.getElementById('lake-view').classList.contains('active')) {
      updateLakeRealTimeUI(activeLakeId);
      if(charts.liveMeteo) {
        const d = charts.liveMeteo.data.datasets[0].data;
        d.shift(); d.push(Math.random() * 2);
        charts.liveMeteo.update();
      }
    }
  }, SIMULATION_INTERVAL);
}

function updateLakeRealTimeUI(id) {
  const t = DB.telemetry[id];
  const risk = calculateRisk(t.level, t.threshold);
  setText('lake-water-level', t.level + " m");
  setText('lake-volume', t.volume + " M.m³");
  setText('lake-flow', t.flow + " m³/s");
  setText('lake-growth', t.growth + " km²/yr");
  setText('lake-area', t.area + " km²");
  setText('lake-stability', t.stability + "/100");
  const el = document.getElementById('lake-structure');
  el.innerText = risk === 'High' ? "UNSTABLE" : "Stable";
  el.className = `sev ${risk}`;
}

// =======================================================
// 6. MAP & CHART RENDERERS
// =======================================================
// =======================================================
// 6. MAP & CHART RENDERERS
// =======================================================

function renderMap(elemId, center, zoom) {
  if(mapInstance && mapInstance.getContainer().id === elemId) { 
    mapInstance.flyTo(center, zoom); 
    return; 
  }
  if(mapInstance) mapInstance.remove();
  
  mapInstance = L.map(elemId).setView(center, zoom);
  
  // FIX: Changed from 'dark_all' to 'Esri World Imagery' (Satellite)
  // This fixes the "Black Map" issue
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
  }).addTo(mapInstance);

  // Optional: Add a border/label layer on top if you want roads
  // L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}{r}.png').addTo(mapInstance);
}

// ... (Keep renderSatelliteMap as it is) ...tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap, &copy; CARTO' }).addTo(mapInstance);


// NEW: Renders the Satellite Map
function renderSatelliteMap(coords) {
  const container = document.getElementById('lake-satellite-map');
  if (!container) return;

  // Cleanup previous instance
  if (satMapInstance) { satMapInstance.remove(); satMapInstance = null; }

  satMapInstance = L.map('lake-satellite-map', { zoomControl: false, attributionControl: false }).setView(coords, 14);
  
  // ESRI World Imagery
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(satMapInstance);
  
  // Center Marker
  L.circleMarker(coords, { color: '#64ffda', fillColor: '#64ffda', fillOpacity: 0.5, radius: 8 }).addTo(satMapInstance);
}

function addMarker(lake, clickHandler) {
  const t = DB.telemetry[lake.id];
  const risk = calculateRisk(t.level, t.threshold);
  const color = risk === 'High' ? '#f44336' : (risk === 'Medium' ? '#ff9800' : '#4caf50');
  const icon = L.divIcon({ className: 'custom-pin', html: `<div style="background:${color}; width:12px; height:12px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 10px ${color};"></div>`, iconSize: [20, 20] });
  const m = L.marker(lake.coords, { icon: icon }).addTo(mapInstance);
  m.bindPopup(`<b>${lake.name}</b><br>Risk: ${risk}`);
  if(clickHandler) m.on('click', clickHandler);
}

function renderHistoryChart() {
  const ctx = document.getElementById('national-history-chart').getContext('2d');
  if(charts.history) charts.history.destroy();
  charts.history = new Chart(ctx, {
    type: 'bar',
    data: { labels: DB.history.map(h => h.year), datasets: [{ label: 'Casualties', data: DB.history.map(h => h.deaths), backgroundColor: '#f44336', borderRadius: 4 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { y: { grid: { color: '#112240' }, ticks: { color: '#8892b0' } }, x: { grid: { display: false }, ticks: { color: '#8892b0' } } },
      onClick: (e, activeEls) => {
        if(activeEls.length > 0) {
          const event = DB.history[activeEls[0].index];
          document.getElementById('history-modal').style.display = 'block';
          document.getElementById('hist-modal-title').innerText = event.title;
          document.getElementById('hist-modal-date').innerText = event.date;
          document.getElementById('hist-modal-loc').innerText = event.loc;
          document.getElementById('hist-modal-desc').innerText = event.desc;
        }
      }
    }
  });
}

function renderStateChart(avgRain, avgTemp) {
  const ctx = document.getElementById('state-rain-temp-chart').getContext('2d');
  if(charts.state) charts.state.destroy();
  charts.state = new Chart(ctx, {
    type: 'line',
    data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today'], datasets: [{ label: 'Rain (mm)', data: [2, 1, 4, 0, 2, avgRain], borderColor: '#64ffda', tension: 0.4 }, { label: 'Temp (°C)', data: [-2, -1, -3, -2, 0, avgTemp], borderColor: '#ff9800', tension: 0.4 }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#112240' }, ticks: { color: '#8892b0' } }, x: { grid: { display: false }, ticks: { color: '#8892b0' } } } }
  });
}

function renderLiveMeteoChart() {
  const ctx = document.getElementById('lake-meteo-chart').getContext('2d');
  if(charts.liveMeteo) charts.liveMeteo.destroy();
  charts.liveMeteo = new Chart(ctx, {
    type: 'line',
    data: { labels: ['-10s', '-8s', '-6s', '-4s', '-2s', 'Now'], datasets: [{ label: 'Rain Intensity (mm)', data: [0.2, 0.5, 0.1, 0.3, 0.2, 0.4], borderColor: '#64ffda', backgroundColor: 'rgba(100, 255, 218, 0.1)', fill: true, tension: 0.4 }] },
    options: { responsive: true, maintainAspectRatio: false, animation: false, scales: { y: { beginAtZero: true, grid: { color: '#112240' }, ticks: { color: '#8892b0' } }, x: { grid: { display: false }, ticks: { color: '#8892b0' } } } }
  });
}



