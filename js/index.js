if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./js/serviceWorker.js");
    });
}

const elements = {
    cityInput:     document.querySelector("#getCity"),
    cityName:      document.querySelector(".cityName"),
    cityTemp:      document.querySelector(".weatherDeg"),
    cityCondition: document.querySelector(".weatherCondition"),
    todayDate:     document.querySelector(".date"),
    weatherIcon:   document.querySelector(".weatherIconDisplay"),
    header:        document.querySelector("header"),
    mainCard:      document.querySelector(".mainWeatherCard"),
    atmosphere:    document.querySelector(".atmosphereInfo"),
    wind:          document.querySelector(".windInfo"),
    marine:        document.querySelector(".marineInfo"),
    forecast:      document.querySelector(".forecastInfo"),
    astro:         document.querySelector(".astroInfo"),
    hourly:        document.querySelector(".hourlyInfo"),
    prevArrow:     document.querySelector(".prevArrow"),
    nextArrow:     document.querySelector(".nextArrow"),
    favDots:       document.getElementById("favDots")
};

const API_URLS = {
    geocoding: "https://geocoding-api.open-meteo.com/v1/search",
    weather:   "https://api.open-meteo.com/v1/forecast",
    marine:    "https://marine-api.open-meteo.com/v1/marine"
};

const METEOCONS_CDN = "https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg";

const WMO_MAP = {
    0:  { day:"clear-day",               night:"clear-night"              },
    1:  { day:"partly-cloudy-day",       night:"partly-cloudy-night"      },
    2:  { day:"partly-cloudy-day",       night:"partly-cloudy-night"      },
    3:  { day:"overcast",                night:"overcast-night"           },
    45: { day:"fog",                     night:"fog-night"                },
    48: { day:"fog",                     night:"fog-night"                },
    51: { day:"drizzle",                 night:"drizzle"                  },
    53: { day:"drizzle",                 night:"drizzle"                  },
    55: { day:"drizzle",                 night:"drizzle"                  },
    61: { day:"rain",                    night:"rain"                     },
    63: { day:"rain",                    night:"rain"                     },
    65: { day:"extreme-rain",            night:"extreme-rain"             },
    71: { day:"snow",                    night:"snow"                     },
    73: { day:"snow",                    night:"snow"                     },
    75: { day:"extreme-snow",            night:"extreme-snow"             },
    77: { day:"hail",                    night:"hail"                     },
    80: { day:"partly-cloudy-day-rain",  night:"partly-cloudy-night-rain" },
    81: { day:"rain",                    night:"rain"                     },
    82: { day:"extreme-rain",            night:"extreme-rain"             },
    85: { day:"snow",                    night:"snow"                     },
    86: { day:"extreme-snow",            night:"extreme-snow"             },
    95: { day:"thunderstorms",           night:"thunderstorms-night"      },
    96: { day:"thunderstorms-rain",      night:"thunderstorms-night-rain" },
    99: { day:"thunderstorms-rain",      night:"thunderstorms-night-rain" },
};

function getMeteoconImg(code, isDay = 1, size = "64px") {
    const entry = WMO_MAP[code] ?? { day:"not-available", night:"not-available" };
    const name  = isDay ? entry.day : entry.night;
    const label = I18N.wmo(code);
    return `<img src="${METEOCONS_CDN}/${name}.svg" width="${size}" height="${size}" alt="${label}" style="display:inline-block;vertical-align:middle" loading="lazy">`;
}
function getMeteoconSmall(code, isDay = 1) { return getMeteoconImg(code, isDay, "48px"); }
function getWeatherLabel(code) { return I18N.wmo(code); }

const BACKGROUND_IMAGES = {
    day:   { sunny:["sunny1","sunny2","beach"], cloudy:["cloudy1","cloudy2"], rainy:["rainy1","rainy2","rainy3"], snowy:["snowy1","snowy2"], stormy:["stormy1","stormy2"], foggy:["foggy1","foggy2"], default:["bg1","bg2","bg3","bg4","bg5"] },
    night: { sunny:["nightClear1","night1"], cloudy:["nightCloudy1","night2"], rainy:["nightRainy1","night1"], snowy:["night1"], stormy:["nightStormy1","night2"], foggy:["night2"], default:["night1","night2","night3"] }
};


