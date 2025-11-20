// ==== MOCK TEST DATA (EXPANDED) ====
// This is now the single source of truth for mock data
const TEST_DATA = {
  national: {
    totalLakes: 4707,
    lakesOnAlert: 12,
    statesOnWatch: 3,
    lastUpdate: "2025-11-10 18:30 IST",
    climate: {
      avgTemp: "-2.5°C",
      avgRain: "5.2mm",
      snowmelt: "Moderate",
      floodZones: 2,
    },
    // This list is now derived from the full lakes list below
    topLakes: [
      { id: "sl_1", stateId: "SK", name: "South Lhonak", state: "Sikkim", risk: "High", update: "10m ago" },
      { id: "up_1", stateId: "UK", name: "Chorabari Tal", state: "Uttarakhand", risk: "High", update: "1h ago" },
      { id: "hp_1", stateId: "HP", name: "Ghepan Gath", state: "Himachal Pradesh", risk: "Medium", update: "3h ago" },
      { id: "ap_1", stateId: "AP", name: "Dibang Lake", state: "Arunachal Pradesh", risk: "Medium", update: "1d ago" },
      { id: "sk_2", stateId: "SK", name: "Zemu Glacier", state: "Sikkim", risk: "Low", update: "2d ago" },
    ],
    charts: {
      history: {
        labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
        data: [2, 1, 3, 2, 4, 1], // GLOF Occurrences
      },
      risk: {
        labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
        data: [3.5, 3.7, 3.9, 4.1, 4.4, 4.5], // Avg. Risk Trend
      },
    },
  },
  states: [
    {
      id: "SK",
      name: "Sikkim",
      coords: [27.533, 88.5122],
      risk: "High",
      totalLakes: 88,
      activeAlerts: 3,
      lastAlert: "2025-11-10",
      env: { rain: "12.5mm", temp: "-1.1°C", wind: "15 km/h", snowmelt: "High" },
      lakes: [
        { id: "sl_1", name: "South Lhonak", region: "North Sikkim", level: "7.8m (High)", risk: "High", status: "Alert" },
        { id: "sk_2", name: "Zemu Glacier", region: "North Sikkim", level: "4.2m (Stable)", risk: "Low", status: "Watch" },
        { id: "sk_3", name: "Gurudongmar", region: "North Sikkim", level: "2.1m (Stable)", risk: "Low", status: "Safe" },
      ],
      charts: {
        rain: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], data: [2, 5, 1, 8, 12, 10, 3] },
        temp: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], data: [-1, 0, -2, -1, 1, 0, -1] },
      },
      alerts: [
        { date: "2025-11-10", risk: "High", title: "South Lhonak Alert", summary: "Rapid water level increase detected." },
        { date: "2025-11-08", risk: "Medium", title: "Zemu Glacier Watch", summary: "Increased meltwater flow." },
      ],
      criticalZones: ["Chungthang Dam", "Lachen Village", "NH10 (Mangan)", "Teesta Hydropower III"],
    },
    {
      id: "UK",
      name: "Uttarakhand",
      coords: [30.0668, 79.0193],
      risk: "High",
      totalLakes: 102,
      activeAlerts: 1,
      lastAlert: "2025-11-09",
      env: { rain: "8.0mm", temp: "0.5°C", wind: "10 km/h", snowmelt: "Medium" },
      lakes: [
        { id: "up_1", name: "Chorabari Tal", region: "Rudraprayag", level: "N/A (Breached)", risk: "High", status: "Alert" },
        { id: "uk_2", name: "Gangotri", region: "Uttarkashi", level: "3.1m (Stable)", risk: "Medium", status: "Watch" },
      ],
      charts: {
        rain: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], data: [1, 3, 4, 8, 6, 2, 1] },
        temp: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], data: [1, 2, 1, 0, 2, 3, 1] },
      },
      alerts: [{ date: "2025-11-09", risk: "High", title: "Chorabari Alert", summary: "Seismic activity detected near moraine." }],
      criticalZones: ["Kedarnath Temple", "Rudraprayag Town", "Alaknanda River Basin"],
    },
    {
      id: "HP",
      name: "Himachal Pradesh",
      coords: [31.1048, 77.1734],
      risk: "Medium",
      totalLakes: 120,
      activeAlerts: 1,
      lastAlert: "2025-11-08",
      env: { rain: "4.0mm", temp: "1.2°C", wind: "12 km/h", snowmelt: "Medium" },
      lakes: [
        { id: "hp_1", name: "Ghepan Gath", region: "Lahaul", level: "5.5m (Stable)", risk: "Medium", status: "Watch" },
      ],
      charts: {
        rain: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], data: [0, 1, 1, 4, 3, 2, 1] },
        temp: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], data: [2, 3, 2, 1, 2, 4, 3] },
      },
      alerts: [{ date: "2025-11-08", risk: "Medium", title: "Ghepan Gath Watch", summary: "Meltwater rising." }],
      criticalZones: ["Manali Town", "Beas River Basin"],
    },
    {
      id: "AP",
      name: "Arunachal Pradesh",
      coords: [27.1, 93.6166],
      risk: "Medium",
      totalLakes: 55,
      activeAlerts: 1,
      lastAlert: "2025-11-07",
      env: { rain: "10.2mm", temp: "3.5°C", wind: "8 km/h", snowmelt: "Low" },
      lakes: [
        { id: "ap_1", name: "Dibang Lake", region: "Dibang Valley", level: "6.1m (Stable)", risk: "Medium", status: "Watch" },
      ],
      charts: {
        rain: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], data: [5, 6, 10, 8, 12, 10, 9] },
        temp: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], data: [4, 4, 3, 5, 3, 4, 4] },
      },
      alerts: [{ date: "2025-11-07", risk: "Medium", title: "Dibang Lake Watch", summary: "Increased inflow." }],
      criticalZones: ["Dibang Hydropower", "Anini Town"],
    }
  ],
  lakes: [
    {
      id: "sl_1",
      stateId: "SK",
      name: "South Lhonak",
      overview: { id: "SK-N-001", coords: "27.933, 88.567", altitude: "5,200 m", type: "Moraine-dammed", basin: "Teesta River" },
      stats: { level: "7.8m", area: "1.02 km²", volume: "50 million m³", growth: "+0.05 km²/yr" },
      stability: { index: "2.5 (High Risk)", deformation: "3.2 mm/day", outflow: "Blocked", seepage: "Detected" },
      meteo: {
        temp: "-5.2°C", rain: "2.1mm", humidity: "78%",
        chart: { labels: ["-6h", "-5h", "-4h", "-3h", "-2h", "-1h", "Now"], temp: [-4.8, -4.9, -5.0, -5.2, -5.1, -5.2, -5.2], rain: [0, 0, 0, 0.5, 1.2, 0.4, 0] }
      },
      satellite: { img: "https://via.placeholder.com/300x200?text=South+Lhonak+IMG", ndwi: "+0.08", iceCover: "12%" },
      simulation: { map: "placeholder", impact: "High risk to Chungthang, 3h travel time." },
      history: [
        { date: "2025-11-10", risk: "High", title: "Alert Issued", summary: "Water level exceeded 7.5m threshold." },
        { date: "2025-11-09", risk: "Medium", title: "Watch Issued", summary: "Increased seismic activity." },
      ],
      sensors: [
        { id: "S-LNK-01", status: "Online", uptime: "99.8%", battery: "89%" },
        { id: "S-LNK-02", status: "Online", uptime: "99.7%", battery: "92%" },
        { id: "S-LNK-03", status: "Offline", uptime: "85.0%", battery: "N/A" },
      ],
    },
    {
      id: "up_1",
      stateId: "UK",
      name: "Chorabari Tal",
      overview: { id: "UK-R-005", coords: "30.758, 79.056", altitude: "3,900 m", type: "Moraine-dammed (Breached 2013)", basin: "Mandakini River" },
      stats: { level: "N/A", area: "0.15 km² (Former)", volume: "N/A", growth: "N/A" },
      stability: { index: "1.8 (High Risk)", deformation: "0.5 mm/day", outflow: "Stable (Breached)", seepage: "N/A" },
      meteo: {
        temp: "-1.0°C", rain: "5.0mm", humidity: "85%",
        chart: { labels: ["-6h", "-5h", "-4h", "-3h", "-2h", "-1h", "Now"], temp: [-0.5, -0.6, -0.8, -1.0, -1.0, -1.1, -1.0], rain: [0.1, 0.1, 0.3, 0.5, 1.0, 1.5, 1.5] }
      },
      satellite: { img: "https://via.placeholder.com/300x200?text=Chorabari+Tal+IMG", ndwi: "-0.02", iceCover: "5%" },
      simulation: { map: "placeholder", impact: "High risk to Kedarnath, 20m travel time." },
      history: [
        { date: "2025-11-09", risk: "High", title: "Seismic Alert", summary: "Minor tremor detected. Moraine stability check." },
        { date: "2013-06-16", risk: "Critical", title: "Lake Breach", summary: "Catastrophic breach during heavy rainfall." },
      ],
      sensors: [{ id: "C-TAL-01", status: "Online", uptime: "99.9%", battery: "95%" }],
    },
    {
      id: "hp_1",
      stateId: "HP",
      name: "Ghepan Gath",
      overview: { id: "HP-L-012", coords: "32.373, 77.250", altitude: "4,500 m", type: "Moraine-dammed", basin: "Beas River" },
      stats: { level: "5.5m", area: "0.85 km²", volume: "30 million m³", growth: "+0.02 km²/yr" },
      stability: { index: "3.1 (Medium Risk)", deformation: "1.2 mm/day", outflow: "Clear", seepage: "Minor" },
      meteo: {
        temp: "0.2°C", rain: "1.1mm", humidity: "60%",
        chart: { labels: ["-6h", "-5h", "-4h", "-3h", "-2h", "-1h", "Now"], temp: [0.1, 0.1, 0.0, -0.1, 0.2, 0.2, 0.2], rain: [0, 0, 0, 0, 0, 0.5, 0.6] }
      },
      satellite: { img: "https://via.placeholder.com/300x200?text=Ghepan+Gath+IMG", ndwi: "+0.04", iceCover: "10%" },
      simulation: { map: "placeholder", impact: "Medium risk to Manali, 5h travel time." },
      history: [{ date: "2025-11-08", risk: "Medium", title: "Watch Issued", summary: "Increased meltwater flow." }],
      sensors: [{ id: "G-GATH-01", status: "Online", uptime: "98.8%", battery: "80%" }],
    },
    {
      id: "ap_1",
      stateId: "AP",
      name: "Dibang Lake",
      overview: { id: "AP-D-003", coords: "28.700, 95.600", altitude: "4,100 m", type: "Moraine-dammed", basin: "Dibang River" },
      stats: { level: "6.1m", area: "0.90 km²", volume: "35 million m³", growth: "+0.03 km²/yr" },
      stability: { index: "3.4 (Medium Risk)", deformation: "0.8 mm/day", outflow: "Clear", seepage: "None" },
      meteo: {
        temp: "2.5°C", rain: "3.0mm", humidity: "82%",
        chart: { labels: ["-6h", "-5h", "-4h", "-3h", "-2h", "-1h", "Now"], temp: [2.0, 2.1, 2.2, 2.4, 2.5, 2.5, 2.5], rain: [0.2, 0.2, 0.3, 0.3, 0.5, 1.0, 0.5] }
      },
      satellite: { img: "https://via.placeholder.com/300x200?text=Dibang+Lake+IMG", ndwi: "+0.03", iceCover: "8%" },
      simulation: { map: "placeholder", impact: "Medium risk to Anini, 4h travel time." },
      history: [{ date: "2025-11-07", risk: "Medium", title: "Watch Issued", summary: "Heavy rainfall upstream." }],
      sensors: [{ id: "D-LAKE-01", status: "Online", uptime: "99.2%", battery: "91%" }],
    },
    {
      id: "sk_2",
      stateId: "SK",
      name: "Zemu Glacier",
      overview: { id: "SK-N-002", coords: "27.700, 88.400", altitude: "4,900 m", type: "Ice-dammed", basin: "Teesta River" },
      stats: { level: "4.2m", area: "0.75 km²", volume: "25 million m³", growth: "+0.01 km²/yr" },
      stability: { index: "4.0 (Low Risk)", deformation: "0.2 mm/day", outflow: "Clear", seepage: "None" },
      meteo: {
        temp: "-3.0°C", rain: "0.5mm", humidity: "70%",
        chart: { labels: ["-6h", "-5h", "-4h", "-3h", "-2h", "-1h", "Now"], temp: [-3.0, -3.1, -3.0, -2.9, -2.9, -3.0, -3.0], rain: [0, 0, 0, 0, 0, 0, 0] }
      },
      satellite: { img: "https://via.placeholder.com/300x200?text=Zemu+Glacier+IMG", ndwi: "+0.01", iceCover: "15%" },
      simulation: { map: "placeholder", impact: "Low risk to Lachen, 6h travel time." },
      history: [{ date: "2025-11-08", risk: "Low", title: "Watch Issued", summary: "Stable conditions." }],
      sensors: [{ id: "ZEMU-01", status: "Online", uptime: "99.9%", battery: "98%" }],
    },
  ],
};

