// =======================================================
// 1. CONFIGURATION & API KEYS
// =======================================================
// Replace with your key. If left as "YOUR_KEY", simulation runs.
const API_KEY = "b1439b5b93805a9e9cc7737829d3b30f"; 
const SIMULATION_INTERVAL = 3000; // Updates every 3 seconds

// =======================================================
// 2. MOCK DATABASE (Mirrors Firebase Structure)
// =======================================================
const DB = {
  // STATIC DATA: Lake locations and details
  lakes: [
    {
      id: "SK_01", name: "South Lhonak", state: "Sikkim", 
      coords: [27.933, 88.567], type: "Moraine-dammed", basin: "Teesta",
      img: "https://earthobservatory.nasa.gov/ContentFeature/Images/glof_sikkim_2023/glof_sikkim_l7_2023278_lrg.jpg",
      critical_zones: [
        { name: "Chungthang Dam", coords: [27.60, 88.65] },
        { name: "Lachen Village", coords: [27.72, 88.55] },
        { name: "NH 10 Highway", coords: [27.55, 88.50] }
      ]
    },
    {
      id: "UK_01", name: "Chorabari Tal", state: "Uttarakhand", 
      coords: [30.758, 79.056], type: "Glacial", basin: "Mandakini",
      img: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Chorabari_Tal.jpg",
      critical_zones: [
        { name: "Kedarnath Temple", coords: [30.73, 79.06] },
        { name: "Rudraprayag Town", coords: [30.28, 78.98] }
      ]
    },
    {
      id: "HP_01", name: "Ghepan Gath", state: "Himachal Pradesh", 
      coords: [32.373, 77.250], type: "Moraine-dammed", basin: "Beas",
      img: "https://pbs.twimg.com/media/F_x-y-aXoAAgL-_.jpg",
      critical_zones: [
        { name: "Manali Town", coords: [32.23, 77.18] },
        { name: "Sissu Helipad", coords: [32.48, 77.13] }
      ]
    }
  ],
  
  // DYNAMIC DATA: Telemetry (Water levels, sensors)
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
// 3. GLOBAL STATE VARIABLES
// =======================================================
let mapInstance = null; // Leaflet map instance
let charts = {};        // Store chart instances to update/destroy
let activeLakeId = null;// Currently viewed lake

// =======================================================
// 4. INITIALIZATION
// =======================================================
// ... (Keep your existing Configuration, Database, and Global State sections) ...

// =======================================================
// 4. INITIALIZATION
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Setup UI Elements (Clock & Theme) - NEW
  setupUI();

  // 2. Load default view
  renderNationalView();
  
  // 3. Setup Navigation listeners
  setupNavigation();
  
  // 4. Start the "Fake" Live Data
  startRealTimeSimulation(); 
});

// =======================================================
// NEW: UI SETUP FUNCTION (Clock & Theme)
// =======================================================
function setupUI() {
  // --- A. CLOCK LOGIC ---
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert hour '0' to '12'
    
    const timeString = `${hours}:${minutes} ${ampm}`;
    
    const clockEl = document.getElementById('clock');
    if(clockEl) clockEl.innerText = timeString;
  }
  
  // Update immediately and then every second
  updateClock(); 
  setInterval(updateClock, 1000);

  // --- B. THEME TOGGLE LOGIC ---
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  
  // 1. Check Local Storage for saved preference
  if (localStorage.getItem('theme') === 'light') {
    body.classList.add('light-mode');
  }

  // 2. Toggle Listener
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('light-mode');
      
      // Save preference
      if (body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
      } else {
        localStorage.setItem('theme', 'dark');
      }

      // Optional: Re-render active chart if you want colors to update instantly
      if(activeLakeId && charts.liveMeteo) {
         charts.liveMeteo.update(); // Triggers chart refresh for new colors
      }
    });
  }
}

// ... (Keep the rest of your Navigation, View Rendering, and Helper functions) ...
document.addEventListener('DOMContentLoaded', () => {
  // Load default view
  renderNationalView();
  
  // Setup Navigation listeners
  setupNavigation();
  
  // Start the "Fake" Live Data
  startRealTimeSimulation(); 
});

function setupNavigation() {
  // Breadcrumb clicks
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
  // Hide all views
  document.querySelectorAll('.dashboard-view').forEach(el => el.classList.remove('active'));
  // Show target view
  document.getElementById(viewId).classList.add('active');
}

