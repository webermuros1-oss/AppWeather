if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./js/serviceWorker.js")
            .then(reg => console.log("SW registrado:", reg.scope))
            .catch(err => console.error("SW error:", err));
    });
}

const elements = {
    cityInput:    document.querySelector("#getCity"),
    cityName:     document.querySelector(".cityName"),
    cityTemp:     document.querySelector(".weatherDeg"),
    cityCondition:document.querySelector(".weatherCondition"),
    todayDate:    document.querySelector(".date"),
    weatherIcon:  document.querySelector(".weatherIconDisplay"),
    header:       document.querySelector("header"),
    mainCard:     document.querySelector(".mainWeatherCard"),
    atmosphere:   document.querySelector(".atmosphereInfo"),
    wind:         document.querySelector(".windInfo"),
    marine:       document.querySelector(".marineInfo"),
    forecast:     document.querySelector(".forecastInfo"),
    astro:        document.querySelector(".astroInfo"),
    hourly:       document.querySelector(".hourlyInfo"),
    prevArrow:    document.querySelector(".prevArrow"),
    nextArrow:    document.querySelector(".nextArrow"),
    favDots:      document.getElementById("favDots")
};

const API_URLS = {
    geocoding: "https://geocoding-api.open-meteo.com/v1/search",
    weather:   "https://api.open-meteo.com/v1/forecast",
    marine:    "https://marine-api.open-meteo.com/v1/marine"
};

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS   = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];



const METEOCONS_CDN = "https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg";


const WMO_MAP = {
    0:  { day:"clear-day",          night:"clear-night",         label:"Despejado" },
    1:  { day:"partly-cloudy-day",  night:"partly-cloudy-night", label:"Mayormente despejado" },
    2:  { day:"partly-cloudy-day",  night:"partly-cloudy-night", label:"Parcialmente nublado" },
    3:  { day:"overcast",           night:"overcast-night",      label:"Nublado" },
    45: { day:"fog",                night:"fog-night",           label:"Niebla" },
    48: { day:"fog",                night:"fog-night",           label:"Niebla con escarcha" },
    51: { day:"drizzle",            night:"drizzle",             label:"Llovizna ligera" },
    53: { day:"drizzle",            night:"drizzle",             label:"Llovizna moderada" },
    55: { day:"drizzle",            night:"drizzle",             label:"Llovizna intensa" },
    61: { day:"rain",               night:"rain",                label:"Lluvia ligera" },
    63: { day:"rain",               night:"rain",                label:"Lluvia moderada" },
    65: { day:"extreme-rain",       night:"extreme-rain",        label:"Lluvia intensa" },
    71: { day:"snow",               night:"snow",                label:"Nieve ligera" },
    73: { day:"snow",               night:"snow",                label:"Nieve moderada" },
    75: { day:"extreme-snow",       night:"extreme-snow",        label:"Nieve intensa" },
    77: { day:"hail",               night:"hail",                label:"Granizo" },
    80: { day:"partly-cloudy-day-rain",  night:"partly-cloudy-night-rain", label:"Chubascos ligeros" },
    81: { day:"rain",               night:"rain",                label:"Chubascos moderados" },
    82: { day:"extreme-rain",       night:"extreme-rain",        label:"Chubascos intensos" },
    85: { day:"snow",               night:"snow",                label:"Nevadas ligeras" },
    86: { day:"extreme-snow",       night:"extreme-snow",        label:"Nevadas intensas" },
    95: { day:"thunderstorms",      night:"thunderstorms-night", label:"Tormenta" },
    96: { day:"thunderstorms-rain", night:"thunderstorms-night-rain", label:"Tormenta con granizo" },
    99: { day:"thunderstorms-rain", night:"thunderstorms-night-rain", label:"Tormenta severa" },
};


function getMeteoconImg(code, isDay = 1, size = "64px") {
    const entry = WMO_MAP[code] ?? { day:"not-available", night:"not-available", label:"Desconocido" };
    const name  = isDay ? entry.day : entry.night;
    return `<img src="${METEOCONS_CDN}/${name}.svg" width="${size}" height="${size}" alt="${entry.label}" style="display:inline-block;vertical-align:middle" loading="lazy">`;
}