// ==== CHART & MAP GLOBALS ====
let charts = {};
let maps = {};
let currentView = 'national';
let currentStateId = null;
let currentLakeId = null;

// ==== DOM READY LISTENER ====
document.addEventListener('DOMContentLoaded', () => {
  // --- Navigation ---
  setupTabNavigation();
  setupViewNavigation();
  
  // --- Check for deep link from index.html ---
  const gotoLakeId = localStorage.getItem('gotoLakeId');
  const gotoStateId = localStorage.getItem('gotoStateId');

  if (gotoLakeId && gotoStateId) {
    localStorage.removeItem('gotoLakeId'); // Clear the link
    localStorage.removeItem('gotoStateId'); // Clear the link
    renderLakeView(gotoStateId, gotoLakeId); // Jump straight to lake
  } else {
    renderNationalView(); // Default load
  }

  // --- Theme Change Listener ---
  document.getElementById('themeToggle').addEventListener('click', () => {
    setTimeout(rerenderActiveCharts, 50); // Re-render charts on theme change
  });
});

// ==== NAVIGATION SETUP ====
function setupTabNavigation() {
  document.querySelectorAll('.dash-tab-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.dash-tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.dash-content').forEach(content => content.classList.remove('active'));
      
      button.classList.add('active');
      document.getElementById(button.dataset.target).classList.add('active');
    });
  });
}

