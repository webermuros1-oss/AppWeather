if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./js/serviceWorker.js")
            .then(reg => console.log("Service Worker registrado:", reg.scope))
            .catch(err => console.error("Error registrando Service Worker:", err));
    });
}

const elements = {
    cityInput: document.querySelector("#getCity"),
    cityName: document.querySelector(".cityName"),
    cityTemp: document.querySelector(".weatherDeg"),
    cityCondition: document.querySelector(".weatherCondition"),
    todayDate: document.querySelector(".date"),
    weatherIcon: document.querySelector(".weatherIconDisplay"),
    header: document.querySelector("header"),
    mainCard: document.querySelector(".mainWeatherCard"),
    atmosphere: document.querySelector(".atmosphereInfo"),
    wind: document.querySelector(".windInfo"),
    marine: document.querySelector(".marineInfo"),
    forecast: document.querySelector(".forecastInfo"),
    astro: document.querySelector(".astroInfo"),
    hourly: document.querySelector(".hourlyInfo"),
    prevArrow: document.querySelector(".prevArrow"),
    nextArrow: document.querySelector(".nextArrow"),
    favDots: document.getElementById("favDots")
};

const API_URLS = {
    geocoding: "https://geocoding-api.open-meteo.com/v1/search",
    weather:   "https://api.open-meteo.com/v1/forecast",
    marine:    "https://marine-api.open-meteo.com/v1/marine"
};

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS   = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

const WEATHER_ICONS = {
    0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",
    51:"🌦️",53:"🌦️",55:"🌧️",61:"🌧️",63:"🌧️",65:"🌧️",
    71:"❄️",73:"❄️",75:"❄️",77:"🌨️",
    80:"🌦️",81:"🌧️",82:"⛈️",
    85:"🌨️",86:"🌨️",
    95:"⛈️",96:"⛈️",99:"⛈️"
};

const WEATHER_DESCRIPTIONS = {
    0:"Despejado",1:"Mayormente despejado",
    2:"Parcialmente nublado",3:"Nublado",
    45:"Niebla",48:"Niebla con escarcha",
    51:"Llovizna ligera",53:"Llovizna moderada",55:"Llovizna intensa",
    61:"Lluvia ligera",63:"Lluvia moderada",65:"Lluvia intensa",
    71:"Nieve ligera",73:"Nieve moderada",75:"Nieve intensa",77:"Granizo",
    80:"Chubascos ligeros",81:"Chubascos moderados",82:"Chubascos intensos",
    85:"Nevadas ligeras",86:"Nevadas intensas",
    95:"Tormenta",96:"Tormenta con granizo",99:"Tormenta severa"
};

const BACKGROUND_IMAGES = {
    sunny:["sunny1","sunny2","beach"],
    cloudy:["cloudy1","cloudy2"],
    rainy:["rainy1","rainy2","rainy3"],
    snowy:["snowy1","snowy2"],
    stormy:["stormy1","stormy2"],
    foggy:["foggy1","foggy2"],
    default:["bg1","bg2","bg3","bg4","bg5"]
};

// ═══════════════════════════════════════════════
// HOUR DETAIL MODAL  (bottom-sheet on mobile,
//                     centered popup on desktop)
// ═══════════════════════════════════════════════