function getMeteoconSmall(code, isDay = 1) { return getMeteoconImg(code, isDay, "48px"); }

function getWeatherLabel(code) {
    return (WMO_MAP[code] ?? { label:"Desconocido" }).label;
}



const BACKGROUND_IMAGES = {
    day: {
        sunny:   ["sunny1","sunny2","beach"],
        cloudy:  ["cloudy1","cloudy2"],
        rainy:   ["rainy1","rainy2","rainy3"],
        snowy:   ["snowy1","snowy2"],
        stormy:  ["stormy1","stormy2"],
        foggy:   ["foggy1","foggy2"],
        default: ["bg1","bg2","bg3","bg4","bg5"]
    },
    night: {
        sunny:   ["nightClear1","night1"],
        cloudy:  ["nightCloudy1","night2"],
        rainy:   ["nightRainy1","night1"],
        snowy:   ["night1"],
        stormy:  ["nightStormy1","night2"],
        foggy:   ["night2"],
        default: ["night1","night2","night3"]
    }
};



function injectModalStyles() {
    if (document.getElementById("sharedModalStyles")) return;
    const s = document.createElement("style");
    s.id = "sharedModalStyles";
    s.textContent = `
    .hmBackdrop {
        position:fixed;inset:0;
        background:rgba(0,0,0,.65);
        backdrop-filter:blur(6px);
        z-index:9000;
        animation:hmFadeIn .25s ease;
    }
    @keyframes hmFadeIn{from{opacity:0}to{opacity:1}}

    .hmPanel {
        position:fixed;bottom:0;left:0;right:0;
        background:linear-gradient(160deg,#0a1628 0%,#1a2f4a 60%,#2d4a5c 100%);
        border-top:2px solid rgba(0,217,255,.4);
        border-radius:24px 24px 0 0;
        z-index:9001;
        max-height:92vh;overflow-y:auto;
        padding-bottom:env(safe-area-inset-bottom,16px);
        box-shadow:0 -8px 40px rgba(0,0,0,.6),0 -2px 10px rgba(0,217,255,.15);
        animation:hmSlideUp .32s cubic-bezier(.4,0,.2,1);
    }
    @keyframes hmSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    .hmPanel.hmClosing{animation:hmSlideDown .28s cubic-bezier(.4,0,.2,1) forwards}
    @keyframes hmSlideDown{from{transform:translateY(0)}to{transform:translateY(100%)}}

    .hmDrag{
        width:40px;height:4px;background:rgba(255,255,255,.2);
        border-radius:2px;margin:14px auto 0;display:block;
    }

    .hmHeader{
        display:flex;align-items:center;justify-content:space-between;
        padding:14px 20px;
        border-bottom:1px solid rgba(0,217,255,.15);
        position:sticky;top:0;
        background:linear-gradient(160deg,#0a1628,#1a2f4a);
        z-index:1;
    }
    .hmTitleGroup{display:flex;align-items:center;gap:12px}
    .hmTitleGroup h3{font-size:1.2rem;font-weight:700;color:#fff;margin-bottom:2px}
    .hmTitleGroup p{font-size:.82rem;color:rgba(255,255,255,.5)}
    .hmCloseBtn{
        background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);
        border-radius:50%;color:#fff;width:34px;height:34px;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;font-size:1rem;transition:background .2s;flex-shrink:0;
    }
    .hmCloseBtn:hover{background:rgba(255,71,87,.35)}

    /* Big temp row */
    .hmTempRow{
        display:flex;align-items:center;justify-content:center;gap:24px;
        padding:18px 20px 14px;
        border-bottom:1px solid rgba(0,217,255,.1);
        flex-wrap:wrap;
    }
    .hmBigTemp{
        font-size:4rem;font-weight:700;color:#fff;line-height:1;
        text-shadow:0 0 24px rgba(0,217,255,.25);
    }
    .hmSubTemps{display:flex;flex-direction:column;gap:6px}
    .hmSubTemp{display:flex;flex-direction:column;gap:2px}
    .hmSubTemp span:first-child{font-size:.7rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px}
    .hmSubTemp span:last-child{font-size:1.2rem;font-weight:600;color:#00ff88}
    .hmSubTemp.cool span:last-child{color:#00d9ff}

    /* Progress bar */
    .hmBar{
        margin:14px 20px;
        background:rgba(0,217,255,.06);
        border:1px solid rgba(0,217,255,.15);
        border-radius:14px;padding:12px 14px;
    }
    .hmBarTop{
        display:flex;justify-content:space-between;
        font-size:.8rem;color:rgba(255,255,255,.55);margin-bottom:8px;
    }
    .hmBarTop strong{color:#00d9ff}
    .hmTrack{height:8px;background:rgba(255,255,255,.1);border-radius:4px;overflow:hidden}
    .hmFill{height:100%;border-radius:4px;background:linear-gradient(90deg,#00d9ff,#00ff88);width:0%;transition:width .7s cubic-bezier(.4,0,.2,1)}

    /* Stats grid */
    .hmGrid{
        display:grid;grid-template-columns:repeat(2,1fr);
        gap:10px;padding:14px 20px 22px;
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
    .hmStatValue{font-size:1.05rem;font-weight:700;color:#00ff88;text-shadow:0 0 8px rgba(0,255,136,.3)}
    .hmStatSub{font-size:.7rem;color:rgba(255,255,255,.32)}

    /* Sun timeline (day modal) */
    .hmSunRow{
        display:flex;align-items:center;justify-content:space-between;
        margin:0 20px 16px;
        background:rgba(255,180,0,.08);
        border:1px solid rgba(255,180,0,.2);
        border-radius:14px;padding:14px;
        gap:10px;
    }
    .hmSunItem{display:flex;flex-direction:column;align-items:center;gap:4px}
    .hmSunItem span:first-child{font-size:1.4rem}
    .hmSunItem span:last-child{font-size:.85rem;font-weight:600;color:#ffcc44}
    .hmSunItem small{font-size:.7rem;color:rgba(255,255,255,.4)}
    .hmSunDivider{flex:1;height:2px;background:linear-gradient(90deg,#ffcc44,rgba(255,204,68,0));border-radius:1px}

    /* cursor on forecast cards */
    .forecastDay{cursor:pointer}
    .forecastTapHint{
        font-size:.62rem;color:rgba(0,217,255,.45);
        flex-shrink:0;
    }
    .forecastDay:hover .forecastTapHint{color:rgba(0,255,136,.65)}

    /* hour tap hint */
    .hourItem{cursor:pointer}
    .hourTapHint{
        font-size:.62rem;color:rgba(0,217,255,.45);
        border-top:1px solid rgba(0,217,255,.12);
        padding-top:5px;width:100%;text-align:center;
    }
    .hourItem:hover .hourTapHint{color:rgba(0,255,136,.65)}

    /* desktop */
    @media(min-width:600px){
        .hmPanel{
            bottom:auto;top:50%;left:50%;
            transform:translate(-50%,-50%);
            border-radius:24px;
            border:1px solid rgba(0,217,255,.3);
            max-width:440px;width:calc(100% - 40px);
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
        .hmGrid{grid-template-columns:repeat(2,1fr)}
    }
    `;
    document.head.appendChild(s);
}