function setupViewNavigation() {
  // Breadcrumb links
  document.getElementById('back-to-national').addEventListener('click', (e) => {
    e.preventDefault();
    renderNationalView();
  });
  document.getElementById('back-to-national-2').addEventListener('click', (e) => {
    e.preventDefault();
    renderNationalView();
  });
  document.getElementById('back-to-state').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentStateId) renderStateView(currentStateId);
  });

  // Table click delegation
  document.getElementById('national-lakes-table').addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (row && row.dataset.stateId) {
      renderLakeView(row.dataset.stateId, row.dataset.lakeId); // Go direct to lake
    }
  });

  document.getElementById('state-lakes-table').addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (row && row.dataset.lakeId) {
      renderLakeView(row.dataset.stateId, row.dataset.lakeId);
    }
  });
}

// ==== VIEW SWITCHING LOGIC ====
function switchView(viewName) {
    document.querySelectorAll('.dashboard-view').forEach(view => view.classList.remove('active'));
    document.getElementById(viewName).classList.add('active');
    currentView = viewName.split('-')[0];
    destroyAllCharts();
}

function renderNationalView() {
  switchView('national-view');
  const data = TEST_DATA.national;
  
  // 1. Populate Stats
  setText('national-total-lakes', data.totalLakes);
  setText('national-lakes-alert', data.lakesOnAlert);
  setText('national-states-watch', data.statesOnWatch);
  setText('national-last-update', data.lastUpdate);
  
  setText('national-avg-temp', data.climate.avgTemp);
  setText('national-avg-rain', data.climate.avgRain);
  setText('national-snowmelt', data.climate.snowmelt);
  setText('national-flood-zones', data.climate.floodZones);
  
  // 2. Populate Table
  const tableBody = data.topLakes.map(lake => `
    <tr data-state-id="${lake.stateId}" data-lake-id="${lake.id}">
      <td>${lake.name}</td>
      <td>${lake.state}</td>
      <td class="sev ${lake.risk}">${lake.risk}</td>
      <td>${lake.update}</td>
    </tr>
  `).join('');
  document.querySelector('#national-lakes-table tbody').innerHTML = tableBody;
  
  // 3. Render Charts
  renderNationalCharts(data.charts);
  
  // 4. Render Map (Updated to show LAKES, not states)
  const lakeMarkers = TEST_DATA.lakes.map(lake => {
      let risk = 'Low';
      if (lake.stability.index.includes('High')) risk = 'High';
      else if (lake.stability.index.includes('Medium')) risk = 'Medium';
      
      return {
          coords: lake.overview.coords.split(',').map(Number),
          name: lake.name,
          risk: risk,
          id: lake.id,
          stateId: lake.stateId
      };
  });
  
  renderMap('national-map', [28.0, 82.0], 5, lakeMarkers, (markerData) => {
    // Click handler: Go to lake view
    renderLakeView(markerData.stateId, markerData.id);
  });
}

