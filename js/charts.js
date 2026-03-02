

const API = {
    geocoding: "https://geocoding-api.open-meteo.com/v1/search",
    weather:   "https://api.open-meteo.com/v1/forecast",
    marine:    "https://marine-api.open-meteo.com/v1/marine",
    airQuality:"https://air-quality-api.open-meteo.com/v1/air-quality",
    reverseGeo:"https://api.bigdatacloud.net/data/reverse-geocode-client"
};


Chart.defaults.color = "rgba(255,255,255,0.65)";
Chart.defaults.borderColor = "rgba(255,255,255,0.07)";
Chart.defaults.font.family = "Barlow, sans-serif";


function baseChartOptions(yLabel = "") {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "rgba(10,22,40,0.95)",
                borderColor: "rgba(0,217,255,0.4)",
                borderWidth: 1,
                titleColor: "#00d9ff",
                bodyColor: "rgba(255,255,255,0.9)",
                padding: 10
            }
        },
        scales: {
            x: {
                grid: { color: "rgba(255,255,255,0.05)" },
                ticks: { maxRotation: 45, font: { size: 10 } }
            },
            y: {
                grid: { color: "rgba(255,255,255,0.07)" },
                title: { display: !!yLabel, text: yLabel, color: "rgba(255,255,255,0.5)", font: { size: 11 } },
                ticks: { font: { size: 11 } }
            }
        }
    };
}


let currentLat = null, currentLon = null, currentCity = "—", currentCountry = "";
const chartInstances = {};


window.addEventListener("load", async () => {
    try {
        // Try GPS first, fallback to saved city
        const saved = localStorage.getItem("favCities");
        let cityData = null;

        try {
            cityData = await getGPSLocation();
        } catch {
            if (saved) {
                const cities = JSON.parse(saved);
                if (cities.length) cityData = cities[cities.length - 1];
            }
        }

        if (!cityData) {
            showGlobalError("No se pudo detectar tu ubicación. Ve al inicio y busca una ciudad.");
            return;
        }

        currentLat = cityData.latitude;
        currentLon = cityData.longitude;
        currentCity = cityData.name;
        currentCountry = cityData.country || "";

        
        const badge = document.getElementById("currentCityBadge");
        document.getElementById("cityBadgeText").textContent = `${currentCity}, ${currentCountry}`;
        badge.style.display = "inline-flex";

        
        await Promise.all([
            loadAirQuality(),
            loadWeatherCharts(),
            loadMarineData()
        ]);

    } catch (err) {
        console.error("Error inicializando charts:", err);
        showGlobalError("Error cargando los datos. Comprueba tu conexión.");
    }
});


function getGPSLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject("No GPS"); return; }
        navigator.geolocation.getCurrentPosition(async pos => {
            try {
                const { latitude, longitude } = pos.coords;
                const res = await fetch(`${API.reverseGeo}?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`);
                const d = await res.json();
                resolve({
                    name: d.city || d.locality || "Desconocido",
                    country: d.countryCode || "",
                    latitude, longitude
                });
            } catch { reject("Geocoding failed"); }
        }, () => reject("GPS denied"), { timeout: 8000 });
    });
}


async function loadAirQuality() {
    const params = new URLSearchParams({
        latitude: currentLat,
        longitude: currentLon,
        current: "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi",
        hourly: "pm10,pm2_5,european_aqi",
        timezone: "auto"
    });

    const res = await fetch(`${API.airQuality}?${params}`);
    const data = await res.json();
    const c = data.current;

    if (!c) {
        document.getElementById("aqiContent").innerHTML = `<p class="notAvailable">Datos de calidad del aire no disponibles para esta ubicación</p>`;
        return;
    }

    const euAqi = c.european_aqi ?? null;
    const usAqi = c.us_aqi ?? null;
    const displayAqi = euAqi ?? usAqi ?? 0;
    const aqiInfo = getAQIInfo(displayAqi);

    document.getElementById("aqiBadgeLabel").textContent = `AQI ${displayAqi}`;

    document.getElementById("aqiContent").innerHTML = `
        <div class="aqiIndexBanner ${aqiInfo.cls}">
            <div class="aqiBigNumber">${displayAqi}</div>
            <div class="aqiInfo">
                <div class="aqiIndexLabel">${aqiInfo.label}</div>
                <div class="aqiIndexDesc">${aqiInfo.desc}</div>
            </div>
            <span style="font-size:2.5rem">${aqiInfo.emoji}</span>
        </div>
        <div class="aqiGrid">
            ${makeAQIItem("PM2.5", c.pm2_5?.toFixed(1) ?? "—", "μg/m³")}
            ${makeAQIItem("PM10",  c.pm10?.toFixed(1) ?? "—",  "μg/m³")}
            ${makeAQIItem("CO",    c.carbon_monoxide?.toFixed(0) ?? "—", "μg/m³")}
            ${makeAQIItem("NO₂",   c.nitrogen_dioxide?.toFixed(1) ?? "—", "μg/m³")}
            ${makeAQIItem("SO₂",   c.sulphur_dioxide?.toFixed(1) ?? "—", "μg/m³")}
            ${makeAQIItem("O₃",    c.ozone?.toFixed(1) ?? "—", "μg/m³")}
        </div>
    `;


}

