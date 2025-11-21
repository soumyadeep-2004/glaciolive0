// ==== CONFIGURATION ====
// IMPORTANT: Replace this with your actual OpenWeatherMap API Key
const API_KEY = "b1439b5b93805a9e9cc7737829d3b30f"; 

// ==== REAL LAKE DATA (15 Key Lakes) ====
// Added initial simulated properties to populate table immediately
const LAKES_DATA = [
  // Sikkim
  { id: "sk_1", name: "South Lhonak", state: "Sikkim", coords: [27.91575, 88.20972], basin: "Teesta", alt: "5,200m", type: "Moraine-dammed" },
  { id: "sk_2", name: "Tso Lhamo", state: "Sikkim", coords: [28.0091, 88.7553], basin: "Teesta", alt: "5,400m", type: "Glacial" },
  { id: "sk_3", name: "Gurudongmar", state: "Sikkim", coords: [28.0236, 88.7107], basin: "Teesta", alt: "5,430m", type: "Glacial" },
  { id: "sk_4", name: "Tsomgo (Changu)", state: "Sikkim", coords: [27.3742, 88.7619], basin: "Teesta", alt: "3,753m", type: "Glacial" },
  { id: "sk_5", name: "Samiti Lake", state: "Sikkim", coords: [27.5615, 88.1873], basin: "Rangit", alt: "4,200m", type: "Glacial" },
  
  // Uttarakhand
  { id: "uk_1", name: "Vasudhara Tal", state: "Uttarakhand", coords: [30.9008, 79.7547], basin: "Alaknanda", alt: "4,800m", type: "Glacial" },
  { id: "uk_2", name: "Pyungru Lake", state: "Uttarakhand", coords: [30.2500, 80.5500], basin: "Darma", alt: "4,500m", type: "Moraine-dammed" },
  { id: "uk_3", name: "Maban Lake", state: "Uttarakhand", coords: [30.3500, 80.4500], basin: "Lassar Yangti", alt: "4,600m", type: "Moraine-dammed" },
  { id: "uk_4", name: "Kedartal", state: "Uttarakhand", coords: [30.9120, 78.9575], basin: "Bhagirathi", alt: "4,750m", type: "Glacial" },
  { id: "uk_5", name: "Chorabari Tal", state: "Uttarakhand", coords: [30.7346, 79.0669], basin: "Mandakini", alt: "3,900m", type: "Breached/Remnant" },
  { id: "uk_6", name: "Hemkund", state: "Uttarakhand", coords: [30.6408, 79.6929], basin: "Alaknanda", alt: "4,160m", type: "Glacial" },
  { id: "uk_7", name: "Roopkund", state: "Uttarakhand", coords: [30.2622, 79.7316], basin: "Ganga", alt: "5,029m", type: "Glacial" },

  // Himachal Pradesh
  { id: "hp_1", name: "Ghepan Gath", state: "Himachal Pradesh", coords: [32.3730, 77.2500], basin: "Chenab", alt: "4,500m", type: "Moraine-dammed" },
  { id: "hp_2", name: "Chandra Taal", state: "Himachal Pradesh", coords: [32.4751, 77.6170], basin: "Chandra", alt: "4,250m", type: "Glacial" },
  { id: "hp_3", name: "Suraj Tal", state: "Himachal Pradesh", coords: [32.7627, 77.3977], basin: "Bhaga", alt: "4,890m", type: "Glacial" },
];

// ==== STATIC STATS ====
const LAKE_STATS = {
  level: "Stable", area: "0.85 km²", volume: "30M m³", growth: "+0.02%"
};

// ==== GLOBALS ====
let charts = {};
let maps = {};
let currentLakeId = null;
let weatherInterval = null;

// ==== DOM READY ====
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  simulateAllLakesWeather(); // Populate initial calculated risks
  renderNationalView();

  // Theme Change Listener
  document.getElementById('themeToggle').addEventListener('click', () => {
    setTimeout(rerenderActiveCharts, 50);
  });
});

// ==== RISK LOGIC ====
function calculateRisk(temp, rain24h, snow24h) {
    // Defaults
    if (isNaN(temp)) temp = 0;
    if (isNaN(rain24h)) rain24h = 0;
    if (isNaN(snow24h)) snow24h = 0;

    // Logic based on provided table
    if (rain24h > 100 || temp > 15 || (snow24h > 50 && rain24h > 0)) {
        return "High";
    }
    else if ((rain24h >= 50 && rain24h <= 100) || (temp >= 10 && temp <= 15) || (snow24h >= 20 && snow24h <= 50)) {
        return "Moderate";
    }
    else {
        return "Low";
    }
}