function renderStateView(stateId) {
  const data = TEST_DATA.states.find(s => s.id === stateId);
  if (!data) return;

  switchView('state-view');
  currentStateId = stateId;

  // 1. Populate Breadcrumb & Stats
  setText('state-name-breadcrumb', data.name);
  setText('state-risk-level', data.risk, data.risk);
  setText('state-total-lakes', data.totalLakes);
  setText('state-active-alerts', data.activeAlerts);
  setText('state-last-alert', data.lastAlert);
  // (rest of stats...)
  setText('state-avg-rain', data.env.rain);
  setText('state-avg-temp', data.env.temp);
  setText('state-avg-wind', data.env.wind);
  setText('state-snowmelt', data.env.snowmelt);


  // 2. Populate Table
  const tableBody = data.lakes.map(lake => `
    <tr data-state-id="${data.id}" data-lake-id="${lake.id}">
      <td>${lake.name}</td>
      <td>${lake.region}</td>
      <td>${lake.level}</td>
      <td class="sev ${lake.risk}">${lake.risk}</td>
      <td>${lake.status}</td>
    </tr>
  `).join('');
  document.querySelector('#state-lakes-table tbody').innerHTML = tableBody;

  // 3. Render Charts
  renderStateCharts(data.charts);

  // 4. Render Map
  const lakeMarkers = data.lakes.map(l => {
      const lakeData = TEST_DATA.lakes.find(fullLake => fullLake.id === l.id);
      const coords = lakeData ? lakeData.overview.coords.split(',').map(Number) : data.coords;
      return { 
        coords: coords, 
        name: l.name, 
        risk: l.risk,
        id: l.id,
        stateId: data.id
      }
  });

  renderMap('state-map', data.coords, 8, lakeMarkers, (markerData) => {
    // Click handler: Go to lake view
    renderLakeView(markerData.stateId, markerData.id);
  });
  
  // 5. Render Timeline & Lists
  renderTimeline('state-alert-timeline', data.alerts);
  document.getElementById('state-critical-zones').innerHTML = data.criticalZones.map(zone => `<li>${zone}</li>`).join('');
}

