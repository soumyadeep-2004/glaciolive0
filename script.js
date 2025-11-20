// ==== GLACIOLIVE – EVACUATION ROUTES + SMART MAP ====
const map = L.map('map').setView([22.9734, 78.6569], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const STATE_CAPITALS = {
  "Sikkim": "Gangtok",
  "Uttarakhand": "Dehradun",
  "Himachal Pradesh": "Shimla",
  "Arunachal Pradesh": "Itanagar"
};

// UPDATED ALERTS to match dashboard.js TEST_DATA
const ALERTS = [
  {id:"sl_1", stateId:"SK", loc:"South Lhonak", state:"Sikkim", lat:27.933, lng:88.567, sev:"High", evac_path: [[27.933,88.567],[27.90,88.50],[27.85,88.45]]},
  {id:"up_1", stateId:"UK", loc:"Chorabari Tal", state:"Uttarakhand", lat:30.758, lng:79.056, sev:"High", evac_path: [[30.924,79.083],[30.90,79.05],[30.85,79.00]]},
  {id:"hp_1", stateId:"HP", loc:"Ghepan Gath", state:"Himachal Pradesh", lat:32.373, lng:77.250, sev:"Medium", evac_path: [[32.373,77.250],[32.35,77.22],[32.30,77.20]]},
  {id:"ap_1", stateId:"AP", loc:"Dibang Lake", state:"Arunachal Pradesh", lat:28.700, lng:95.600, sev:"Medium", evac_path: [[28.700,95.600],[28.65,95.55],[28.60,95.50]]},
  {id:"sk_2", stateId:"SK", loc:"Zemu Glacier", state:"Sikkim", lat:27.700, lng:88.400, sev:"Low", evac_path: [[27.700,88.400],[27.65,88.35],[27.60,88.30]]}
];

// REQ 2: Added searchMarker
let userMarker = null, evacLines = [], markers = [], searchMarker = null;

// ==== NEW: Function to link to dashboard ====
function goToLakeDashboard(lakeId, stateId) {
  localStorage.setItem('gotoLakeId', lakeId);
  localStorage.setItem('gotoStateId', stateId);
  window.location.href = 'dashboard.html';
}


// ==== WEATHER ====
const API_KEY = "b1439b5b93805a9e9cc7737829d3b30f";

async function showWeather(city = "Kolkata") {
  document.getElementById('loc').textContent = "Fetching...";
  document.getElementById('temp').textContent = "--°C";
  document.getElementById('desc').textContent = "Please wait";
  document.getElementById('hum').textContent = "--%";
  document.getElementById('wind').textContent = "-- m/s";

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "City not found");
    }
    const d = await res.json();

    document.getElementById('loc').textContent = `${d.name}, ${d.sys.country}`;
    document.getElementById('temp').textContent = Math.round(d.main.temp) + "°C";
    document.getElementById('desc').textContent = d.weather[0].description.charAt(0).toUpperCase() + d.weather[0].description.slice(1);
    document.getElementById('hum').textContent = d.main.humidity + "%";
    document.getElementById('wind').textContent = d.wind.speed + " m/s";
    return { ok: true, lat: d.coord.lat, lng: d.coord.lon };
  } catch (error) {
    document.getElementById('loc').textContent = city;
    document.getElementById('temp').textContent = "--°C";
    document.getElementById('desc').textContent = error.message.charAt(0).toUpperCase() + error.message.slice(1);
    document.getElementById('hum').textContent = "--%";
    document.getElementById('wind').textContent = "-- m/s";
    return { ok: false };
  }
}

// ==== SEARCH ====
async function searchCity() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return;

  const weatherResult = await showWeather(city);
  
  if (weatherResult.ok) {
    const { lat, lng } = weatherResult;
    clearMap();
    map.setView([lat, lng], 10);
    
    searchMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'search-marker',
            html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#f44336" width="36" height="36"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 400Q319-217 239.5-334.5T160-552q0-150 96.5-263.5T480-928q127 0 223.5 113.5T800-552q0 117-79.5 234.5T480-80Z"/></svg>',
            iconSize: [36, 36],
            iconAnchor: [18, 36]
        })
    }).addTo(map)
      .bindPopup(`<b>${city}</b>`)
      .openPopup();
      
    addMarkers(ALERTS);
    renderList(ALERTS, "All India Alerts");
  }
}