function injectModalStyles() {
    if (document.getElementById("hourModalStyles")) return;
    const s = document.createElement("style");
    s.id = "hourModalStyles";
    s.textContent = `
    /* ── backdrop ── */
    .hmBackdrop {
        position:fixed;inset:0;
        background:rgba(0,0,0,.65);
        backdrop-filter:blur(6px);
        z-index:9000;
        animation:hmFadeIn .25s ease;
    }
    @keyframes hmFadeIn{from{opacity:0}to{opacity:1}}

    /* ── panel ── */
    .hmPanel {
        position:fixed;bottom:0;left:0;right:0;
        background:linear-gradient(160deg,#0a1628 0%,#1a2f4a 60%,#2d4a5c 100%);
        border-top:2px solid rgba(0,217,255,.4);
        border-radius:24px 24px 0 0;
        z-index:9001;
        max-height:90vh;overflow-y:auto;
        padding-bottom:env(safe-area-inset-bottom,16px);
        box-shadow:0 -8px 40px rgba(0,0,0,.6),0 -2px 10px rgba(0,217,255,.15);
        animation:hmSlideUp .32s cubic-bezier(.4,0,.2,1);
    }
    @keyframes hmSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    .hmPanel.hmClosing{animation:hmSlideDown .28s cubic-bezier(.4,0,.2,1) forwards}
    @keyframes hmSlideDown{from{transform:translateY(0)}to{transform:translateY(100%)}}

    /* drag bar */
    .hmDrag{
        width:40px;height:4px;background:rgba(255,255,255,.25);
        border-radius:2px;margin:14px auto 0;display:block;
    }

    /* ── header row ── */
    .hmHeader{
        display:flex;align-items:center;justify-content:space-between;
        padding:14px 20px 14px;
        border-bottom:1px solid rgba(0,217,255,.15);
        position:sticky;top:0;
        background:linear-gradient(160deg,#0a1628,#1a2f4a);
        z-index:1;
    }
    .hmTitleGroup{display:flex;align-items:center;gap:12px}
    .hmEmoji{font-size:2.4rem;line-height:1}
    .hmTitleGroup h3{font-size:1.25rem;font-weight:700;color:#fff;margin-bottom:2px}
    .hmTitleGroup p{font-size:.82rem;color:rgba(255,255,255,.5)}
    .hmCloseBtn{
        background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);
        border-radius:50%;color:#fff;width:34px;height:34px;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;font-size:1rem;transition:background .2s;flex-shrink:0;
    }
    .hmCloseBtn:hover{background:rgba(255,71,87,.35)}

    /* ── big temp ── */
    .hmTempRow{
        display:flex;align-items:center;justify-content:center;gap:24px;
        padding:18px 20px 14px;
        border-bottom:1px solid rgba(0,217,255,.1);
    }
    .hmBigTemp{
        font-size:4.2rem;font-weight:700;color:#fff;line-height:1;
        text-shadow:0 0 24px rgba(0,217,255,.25);
    }
    .hmFeels{display:flex;flex-direction:column;gap:4px}
    .hmFeels span:first-child{font-size:.72rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px}
    .hmFeels span:last-child{font-size:1.5rem;font-weight:600;color:#00ff88}

    /* ── rain bar ── */
    .hmRainBar{
        margin:14px 20px;
        background:rgba(0,217,255,.06);
        border:1px solid rgba(0,217,255,.15);
        border-radius:14px;padding:12px 14px;
    }
    .hmRainBarTop{
        display:flex;justify-content:space-between;
        font-size:.8rem;color:rgba(255,255,255,.55);margin-bottom:8px;
    }
    .hmRainBarTop strong{color:#00d9ff}
    .hmTrack{height:8px;background:rgba(255,255,255,.1);border-radius:4px;overflow:hidden}
    .hmFill{
        height:100%;border-radius:4px;
        background:linear-gradient(90deg,#00d9ff,#00ff88);
        width:0%;transition:width .7s cubic-bezier(.4,0,.2,1);
    }

    /* ── stats grid ── */
    .hmGrid{
        display:grid;grid-template-columns:repeat(2,1fr);
        gap:10px;padding:0 20px 22px;
    }
    .hmStat{
        background:rgba(0,217,255,.08);
        border:1px solid rgba(0,217,255,.14);
        border-radius:14px;padding:14px;
        display:flex;flex-direction:column;gap:4px;
        transition:background .2s;
    }
    .hmStat:hover{background:rgba(0,217,255,.15)}
    .hmStatIcon{font-size:1.3rem}
    .hmStatLabel{font-size:.7rem;color:rgba(255,255,255,.42);text-transform:uppercase;letter-spacing:.5px}
    .hmStatValue{font-size:1.1rem;font-weight:700;color:#00ff88;text-shadow:0 0 8px rgba(0,255,136,.3)}
    .hmStatSub{font-size:.7rem;color:rgba(255,255,255,.32)}

    /* ── desktop override ── */
    @media(min-width:600px){
        .hmPanel{
            bottom:auto;top:50%;left:50%;
            transform:translate(-50%,-50%);
            border-radius:24px;
            border:1px solid rgba(0,217,255,.3);
            max-width:420px;width:calc(100% - 40px);
            animation:hmPopIn .3s cubic-bezier(.4,0,.2,1);
        }
        @keyframes hmPopIn{
            from{opacity:0;transform:translate(-50%,-48%) scale(.95)}
            to  {opacity:1;transform:translate(-50%,-50%) scale(1)}
        }
        .hmPanel.hmClosing{
            animation:hmPopOut .25s cubic-bezier(.4,0,.2,1) forwards;
        }
        @keyframes hmPopOut{
            from{opacity:1;transform:translate(-50%,-50%) scale(1)}
            to  {opacity:0;transform:translate(-50%,-48%) scale(.95)}
        }
        .hmDrag{display:none}
    }

    /* ── hour card cursor ── */
    .hourItem{cursor:pointer}
    .hourTapHint{
        font-size:.65rem;color:rgba(255,255,255,.35);
        margin-top:2px;
    }
    `;
    document.head.appendChild(s);
}