function renderLakeView(stateId, lakeId) {
  const data = TEST_DATA.lakes.find(l => l.id === lakeId);
  const stateData = TEST_DATA.states.find(s => s.id === stateId);
  if (!data || !stateData) return;

  switchView('lake-view');
  currentStateId = stateId;
  currentLakeId = lakeId;

  // 1. Populate Breadcrumbs
  setText('back-to-state', stateData.name);
  setText('lake-name-breadcrumb', data.name);

  // 2. Populate Info Cards
  setText('lake-id', data.overview.id);
  setText('lake-coords', data.overview.coords);
  setText('lake-altitude', data.overview.altitude);
  // (rest of data...)
  setText('lake-type', data.overview.type);
  setText('lake-basin', data.overview.basin);
  setText('lake-water-level', data.stats.level);
  setText('lake-surface-area', data.stats.area);
  setText('lake-volume', data.stats.volume);
  setText('lake-growth-rate', data.stats.growth);
  setText('lake-stability-index', data.stability.index, data.stability.index.includes('High') ? 'High' : (data.stability.index.includes('Medium') ? 'Medium' : 'Low'));
  setText('lake-deformation', data.stability.deformation);
  setText('lake-outflow', data.stability.outflow);
  setText('lake-seepage', data.stability.seepage);
  setText('lake-current-temp', data.meteo.temp);
  setText('lake-current-rain', data.meteo.rain);
  setText('lake-current-humidity', data.meteo.humidity);
  document.getElementById('lake-satellite-img').src = data.satellite.img;
  setText('lake-ndwi', data.satellite.ndwi);
  setText('lake-ice-cover', data.satellite.iceCover);
  setText('lake-sim-impact', data.simulation.impact);

  // 3. Render Sensor Table
  const tableBody = data.sensors.map(sensor => `
    <tr>
      <td>${sensor.id}</td>
      <td class="${sensor.status === 'Offline' ? 'sev High' : ''}">${sensor.status}</td>
      <td>${sensor.uptime}</td>
      <td>${sensor.battery}</td>
    </tr>
  `).join('');
  document.querySelector('#lake-sensor-table tbody').innerHTML = tableBody;
  
  // 4. Render Timeline
  renderTimeline('lake-alert-history', data.history);
  
  // 5. Render Charts
  renderLakeCharts(data.meteo.chart);
  
  // 6. Render Map
  const lakeCoords = data.overview.coords.split(',').map(Number);
  let risk = 'Low';
  if (data.stability.index.includes('High')) risk = 'High';
  else if (data.stability.index.includes('Medium')) risk = 'Medium';

  renderMap('lake-sim-map', lakeCoords, 12, [{ 
    coords: lakeCoords, 
    name: data.name, 
    risk: risk 
  }], null); // No click handler for sim map
}


