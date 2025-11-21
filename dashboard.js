// ==== CONFIGURATION ====
const OPENWEATHER_API_KEY = "YOUR_API_KEY_HERE"; // Insert Key if you have one, else simulation runs
const USE_SIMULATION = true; // Set to TRUE for Viva/Demo to show moving numbers

// ==== DATA ARCHITECTURE (FIREBASE MIRROR) ====
// This object mirrors how your NoSQL Collections look.
const DB = {
  lakes: [
    {
      id: "SK_01", name: "South Lhonak", state: "Sikkim", 
      coords: [27.933, 88.567], type: "Moraine-dammed", basin: "Teesta",
      img: "https://earthobservatory.nasa.gov/ContentFeature/Images/glof_sikkim_2023/glof_sikkim_l7_2023278_lrg.jpg",
      critical_zones: [
        { name: "Chungthang Dam", coords: [27.60, 88.65] },
        { name: "Lachen Village", coords: [27.72, 88.55] }
      ]
    },
    {
      id: "UK_01", name: "Chorabari Tal", state: "Uttarakhand", 
      coords: [30.758, 79.056], type: "Glacial", basin: "Mandakini",
      img: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Chorabari_Tal.jpg",
      critical_zones: [
        { name: "Kedarnath Temple", coords: [30.73, 79.06] },
        { name: "Rudraprayag", coords: [30.28, 78.98] }
      ]
    },
    {
      id: "HP_01", name: "Ghepan Gath", state: "Himachal Pradesh", 
      coords: [32.373, 77.250], type: "Moraine-dammed", basin: "Beas",
      img: "https://pbs.twimg.com/media/F_x-y-aXoAAgL-_.jpg",
      critical_zones: [
        { name: "Manali Town", coords: [32.23, 77.18] }
      ]
    }
  ],
  // "Telemetry" is the real-time data
  telemetry: {
    "SK_01": { waterLevel: 16.5, threshold: 18, volume: 52.4, flow: 120, stability: 85, temp: -2, rain: 5, humidity: 80 },
    "UK_01": { waterLevel: 4.2, threshold: 10, volume: 12.1, flow: 45, stability: 92, temp: 1, rain: 0, humidity: 60 },
    "HP_01": { waterLevel: 8.8, threshold: 12, volume: 30.5, flow: 88, stability: 78, temp: 3, rain: 2, humidity: 55 }
  },
  history: [
    { year: 2023, location: "South Lhonak", desc: "Cloudburst triggered massive GLOF destroying Teesta III dam.", deaths: 40 },
    { year: 2021, location: "Chamoli", desc: "Rock-ice avalanche caused flash floods.", deaths: 200 },
    { year: 2013, location: "Chorabari", desc: "Kedarnath disaster due to lake breach.", deaths: 5000 }
  ]
};

// ==== GLOBAL STATE ====
let mapInstance = null;
let charts = {};
let currentView = 'national';
let activeLakeId = null;

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  if(USE_SIMULATION) startRealTimeSimulation();
});

// ==== INITIALIZATION ====
function initDashboard() {
  renderNationalView();
  setupNavigation();
}

function setupNavigation() {
  document.getElementById('back-to-national').onclick = renderNationalView;
  document.getElementById('back-to-national-2').onclick = renderNationalView;
  document.getElementById('back-to-state').onclick = () => {
    const lake = DB.lakes.find(l => l.id === activeLakeId);
    if(lake) renderStateView(lake.state);
  };
}

// ==== VIEW RENDERERS ====

// 1. NATIONAL VIEW
function renderNationalView() {
  switchView('national-view');
  
  // Render Map with ALL Lakes
  renderMap('national-map', [28.5, 84.0], 5);
  DB.lakes.forEach(lake => {
    addMarker(lake, (l) => renderLakeView(l.id));
  });

  // Render Risk Table (Sorted by Risk)
  const tbody = document.getElementById('national-lakes-table').querySelector('tbody');
  tbody.innerHTML = '';
  DB.lakes.forEach(lake => {
    const tel = DB.telemetry[lake.id];
    const risk = calculateRisk(tel.waterLevel, tel.threshold, tel.rain);
    tbody.innerHTML += `
      <tr onclick="renderLakeView('${lake.id}')" style="cursor:pointer">
        <td>${lake.name}</td>
        <td>${lake.state}</td>
        <td class="sev ${risk}">${risk}</td>
        <td>Just now</td>
      </tr>`;
  });

  // Render Historical Chart
  renderHistoryChart();
}