// =======================================================
// 5. VIEW RENDERING LOGIC
// =======================================================

/* --- VIEW 1: NATIONAL --- */
function renderNationalView() {
  switchView('national-view');
  activeLakeId = null;

  // 1. Initialize/Update Map
  renderMap('national-map', [23.0, 82.0], 4); // Center on India

  // 2. Populate Map Markers & Table
  const tableBody = document.querySelector('#national-lakes-table tbody');
  tableBody.innerHTML = ''; // Clear old rows

  DB.lakes.forEach(lake => {
    // Add Marker
    addMarker(lake, () => renderStateView(lake.state));

    // Add Table Row
    const t = DB.telemetry[lake.id];
    const risk = calculateRisk(t.level, t.threshold);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${lake.name}</td>
      <td>${lake.state}</td>
      <td class="sev ${risk}">${risk}</td>
      <td class="live-data">Live</td>
    `;
    row.onclick = () => renderStateView(lake.state);
    tableBody.appendChild(row);
  });

  // 3. Render History Chart
  renderHistoryChart();
}

/* --- VIEW 2: STATE --- */
async function renderStateView(stateName) {
  switchView('state-view');
  document.getElementById('state-name-breadcrumb').innerText = stateName;

  // Filter Data for this State
  const stateLakes = DB.lakes.filter(l => l.state === stateName);
  if(stateLakes.length === 0) return;

  // 1. Aggregate Weather & Risk (Simulated API Calls)
  let totalTemp = 0, totalRain = 0, totalWind = 0, totalHumid = 0;
  let maxRiskLevel = 0; 
  let worstLake = "None";

  for(const lake of stateLakes) {
    // Fetch weather for each lake (Real API call or Sim)
    const w = await fetchWeatherData(lake.coords[0], lake.coords[1]);
    totalTemp += parseFloat(w.temp);
    totalRain += parseFloat(w.rain);
    totalWind += parseFloat(w.wind);
    totalHumid += parseFloat(w.humidity);

    // Check Risk
    const t = DB.telemetry[lake.id];
    const riskScore = t.level / t.threshold;
    if(riskScore > maxRiskLevel) {
      maxRiskLevel = riskScore;
      worstLake = lake.name;
    }
  }

  // Averages
  const avgTemp = (totalTemp / stateLakes.length).toFixed(1);
  const avgRain = (totalRain / stateLakes.length).toFixed(1);
  const avgWind = (totalWind / stateLakes.length).toFixed(1);
  const avgHumid = Math.round(totalHumid / stateLakes.length);

  // 2. Update DOM Stats
  setText('state-avg-temp', avgTemp + "°C");
  setText('state-avg-rain', avgRain + " mm");
  setText('state-wind', avgWind + " m/s");
  setText('state-humidity', avgHumid + "%");
  setText('state-snow', "High (Winter)"); // Hardcoded for now
  
  const overallRisk = maxRiskLevel > 0.9 ? "High" : (maxRiskLevel > 0.7 ? "Medium" : "Low");
  const riskEl = document.getElementById('state-risk');
  riskEl.innerText = overallRisk;
  riskEl.className = `sev ${overallRisk}`;

  const worstLakeEl = document.getElementById('state-high-risk-lake');
  worstLakeEl.innerText = worstLake;
  worstLakeEl.className = `sev ${overallRisk}`; // Color matches risk
  setText('state-last-alert', "2h ago");

  // 3. Map Zoom
  const center = stateLakes[0].coords;
  renderMap('state-map', center, 8); // Zoom in to state
  stateLakes.forEach(l => addMarker(l, () => renderLakeView(l.id)));

  // 4. State Table
  const tbody = document.querySelector('#state-lakes-table tbody');
  tbody.innerHTML = '';
  stateLakes.forEach(lake => {
    const t = DB.telemetry[lake.id];
    const risk = calculateRisk(t.level, t.threshold);
    tbody.innerHTML += `
      <tr onclick="renderLakeView('${lake.id}')">
        <td>${lake.name}</td>
        <td>${lake.basin}</td>
        <td>${t.level} m</td>
        <td class="sev ${risk}">${risk}</td>
        <td><button style="background:transparent; border:1px solid #64ffda; color:#64ffda; cursor:pointer;">View</button></td>
      </tr>
    `;
  });

  // 5. Render Regional Chart
  renderStateChart(avgRain, avgTemp);
}

/* --- VIEW 3: LAKE DEEP DIVE --- */
async function renderLakeView(lakeId) {
  activeLakeId = lakeId;
  const lake = DB.lakes.find(l => l.id === lakeId);
  const t = DB.telemetry[lakeId];
  
  switchView('lake-view');

  // 1. Fill Static Info
  setText('lake-name-breadcrumb', lake.name);
  setText('lake-id', lake.id);
  setText('lake-coords', lake.coords.join(', '));
  setText('lake-type', lake.type);
  setText('lake-basin', lake.basin);
  document.getElementById('lake-satellite-img').src = lake.img;
  setText('lake-ice-cover', "15% (Stable)");

  // 2. Fill Telemetry (Initial)
  updateLakeRealTimeUI(lakeId);

  // 3. Map Zoom (Detailed)
  renderMap('lake-map', lake.coords, 13);
  addMarker(lake, null); // Marker without click event (already here)

  // 4. Weather API Call
  const w = await fetchWeatherData(lake.coords[0], lake.coords[1]);
  setText('lake-live-temp', w.temp + "°C");
  setText('lake-live-rain', w.rain + " mm");
  setText('lake-live-humid', w.humidity + "%");

  // 5. Critical Zones (Haversine Distance)
  const zoneList = document.getElementById('lake-critical-zones');
  zoneList.innerHTML = lake.critical_zones.map(z => {
    const dist = getDistance(lake.coords[0], lake.coords[1], z.coords[0], z.coords[1]);
    return `<li><span style="color:#e6f1ff;">${z.name}</span>: <span style="color:#ff9800;">${dist} km</span> downstream</li>`;
  }).join('');

  // 6. Alert Timeline
  const alerts = DB.alerts.filter(a => a.lakeId === lakeId);
  const alertContainer = document.getElementById('lake-alert-history');
  if(alerts.length === 0) {
    alertContainer.innerHTML = "<p style='color:#8892b0'>No recent alerts.</p>";
  } else {
    alertContainer.innerHTML = alerts.map(a => `
      <div class="timeline-item">
        <strong>${a.title}</strong>
        <span>${a.date}</span>
        <p>${a.desc}</p>
      </div>
    `).join('');
  }

  // 7. Render Live Chart
  renderLiveMeteoChart();
}

// =======================================================
// 6. HELPER FUNCTIONS & LOGIC
// =======================================================

// Helper: Set text of element safely
function setText(id, text) {
  const el = document.getElementById(id);
  if(el) el.innerText = text;
}

// Logic: Risk Calculation
function calculateRisk(level, threshold) {
  if (level >= threshold) return 'High';
  if (level >= threshold * 0.85) return 'Medium';
  return 'Low';
}

// Logic: Haversine Formula for Distance (km)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return (R * c).toFixed(2);
}
function deg2rad(deg) { return deg * (Math.PI/180); }

// API: Fetch Weather
async function fetchWeatherData(lat, lon) {
  // SIMULATION MODE if key is default
  if (API_KEY === "YOUR_OPENWEATHER_KEY_HERE" || !API_KEY) {
    // Return random realistic mountain weather
    return {
      temp: (Math.random() * 15 - 5).toFixed(1), // -5 to 10 deg
      rain: (Math.random() * 5).toFixed(1),      // 0 to 5 mm
      wind: (Math.random() * 20).toFixed(1),     // 0 to 20 m/s
      humidity: Math.floor(Math.random() * 50 + 40) // 40-90%
    };
  }

  // REAL API MODE
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();
    return {
      temp: data.main.temp,
      humidity: data.main.humidity,
      wind: data.wind.speed,
      rain: data.rain ? data.rain['1h'] : 0
    };
  } catch (error) {
    console.error("API Error:", error);
    return { temp: "--", rain: "--", wind: "--", humidity: "--" };
  }
}

// =======================================================
// 7. SIMULATION ENGINE (The "Real-Time" Effect)
// =======================================================
function startRealTimeSimulation() {
  setInterval(() => {
    // 1. Update Telemetry Numbers randomly
    Object.keys(DB.telemetry).forEach(key => {
      const t = DB.telemetry[key];
      // Fluctuate water level slightly
      const change = (Math.random() * 0.1) - 0.05; 
      t.level = parseFloat((t.level + change).toFixed(2));
      
      // Fluctuate flow rate
      t.flow = Math.floor(t.flow + (Math.random() * 4 - 2));
    });

    // 2. If user is looking at Lake View, update UI instantly
    if(activeLakeId && document.getElementById('lake-view').classList.contains('active')) {
      updateLakeRealTimeUI(activeLakeId);
      
      // Update Live Chart
      if(charts.liveMeteo) {
        const data = charts.liveMeteo.data.datasets[0].data;
        data.shift(); // Remove old point
        data.push(Math.random() * 2); // Add new random point
        charts.liveMeteo.update();
      }
    }
    
    // 3. If National View, update Table Risk colors (optional)
    // (You could re-render the table here if you want table rows to flash)

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
  
  const structEl = document.getElementById('lake-structure');
  structEl.innerText = risk === 'High' ? "UNSTABLE" : "Stable";
  structEl.className = `sev ${risk}`;
}

// =======================================================
// 8. MAP & CHART RENDERERS
// =======================================================

/* Map Renderer (Leaflet) */
function renderMap(elemId, center, zoom) {
  // Check if map exists for this container
  if(mapInstance && mapInstance.getContainer().id === elemId) {
    mapInstance.flyTo(center, zoom); // Smooth zoom animation
    return;
  }
  
  // If map exists on DIFFERENT container, remove it
  if(mapInstance) {
    mapInstance.remove();
  }

  // Create New Map
  mapInstance = L.map(elemId).setView(center, zoom);
  
  // Dark Mode Tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap, &copy; CARTO'
  }).addTo(mapInstance);
}

/* Add Marker with Custom Color */
function addMarker(lake, clickHandler) {
  const t = DB.telemetry[lake.id];
  const risk = calculateRisk(t.level, t.threshold);
  
  // Define color based on risk
  const color = risk === 'High' ? '#f44336' : (risk === 'Medium' ? '#ff9800' : '#4caf50');
  
  // Custom HTML Icon
  const icon = L.divIcon({
    className: 'custom-pin',
    html: `<div style="background:${color}; width:12px; height:12px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 10px ${color};"></div>`,
    iconSize: [20, 20]
  });

  const m = L.marker(lake.coords, { icon: icon }).addTo(mapInstance);
  m.bindPopup(`<b>${lake.name}</b><br>Risk: ${risk}`);
  
  if(clickHandler) {
    m.on('click', clickHandler);
  }
}

/* Charts (Chart.js) */
function renderHistoryChart() {
  const ctx = document.getElementById('national-history-chart').getContext('2d');
  if(charts.history) charts.history.destroy();

  const labels = DB.history.map(h => h.year);
  // Logarithmic scale or raw deaths
  const data = DB.history.map(h => h.deaths);

  charts.history = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Casualties',
        data: data,
        backgroundColor: '#f44336',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { grid: { color: '#112240' }, ticks: { color: '#8892b0' } },
        x: { grid: { display: false }, ticks: { color: '#8892b0' } }
      },
      onClick: (e, activeEls) => {
        if(activeEls.length > 0) {
          const index = activeEls[0].index;
          const event = DB.history[index];
          
          // Show Modal with details
          const modal = document.getElementById('history-modal');
          modal.style.display = 'block';
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
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today'],
      datasets: [
        { label: 'Rain (mm)', data: [2, 1, 4, 0, 2, avgRain], borderColor: '#64ffda', tension: 0.4 },
        { label: 'Temp (°C)', data: [-2, -1, -3, -2, 0, avgTemp], borderColor: '#ff9800', tension: 0.4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { grid: { color: '#112240' }, ticks: { color: '#8892b0' } },
        x: { grid: { display: false }, ticks: { color: '#8892b0' } }
      }
    }
  });
}

function renderLiveMeteoChart() {
  const ctx = document.getElementById('lake-meteo-chart').getContext('2d');
  if(charts.liveMeteo) charts.liveMeteo.destroy();

  charts.liveMeteo = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['-10s', '-8s', '-6s', '-4s', '-2s', 'Now'],
      datasets: [{
        label: 'Rain Intensity (mm)',
        data: [0.2, 0.5, 0.1, 0.3, 0.2, 0.4], // Initial dummy data
        borderColor: '#64ffda',
        backgroundColor: 'rgba(100, 255, 218, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false, // Disable animation for smooth real-time feeling
      scales: {
        y: { beginAtZero: true, grid: { color: '#112240' }, ticks: { color: '#8892b0' } },
        x: { grid: { display: false }, ticks: { color: '#8892b0' } }
      }
    }
  });
}