function _buildModal(innerHTML) {
    injectModalStyles(); _closeModal(true);
    const backdrop = document.createElement("div"); backdrop.className = "hmBackdrop"; backdrop.id = "hmBackdrop";
    const panel    = document.createElement("div"); panel.className    = "hmPanel";    panel.id    = "hmPanel";
    panel.innerHTML = innerHTML;
    document.body.appendChild(backdrop); document.body.appendChild(panel);
    document.body.style.overflow = "hidden";
    panel.querySelector(".hmCloseBtn")?.addEventListener("click", () => _closeModal());
    backdrop.addEventListener("click", () => _closeModal());
    document.addEventListener("keydown", _escH);
    return panel;
}
function _escH(e) { if (e.key === "Escape") _closeModal(); }
function _closeModal(instant = false) {
    const panel = document.getElementById("hmPanel"), backdrop = document.getElementById("hmBackdrop");
    document.removeEventListener("keydown", _escH);
    if (!panel) return;
    if (instant) { panel.remove(); backdrop?.remove(); document.body.style.overflow = ""; return; }
    panel.classList.add("hmClosing");
    panel.addEventListener("animationend", () => { panel.remove(); backdrop?.remove(); document.body.style.overflow = ""; }, { once: true });
}

function openHourModal(d) {
    const pct   = d.precip > 0 ? Math.min(d.precip * 25, 100) : (d.rainProb ?? 0);
    const vis   = d.visibility != null ? (d.visibility / 1000).toFixed(1) : "—";
    const feels = d.feelsLike  != null ? Math.round(d.feelsLike) : "—";
    const t = k => I18N.t(k);
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
                <div class="hmSubTemp"><span>${t("modalFeelsLike")}</span><span>${feels}°C</span></div>
                <div class="hmSubTemp cool"><span>${t("modalHumidity")}</span><span>${d.humidity ?? "—"}%</span></div>
            </div>
        </div>
        <div class="hmBar">
            <div class="hmBarTop">
                <span>${d.precip > 0 ? `💧 ${t("modalPrecip")}: <strong>${d.precip} mm</strong>` : `💧 ${t("modalRainProb")}: <strong>${d.rainProb ?? 0}%</strong>`}</span>
            </div>
            <div class="hmTrack"><div class="hmFill" id="hmFill"></div></div>
        </div>
        <div class="hmGrid">
            <div class="hmStat"><span class="hmStatIcon">💨</span><span class="hmStatLabel">${t("modalWind")}</span><span class="hmStatValue">${Math.round(d.windSpeed ?? 0)} km/h</span><span class="hmStatSub">${getWindDirection(d.windDir)}</span></div>
            <div class="hmStat"><span class="hmStatIcon">👁️</span><span class="hmStatLabel">${t("modalVis")}</span><span class="hmStatValue">${vis} km</span></div>
            <div class="hmStat"><span class="hmStatIcon">☁️</span><span class="hmStatLabel">${t("modalClouds")}</span><span class="hmStatValue">${d.cloudCover ?? "—"}%</span></div>
            <div class="hmStat"><span class="hmStatIcon">🌡️</span><span class="hmStatLabel">${t("modalDew")}</span><span class="hmStatValue">${d.dewPoint != null ? d.dewPoint.toFixed(1) : "—"}°C</span></div>
            <div class="hmStat"><span class="hmStatIcon">🌧️</span><span class="hmStatLabel">${d.precip > 0 ? t("modalPrecip") : t("modalRainProb")}</span><span class="hmStatValue">${d.precip > 0 ? d.precip + " mm" : (d.rainProb ?? 0) + "%"}</span></div>
            <div class="hmStat"><span class="hmStatIcon">🌬️</span><span class="hmStatLabel">${t("modalBeaufort")}</span><span class="hmStatValue">${getBeaufort(d.windSpeed ?? 0)} Beaufort</span></div>
        </div>`);
    requestAnimationFrame(() => setTimeout(() => { const f = panel.querySelector("#hmFill"); if (f) f.style.width = pct + "%"; }, 60));
}

function openDayModal(d) {
    const rainPct = d.rainProb ?? 0, precip = d.precipSum ?? 0, snow = d.snowSum ?? 0;
    const t = k => I18N.t(k);
    const panel = _buildModal(`
        <span class="hmDrag"></span>
        <div class="hmHeader">
            <div class="hmTitleGroup">
                ${getMeteoconImg(d.code, 1, "48px")}
                <div><h3>${d.dayName}</h3><p>${d.label} · ${d.dateStr}</p></div>
            </div>
            <button class="hmCloseBtn">✕</button>
        </div>
        <div class="hmTempRow">
            <div class="hmSubTemps" style="align-items:center;gap:10px;flex-direction:row">
                <div class="hmSubTemp" style="align-items:center">
                    <span style="font-size:.7rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px">${t("modalMax")}</span>
                    <span style="font-size:2.8rem;font-weight:700;color:#ffb347;line-height:1">${Math.round(d.maxTemp)}°</span>
                </div>
                <span style="font-size:2rem;color:rgba(255,255,255,.2);font-weight:300">/</span>
                <div class="hmSubTemp" style="align-items:center">
                    <span style="font-size:.7rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.5px">${t("modalMin")}</span>
                    <span style="font-size:2.8rem;font-weight:700;color:#00d9ff;line-height:1">${Math.round(d.minTemp)}°</span>
                </div>
            </div>
        </div>
        <div class="hmSunRow">
            <div class="hmSunItem"><span>🌅</span><span>${d.sunrise}</span><small>${t("modalSunrise")}</small></div>
            <div class="hmSunDivider"></div>
            <div class="hmSunItem"><span>☀️</span><span>${d.sunshineH} h</span><small>${t("modalSunReal")}</small></div>
            <div class="hmSunDivider" style="background:linear-gradient(90deg,rgba(255,204,68,0),#ffcc44)"></div>
            <div class="hmSunItem"><span>🌇</span><span>${d.sunset}</span><small>${t("modalSunset")}</small></div>
        </div>
        <div class="hmBar">
            <div class="hmBarTop">
                <span>💧 ${t("modalRainProb")}: <strong>${rainPct}%</strong></span>
                ${precip > 0 ? `<span style="color:#00ff88">${precip} mm total</span>` : ""}
            </div>
            <div class="hmTrack"><div class="hmFill" id="hmFill"></div></div>
        </div>
        <div class="hmGrid">
            <div class="hmStat"><span class="hmStatIcon">💨</span><span class="hmStatLabel">${t("modalWindMax")}</span><span class="hmStatValue">${Math.round(d.windMax ?? 0)} km/h</span><span class="hmStatSub">${getWindDirection(d.windDir)}</span></div>
            <div class="hmStat"><span class="hmStatIcon">💥</span><span class="hmStatLabel">${t("modalGustMax")}</span><span class="hmStatValue">${Math.round(d.gustMax ?? 0)} km/h</span></div>
            <div class="hmStat"><span class="hmStatIcon">☀️</span><span class="hmStatLabel">${t("modalUV")}</span><span class="hmStatValue">${d.uvMax ?? "—"}</span><span class="hmStatSub">${getUVLabel(d.uvMax)}</span></div>
            <div class="hmStat"><span class="hmStatIcon">🌤️</span><span class="hmStatLabel">${t("modalDaylight")}</span><span class="hmStatValue">${d.daylightH} h</span></div>
            <div class="hmStat"><span class="hmStatIcon">🌧️</span><span class="hmStatLabel">${t("modalRainTotal")}</span><span class="hmStatValue">${precip > 0 ? precip + " mm" : t("modalNoRain")}</span></div>
            ${snow > 0
                ? `<div class="hmStat"><span class="hmStatIcon">❄️</span><span class="hmStatLabel">${t("modalSnow")}</span><span class="hmStatValue">${snow} cm</span></div>`
                : `<div class="hmStat"><span class="hmStatIcon">🌬️</span><span class="hmStatLabel">${t("modalWindDir")}</span><span class="hmStatValue">${getWindDirection(d.windDir)}</span><span class="hmStatSub">${Math.round(d.windDir ?? 0)}°</span></div>`}
        </div>`);
    requestAnimationFrame(() => setTimeout(() => { const f = panel.querySelector("#hmFill"); if (f) f.style.width = rainPct + "%"; }, 60));
}

function getUVLabel(uv) {
    const labels = I18N.t("uvLabels");
    if (!uv) return labels[0];
    if (uv <= 2)  return labels[1];
    if (uv <= 5)  return labels[2];
    if (uv <= 7)  return labels[3];
    if (uv <= 10) return labels[4];
    return labels[5];
}

class FavoritesManager {
    constructor(max = 4) {
        this.max = max; this.favorites = this._load();
        const last = localStorage.getItem("lastCity");
        if (last && this.favorites.length) {
            const i = this.favorites.findIndex(c => c.name === last);
            this.currentIndex = i !== -1 ? i : 0;
        } else { this.currentIndex = 0; }
    }
    _load() { try { const s = localStorage.getItem("favCities"); return s ? JSON.parse(s) : []; } catch { return []; } }
    _save() { localStorage.setItem("favCities", JSON.stringify(this.favorites)); }
    saveLastCity(n) { localStorage.setItem("lastCity", n); }
    addCity(d) {
        if (!d?.name || !d.latitude || !d.longitude) return false;
        const i = this.favorites.findIndex(c => c.name === d.name);
        if (i !== -1) this.favorites.splice(i, 1);
        this.favorites.push({ name: d.name, country: d.country, latitude: d.latitude, longitude: d.longitude });
        if (this.favorites.length > this.max) this.favorites.shift();
        this.currentIndex = this.favorites.length - 1;
        this.saveLastCity(d.name); this._save(); return true;
    }
    getCurrentCity()  { return this.favorites[this.currentIndex] ?? null; }
    goToPrevious() { if (!this.favorites.length) return null; this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.favorites.length - 1; return this.getCurrentCity(); }
    goToNext()     { if (!this.favorites.length) return null; this.currentIndex = this.currentIndex < this.favorites.length - 1 ? this.currentIndex + 1 : 0; return this.getCurrentCity(); }
    goToIndex(i)   { if (i >= 0 && i < this.favorites.length) { this.currentIndex = i; return this.getCurrentCity(); } return null; }
    getAllCities()  { return this.favorites; }
    getCount()     { return this.favorites.length; }
}
const favoritesManager = new FavoritesManager();

let _lastUIData = null;

function initializeEventListeners() {
    window.addEventListener("load", async () => {
        changeBackgroundImage();

        const geoPromise = getCurrentLocation().catch(() => null);
        const ipPromise  = getLocationByIP().catch(() => null);

        // Muestra el primero que llegue (IP suele ser ~200ms)
        let shownCity = null;
        const first = await new Promise(resolve => {
            let done = false;
            const tryResolve = v => { if (v && !done) { done = true; resolve(v); } };
            ipPromise.then(tryResolve);
            geoPromise.then(tryResolve);
            Promise.all([ipPromise, geoPromise]).then(() => { if (!done) resolve(null); });
        });

        if (first) {
            shownCity = first.name;
            await fetchDataFromCoordinates(first.latitude, first.longitude, first.name, first.country);
            favoritesManager.addCity(first);
        }

        // Si GPS devuelve una ciudad diferente (más precisa), actualiza silenciosamente
        const geoLoc = await geoPromise;
        if (geoLoc && geoLoc.name !== shownCity) {
            await fetchDataFromCoordinates(geoLoc.latitude, geoLoc.longitude, geoLoc.name, geoLoc.country);
            favoritesManager.addCity(geoLoc);
        }

        if (!shownCity && !geoLoc) {
            if (favoritesManager.getCount() > 0) {
                await loadCityByIndex(favoritesManager.currentIndex);
            } else {
                alert("No se pudo obtener tu ubicación. Por favor, busca una ciudad manualmente.");
            }
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
    elements.mainCard.addEventListener("touchend",   e => {
        const d = txStart - e.changedTouches[0].screenX;
        if (d > 50) elements.nextArrow.click();
        else if (d < -50) elements.prevArrow.click();
    });

    document.querySelectorAll(".card h4").forEach(h => {
        h.addEventListener("click", () => h.closest(".card").classList.toggle("collapsed"));
    });

    document.addEventListener("langChanged", () => {
        if (_lastUIData) updateUI(_lastUIData);
        updateCardTitles();
    });
}

function updateCardTitles() {
    const map = {
        ".hourlyCard h4":     "cardHourly",
        ".forecastCard h4":   "cardForecast",
        ".atmosphereCard h4": "cardAtmosphere",
        ".windCard h4":       "cardWind",
        ".astroCard h4":      "cardAstro",
        ".marineCard h4":     "cardMarine",
    };
    Object.entries(map).forEach(([sel, key]) => {
        const el = document.querySelector(sel);
        if (el) {
            const icon = el.querySelector("i");
            el.innerHTML = I18N.t(key);
            if (icon) el.appendChild(icon);
        }
    });
    const chartsBtn = document.querySelector(".windCard .analytics-btn");
    if (chartsBtn) chartsBtn.innerHTML = `<i class="fa-solid fa-chart-line"></i> ${I18N.t("cardChartsBtn")}`;
    const marineBtn = document.querySelector(".marineCard .analytics-btn");
    if (marineBtn) marineBtn.innerHTML = `<i class="fa-solid fa-water"></i> ${I18N.t("cardMarineBtn")}`;
}

async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) { reject("no_geo"); return; }
        navigator.geolocation.getCurrentPosition(
            async pos => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
                    );
                    const data = await res.json();
                    const name = data.city || data.locality || data.principalSubdivision;
                    if (!name) { reject("no_city"); return; }
                    resolve({ name, country: data.countryCode ?? "", latitude, longitude });
                } catch { reject("geocoding_failed"); }
            },
            () => reject("denied"),
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
        );
    });
}

async function getLocationByIP() {
    try {
        const res = await fetch("https://ip-api.com/json/?fields=status,city,countryCode,lat,lon");
        const data = await res.json();
        if (data.status === "success" && data.city) {
            return { name: data.city, country: data.countryCode, latitude: data.lat, longitude: data.lon };
        }
    } catch {}
    const res2 = await fetch("https://ipapi.co/json/");
    const data2 = await res2.json();
    if (data2.city && data2.latitude) {
        return { name: data2.city, country: data2.country_code, latitude: data2.latitude, longitude: data2.longitude };
    }
    throw new Error("IP geolocation failed");
}

async function fetchDataFromCoordinates(latitude, longitude, name, country) {
    try {
        const [weatherData, marineData] = await Promise.all([
            fetchWeatherData(latitude, longitude),
            fetchMarineData(latitude, longitude)
        ]);

        const combinedData = {
            name,
            country,
            ...weatherData,
            ...marineData
        };

        updateUI(combinedData);

    } catch (error) {
        throw error;
    }
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
        updateUI({ name, country, street: "", ...w, ...m });
        elements.cityInput.value = "";

    } catch {
        alert("Error obteniendo datos meteorológicos");
    }
}

async function fetchGeoData(city) {
    const r = await fetch(`${API_URLS.geocoding}?name=${encodeURIComponent(city)}&count=1&language=${I18N.lang}&format=json`);
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
        timezone: "auto", forecast_days: 7
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
        cloudCover: c.cloud_cover, visibility: c.visibility, uvIndex: c.uv_index, cape: c.cape,
        dailyForecast: d.daily, hourlyForecast: d.hourly
    };
}

async function fetchMarineData(lat, lon) {
    try {
        const p = new URLSearchParams({ latitude: lat, longitude: lon,
            current: "wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,ocean_current_velocity,ocean_current_direction",
            timezone: "auto" });
        const r = await fetch(`${API_URLS.marine}?${p}`);
        if (!r.ok) return { hasMarineData: false };
        const d = await r.json();
        return { hasMarineData: true, marine: d.current };
    } catch { return { hasMarineData: false }; }
}

async function loadCityByIndex(index) {
    const cityData = favoritesManager.goToIndex(index);
    if (cityData) {
        await loadCityByCoordinates(cityData);
    }
}

async function loadCityByName(cityData) {
    await loadCityByCoordinates(cityData);
}

async function loadCityByCoordinates(cityData) {
    if (!cityData?.latitude || !cityData?.longitude) return;
    try {
        await fetchDataFromCoordinates(cityData.latitude, cityData.longitude, cityData.name, cityData.country);
        favoritesManager.saveLastCity(cityData.name);
    } catch {
        alert(`No se pudo cargar ${cityData.name}.`);
    }
}

function updateUI(data) {
    _lastUIData = data;
    updateMainCard(data);
    updateAtmosphere(data);
    updateWind(data);
    updateForecast(data);
    updateAstro(data);
    updateMarine(data);
    updateHourly(data);
    updateDots();
    updateCardTitles();
    changeBackgroundImage(data.weatherCode, data.isDay);
    scrollToTop();
}

function updateMainCard(data) {
    elements.weatherIcon.innerHTML = getMeteoconImg(data.weatherCode, data.isDay, "90px");
    elements.cityName.innerHTML    = `${data.name}, ${data.country}`;
    elements.todayDate.innerHTML   = getCurrentDate();
    elements.cityTemp.innerHTML    = `${Math.round(data.temperature)}°C`;
    elements.cityCondition.innerHTML = getWeatherLabel(data.weatherCode);
}

function updateHourly(data) {
    if (!data.hourlyForecast) { elements.hourly.innerHTML = `<p class="notAvailable">${I18N.t("notAvailable")}</p>`; return; }
    const now = new Date();
    const start = data.hourlyForecast.time.findIndex(t => new Date(t) > now);
    const idx   = start !== -1 ? start : 0;
    const h     = data.hourlyForecast;

    elements.hourly.innerHTML = h.time.slice(idx, idx + 24).map((time, i) => {
        const hi    = idx + i;
        const t     = new Date(time).toLocaleTimeString(I18N.lang + "-" + I18N.lang.toUpperCase(), { hour:"2-digit", minute:"2-digit", hour12:false });
        const temp  = Math.round(h.temperature_2m[hi]);
        const code  = h.weather_code[hi];
        const isDay = h.is_day?.[hi] ?? 1;
        const rain  = h.precipitation_probability[hi] ?? 0;
        const prec  = h.precipitation[hi] ?? 0;
        const detail = {
            time: t, code, isDay, description: getWeatherLabel(code),
            temp: h.temperature_2m[hi], feelsLike: h.apparent_temperature?.[hi],
            humidity: h.relative_humidity_2m?.[hi], windSpeed: h.wind_speed_10m?.[hi],
            windDir: h.wind_direction_10m?.[hi], visibility: h.visibility?.[hi],
            cloudCover: h.cloud_cover?.[hi], dewPoint: h.dew_point_2m?.[hi],
            rainProb: rain, precip: prec
        };
        return `
        <div class="hourItem" data-hour='${JSON.stringify(detail).replace(/'/g,"&#39;")}'>
            <span class="hour">${t}</span>
            <span class="hourIcon">${getMeteoconSmall(code, isDay)}</span>
            <span class="hourTemp">${temp}°</span>
            ${prec > 0 ? `<span class="hourRain">💧 ${prec}mm</span>` : `<span class="hourRain">💧 ${rain}%</span>`}
            <span class="hourTapHint">${I18N.t("moreInfo")}</span>
        </div>`;
    }).join("");
    elements.hourly.querySelectorAll(".hourItem").forEach(card => {
        card.addEventListener("click", () => { try { openHourModal(JSON.parse(card.getAttribute("data-hour"))); } catch(e) { console.error(e); } });
    });
}

function updateForecast(data) {
    const df   = data.dailyForecast;
    const DAYS = I18N.days();
    const MONTHS = I18N.months();
    elements.forecast.innerHTML = df.time.slice(0, 7).map((date, i) => {
        const d       = new Date(date);
        const dayName = i === 0 ? I18N.t("today") : DAYS[d.getDay()];
        const dateStr = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
        const code    = df.weather_code[i];
        const maxT    = Math.round(df.temperature_2m_max[i]);
        const minT    = Math.round(df.temperature_2m_min[i]);
        const rain    = df.precipitation_probability_max?.[i] ?? 0;
        const detail  = {
            dayName, dateStr, code, label: getWeatherLabel(code),
            maxTemp: df.temperature_2m_max[i], minTemp: df.temperature_2m_min[i],
            rainProb: rain, precipSum: df.precipitation_sum?.[i] ?? 0, snowSum: df.snowfall_sum?.[i] ?? 0,
            sunrise:  new Date(df.sunrise[i]).toLocaleTimeString(I18N.lang, { hour:"2-digit", minute:"2-digit" }),
            sunset:   new Date(df.sunset[i]).toLocaleTimeString(I18N.lang,  { hour:"2-digit", minute:"2-digit" }),
            daylightH: (df.daylight_duration[i]  / 3600).toFixed(1),
            sunshineH: (df.sunshine_duration[i]  / 3600).toFixed(1),
            uvMax:    df.uv_index_max?.[i]       ?? 0,
            windMax:  df.wind_speed_10m_max?.[i] ?? 0,
            gustMax:  df.wind_gusts_10m_max?.[i] ?? 0,
            windDir:  df.wind_direction_10m_dominant?.[i] ?? 0,
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
            <span class="forecastTapHint">${I18N.t("moreInfo")}</span>
        </div>`;
    }).join("");
    elements.forecast.querySelectorAll(".forecastDay").forEach(card => {
        card.addEventListener("click", () => { try { openDayModal(JSON.parse(card.getAttribute("data-day"))); } catch(e) { console.error(e); } });
    });
}