function _buildModal(innerHTML) {
    injectModalStyles();
    _closeModal(true);

    const backdrop = document.createElement("div");
    backdrop.className = "hmBackdrop"; backdrop.id = "hmBackdrop";

    const panel = document.createElement("div");
    panel.className = "hmPanel"; panel.id = "hmPanel";
    panel.innerHTML = innerHTML;

    document.body.appendChild(backdrop);
    document.body.appendChild(panel);
    document.body.style.overflow = "hidden";

    const close = () => _closeModal();
    panel.querySelector(".hmCloseBtn")?.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", _escH);

    return panel;
}

function _escH(e) { if (e.key === "Escape") _closeModal(); }

function _closeModal(instant = false) {
    const panel    = document.getElementById("hmPanel");
    const backdrop = document.getElementById("hmBackdrop");
    document.removeEventListener("keydown", _escH);
    if (!panel) return;
    if (instant) { panel.remove(); backdrop?.remove(); document.body.style.overflow = ""; return; }
    panel.classList.add("hmClosing");
    panel.addEventListener("animationend", () => {
        panel.remove(); backdrop?.remove(); document.body.style.overflow = "";
    }, { once: true });
}



function openHourModal(d) {
    const pct  = d.precip > 0 ? Math.min(d.precip * 25, 100) : (d.rainProb ?? 0);
    const vis  = d.visibility != null ? (d.visibility / 1000).toFixed(1) : "—";
    const feels= d.feelsLike  != null ? Math.round(d.feelsLike) : "—";

    const panel = _buildModal(`
        <span class="hmDrag"></span>
        <div class="hmHeader">
            <div class="hmTitleGroup">
                ${getMeteoconImg(d.code ?? 0, d.isDay ?? 1, "48px")}
                <div><h3>${d.time}</h3><p>${d.description}</p></div>
            </div>
            <button class="hmCloseBtn">✕</button>
        </div>

        <div class="hmTempRow">
            <span class="hmBigTemp">${Math.round(d.temp)}°C</span>
            <div class="hmSubTemps">
                <div class="hmSubTemp">
                    <span>Sensación</span><span>${feels}°C</span>
                </div>
                <div class="hmSubTemp cool">
                    <span>Humedad</span><span>${d.humidity ?? "—"}%</span>
                </div>
            </div>
        </div>

        <div class="hmBar">
            <div class="hmBarTop">
                <span>${d.precip > 0
                    ? `💧 Precipitación: <strong>${d.precip} mm</strong>`
                    : `💧 Prob. lluvia: <strong>${d.rainProb ?? 0}%</strong>`}
                </span>
            </div>
            <div class="hmTrack"><div class="hmFill" id="hmFill"></div></div>
        </div>

        <div class="hmGrid">
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
            <div class="hmStat">
                <span class="hmStatIcon">🌬️</span>
                <span class="hmStatLabel">Escala</span>
                <span class="hmStatValue">${getBeaufort(d.windSpeed ?? 0)} Beaufort</span>
            </div>
        </div>
    `);

    requestAnimationFrame(() => setTimeout(() => {
        const f = panel.querySelector("#hmFill");
        if (f) f.style.width = pct + "%";
    }, 60));
}