function openHourModal(d) {
    injectModalStyles();
    _closeHourModal(true); // remove any existing

    const pct = d.precip > 0 ? Math.min(d.precip * 25, 100) : (d.rainProb ?? 0);
    const vis = d.visibility != null ? (d.visibility / 1000).toFixed(1) : "—";
    const feels = d.feelsLike  != null ? Math.round(d.feelsLike) : "—";

    const backdrop = document.createElement("div");
    backdrop.className = "hmBackdrop";
    backdrop.id = "hmBackdrop";

    const panel = document.createElement("div");
    panel.className = "hmPanel";
    panel.id = "hmPanel";
    panel.innerHTML = `
        <span class="hmDrag"></span>
        <div class="hmHeader">
            <div class="hmTitleGroup">
                <span class="hmEmoji">${d.icon}</span>
                <div>
                    <h3>${d.time}</h3>
                    <p>${d.description}</p>
                </div>
            </div>
            <button class="hmCloseBtn" id="hmCloseBtn">✕</button>
        </div>

        <div class="hmTempRow">
            <span class="hmBigTemp">${Math.round(d.temp)}°C</span>
            <div class="hmFeels">
                <span>Sensación</span>
                <span>${feels}°C</span>
            </div>
        </div>

        <div class="hmRainBar">
            <div class="hmRainBarTop">
                <span>${d.precip > 0
                    ? `💧 Precipitación: <strong>${d.precip} mm</strong>`
                    : `💧 Prob. lluvia: <strong>${d.rainProb ?? 0}%</strong>`}
                </span>
            </div>
            <div class="hmTrack"><div class="hmFill" id="hmFill"></div></div>
        </div>

        <div class="hmGrid">
            <div class="hmStat">
                <span class="hmStatIcon">💧</span>
                <span class="hmStatLabel">Humedad</span>
                <span class="hmStatValue">${d.humidity ?? "—"}%</span>
            </div>
            <div class="hmStat">
                <span class="hmStatIcon">💨</span>
                <span class="hmStatLabel">Viento</span>
                <span class="hmStatValue">${Math.round(d.windSpeed ?? 0)} km/h</span>
                <span class="hmStatSub">${getWindDirection(d.windDir)}</span>
            </div>
            <div class="hmStat">
                <span class="hmStatIcon">👁️</span>
                <span class="hmStatLabel">Visibilidad</span>
                <span class="hmStatValue">${vis} km</span>
            </div>
            <div class="hmStat">
                <span class="hmStatIcon">☁️</span>
                <span class="hmStatLabel">Nubosidad</span>
                <span class="hmStatValue">${d.cloudCover ?? "—"}%</span>
            </div>
            <div class="hmStat">
                <span class="hmStatIcon">🌡️</span>
                <span class="hmStatLabel">Punto rocío</span>
                <span class="hmStatValue">${d.dewPoint != null ? d.dewPoint.toFixed(1) : "—"}°C</span>
            </div>
            <div class="hmStat">
                <span class="hmStatIcon">🌧️</span>
                <span class="hmStatLabel">${d.precip > 0 ? "Precipitación" : "Prob. lluvia"}</span>
                <span class="hmStatValue">${d.precip > 0 ? d.precip + " mm" : (d.rainProb ?? 0) + "%"}</span>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
    document.body.style.overflow = "hidden";

    // Animate bar
    requestAnimationFrame(() => setTimeout(() => {
        const fill = document.getElementById("hmFill");
        if (fill) fill.style.width = pct + "%";
    }, 60));

    const close = () => _closeHourModal();
    document.getElementById("hmCloseBtn").addEventListener("click", close);
    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", _hmEscHandler);
}

function _hmEscHandler(e) { if (e.key === "Escape") _closeHourModal(); }

function _closeHourModal(instant = false) {
    const panel    = document.getElementById("hmPanel");
    const backdrop = document.getElementById("hmBackdrop");
    document.removeEventListener("keydown", _hmEscHandler);
    if (!panel) return;
    if (instant) { panel.remove(); backdrop?.remove(); document.body.style.overflow = ""; return; }
    panel.classList.add("hmClosing");
    panel.addEventListener("animationend", () => {
        panel.remove(); backdrop?.remove(); document.body.style.overflow = "";
    }, { once: true });
}

// ═══════════════════════════════════════════════
// FAVORITES MANAGER
// ═══════════════════════════════════════════════

class FavoritesManager {
    constructor(max = 4) {
        this.max = max;
        this.favorites = this._load();
        const last = localStorage.getItem("lastCity");
        if (last && this.favorites.length) {
            const i = this.favorites.findIndex(c => c.name === last);
            this.currentIndex = i !== -1 ? i : 0;
        } else { this.currentIndex = 0; }
    }
    _load() {
        try { const s = localStorage.getItem("favCities"); return s ? JSON.parse(s) : []; }
        catch { return []; }
    }
    _save()    { localStorage.setItem("favCities", JSON.stringify(this.favorites)); }
    saveLastCity(n) { localStorage.setItem("lastCity", n); }
    addCity(d) {
        if (!d?.name || !d.latitude || !d.longitude) return false;
        const i = this.favorites.findIndex(c => c.name === d.name);
        if (i !== -1) this.favorites.splice(i, 1);
        this.favorites.push({ name: d.name, country: d.country, latitude: d.latitude, longitude: d.longitude });
        if (this.favorites.length > this.max) this.favorites.shift();
        this.currentIndex = this.favorites.length - 1;
        this.saveLastCity(d.name);
        this._save();
        return true;
    }
    getCurrentCity() { return this.favorites[this.currentIndex] ?? null; }
    goToPrevious() {
        if (!this.favorites.length) return null;
        this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.favorites.length - 1;
        return this.getCurrentCity();
    }
    goToNext() {
        if (!this.favorites.length) return null;
        this.currentIndex = this.currentIndex < this.favorites.length - 1 ? this.currentIndex + 1 : 0;
        return this.getCurrentCity();
    }
    goToIndex(i) {
        if (i >= 0 && i < this.favorites.length) { this.currentIndex = i; return this.getCurrentCity(); }
        return null;
    }
    getAllCities() { return this.favorites; }
    getCount()     { return this.favorites.length; }
}

const favoritesManager = new FavoritesManager();

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════

function initializeEventListeners() {
    window.addEventListener("load", async () => {
        changeBackgroundImage();
        try {
            const gps = await getCurrentLocation();
            await fetchDataFromCoordinates(gps.latitude, gps.longitude, gps.name, gps.country);
            favoritesManager.addCity(gps);
        } catch {
            if (favoritesManager.getCount() > 0) await loadCityByIndex(favoritesManager.currentIndex);
            else alert("No se pudo obtener tu ubicación. Por favor, busca una ciudad manualmente.");
        }
    });

    let lastST = 0;
    window.addEventListener("scroll", () => {
        const st = window.pageYOffset || document.documentElement.scrollTop;
        elements.header.style.transform = (st > lastST && st > 100) ? "translateY(-100%)" : "translateY(0)";
        lastST = st <= 0 ? 0 : st;
    });

    elements.cityInput.addEventListener("keypress", e => { if (e.key === "Enter") fetchDataFromApi(true); });

    elements.prevArrow.addEventListener("click", async () => {
        const c = favoritesManager.goToPrevious(); if (c) await loadCityByName(c);
    });
    elements.nextArrow.addEventListener("click", async () => {
        const c = favoritesManager.goToNext(); if (c) await loadCityByName(c);
    });

    let txStart = 0;
    elements.mainCard.addEventListener("touchstart", e => { txStart = e.changedTouches[0].screenX; });
    elements.mainCard.addEventListener("touchend", e => {
        const d = txStart - e.changedTouches[0].screenX;
        if (d > 50) elements.nextArrow.click();
        else if (d < -50) elements.prevArrow.click();
    });

    // Collapsible cards
    document.querySelectorAll(".card h4").forEach(h => {
        h.addEventListener("click", () => h.closest(".card").classList.toggle("collapsed"));
    });
}

// ═══════════════════════════════════════════════
// GEO
// ═══════════════════════════════════════════════

async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject("no geo"); return; }
        navigator.geolocation.getCurrentPosition(async pos => {
            try {
                const { latitude, longitude } = pos.coords;
                const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`);
                const d = await r.json();
                if (d.city || d.locality)
                    resolve({ name: d.city || d.locality, country: d.countryCode || d.countryName, latitude, longitude });
                else reject("no city");
            } catch (e) { reject(e); }
        }, e => reject(e), { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
    });
}