// 2. STATE VIEW
function renderStateView(stateName) {
  switchView('state-view');
  document.getElementById('state-name-breadcrumb').innerText = stateName;

  // Filter Lakes for State
  const stateLakes = DB.lakes.filter(l => l.state === stateName);
  
  // Calculate Aggregates (Simulating API aggregation)
  let totalRain = 0, totalTemp = 0, maxRisk = 'Low';
  stateLakes.forEach(l => {
    const tel = DB.telemetry[l.id];
    totalRain += tel.rain;
    totalTemp += tel.temp;
    const risk = calculateRisk(tel.waterLevel, tel.threshold, tel.rain);
    if (risk === 'High') maxRisk = 'High';
    else if (risk === 'Medium' && maxRisk !== 'High') maxRisk = 'Medium';
  });

  // Update DOM
  document.getElementById('state-avg-rain').innerText = (totalRain / stateLakes.length).toFixed(1) + ' mm';
  document.getElementById('state-avg-temp').innerText = (totalTemp / stateLakes.length).toFixed(1) + '°C';
  document.getElementById('state-risk').innerText = maxRisk;
  document.getElementById('state-risk').className = `sev ${maxRisk}`;
  
  // Map Focus
  const center = stateLakes[0].coords;
  renderMap('state-map', center, 8);
  stateLakes.forEach(l => addMarker(l, (lake) => renderLakeView(lake.id)));

  // Lake Table
  const tbody = document.getElementById('state-lakes-table').querySelector('tbody');
  tbody.innerHTML = stateLakes.map(l => {
    const tel = DB.telemetry[l.id];
    const risk = calculateRisk(tel.waterLevel, tel.threshold, tel.rain);
    return `<tr onclick="renderLakeView('${l.id}')">
      <td>${l.name}</td>
      <td>${l.basin}</td>
      <td>${tel.waterLevel}m</td>
      <td class="sev ${risk}">${risk}</td>
      <td>${risk === 'High' ? 'Evacuate' : 'Monitor'}</td>
    </tr>`;
  }).join('');
}

// 3. LAKE VIEW (The Detail Powerhouse)
async function renderLakeView(lakeId) {
  activeLakeId = lakeId;
  const lake = DB.lakes.find(l => l.id === lakeId);
  const tel = DB.telemetry[lakeId];
  
  switchView('lake-view');

  // Basic Info
  document.getElementById('lake-name-breadcrumb').innerText = lake.name;
  document.getElementById('lake-id').innerText = lake.id;
  document.getElementById('lake-type').innerText = lake.type;
  document.getElementById('lake-basin').innerText = lake.basin;
  document.getElementById('lake-coords').innerText = lake.coords.join(', ');
  document.getElementById('lake-satellite-img').src = lake.img;
  document.getElementById('lake-ice-cover').innerText = "15%"; // Mock
  document.getElementById('lake-ndwi').innerText = "0.42"; // Mock

  // Map Zoom
  renderMap('lake-map', lake.coords, 13);
  addMarker(lake, null); // Static marker

  // Live Telemetry (Initial Render)
  updateLakeTelemetryUI(lakeId);

  // Weather API Call
  const weather = await fetchWeatherData(lake.coords[0], lake.coords[1]);
  document.getElementById('lake-live-temp').innerText = weather.temp + "°C";
  document.getElementById('lake-live-rain').innerText = weather.rain + "mm";
  document.getElementById('lake-live-humid').innerText = weather.humidity + "%";
  
  // Critical Zones (Distance Calculation)
  const zonesList = document.getElementById('lake-critical-zones');
  zonesList.innerHTML = lake.critical_zones.map(zone => {
    const dist = calculateDistance(lake.coords[0], lake.coords[1], zone.coords[0], zone.coords[1]);
    return `<li><b>${zone.name}</b>: ${dist} km downstream</li>`;
  }).join('');

  // Render Live Chart
  renderLiveChart();
}

// ==== LOGIC & CALCULATIONS ====

function calculateRisk(level, threshold, rain) {
  if (level >= threshold) return 'High';
  if (level >= threshold * 0.8 || rain > 10) return 'Medium';
  return 'Low';
}

// Haversine Formula for Distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
}