function openDayModal(d) {
    const rainPct  = d.rainProb ?? 0;
    const precip   = d.precipSum ?? 0;
    const snow     = d.snowSum  ?? 0;

    const panel = _buildModal(`
        <span class="hmDrag"></span>
        <div class="hmHeader">
            <div class="hmTitleGroup">
                ${getMeteoconImg(d.code, 1, "48px")}
                <div><h3>${d.dayName}</h3><p>${d.label} · ${d.dateStr}</p></div>
            </div>
            <button class="hmCloseBtn">✕</button>
        </div>

        <!-- Max / Min / Feels -->
        <div class="hmTempRow">
            <div class="hmSubTemps" style="align-items:center;gap:10px;flex-direction:row">
                <div class="hmSubTemp" style="align-items:center">
                    <span style="font-size:.7rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px">Máxima</span>
                    <span style="font-size:2.8rem;font-weight:700;color:#ffb347;line-height:1">${Math.round(d.maxTemp)}°</span>
                </div>
                <span style="font-size:2rem;color:rgba(255,255,255,.2);font-weight:300">/</span>
                <div class="hmSubTemp" style="align-items:center">
                    <span style="font-size:.7rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px">Mínima</span>
                    <span style="font-size:2.8rem;font-weight:700;color:#00d9ff;line-height:1">${Math.round(d.minTemp)}°</span>
                </div>
            </div>
        </div>

        <!-- Sunrise / Sunset -->
        <div class="hmSunRow">
            <div class="hmSunItem">
                <span>🌅</span>
                <span>${d.sunrise}</span>
                <small>Amanecer</small>
            </div>
            <div class="hmSunDivider"></div>
            <div class="hmSunItem">
                <span>☀️</span>
                <span>${d.sunshineH} h</span>
                <small>Sol real</small>
            </div>
            <div class="hmSunDivider" style="background:linear-gradient(90deg,rgba(255,204,68,0),#ffcc44)"></div>
            <div class="hmSunItem">
                <span>🌇</span>
                <span>${d.sunset}</span>
                <small>Atardecer</small>
            </div>
        </div>

        <!-- Rain bar -->
        <div class="hmBar">
            <div class="hmBarTop">
                <span>💧 Probabilidad de lluvia: <strong>${rainPct}%</strong></span>
                ${precip > 0 ? `<span style="color:#00ff88">${precip} mm total</span>` : ""}
            </div>
            <div class="hmTrack"><div class="hmFill" id="hmFill"></div></div>
        </div>

        <!-- Stats grid -->
        <div class="hmGrid">
            <div class="hmStat">
                <span class="hmStatIcon">💨</span>
                <span class="hmStatLabel">Viento máx.</span>
                <span class="hmStatValue">${Math.round(d.windMax ?? 0)} km/h</span>
                <span class="hmStatSub">${getWindDirection(d.windDir)}</span>
            </div>
            <div class="hmStat">
                <span class="hmStatIcon">💥</span>
                <span class="hmStatLabel">Rachas máx.</span>
                <span class="hmStatValue">${Math.round(d.gustMax ?? 0)} km/h</span>
            </div>
            <div class="hmStat">
                <span class="hmStatIcon">☀️</span>
                <span class="hmStatLabel">Índice UV máx.</span>
                <span class="hmStatValue">${d.uvMax ?? "—"}</span>
                <span class="hmStatSub">${getUVLabel(d.uvMax)}</span>
            </div>
            <div class="hmStat">
                <span class="hmStatIcon">🌤️</span>
                <span class="hmStatLabel">Luz del día</span>
                <span class="hmStatValue">${d.daylightH} h</span>
            </div>
            <div class="hmStat">
                <span class="hmStatIcon">🌧️</span>
                <span class="hmStatLabel">Precipitación</span>
                <span class="hmStatValue">${precip > 0 ? precip + " mm" : "Sin lluvia"}</span>
            </div>
            ${snow > 0 ? `
            <div class="hmStat">
                <span class="hmStatIcon">❄️</span>
                <span class="hmStatLabel">Nieve</span>
                <span class="hmStatValue">${snow} cm</span>
            </div>` : `
            <div class="hmStat">
                <span class="hmStatIcon">🌬️</span>
                <span class="hmStatLabel">Viento dir.</span>
                <span class="hmStatValue">${getWindDirection(d.windDir)}</span>
                <span class="hmStatSub">${Math.round(d.windDir ?? 0)}°</span>
            </div>`}
        </div>
    `);

    requestAnimationFrame(() => setTimeout(() => {
        const f = panel.querySelector("#hmFill");
        if (f) f.style.width = rainPct + "%";
    }, 60));
}