// ═══════════════════════════════════════════════
// FETCH
// ═══════════════════════════════════════════════

async function fetchDataFromCoordinates(lat, lon, name, country) {
    const [w, m] = await Promise.all([fetchWeatherData(lat, lon), fetchMarineData(lat, lon)]);
    updateUI({ name, country, ...w, ...m });
}

async function fetchDataFromApi(save = false) {
    const city = elements.cityInput.value.trim();
    if (!city) { alert("Introduce una ciudad"); return; }
    try {
        const geo = await fetchGeoData(city);
        if (!geo) return;
        const { latitude, longitude, name, country } = geo;
        if (save) favoritesManager.addCity({ name, country, latitude, longitude });
        else favoritesManager.saveLastCity(name);
        const [w, m] = await Promise.all([fetchWeatherData(latitude, longitude), fetchMarineData(latitude, longitude)]);
        updateUI({ name, country, ...w, ...m });
        elements.cityInput.value = "";
    } catch (e) { console.error(e); alert("Error obteniendo datos meteorológicos"); }
}

async function fetchGeoData(city) {
    const r = await fetch(`${API_URLS.geocoding}?name=${encodeURIComponent(city)}&count=1&language=es&format=json`);
    const d = await r.json();
    if (!d.results?.length) { alert("Ciudad no encontrada"); return null; }
    return d.results[0];
}