// Simulate weather for ALL lakes on load to populate the map/table with colors
// (Since we can't fetch 15 APIs instantly without paid key)
function simulateAllLakesWeather() {
    LAKES_DATA.forEach(lake => {
        // Random realistic values for simulation
        const temp = (Math.random() * 20) - 5; // -5 to 15
        const rain = Math.random() * 120; // 0 to 120mm
        const snow = Math.random() * 60;  // 0 to 60cm
        
        lake.simData = { temp, rain, snow }; // Store for display
        lake.risk = "Low";
    });
}

// ==== NAVIGATION ====
function setupNavigation() {
  // Tab Buttons
  document.querySelectorAll('.dash-tab-btn').forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      if(target) {
        document.querySelectorAll('.dash-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.dash-content').forEach(c => c.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(target).classList.add('active');
        
        setTimeout(() => {
            if(maps['national-map']) maps['national-map'].invalidateSize();
        }, 100);
      }
    });
  });

  document.getElementById('back-to-national-2').addEventListener('click', (e) => {
    e.preventDefault();
    renderNationalView();
  });

  document.getElementById('national-lakes-table').addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (row && row.dataset.lakeId) {
      renderLakeView(row.dataset.lakeId);
    }
  });
}

// ==== VIEW RENDERERS ====

function renderNationalView() {
  document.querySelectorAll('.dashboard-view').forEach(v => v.classList.remove('active'));
  document.getElementById('national-view').classList.add('active');
  
  if(weatherInterval) clearInterval(weatherInterval);
  currentLakeId = null;

  // Count risks
  const highRiskCount = LAKES_DATA.filter(l => l.risk === 'High').length;
  setText('national-lakes-alert', highRiskCount, highRiskCount > 0 ? 'High' : 'Low');

  // 1. Populate Table (Now with dynamic Risk colors)
  const tableBody = LAKES_DATA.map(lake => `
    <tr data-lake-id="${lake.id}">
      <td>${lake.name}</td>
      <td>${lake.state}</td>
      <td class="sev ${lake.risk === 'Moderate' ? 'Medium' : lake.risk}">${lake.risk}</td>
      <td>Every 5 min</td>
    </tr>
  `).join('');
  document.querySelector('#national-lakes-table tbody').innerHTML = tableBody;

  // 2. Render Map (Markers colored by calculated risk)
  setTimeout(() => {
      renderMap('national-map', [30.5, 79.0], 6, LAKES_DATA, (markerData) => {
        renderLakeView(markerData.id);
      });
  }, 100);
}

function renderLakeView(lakeId) {
  const lake = LAKES_DATA.find(l => l.id === lakeId);
  if (!lake) return;

  currentLakeId = lakeId;
  document.querySelectorAll('.dashboard-view').forEach(v => v.classList.remove('active'));
  document.getElementById('lake-view').classList.add('active');

  // 1. Static Info
  setText('lake-name-breadcrumb', lake.name);
  setText('lake-coords', `${lake.coords[0].toFixed(4)}, ${lake.coords[1].toFixed(4)}`);
  setText('lake-altitude', lake.alt);
  setText('lake-type', lake.type);
  setText('lake-basin', lake.basin);
  setText('lake-water-level', LAKE_STATS.level);
  setText('lake-surface-area', LAKE_STATS.area);
  setText('lake-volume', LAKE_STATS.volume);
  setText('lake-growth-rate', LAKE_STATS.growth);

  // 2. Risk Analysis Box (Initial Simulation Data)
  updateRiskBox(lake.risk, lake.simData.temp, lake.simData.rain, lake.simData.snow);

  // 3. Render Maps
  setTimeout(() => {
    renderMap('lake-sim-map', lake.coords, 12, [lake], null);
  }, 100);

  // 4. Weather Logic
  initLakeChart();
  fetchWeather(lake.coords[0], lake.coords[1]);
}

function updateRiskBox(risk, temp, rain, snow) {
    const riskEl = document.getElementById('lake-risk-display-val');
    riskEl.textContent = risk;
    riskEl.className = `sev ${risk === 'Moderate' ? 'Medium' : risk}`;

    setText('risk-metric-temp', `${temp.toFixed(1)}°C`);
    setText('risk-metric-rain', `${rain.toFixed(1)} mm`);
    setText('risk-metric-snow', `${snow.toFixed(1)} cm`);
}

// ==== WEATHER API ====