function makeAQIItem(label, value, unit) {
    return `
        <div class="aqiItem">
            <div class="aqiLabel">${label}</div>
            <div class="aqiValue">${value}</div>
            <div class="aqiUnit">${unit}</div>
        </div>
    `;
}

function getAQIInfo(aqi) {
    if (aqi <= 20)  return { cls: "aqi-good",              label: "Muy buena",       desc: "Calidad del aire excelente. Ideal para actividades al aire libre.",    emoji: "😊" };
    if (aqi <= 40)  return { cls: "aqi-good",              label: "Buena",           desc: "La calidad del aire es satisfactoria.",                                emoji: "🙂" };
    if (aqi <= 60)  return { cls: "aqi-moderate",          label: "Moderada",        desc: "Acceptable, pero puede haber problemas para personas sensibles.",       emoji: "😐" };
    if (aqi <= 80)  return { cls: "aqi-unhealthy-sensitive",label:"Mala para sensibles", desc: "Personas con enfermedades respiratorias deben reducir exposición.", emoji: "😷" };
    if (aqi <= 100) return { cls: "aqi-unhealthy",         label: "Mala",            desc: "Toda la población puede notar efectos. Evita salir mucho al exterior.", emoji: "🤢" };
    if (aqi <= 150) return { cls: "aqi-very-unhealthy",    label: "Muy mala",        desc: "Alerta sanitaria. Reduce actividades al aire libre.",                   emoji: "🚨" };
    return              { cls: "aqi-hazardous",            label: "Peligrosa",       desc: "Emergencia sanitaria. Permanece en interiores.",                        emoji: "☠️" };
}


async function loadWeatherCharts() {
    const params = new URLSearchParams({
        latitude: currentLat,
        longitude: currentLon,
        current: "wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_2m",
        hourly: "temperature_2m,wind_speed_10m,wind_direction_10m,precipitation_probability,precipitation",
        daily: "precipitation_probability_max,temperature_2m_max,temperature_2m_min,weather_code",
        timezone: "auto",
        forecast_days: 7
    });

    const res = await fetch(`${API.weather}?${params}`);
    const data = await res.json();

    
    renderWindCompass(data.current);

    
    renderWindChart(data.hourly);

    
    renderRainChart(data.daily);

    
    renderTempChart(data.hourly);
}


function renderWindCompass(current) {
    const dir = current.wind_direction_10m ?? 0;
    const speed = current.wind_speed_10m ?? 0;
    const gusts = current.wind_gusts_10m ?? 0;
    const dirLabel = getWindCardinal(dir);

    document.getElementById("windCompassContent").innerHTML = `
        <div class="windRow">
            <div class="compassWrapper">
                <div class="compass">
                    <span class="compassLabel n">N</span>
                    <span class="compassLabel s">S</span>
                    <span class="compassLabel e">E</span>
                    <span class="compassLabel w">O</span>
                    <div class="compassRose">
                        <div class="compassNeedle" id="compassNeedle" style="transform: rotate(${dir - 180}deg)"></div>
                    </div>
                </div>
                <div class="compassDirLabel">
                    <strong>${dirLabel}</strong><br>
                    <span>${Math.round(dir)}°</span>
                </div>
            </div>
            <div class="windStats">
                <div class="windStatItem">
                    <span class="statLabel">💨 Velocidad</span>
                    <span class="statValue">${Math.round(speed)} km/h</span>
                </div>
                <div class="windStatItem">
                    <span class="statLabel">💥 Rachas</span>
                    <span class="statValue">${Math.round(gusts)} km/h</span>
                </div>
                <div class="windStatItem">
                    <span class="statLabel">🧭 Dirección</span>
                    <span class="statValue">${dirLabel} (${Math.round(dir)}°)</span>
                </div>
                <div class="windStatItem">
                    <span class="statLabel">⚡ Beaufort</span>
                    <span class="statValue">${getBeaufort(speed)} BF</span>
                </div>
            </div>
        </div>
    `;
}