function updateAtmosphere(data) {
    const t = k => I18N.t(k);
    const items = [
        `💧 <strong>${data.humidity}%</strong> ${t("humidity")}`,
        `🌡️ <strong>${Math.round(data.apparentTemperature)}°C</strong> ${t("feelsLike")}`,
        `💧 <strong>${data.dewPoint?.toFixed(1) ?? 0}°C</strong> ${t("dewPoint")}`,
        `🌧️ <strong>${data.precipitation ?? 0} mm</strong> ${t("precipitation")}`,
        data.rain    > 0 ? `🌧️ <strong>${data.rain} mm</strong> ${t("rain")}`     : null,
        data.showers > 0 ? `🌦️ <strong>${data.showers} mm</strong> ${t("showers")}` : null,
        data.snowfall > 0 ? `❄️ <strong>${data.snowfall} cm</strong> ${t("snow")}` : null,
        `📊 <strong>${Math.round(data.pressure)} hPa</strong> ${t("pressure")}`,
        `📉 <strong>${Math.round(data.surfacePressure)} hPa</strong> ${t("surfacePressure")}`,
        `☁️ <strong>${data.cloudCover}%</strong> ${t("cloudCover")}`,
        `👁️ <strong>${(data.visibility/1000).toFixed(1)} km</strong> ${t("visibility")}`,
        `☀️ <strong>${data.uvIndex ?? 0}</strong> ${t("uvIndex")}`,
        data.cape ? `⚡ <strong>${Math.round(data.cape)} J/kg</strong> ${t("cape")}` : null
    ].filter(Boolean);
    elements.atmosphere.innerHTML = items.map(i => `<p>${i}</p>`).join("");
}