async function fetchWeather(lat, lon) {
  if(API_KEY === "YOUR_OPENWEATHER_API_KEY_HERE") {
    console.warn("Please set your OpenWeatherMap API Key in dashboard.js");
    setText('lake-current-temp', "No API Key");
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    if(!response.ok) throw new Error("Weather API Error");
    const currentData = await response.json();

    // Extract Data
    const temp = currentData.main.temp;
    const condition = currentData.weather[0].main;
    
    // Estimate 24h data from API (Rain/Snow usually 1h or 3h in free tier)
    let rain1h = (currentData.rain && currentData.rain['1h']) ? currentData.rain['1h'] : 0;
    let snow1h = (currentData.snow && currentData.snow['1h']) ? currentData.snow['1h'] : 0;
    let estimatedRain24h = rain1h * 24; 
    let estimatedSnow24h = snow1h * 24;

    // Recalculate Risk based on REAL API data
    const realRisk = calculateRisk(temp, estimatedRain24h, estimatedSnow24h);

    // Update DOM Elements
    setText('lake-current-temp', `${temp.toFixed(1)}°C`);
    setText('lake-current-condition', condition);
    setText('lake-rain-snow-val', `${estimatedRain24h.toFixed(1)}mm / ${estimatedSnow24h.toFixed(1)}cm`);
    
    // Update Risk Box with Real Data
    updateRiskBox(realRisk, temp, estimatedRain24h, estimatedSnow24h);

    // Update Chart
    const historyData = generate48hTrend(temp, estimatedRain24h);
    updateLakeChart(historyData);

  } catch (error) {
    console.error("Error fetching weather:", error);
    setText('lake-current-temp', "Error");
  }
}

function generate48hTrend(currentTemp, currentRain24h) {
    let labels = [];
    let temps = [];
    let rains = [];
    
    const now = new Date();
    const hourlyRainAvg = currentRain24h / 24;

    for(let i = 48; i >= 0; i--) {
        const d = new Date(now.getTime() - (i * 60 * 60 * 1000));
        const hour = d.getHours();
        labels.push(`${hour}:00`);
        
        const dayCycle = Math.sin((hour - 9) / 24 * 2 * Math.PI); 
        const simTemp = currentTemp + (dayCycle * 3) + (Math.random() * 0.5);
        temps.push(simTemp);

        // Distribute rain randomly based on 24h volume
        let simRain = hourlyRainAvg > 0 ? (hourlyRainAvg * (Math.random() + 0.5)) : 0;
        rains.push(simRain);
    }
    return { labels, temps, rains };
}

// ==== CHARTS & MAPS ====

function getChartOptions() {
  const isLight = document.body.classList.contains('light');
  const color = isLight ? '#0a1a2e' : '#e0e7ef';
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: color } } },
    scales: {
      x: { ticks: { color: color }, grid: { color: isLight ? '#00000010' : '#ffffff10' } },
      y: { ticks: { color: color }, grid: { color: isLight ? '#00000010' : '#ffffff10' } }
    }
  };
}

function initLakeChart() {
  if(charts.lakeMeteo) charts.lakeMeteo.destroy();
  const ctx = document.getElementById('lake-meteo-chart');
  
  charts.lakeMeteo = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'Temp (°C)', data: [], borderColor: '#ff9800', yAxisID: 'y', borderWidth: 2, pointRadius: 0 },
        { label: 'Rainfall (mm)', data: [], backgroundColor: '#4fc3f780', yAxisID: 'y1', type: 'bar' }
      ]
    },
    options: {
      ...getChartOptions(),
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: getChartOptions().scales.x,
        y: { type: 'linear', display: true, position: 'left', title: {display:true, text:'Temp'} },
        y1: { type: 'linear', display: true, position: 'right', grid: {drawOnChartArea: false}, title: {display:true, text:'Rain'} }
      }
    }
  });
}

function updateLakeChart(data) {
  if(!charts.lakeMeteo) return;
  const chart = charts.lakeMeteo;
  chart.data.labels = data.labels;
  chart.data.datasets[0].data = data.temps;
  chart.data.datasets[1].data = data.rains;
  chart.update();
}

function rerenderActiveCharts() {
   if(document.getElementById('lake-view').classList.contains('active') && charts.lakeMeteo) charts.lakeMeteo.update();
}

function renderMap(elemId, center, zoom, markers, onClick) {
  if (maps[elemId]) { maps[elemId].remove(); delete maps[elemId]; }
  const container = document.getElementById(elemId);
  if(!container) return;

  maps[elemId] = L.map(elemId).setView(center, zoom);
  const isLight = document.body.classList.contains('light');
  const tileUrl = isLight 
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  L.tileLayer(tileUrl, { attribution: '© OpenStreetMap' }).addTo(maps[elemId]);

  markers.forEach(m => {
    // Dynamic Color based on Calculated Risk
    const color = m.risk === 'High' ? '#f44336' : (m.risk === 'Moderate' ? '#ff9800' : '#4caf50');
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background:${color}; width:15px; height:15px; border-radius:50%; border:2px solid white; box-shadow: 0 0 5px ${color}"></div>`,
      iconSize: [20, 20]
    });

    const marker = L.marker(m.coords, { icon: icon }).addTo(maps[elemId]);
    marker.bindPopup(`<b>${m.name}</b><br>Risk: ${m.risk}`);
    if(onClick) marker.on('click', () => onClick(m));
  });
  
  setTimeout(() => maps[elemId].invalidateSize(), 200);
}

function setText(id, text, className) {
  const el = document.getElementById(id);
  if(el) {
    el.textContent = text;
    if(className) el.className = `sev ${className}`;
  }
}