function getUVLabel(uv) {
    if (!uv) return "—";
    if (uv <= 2)  return "Bajo";
    if (uv <= 5)  return "Moderado";
    if (uv <= 7)  return "Alto";
    if (uv <= 10) return "Muy alto";
    return "Extremo";
}



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
    getCurrentCity()  { return this.favorites[this.currentIndex] ?? null; }
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
    getCount()    { return this.favorites.length; }
}

const favoritesManager = new FavoritesManager();



function initializeEventListeners() {
    window.addEventListener("load", async () => {
        changeBackgroundImage();
        try {
            const gps = await getCurrentLocation();
            await fetchDataFromCoordinates(gps.latitude, gps.longitude, gps.name, gps.country, gps.street);
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


    document.addEventListener("citySelected", async e => {
        const { name, country, latitude, longitude, street } = e.detail;
        favoritesManager.addCity({ name, country, latitude, longitude });
        try {
            const [w, m] = await Promise.all([fetchWeatherData(latitude, longitude), fetchMarineData(latitude, longitude)]);
            updateUI({ name, country, street, ...w, ...m });
        } catch (err) { console.error(err); alert("Error cargando datos de la ciudad seleccionada"); }
    });
    elements.prevArrow.addEventListener("click", async () => { const c = favoritesManager.goToPrevious(); if (c) await loadCityByName(c); });
    elements.nextArrow.addEventListener("click", async () => { const c = favoritesManager.goToNext();     if (c) await loadCityByName(c); });

    let txStart = 0;
    elements.mainCard.addEventListener("touchstart", e => { txStart = e.changedTouches[0].screenX; });
    elements.mainCard.addEventListener("touchend", e => {
        const d = txStart - e.changedTouches[0].screenX;
        if (d > 50) elements.nextArrow.click();
        else if (d < -50) elements.prevArrow.click();
    });

    document.querySelectorAll(".card h4").forEach(h => {
        h.addEventListener("click", () => h.closest(".card").classList.toggle("collapsed"));
    });
}



async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject("no geo"); return; }
        navigator.geolocation.getCurrentPosition(async pos => {
            try {
                const { latitude, longitude } = pos.coords;
                // Nominatim para nivel de calle
                const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=16&accept-language=es`);
                const d = await r.json();
                const a = d.address ?? {};
                const name = a.neighbourhood || a.suburb || a.village || a.town || a.city || a.county || d.display_name.split(",")[0];
                const street = a.road || a.pedestrian || a.path || a.footway || "";
                const country = a.country_code?.toUpperCase() ?? "";
                resolve({ name, street, country, latitude, longitude });
            } catch {
                // Fallback BigDataCloud
                try {
                    const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=es`);
                    const d = await r.json();
                    resolve({ name: d.city || d.locality || "Mi ubicación", street: "", country: d.countryCode || "", latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                } catch(e) { reject(e); }
            }
        }, e => reject(e), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    });
}