function updateWind(data) {
    const t = k => I18N.t(k);
    elements.wind.innerHTML = `
        <p>💨 <strong>${Math.round(data.windSpeed)} km/h</strong> ${t("windSpeed")} ${getWindDirection(data.windDirection)}</p>
        <p>💥 <strong>${Math.round(data.windGusts)} km/h</strong> ${t("windGusts")}</p>
        <p>🧭 <strong>${Math.round(data.windDirection)}°</strong> ${t("windDir")}</p>
        <p>🌬️ <strong>${getBeaufort(data.windSpeed)} Beaufort</strong> ${t("windBeaufort")}</p>
    `;
}

function updateAstro(data) {
    const t = k => I18N.t(k);
    const rise = new Date(data.dailyForecast.sunrise[0]).toLocaleTimeString(I18N.lang, { hour:"2-digit", minute:"2-digit" });
    const set  = new Date(data.dailyForecast.sunset[0]).toLocaleTimeString(I18N.lang,  { hour:"2-digit", minute:"2-digit" });
    elements.astro.innerHTML = `
        <p>🌅 <strong>${rise}</strong> ${t("sunrise")}</p>
        <p>🌇 <strong>${set}</strong> ${t("sunset")}</p>
        <p>☀️ <strong>${(data.dailyForecast.daylight_duration[0]/3600).toFixed(1)} h</strong> ${t("daylight")}</p>
        <p>🌞 <strong>${(data.dailyForecast.sunshine_duration[0]/3600).toFixed(1)} h</strong> ${t("sunshine")}</p>
        <p>☀️ <strong>${data.dailyForecast.uv_index_max?.[0] ?? 0}</strong> ${t("uvMax")}</p>
    `;
}