async function fetchWeatherData(lat, lon) {
    const p = new URLSearchParams({
        latitude: lat, longitude: lon,
        current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,apparent_temperature,precipitation,rain,showers,snowfall,pressure_msl,surface_pressure,cloud_cover,visibility,uv_index,is_day,cape,dew_point_2m",
        // ← extra hourly fields needed for modal detail
        hourly: "temperature_2m,precipitation_probability,weather_code,relative_humidity_2m,precipitation,apparent_temperature,wind_speed_10m,wind_direction_10m,visibility,cloud_cover,dew_point_2m",
        daily:  "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max",
        timezone: "auto",
        forecast_days: 7
    });
    const r = await fetch(`${API_URLS.weather}?${p}`);
    const d = await r.json();
    const c = d.current;
    return {
        temperature: c.temperature_2m, apparentTemperature: c.apparent_temperature,
        humidity: c.relative_humidity_2m, dewPoint: c.dew_point_2m,
        windSpeed: c.wind_speed_10m, windDirection: c.wind_direction_10m, windGusts: c.wind_gusts_10m,
        weatherCode: c.weather_code, precipitation: c.precipitation,
        rain: c.rain, showers: c.showers, snowfall: c.snowfall,
        pressure: c.pressure_msl, surfacePressure: c.surface_pressure,
        cloudCover: c.cloud_cover, visibility: c.visibility,
        uvIndex: c.uv_index, cape: c.cape,
        dailyForecast: d.daily, hourlyForecast: d.hourly
    };
}