function renderWindChart(hourly) {
    const now = new Date();
    const startIdx = hourly.time.findIndex(t => new Date(t) >= now);
    const slice = (arr) => arr.slice(startIdx, startIdx + 24);

    const labels = slice(hourly.time).map(t =>
        new Date(t).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false })
    );

    const windData = slice(hourly.wind_speed_10m).map(v => Math.round(v));

    if (chartInstances.wind) chartInstances.wind.destroy();
    const ctx = document.getElementById("windChart").getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, "rgba(0, 217, 255, 0.4)");
    gradient.addColorStop(1, "rgba(0, 217, 255, 0.02)");

    chartInstances.wind = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Velocidad viento (km/h)",
                data: windData,
                borderColor: "#00d9ff",
                backgroundColor: gradient,
                borderWidth: 2.5,
                pointRadius: 3,
                pointBackgroundColor: "#00d9ff",
                pointBorderColor: "rgba(0,217,255,0.3)",
                tension: 0.4,
                fill: true
            }]
        },
        options: baseChartOptions("km/h")
    });
}


function renderRainChart(daily) {
    const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const labels = daily.time.map((d, i) => {
        const date = new Date(d);
        return i === 0 ? "Hoy" : DAYS_ES[date.getDay()];
    });
    const rainProb = daily.precipitation_probability_max;

    if (chartInstances.rain) chartInstances.rain.destroy();
    const ctx = document.getElementById("rainChart").getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, "rgba(0, 255, 136, 0.5)");
    gradient.addColorStop(1, "rgba(0, 255, 136, 0.03)");

    chartInstances.rain = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Prob. lluvia (%)",
                data: rainProb,
                backgroundColor: rainProb.map(v => v > 70 ? "rgba(0,217,255,0.7)" : v > 40 ? "rgba(0,255,136,0.55)" : "rgba(0,255,136,0.3)"),
                borderColor: "rgba(0, 255, 136, 0.8)",
                borderWidth: 1.5,
                borderRadius: 8
            }]
        },
        options: {
            ...baseChartOptions("%"),
            scales: {
                ...baseChartOptions("%").scales,
                y: { ...baseChartOptions("%").scales.y, min: 0, max: 100 }
            }
        }
    });
}


function renderTempChart(hourly) {
    const now = new Date();
    const startIdx = hourly.time.findIndex(t => new Date(t) >= now);
    const slice = (arr) => arr.slice(startIdx, startIdx + 24);

    const labels = slice(hourly.time).map(t =>
        new Date(t).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false })
    );
    const temps = slice(hourly.temperature_2m).map(v => Math.round(v));

    if (chartInstances.temp) chartInstances.temp.destroy();
    const ctx = document.getElementById("tempChart").getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, "rgba(255, 149, 0, 0.45)");
    gradient.addColorStop(1, "rgba(255, 71, 87, 0.04)");

    chartInstances.temp = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Temperatura (°C)",
                data: temps,
                borderColor: "#ff9500",
                backgroundColor: gradient,
                borderWidth: 2.5,
                pointRadius: 3,
                pointBackgroundColor: "#ff9500",
                tension: 0.45,
                fill: true
            }]
        },
        options: baseChartOptions("°C")
    });
}