function updateMarine(data) {
    const t = k => I18N.t(k);
    if (!data.hasMarineData || !data.marine) {
        elements.marine.innerHTML = `<p class="notAvailable">${t("notAvailable")}</p>`; return;
    }
    const m = data.marine;
    elements.marine.innerHTML = `
        <p>🌊 <strong>${m.wave_height?.toFixed(2) ?? 0} m</strong> ${t("waveHeight")}</p>
        <p>🧭 <strong>${Math.round(m.wave_direction ?? 0)}°</strong> ${t("waveDir")}</p>
        <p>⏱️ <strong>${m.wave_period?.toFixed(1) ?? 0} s</strong> ${t("wavePeriod")}</p>
        <p>💨 <strong>${m.wind_wave_height?.toFixed(2) ?? 0} m</strong> ${t("windWave")}</p>
        <p>🌀 <strong>${m.swell_wave_height?.toFixed(2) ?? 0} m</strong> ${t("swell")}</p>
        <p>🌊 <strong>${m.ocean_current_velocity?.toFixed(2) ?? 0} m/s</strong> ${t("current")}</p>
    `;
}

function updateDots() {
    elements.favDots.innerHTML = favoritesManager.getAllCities()
        .map((_, i) => `<div class="dot ${i === favoritesManager.currentIndex ? "active" : ""}"></div>`)
        .join("");
}