async function fetchMarineData(lat, lon) {
    try {
        const p = new URLSearchParams({
            latitude: lat, longitude: lon,
            current: "wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,ocean_current_velocity,ocean_current_direction",
            timezone: "auto"
        });
        const r = await fetch(`${API_URLS.marine}?${p}`);
        if (!r.ok) return { hasMarineData: false };
        const d = await r.json();
        return { hasMarineData: true, marine: d.current };
    } catch { return { hasMarineData: false }; }
}

async function loadCityByIndex(i)    { const c = favoritesManager.goToIndex(i);    if (c) await loadCityByCoordinates(c); }
async function loadCityByName(c)     { await loadCityByCoordinates(c); }
async function loadCityByCoordinates(c) {
    if (!c?.latitude || !c?.longitude) return;
    try { await fetchDataFromCoordinates(c.latitude, c.longitude, c.name, c.country); favoritesManager.saveLastCity(c.name); }
    catch { alert(`No se pudo cargar ${c.name}.`); }
}

// ═══════════════════════════════════════════════
// UI
// ═══════════════════════════════════════════════

function updateUI(data) {
    updateMainCard(data);
    updateAtmosphere(data);
    updateWind(data);
    updateForecast(data);
    updateAstro(data);
    updateMarine(data);
    updateHourly(data);
    updateDots();
    changeBackgroundImage(data.weatherCode);
    scrollToTop();
}

// ─── Hourly: 24h + tap-to-expand modal ───
function updateHourly(data) {
    if (!data.hourlyForecast) {
        elements.hourly.innerHTML = `<p class="notAvailable">Pronóstico horario no disponible</p>`;
        return;
    }
    const now = new Date();
    const start = data.hourlyForecast.time.findIndex(t => new Date(t) > now);
    const idx = start !== -1 ? start : 0;
    const h = data.hourlyForecast;

    elements.hourly.innerHTML = h.time.slice(idx, idx + 24).map((time, i) => {
        const hi   = idx + i;
        const t    = new Date(time).toLocaleTimeString("es-ES", { hour:"2-digit", minute:"2-digit", hour12:false });
        const temp = Math.round(h.temperature_2m[hi]);
        const code = h.weather_code[hi];
        const rain = h.precipitation_probability[hi] ?? 0;
        const prec = h.precipitation[hi] ?? 0;
        const icon = getWeatherIcon(code);

        // All detail data packed into data attribute
        const detail = {
            time: t, icon, description: getWeatherDescription(code),
            temp: h.temperature_2m[hi],
            feelsLike:   h.apparent_temperature?.[hi],
            humidity:    h.relative_humidity_2m?.[hi],
            windSpeed:   h.wind_speed_10m?.[hi],
            windDir:     h.wind_direction_10m?.[hi],
            visibility:  h.visibility?.[hi],
            cloudCover:  h.cloud_cover?.[hi],
            dewPoint:    h.dew_point_2m?.[hi],
            rainProb: rain, precip: prec
        };

        return `
        <div class="hourItem" data-hour='${JSON.stringify(detail).replace(/'/g,"&#39;")}'>
            <span class="hour">${t}</span>
            <span class="hourIcon">${icon}</span>
            <span class="hourTemp">${temp}°</span>
            ${prec > 0
                ? `<span class="hourRain">💧 ${prec}mm</span>`
                : `<span class="hourRain">💧 ${rain}%</span>`}
            <span class="hourTapHint">+ info</span>
        </div>`;
    }).join("");

    elements.hourly.querySelectorAll(".hourItem").forEach(card => {
        card.addEventListener("click", () => {
            try { openHourModal(JSON.parse(card.getAttribute("data-hour"))); }
            catch (e) { console.error("Modal parse error", e); }
        });
    });
}