document.getElementById('cityInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') searchCity();
});

// ==== CURRENT VIEW ====
function showCurrent() {
  clearMap();
  const kolkata = {lat:22.5726, lng:88.3639, name:"Kolkata"};

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        map.setView([lat, lng], 11);
        userMarker = L.circleMarker([lat, lng], {radius:10, color:'#007BFF', fillOpacity:0.9})
          .addTo(map).bindPopup("You are HERE!").openPopup();
        fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${API_KEY}`)
          .then(r => r.json())
          .then(data => showWeather(data[0]?.name || kolkata.name))
          .catch(() => showWeather(kolkata.name));
      },
      () => {
        map.setView([kolkata.lat, kolkata.lng], 11);
        userMarker = L.circleMarker([kolkata.lat, kolkata.lng], {radius:10, color:'#007BFF', fillOpacity:0.9})
          .addTo(map).bindPopup("Kolkata").openPopup();
        showWeather(kolkata.name);
      },
      { enableHighAccuracy: true }      
    );
  } else {
    map.setView([kolkata.lat, kolkata.lng], 11);
    userMarker = L.circleMarker([kolkata.lat, kolkata.lng], {radius:10, color:'#007BFF', fillOpacity:0.9})
      .addTo(map).bindPopup("Kolkata").openPopup();
    showWeather(kolkata.name);
  }

  addMarkers(ALERTS);
  renderList(ALERTS, "Nearby Alerts");
}

// ==== INDIA VIEW ====
function showIndia() {
  clearMap();
  map.setView([22.9734, 78.6569], 5);
  addMarkers(ALERTS);
  renderList(ALERTS, "All India");
  document.getElementById('ticker-text').textContent = "*** South Lhonak - HIGH RISK ***";
  showWeather("Delhi");
}

// ==== STATE VIEW – NO MAP CHANGE UNTIL CLICK ====
function showStateView() {
  document.getElementById('stateTable').style.display = 'block';
  document.getElementById('alertList').style.display = 'none';
  document.getElementById('panelTitle').textContent = "State-wise Summary";

  const groups = {};
  ALERTS.forEach(a => {
    groups[a.state] = groups[a.state] || {count:0, top:a.sev};
    groups[a.state].count++;
    if (a.sev === "High") groups[a.state].top = "High";
  });

  let html = `<div class="table-container">
              <table><tr><th>State</th><th>Alerts</th><th>Capital</th><th>Risk</th></tr>`;
  Object.keys(groups).sort().forEach(s => {
    const capital = STATE_CAPITALS[s];
    html += `<tr onclick="zoomState('${s}')">
      <td>${s}</td>
      <td>${groups[s].count}</td>
      <td>${capital}</td>
      <td class="sev ${groups[s].top}">${groups[s].top}</td>
    </tr>`;
  });
  html += `</table></div>`;
  document.getElementById('stateTable').innerHTML = html;
}

// ==== ZOOM STATE – NOW CHANGE MAP + ROUTES ====
function zoomState(stateName) {
  const alerts = ALERTS.filter(a => a.state === stateName);
  clearMap(); 
  addMarkers(alerts);
  addEvacPaths(alerts);
  renderList(alerts, `${stateName} Alerts`, true);
  map.fitBounds([
    [Math.min(...alerts.map(a=>a.lat))-0.3, Math.min(...alerts.map(a=>a.lng))-0.3],
    [Math.max(...alerts.map(a=>a.lat))+0.3, Math.max(...alerts.map(a=>a.lng))+0.3]
  ]);
  showWeather(STATE_CAPITALS[stateName]);
}

// ==== MAP HELPERS ====
function clearMap() { [userMarker, searchMarker, ...markers, ...evacLines].forEach(l => l && map.removeLayer(l)); markers = []; evacLines = []; searchMarker = null; userMarker = null; }

// UPDATED addMarkers for hover/click
function addMarkers(data) {
  data.forEach(a => {
    // .g-marker class is styled in style.css
    const m = L.marker([a.lat, a.lng], {icon: L.divIcon({className:`g-marker sev ${a.sev}`, html:'G'})})
      .addTo(map)
      .bindPopup(`<b>${a.loc}</b><br>Risk: ${a.sev}`); // Popup content
    
    // Add hover events
    m.on('mouseover', function (e) { this.openPopup(); });
    m.on('mouseout', function (e) { this.closePopup(); });
    
    // Add click event
    m.on('click', () => { goToLakeDashboard(a.id, a.stateId); });

    markers.push(m);
  });
}

function addEvacPaths(data) {
  data.forEach(a => {
    if (a.evac_path) {
      const line = L.polyline(a.evac_path, {color:'orange', weight:4, dashArray:'10,10'})
        .addTo(map).bindPopup(`Evacuation Route from ${a.loc} (Safe path based on current weather)`);
      evacLines.push(line);
    }
  });
}

// UPDATED renderList for click
function renderList(alerts, title, back = false) {
  const list = document.getElementById('alertList');
  list.style.display = 'block';
  document.getElementById('stateTable').style.display = 'none';
  document.getElementById('panelTitle').textContent = title;
  
  // Added onclick event to each item
  list.innerHTML = alerts.map(a => `
    <div class="item" onclick="goToLakeDashboard('${a.id}', '${a.stateId}')" style="cursor: pointer;">
      <div class="icon">G</div>
      <div><strong>${a.loc}</strong><br>${a.state} • ${a.sev}</div>
    </div>
  `).join('');

  if (back) {
    const btn = document.createElement('button');
    btn.textContent = "Back";
    btn.onclick = () => {
      document.querySelector('[data-view="state"]').click();
    };
    list.appendChild(btn);
  }
}

// ==== TABS ====
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const v = btn.dataset.view;
    if (v === 'current') showCurrent();
    else if (v === 'india') showIndia();
    else showStateView();
  };
});

// ==== NAV + CHARTS + THEME + CLOCK ====
document.querySelectorAll('nav a').forEach(a => {
  a.onclick = e => {
    if (a.href.includes('#')) {
      e.preventDefault();
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.querySelector(a.getAttribute('href')).classList.add('active');
      if (a.getAttribute('href') === '#dashboard') initCharts();
    }
  };
});
function initCharts() {
  // This is for the old dashboard page, which is no longer used
  // But we can leave the logic.
  try {
    const sev = {High:0, Medium:0, Low:0};
    const states = {};
    ALERTS.forEach(a => { sev[a.sev]++; states[a.state] = (states[a.state] || 0) + 1; });
    new Chart(document.getElementById('severityPie'), {type:'pie', data:{labels:['High','Medium','Low'], datasets:[{data:Object.values(sev), backgroundColor:['#f44336','#ff9800','#4caf50']}]}});
    new Chart(document.getElementById('stateBar'), {type:'bar', data:{labels:Object.keys(states), datasets:[{label:'Alerts', data:Object.values(states), backgroundColor:'#4fc3f7'}]}});
  } catch (e) {
    // console.log("Charts not on this page");
  }
}
document.getElementById('themeToggle').onclick = () => {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
};
if (localStorage.getItem('theme') === 'light') document.body.classList.add('light');
function updateClock() {
  const now = new Date();
  const h = now.getHours() % 12 || 12;
  const m = now.getMinutes().toString().padStart(2,'0');
  const am = now.getHours() >= 12 ? 'PM' : 'AM';
  document.getElementById('clock').textContent = `${h}:${m} ${am}`;
}
setInterval(updateClock, 1000); updateClock();

// ==== MOBILE NAV TOGGLE ====
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('nav');

navToggle.addEventListener('click', () => {
  nav.classList.toggle('nav-active');
  navToggle.classList.toggle('nav-active');
});

document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', () => {
    if (nav.classList.contains('nav-active')) {
      nav.classList.remove('nav-active');
      navToggle.classList.remove('nav-active');
    }
  });
});

// ==== START ====
document.querySelector('[data-view="india"]').click();