async function loadMarineData() {
    try {
        const params = new URLSearchParams({
            latitude: currentLat,
            longitude: currentLon,
            current: "wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,ocean_current_velocity,ocean_current_direction",
            hourly: "wave_height,swell_wave_height",
            timezone: "auto"
        });

        const res = await fetch(`${API.marine}?${params}`);
        if (!res.ok) throw new Error("No marine data");
        const data = await res.json();
        const m = data.current;

        document.getElementById("marineContent").innerHTML = `
            <div class="marineStatsGrid">
                ${marineCard("🌊", "Altura olas", m.wave_height?.toFixed(2) ?? "—", "m")}
                ${marineCard("⏱️", "Período olas", m.wave_period?.toFixed(1) ?? "—", "s")}
                ${marineCard("💨", "Olas de viento", m.wind_wave_height?.toFixed(2) ?? "—", "m")}
                ${marineCard("🌀", "Oleaje (swell)", m.swell_wave_height?.toFixed(2) ?? "—", "m")}
                ${marineCard("🌊", "Corriente", m.ocean_current_velocity?.toFixed(2) ?? "—", "m/s")}
                ${marineCard("🧭", "Dir. corriente", Math.round(m.ocean_current_direction ?? 0) + "°", "")}
            </div>
        `;

        
        renderWaveChart(data.hourly);

    } catch {
        document.getElementById("marineContent").innerHTML = `
            <p class="notAvailable">⚓ Datos marítimos no disponibles para esta ubicación (solo disponibles en zonas costeras/oceánicas)</p>
        `;
        document.getElementById("waveChart").parentElement.style.display = "none";
    }
}

function marineCard(icon, label, value, unit) {
    return `
        <div class="marineStatCard">
            <div class="statIcon">${icon}</div>
            <div class="statLabel">${label}</div>
            <div class="statValue">${value}</div>
            <div class="statUnit">${unit}</div>
        </div>
    `;
}

function renderWaveChart(hourly) {
    if (!hourly?.wave_height) return;

    const now = new Date();
    const startIdx = hourly.time.findIndex(t => new Date(t) >= now);
    const slice = (arr) => arr.slice(startIdx, startIdx + 24);

    const labels = slice(hourly.time).map(t =>
        new Date(t).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false })
    );

    if (chartInstances.wave) chartInstances.wave.destroy();
    const ctx = document.getElementById("waveChart").getContext("2d");

    const g1 = ctx.createLinearGradient(0, 0, 0, 240);
    g1.addColorStop(0, "rgba(0, 217, 255, 0.45)");
    g1.addColorStop(1, "rgba(0, 217, 255, 0.03)");

    const g2 = ctx.createLinearGradient(0, 0, 0, 240);
    g2.addColorStop(0, "rgba(0, 255, 136, 0.25)");
    g2.addColorStop(1, "rgba(0, 255, 136, 0.01)");

    chartInstances.wave = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Altura olas (m)",
                    data: slice(hourly.wave_height).map(v => v?.toFixed(2) ?? 0),
                    borderColor: "#00d9ff",
                    backgroundColor: g1,
                    borderWidth: 2.5,
                    pointRadius: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: "Oleaje swell (m)",
                    data: slice(hourly.swell_wave_height).map(v => v?.toFixed(2) ?? 0),
                    borderColor: "#00ff88",
                    backgroundColor: g2,
                    borderWidth: 1.5,
                    pointRadius: 2,
                    borderDash: [5, 3],
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            ...baseChartOptions("m"),
            plugins: {
                ...baseChartOptions().plugins,
                legend: {
                    display: true,
                    labels: {
                        color: "rgba(255,255,255,0.7)",
                        font: { size: 11 },
                        boxWidth: 12,
                        padding: 12
                    }
                }
            }
        }
    });
}


function getWindCardinal(degrees) {
    const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
    return dirs[Math.round(degrees / 22.5) % 16];
}

function getBeaufort(kmh) {
    if (kmh < 1)   return 0;
    if (kmh < 6)   return 1;
    if (kmh < 12)  return 2;
    if (kmh < 20)  return 3;
    if (kmh < 29)  return 4;
    if (kmh < 39)  return 5;
    if (kmh < 50)  return 6;
    if (kmh < 62)  return 7;
    if (kmh < 75)  return 8;
    if (kmh < 89)  return 9;
    if (kmh < 103) return 10;
    if (kmh < 118) return 11;
    return 12;
}

function showGlobalError(msg) {
    document.querySelectorAll(".loadingState").forEach(el => {
        el.innerHTML = `<p class="notAvailable">⚠️ ${msg}</p>`;
    });
}