function updateMainCard(data) {
    elements.weatherIcon.innerHTML   = getWeatherIcon(data.weatherCode);
    elements.cityName.innerHTML      = `${data.name}, ${data.country}`;
    elements.cityTemp.innerHTML      = `${Math.round(data.temperature)}°C`;
    elements.cityCondition.innerHTML = getWeatherDescription(data.weatherCode);
    elements.todayDate.innerHTML     = getCurrentDate();
}

function updateAtmosphere(data) {
    const items = [
        `💧 <strong>${data.humidity}%</strong> Humedad`,
        `🌡️ <strong>${Math.round(data.apparentTemperature)}°C</strong> Sensación térmica`,
        `💧 <strong>${data.dewPoint?.toFixed(1) ?? 0}°C</strong> Punto de rocío`,
        `🌧️ <strong>${data.precipitation ?? 0} mm</strong> Precipitación`,
        data.rain    > 0 ? `🌧️ <strong>${data.rain} mm</strong> Lluvia`    : null,
        data.showers > 0 ? `🌦️ <strong>${data.showers} mm</strong> Chubascos` : null,
        data.snowfall > 0 ? `❄️ <strong>${data.snowfall} cm</strong> Nieve`   : null,
        `📊 <strong>${Math.round(data.pressure)} hPa</strong> Presión atmosférica`,
        `📉 <strong>${Math.round(data.surfacePressure)} hPa</strong> Presión superficial`,
        `☁️ <strong>${data.cloudCover}%</strong> Nubosidad`,
        `👁️ <strong>${(data.visibility/1000).toFixed(1)} km</strong> Visibilidad`,
        `☀️ <strong>${data.uvIndex ?? 0}</strong> Índice UV`,
        data.cape ? `⚡ <strong>${Math.round(data.cape)} J/kg</strong> CAPE` : null
    ].filter(Boolean);
    elements.atmosphere.innerHTML = items.map(i => `<p>${i}</p>`).join("");
}

function updateWind(data) {
    // ← Sparklines removed, clean stats only
    elements.wind.innerHTML = `
        <p>💨 <strong>${Math.round(data.windSpeed)} km/h</strong> Velocidad ${getWindDirection(data.windDirection)}</p>
        <p>💥 <strong>${Math.round(data.windGusts)} km/h</strong> Rachas de viento</p>
        <p>🧭 <strong>${Math.round(data.windDirection)}°</strong> Dirección exacta</p>
        <p>🌬️ <strong>${getBeaufort(data.windSpeed)} Beaufort</strong> Escala Beaufort</p>
    `;
}

function updateForecast(data) {
    elements.forecast.innerHTML = data.dailyForecast.time.slice(0,7).map((date, i) => {
        const d = new Date(date);
        return `
        <div class="forecastDay">
            <span class="forecastDayName">${i===0 ? "Hoy" : DAYS[d.getDay()]}</span>
            <span class="forecastIcon">${getWeatherIcon(data.dailyForecast.weather_code[i])}</span>
            <div class="forecastTemps">
                <span class="forecastMax">${Math.round(data.dailyForecast.temperature_2m_max[i])}°</span>
                <span class="forecastMin">${Math.round(data.dailyForecast.temperature_2m_min[i])}°</span>
            </div>
            <span class="forecastRain">💧 ${data.dailyForecast.precipitation_probability_max?.[i] ?? 0}%</span>
        </div>`;
    }).join("");
}