// ==== CHART RENDERING ====

function getChartOptions() {
  const isLight = document.body.classList.contains('light');
  const gridColor = isLight ? '#0a1a2e20' : '#ffffff20';
  const labelColor = isLight ? '#0a1a2e' : '#e0e7ef';
  
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: labelColor, font: { family: "'Josefin Sans', sans-serif" } }
      }
    },
    scales: {
      x: {
        ticks: { color: labelColor, font: { family: "'Josefin Sans', sans-serif" } },
        grid: { color: gridColor }
      },
      y: {
        ticks: { color: labelColor, font: { family: "'Josefin Sans', sans-serif" } },
        grid: { color: gridColor }
      }
    }
  };
}

function destroyAllCharts() {
  Object.values(charts).forEach(chart => chart.destroy());
  charts = {};
}

function rerenderActiveCharts() {
  if (currentView === 'national') {
    renderNationalCharts(TEST_DATA.national.charts);
  } else if (currentView === 'state' && currentStateId) {
    const data = TEST_DATA.states.find(s => s.id === currentStateId);
    if (data) renderStateCharts(data.charts);
  } else if (currentView === 'lake' && currentLakeId) {
    const data = TEST_DATA.lakes.find(l => l.id === currentLakeId);
    if (data) renderLakeCharts(data.meteo.chart);
  }
}

function renderNationalCharts(data) {
  if (charts.nationalHistory) charts.nationalHistory.destroy();
  if (charts.nationalRisk) charts.nationalRisk.destroy();
  
  charts.nationalHistory = new Chart(document.getElementById('national-history-chart'), {
    type: 'bar',
    data: {
      labels: data.history.labels,
      datasets: [{
        label: 'GLOF Occurrences',
        data: data.history.data,
        backgroundColor: '#f44336',
      }]
    },
    options: getChartOptions()
  });

  charts.nationalRisk = new Chart(document.getElementById('national-risk-chart'), {
    type: 'line',
    data: {
      labels: data.risk.labels,
      datasets: [{
        label: 'National Risk Trend',
        data: data.risk.data,
        borderColor: '#ff9800',
        backgroundColor: '#ff980030',
        fill: true,
        tension: 0.2
      }]
    },
    options: getChartOptions()
  });
}