function changeBackgroundImage(code = null, isDay = 1) {
    if (!elements.mainCard) return;
    let cat = "default";
    if (code !== null) {
        if ([0,1].includes(code))                             cat = "sunny";
        else if ([2,3].includes(code))                        cat = "cloudy";
        else if ((code>=51&&code<=67)||(code>=80&&code<=82))  cat = "rainy";
        else if ((code>=71&&code<=77)||(code>=85&&code<=86))  cat = "snowy";
        else if (code>=95&&code<=99)                          cat = "stormy";
        else if ([45,48].includes(code))                      cat = "foggy";
    }
    const set  = isDay ? BACKGROUND_IMAGES.day : BACKGROUND_IMAGES.night;
    const imgs = set[cat] ?? set.default;
    elements.mainCard.style.backgroundImage = `url('media/images/${imgs[Math.floor(Math.random() * imgs.length)]}.jpg')`;
}

function getWindDirection(deg) {
    const dirs = I18N.t("windDirs");
    return deg != null ? `(${dirs[Math.round(deg/45)%8]})` : "";
}

function getBeaufort(kmh) {
    const scale = [1,6,12,20,29,39,50,62,75,89,103,118];
    const i = scale.findIndex(v => kmh < v);
    return i === -1 ? 12 : i;
}

function getCurrentDate() {
    const d = new Date();
    const DAYS   = I18N.days();
    const MONTHS = I18N.months();
    return `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

function scrollToTop() {
    const hash = window.location.hash?.slice(1);
    if (hash) {
        setTimeout(() => {
            const target = document.getElementById(hash) || document.querySelector("." + hash);
            if (target) {
                const headerH = document.querySelector(".appHeader")?.offsetHeight || 0;
                window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - headerH - 16, behavior: "smooth" });
            }
            history.replaceState(null, "", window.location.pathname);
        }, 200);
    } else { window.scrollTo({ top: 0, behavior: "smooth" }); }
}

initializeEventListeners();