async function fetchDataFromCoordinates(lat, lon, name, country, street = "") {
    const [w, m] = await Promise.all([fetchWeatherData(lat, lon), fetchMarineData(lat, lon)]);
    updateUI({ name, country, street, ...w, ...m });
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
        hourly:  "temperature_2m,precipitation_probability,weather_code,relative_humidity_2m,precipitation,apparent_temperature,wind_speed_10m,wind_direction_10m,visibility,cloud_cover,dew_point_2m,is_day",
        daily:   "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,rain_sum,snowfall_sum,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant",
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
        weatherCode: c.weather_code, isDay: c.is_day,
        precipitation: c.precipitation, rain: c.rain, showers: c.showers, snowfall: c.snowfall,
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

async function loadCityByIndex(i)  { const c = favoritesManager.goToIndex(i);   if (c) await loadCityByCoordinates(c); }
async function loadCityByName(c)   { await loadCityByCoordinates(c); }
async function loadCityByCoordinates(c) {
    if (!c?.latitude || !c?.longitude) return;
    try { await fetchDataFromCoordinates(c.latitude, c.longitude, c.name, c.country, c.street ?? ""); favoritesManager.saveLastCity(c.name); }
    catch { alert(`No se pudo cargar ${c.name}.`); }
}



function updateUI(data) {
    updateMainCard(data);
    updateAtmosphere(data);
    updateWind(data);
    updateForecast(data);
    updateAstro(data);
    updateMarine(data);
    updateHourly(data);
    updateDots();
    changeBackgroundImage(data.weatherCode, data.isDay);
    scrollToTop();
}

function updateMainCard(data) {
    elements.weatherIcon.innerHTML = getMeteoconImg(data.weatherCode, data.isDay, "90px");

    if (data.street) {
        elements.cityName.innerHTML  = data.street;
        elements.todayDate.innerHTML = `${data.name} · ${getCurrentDate()}`;
    } else {
        elements.cityName.innerHTML  = `${data.name}, ${data.country}`;
        elements.todayDate.innerHTML = getCurrentDate();
    }

    elements.cityTemp.innerHTML      = `${Math.round(data.temperature)}°C`;
    elements.cityCondition.innerHTML = getWeatherLabel(data.weatherCode);
}


function updateHourly(data) {
    if (!data.hourlyForecast) {
        elements.hourly.innerHTML = `<p class="notAvailable">Pronóstico horario no disponible</p>`;
        return;
    }
    const now   = new Date();
    const start = data.hourlyForecast.time.findIndex(t => new Date(t) > now);
    const idx   = start !== -1 ? start : 0;
    const h     = data.hourlyForecast;

    elements.hourly.innerHTML = h.time.slice(idx, idx + 24).map((time, i) => {
        const hi     = idx + i;
        const t      = new Date(time).toLocaleTimeString("es-ES", { hour:"2-digit", minute:"2-digit", hour12:false });
        const temp   = Math.round(h.temperature_2m[hi]);
        const code   = h.weather_code[hi];
        const isDay  = h.is_day?.[hi] ?? 1;
        const rain   = h.precipitation_probability[hi] ?? 0;
        const prec   = h.precipitation[hi] ?? 0;

        const detail = {
            time: t, code, isDay, description: getWeatherLabel(code),
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
            <span class="hourIcon">${getMeteoconSmall(code, isDay)}</span>
            <span class="hourTemp">${temp}°</span>
            ${prec > 0 ? `<span class="hourRain">💧 ${prec}mm</span>` : `<span class="hourRain">💧 ${rain}%</span>`}
            <span class="hourTapHint">+ info</span>
        </div>`;
    }).join("");

    elements.hourly.querySelectorAll(".hourItem").forEach(card => {
        card.addEventListener("click", () => {
            try { openHourModal(JSON.parse(card.getAttribute("data-hour"))); }
            catch (e) { console.error(e); }
        });
    });
}


function updateForecast(data) {
    const df = data.dailyForecast;

    elements.forecast.innerHTML = df.time.slice(0, 7).map((date, i) => {
        const d       = new Date(date);
        const dayName = i === 0 ? "Hoy" : DAYS[d.getDay()];
        const dateStr = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
        const code    = df.weather_code[i];
        const maxT    = Math.round(df.temperature_2m_max[i]);
        const minT    = Math.round(df.temperature_2m_min[i]);
        const rain    = df.precipitation_probability_max?.[i] ?? 0;

        
        const detail = {
            dayName, dateStr, code,
            label:      getWeatherLabel(code),
            maxTemp:    df.temperature_2m_max[i],
            minTemp:    df.temperature_2m_min[i],
            rainProb:   rain,
            precipSum:  df.precipitation_sum?.[i]  ?? 0,
            snowSum:    df.snowfall_sum?.[i]        ?? 0,
            sunrise:    new Date(df.sunrise[i]).toLocaleTimeString("es-ES", { hour:"2-digit", minute:"2-digit" }),
            sunset:     new Date(df.sunset[i]).toLocaleTimeString("es-ES",  { hour:"2-digit", minute:"2-digit" }),
            daylightH:  (df.daylight_duration[i]  / 3600).toFixed(1),
            sunshineH:  (df.sunshine_duration[i]  / 3600).toFixed(1),
            uvMax:      df.uv_index_max?.[i]       ?? 0,
            windMax:    df.wind_speed_10m_max?.[i] ?? 0,
            gustMax:    df.wind_gusts_10m_max?.[i] ?? 0,
            windDir:    df.wind_direction_10m_dominant?.[i] ?? 0,
        };

        return `
        <div class="forecastDay" data-day='${JSON.stringify(detail).replace(/'/g,"&#39;")}'>
            <span class="forecastDayName">${dayName}</span>
            <span class="forecastIcon">${getMeteoconSmall(code, 1)}</span>
            <div class="forecastTemps">
                <span class="forecastMax">${maxT}°</span>
                <span class="forecastMin">${minT}°</span>
            </div>
            <span class="forecastRain">💧 ${rain}%</span>
            <span class="forecastTapHint">+ info</span>
        </div>`;
    }).join("");

    elements.forecast.querySelectorAll(".forecastDay").forEach(card => {
        card.addEventListener("click", () => {
            try { openDayModal(JSON.parse(card.getAttribute("data-day"))); }
            catch (e) { console.error(e); }
        });
    });
}

function updateAtmosphere(data) {
    const items = [
        `💧 <strong>${data.humidity}%</strong> Humedad`,
        `🌡️ <strong>${Math.round(data.apparentTemperature)}°C</strong> Sensación térmica`,
        `💧 <strong>${data.dewPoint?.toFixed(1) ?? 0}°C</strong> Punto de rocío`,
        `🌧️ <strong>${data.precipitation ?? 0} mm</strong> Precipitación`,
        data.rain    > 0 ? `🌧️ <strong>${data.rain} mm</strong> Lluvia`      : null,
        data.showers > 0 ? `🌦️ <strong>${data.showers} mm</strong> Chubascos`  : null,
        data.snowfall > 0 ? `❄️ <strong>${data.snowfall} cm</strong> Nieve`    : null,
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
    elements.wind.innerHTML = `
        <p>💨 <strong>${Math.round(data.windSpeed)} km/h</strong> Velocidad ${getWindDirection(data.windDirection)}</p>
        <p>💥 <strong>${Math.round(data.windGusts)} km/h</strong> Rachas de viento</p>
        <p>🧭 <strong>${Math.round(data.windDirection)}°</strong> Dirección exacta</p>
        <p>🌬️ <strong>${getBeaufort(data.windSpeed)} Beaufort</strong> Escala Beaufort</p>
    `;
}

function updateAstro(data) {
    const rise = new Date(data.dailyForecast.sunrise[0]).toLocaleTimeString("es-ES",{ hour:"2-digit", minute:"2-digit" });
    const set  = new Date(data.dailyForecast.sunset[0]).toLocaleTimeString("es-ES", { hour:"2-digit", minute:"2-digit" });
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


function changeBackgroundImage(code = null, isDay = 1) {
    if (!elements.mainCard) return;

    let cat = "default";
    if (code !== null) {
        if ([0,1].includes(code))                                           cat = "sunny";
        else if ([2,3].includes(code))                                      cat = "cloudy";
        else if ((code>=51&&code<=67)||(code>=80&&code<=82))                cat = "rainy";
        else if ((code>=71&&code<=77)||(code>=85&&code<=86))                cat = "snowy";
        else if (code>=95&&code<=99)                                        cat = "stormy";
        else if ([45,48].includes(code))                                    cat = "foggy";
    }

    const set  = isDay ? BACKGROUND_IMAGES.day : BACKGROUND_IMAGES.night;
    const imgs = set[cat] ?? set.default;
    elements.mainCard.style.backgroundImage =
        `url('media/images/${imgs[Math.floor(Math.random() * imgs.length)]}.jpg')`;
}



function getWindDirection(deg) {
    const d = ["N","NE","E","SE","S","SO","O","NO"];
    return deg != null ? `(${d[Math.round(deg/45)%8]})` : "";
}

function getBeaufort(kmh) {
    const scale = [1,6,12,20,29,39,50,62,75,89,103,118];
    const i = scale.findIndex(v => kmh < v);
    return i === -1 ? 12 : i;
}

function getCurrentDate() {
    const d = new Date();
    return `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

function scrollToTop() {
    const hash = window.location.hash?.slice(1);
    if (hash) {
        setTimeout(() => {
            const target = document.getElementById(hash) || document.querySelector('.' + hash);
            if (target) {
                const headerH = document.querySelector('.appHeader')?.offsetHeight || 0;
                const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
                window.scrollTo({ top, behavior: 'smooth' });
            }
            
            history.replaceState(null, '', window.location.pathname);
        }, 200);
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

initializeEventListeners();