// API Fetcher (with Mock Fallback)
async function fetchWeatherData(lat, lon) {
  if (!USE_SIMULATION && OPENWEATHER_API_KEY !== "YOUR_API_KEY_HERE") {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`);
      const data = await res.json();
      return { 
        temp: data.main.temp, 
        humidity: data.main.humidity, 
        rain: data.rain ? data.rain['1h'] : 0 
      };
    } catch (e) { console.error("API Error, using fallback"); }
  }
  // Fallback / Simulation
  return {
    temp: (Math.random() * 10 - 5).toFixed(1),
    humidity: Math.floor(Math.random() * 50 + 40),
    rain: (Math.random() * 5).toFixed(1)
  };
}

// ==== SIMULATION ENGINE (FOR VIVA) ====
function startRealTimeSimulation() {
  setInterval(() => {
    // Update Telemetry Data randomly
    Object.keys(DB.telemetry).forEach(key => {
      const t = DB.telemetry[key];
      t.waterLevel = parseFloat((t.waterLevel + (Math.random() * 0.2 - 0.1)).toFixed(2));
      t.rain = parseFloat((t.rain + (Math.random() * 0.5 - 0.2)).toFixed(1));
      if(t.rain < 0) t.rain = 0;
    });

    // If looking at a lake, update UI instantly
    if (activeLakeId && document.getElementById('lake-view').classList.contains('active')) {
      updateLakeTelemetryUI(activeLakeId);
      updateLiveChart(); // Make graph move
    }
  }, 2000); // Every 2 seconds
}

function updateLakeTelemetryUI(id) {
  const t = DB.telemetry[id];
  document.getElementById('lake-water-level').innerText = t.waterLevel + " m";
  document.getElementById('lake-volume').innerText = t.volume + " M.m³";
  document.getElementById('lake-stability').innerText = t.stability + " (Index)";
  
  const risk = calculateRisk(t.waterLevel, t.threshold, t.rain);
  document.getElementById('lake-dam-status').innerText = risk === 'High' ? 'UNSTABLE' : 'Stable';
  document.getElementById('lake-dam-status').className = risk === 'High' ? 'sev High' : 'sev Low';
}

// ==== CHARTING ====
function renderHistoryChart() {
  const ctx = document.getElementById('national-history-chart');
  if(charts.history) charts.history.destroy();

  charts.history = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DB.history.map(h => h.year),
      datasets: [{ label: 'GLOF Events', data: DB.history.map(h => h.deaths / 100), backgroundColor: '#f44336' }]
    },
    options: {
      onClick: (e, elements) => {
        if(elements.length > 0) {
          const idx = elements[0].index;
          const event = DB.history[idx];
          // Show details
          document.getElementById('history-modal').style.display = 'block';
          document.getElementById('hist-modal-title').innerText = `${event.year} - ${event.location}`;
          document.getElementById('hist-modal-desc').innerText = `${event.desc} (${event.deaths} casualties)`;
        }
      }
    }
  });
}

function renderLiveChart() {
  const ctx = document.getElementById('lake-live-chart');
  if(charts.live) charts.live.destroy();

  charts.live = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['-10s', '-8s', '-6s', '-4s', '-2s', 'Now'],
      datasets: [
        { label: 'Water Level', data: [10, 10, 10, 10, 10, 10], borderColor: '#4fc3f7', tension: 0.4 }
      ]
    },
    options: { animation: false }
  });
}

function updateLiveChart() {
  if(!charts.live) return;
  const data = charts.live.data.datasets[0].data;
  const newVal = DB.telemetry[activeLakeId].waterLevel;
  data.shift();
  data.push(newVal);
  charts.live.update();
}

// ==== MAP HELPERS ====
function renderMap(elemId, center, zoom) {
  if(mapInstance && mapInstance.getContainer().id === elemId) {
    mapInstance.setView(center, zoom);
    return; // Reuse
  }
  if(mapInstance) mapInstance.remove();
  
  mapInstance = L.map(elemId).setView(center, zoom);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(mapInstance);
}

function addMarker(lake, clickHandler) {
  const t = DB.telemetry[lake.id];
  const risk = calculateRisk(t.waterLevel, t.threshold, t.rain);
  const color = risk === 'High' ? '#f44336' : (risk === 'Medium' ? '#ff9800' : '#4caf50');
  
  const icon = L.divIcon({
    className: 'custom-pin',
    html: `<div style="background:${color}; width:15px; height:15px; border-radius:50%; border:2px solid white;"></div>`
  });

  const m = L.marker(lake.coords, {icon}).addTo(mapInstance).bindPopup(lake.name);
  if(clickHandler) m.on('click', () => clickHandler(lake));
}

function switchView(viewId) {
  document.querySelectorAll('.dashboard-view').forEach(el => el.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
}