function updateAstro(data) {
    const rise = new Date(data.dailyForecast.sunrise[0]).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"});
    const set  = new Date(data.dailyForecast.sunset[0]).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"});
    elements.astro.innerHTML = `
        <p>🌅 <strong>${rise}</strong> Amanecer</p>
        <p>🌇 <strong>${set}</strong> Atardecer</p>
        <p>☀️ <strong>${(data.dailyForecast.daylight_duration[0]/3600).toFixed(1)} h</strong> Luz del día</p>
        <p>🌞 <strong>${(data.dailyForecast.sunshine_duration[0]/3600).toFixed(1)} h</strong> Horas de sol</p>
        <p>☀️ <strong>${data.dailyForecast.uv_index_max?.[0] ?? 0}</strong> UV máximo</p>
    `;
}

function updateMarine(data) {
    if (!data.hasMarineData || !data.marine) {
        elements.marine.innerHTML = `<p class="notAvailable">Datos marítimos no disponibles para esta ubicación</p>`;
        return;
    }
    // ← Sparklines removed, clean stats only
    const m = data.marine;
    elements.marine.innerHTML = `
        <p>🌊 <strong>${m.wave_height?.toFixed(2) ?? 0} m</strong> Altura de olas</p>
        <p>🧭 <strong>${Math.round(m.wave_direction ?? 0)}°</strong> Dirección olas</p>
        <p>⏱️ <strong>${m.wave_period?.toFixed(1) ?? 0} s</strong> Período de olas</p>
        <p>💨 <strong>${m.wind_wave_height?.toFixed(2) ?? 0} m</strong> Olas de viento</p>
        <p>🌀 <strong>${m.swell_wave_height?.toFixed(2) ?? 0} m</strong> Oleaje</p>
        <p>🌊 <strong>${m.ocean_current_velocity?.toFixed(2) ?? 0} m/s</strong> Corriente oceánica</p>
    `;
}

function updateDots() {
    elements.favDots.innerHTML = favoritesManager.getAllCities()
        .map((_, i) => `<div class="dot ${i === favoritesManager.currentIndex ? "active":""}"></div>`)
        .join("");
}

function changeBackgroundImage(code = null) {
    if (!elements.mainCard) return;
    let cat = "default";
    if (code !== null) {
        if ([0,1].includes(code)) cat = "sunny";
        else if ([2,3].includes(code)) cat = "cloudy";
        else if ((code>=51&&code<=67)||(code>=80&&code<=82)) cat = "rainy";
        else if ((code>=71&&code<=77)||(code>=85&&code<=86)) cat = "snowy";
        else if (code>=95&&code<=99) cat = "stormy";
        else if ([45,48].includes(code)) cat = "foggy";
    }
    const imgs = BACKGROUND_IMAGES[cat];
    elements.mainCard.style.backgroundImage = `url('media/images/${imgs[Math.floor(Math.random()*imgs.length)]}.jpg')`;
}

// ═══════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════

function getWindDirection(deg) {
    const d = ["N","NE","E","SE","S","SO","O","NO"];
    return deg != null ? `(${d[Math.round(deg/45)%8]})` : "";
}

function getBeaufort(kmh) {
    const scale = [1,6,12,20,29,39,50,62,75,89,103,118];
    return scale.findIndex(v => kmh < v) + (kmh < 1 ? 0 : 0) || 12;
}

function getWeatherIcon(code)        { return WEATHER_ICONS[code]        || "🌡️"; }
function getWeatherDescription(code) { return WEATHER_DESCRIPTIONS[code] || "Desconocido"; }
function getCurrentDate() {
    const d = new Date();
    return `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}
function scrollToTop() { window.scrollTo({ top:0, behavior:"smooth" }); }

initializeEventListeners();