function renderStateCharts(data) {
  if (charts.stateRain) charts.stateRain.destroy();
  if (charts.stateTemp) charts.stateTemp.destroy();

  charts.stateRain = new Chart(document.getElementById('state-rain-chart'), {
    type: 'bar',
    data: {
      labels: data.rain.labels,
      datasets: [{
        label: 'Rainfall (mm)',
        data: data.rain.data,
        backgroundColor: '#4fc3f7',
      }]
    },
    options: getChartOptions()
  });

  charts.stateTemp = new Chart(document.getElementById('state-temp-chart'), {
    type: 'line',
    data: {
      labels: data.temp.labels,
      datasets: [{
        label: 'Avg. Temp (°C)',
        data: data.temp.data,
        borderColor: '#ff9800',
        tension: 0.2
      }]
    },
    options: getChartOptions()
  });
}

function renderLakeCharts(data) {
    if (charts.lakeMeteo) charts.lakeMeteo.destroy();
    
    charts.lakeMeteo = new Chart(document.getElementById('lake-meteo-chart'), {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: data.temp,
                    borderColor: '#ff9800',
                    yAxisID: 'yTemp',
                    tension: 0.2
                },
                {
                    label: 'Rainfall (mm)',
                    data: data.rain,
                    borderColor: '#4fc3f7',
                    backgroundColor: '#4fc3f730',
                    type: 'bar',
                    yAxisID: 'yRain',
                }
            ]
        },
        options: {
            ...getChartOptions(),
            scales: {
                ...getChartOptions().scales,
                yTemp: {
                    type: 'linear',
                    position: 'left',
                    ticks: { color: '#ff9800' },
                    grid: { drawOnChartArea: false }
                },
                yRain: {
                    type: 'linear',
                    position: 'right',
                    ticks: { color: '#4fc3f7' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}


// ==== MAP RENDERING (Leaflet) - UPDATED ====

function renderMap(elementId, center, zoom, markers, onMarkerClick = null) {
  if (maps[elementId]) {
    maps[elementId].remove();
  }

  maps[elementId] = L.map(elementId).setView(center, zoom);
  
  const isLight = document.body.classList.contains('light');
  const tileUrl = isLight 
    ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  
  L.tileLayer(tileUrl, {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(maps[elementId]);

  // Add markers
  if (markers) {
    markers.forEach(markerData => {
        const icon = L.divIcon({
            className: `g-marker-dash ${markerData.risk || 'default'}`, // Use new CSS class
            html: 'G',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const markerInstance = L.marker(markerData.coords, { icon: icon })
          .addTo(maps[elementId])
          .bindPopup(`<b>${markerData.name}</b><br>Risk: ${markerData.risk}`);
        
        // Add hover events
        markerInstance.on('mouseover', function (e) { this.openPopup(); });
        markerInstance.on('mouseout', function (e) { this.closePopup(); });

        // Add click event IF a handler is provided
        if (onMarkerClick) {
            markerInstance.on('click', () => {
                onMarkerClick(markerData);
            });
        }
    });
  }
}

// ==== HELPER FUNCTIONS ====
function setText(id, text, className = null) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
    if (className) {
      el.className = `sev ${className}`; // This is correct: "sev High"
    } else {
      el.className = ''; // Clear old severity classes
    }
  }
}

function renderTimeline(elementId, alerts) {
  const timeline = document.getElementById(elementId);
  if (timeline) {
    timeline.innerHTML = alerts.map(alert => `
      <div class="timeline-item">
        <strong class="sev ${alert.risk}">${alert.title}</strong>
        <span>${alert.date}</span>
        <p>${alert.summary}</p>
      </div>
    `).join('');
  }
}