/**
 * Controlador de la página de gráficas (Chart.js vía CDN como global `Chart`).
 * Carga calidad del aire, viento, lluvia, temperatura y datos marítimos.
 */

import { escapeHtml, qs } from "../core/dom.js";
import { i18n } from "../i18n/index.js";
import { onCitySelected, onLangChanged } from "../core/events.js";
import { beaufort, cardinal16 } from "../domain/wind.js";
import { aqiInfo } from "../domain/air-quality.js";
import { fetchAirQuality } from "../services/air-quality-service.js";
import { fetchMarine } from "../services/marine-service.js";
import { getPosition, reverseGeocode } from "../services/geolocation-service.js";
import { API_URLS } from "../core/config.js";
import { buildUrl, fetchJson } from "../core/http.js";

const state = { lat: null, lon: null, city: "—", country: "" };
const charts = {};

function Chart_() {
  // `Chart` llega del script CDN; lo resolvemos de forma perezosa.
  return window.Chart;
}

function baseOptions(yLabel = "") {
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
        padding: 10,
      },
    },
    scales: {
      x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { maxRotation: 45, font: { size: 10 } } },
      y: {
        grid: { color: "rgba(255,255,255,0.07)" },
        title: { display: !!yLabel, text: yLabel, color: "rgba(255,255,255,0.5)", font: { size: 11 } },
        ticks: { font: { size: 11 } },
      },
    },
  };
}

function sliceFromNow(timeArr, arr, count = 24) {
  const now = new Date();
  const start = timeArr.findIndex((t) => new Date(t) >= now);
  const idx = start !== -1 ? start : 0;
  return arr.slice(idx, idx + count);
}

function hourLabels(timeArr) {
  return sliceFromNow(timeArr, timeArr).map((t) =>
    new Date(t).toLocaleTimeString(i18n.lang, { hour: "2-digit", minute: "2-digit", hour12: false }),
  );
}

function applyChartDefaults() {
  const C = Chart_();
  if (!C) return;
  C.defaults.color = "rgba(255,255,255,0.65)";
  C.defaults.borderColor = "rgba(255,255,255,0.07)";
  C.defaults.font.family = "Barlow, sans-serif";
}

export function initChartsPage() {
  window.addEventListener("load", async () => {
    applyChartDefaults();
    try {
      let cityData = null;
      try {
        const { latitude, longitude } = await getPosition({ timeout: 8000 });
        const place = await reverseGeocode(latitude, longitude, i18n.lang);
        cityData = { name: place.name, country: place.country, latitude, longitude };
      } catch {
        const saved = readLastFavorite();
        if (saved) cityData = saved;
      }
      if (!cityData) {
        showGlobalError(i18n.t("errNoLocation"));
        return;
      }
      await applyCity(cityData);
    } catch (err) {
      console.error("Error inicializando charts:", err);
      showGlobalError(i18n.t("errGeneric"));
    }
  });

  onCitySelected(async (e) => {
    const { name, country, latitude, longitude } = e.detail;
    await applyCity({ name, country, latitude, longitude });
  });

  onLangChanged(() => {
    qs("body")?.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = i18n.t(el.getAttribute("data-i18n"));
    });
    if (state.lat !== null) applyCity({ name: state.city, country: state.country, latitude: state.lat, longitude: state.lon });
  });
}

function readLastFavorite() {
  try {
    const raw = localStorage.getItem("pw_fav_cities");
    if (!raw) return null;
    const cities = JSON.parse(raw);
    return Array.isArray(cities) && cities.length ? cities[cities.length - 1] : null;
  } catch {
    return null;
  }
}

async function applyCity(cityData) {
  state.lat = cityData.latitude;
  state.lon = cityData.longitude;
  state.city = cityData.name;
  state.country = cityData.country || "";

  const badge = qs("#currentCityBadge");
  const badgeText = qs("#cityBadgeText");
  if (badge && badgeText) {
    badgeText.textContent = `${state.city}, ${state.country}`;
    badge.style.display = "inline-flex";
  }

  ["aqiContent", "windCompassContent", "marineContent"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<p class="loadingState">${i18n.t("loading")}</p>`;
  });

  await Promise.all([loadAirQuality(), loadWeatherCharts(), loadMarine()]);
}

async function loadAirQuality() {
  try {
    const { hasData, current } = await fetchAirQuality(state.lat, state.lon);
    const content = qs("#aqiContent");
    if (!hasData || !content) {
      if (content) content.innerHTML = `<p class="notAvailable">${i18n.t("notAvailable")}</p>`;
      return;
    }
    const c = current;
    const displayAqi = c.european_aqi ?? c.us_aqi ?? 0;
    const info = aqiInfo(displayAqi);
    const labels = i18n.t("aqiLabels");
    const descs = i18n.t("aqiDescs");
    const badge = qs("#aqiBadgeLabel");
    if (badge) badge.textContent = `AQI ${displayAqi}`;

    content.innerHTML = `
        <div class="aqiIndexBanner ${info.cls}">
            <div class="aqiBigNumber">${displayAqi}</div>
            <div class="aqiInfo">
                <div class="aqiIndexLabel">${escapeHtml(labels[info.level])}</div>
                <div class="aqiIndexDesc">${escapeHtml(descs[info.level])}</div>
            </div>
            <span style="font-size:2.5rem">${info.emoji}</span>
        </div>
        <div class="aqiGrid">
            ${aqiItem("PM2.5", c.pm2_5?.toFixed(1) ?? "—", "μg/m³")}
            ${aqiItem("PM10", c.pm10?.toFixed(1) ?? "—", "μg/m³")}
            ${aqiItem("CO", c.carbon_monoxide?.toFixed(0) ?? "—", "μg/m³")}
            ${aqiItem("NO₂", c.nitrogen_dioxide?.toFixed(1) ?? "—", "μg/m³")}
            ${aqiItem("SO₂", c.sulphur_dioxide?.toFixed(1) ?? "—", "μg/m³")}
            ${aqiItem("O₃", c.ozone?.toFixed(1) ?? "—", "μg/m³")}
        </div>`;
  } catch {
    const content = qs("#aqiContent");
    if (content) content.innerHTML = `<p class="notAvailable">${i18n.t("notAvailable")}</p>`;
  }
}

function aqiItem(label, value, unit) {
  return `<div class="aqiItem"><div class="aqiLabel">${label}</div><div class="aqiValue">${value}</div><div class="aqiUnit">${unit}</div></div>`;
}

async function loadWeatherCharts() {
  const url = buildUrl(API_URLS.weather, {
    latitude: state.lat,
    longitude: state.lon,
    current: "wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_2m",
    hourly: "temperature_2m,wind_speed_10m,wind_direction_10m,precipitation_probability,precipitation",
    daily: "precipitation_probability_max,temperature_2m_max,temperature_2m_min,weather_code",
    timezone: "auto",
    forecast_days: 7,
  });
  const data = await fetchJson(url);
  renderWindCompass(data.current);
  renderWindChart(data.hourly);
  renderRainChart(data.daily);
  renderTempChart(data.hourly);
}

function renderWindCompass(current) {
  const dir = current.wind_direction_10m ?? 0;
  const speed = current.wind_speed_10m ?? 0;
  const gusts = current.wind_gusts_10m ?? 0;
  const dirLabel = cardinal16(dir);
  const content = qs("#windCompassContent");
  if (!content) return;
  content.innerHTML = `
        <div class="windRow">
            <div class="compassWrapper">
                <div class="compass">
                    <span class="compassLabel n">N</span><span class="compassLabel s">S</span>
                    <span class="compassLabel e">E</span><span class="compassLabel w">O</span>
                    <div class="compassRose"><div class="compassNeedle" style="transform: rotate(${dir - 180}deg)"></div></div>
                </div>
                <div class="compassDirLabel"><strong>${dirLabel}</strong><br><span>${Math.round(dir)}°</span></div>
            </div>
            <div class="windStats">
                <div class="windStatItem"><span class="statLabel">💨 ${i18n.t("windSpeed")}</span><span class="statValue">${Math.round(speed)} km/h</span></div>
                <div class="windStatItem"><span class="statLabel">💥 ${i18n.t("windGusts")}</span><span class="statValue">${Math.round(gusts)} km/h</span></div>
                <div class="windStatItem"><span class="statLabel">🧭 ${i18n.t("windDir")}</span><span class="statValue">${dirLabel} (${Math.round(dir)}°)</span></div>
                <div class="windStatItem"><span class="statLabel">⚡ ${i18n.t("windBeaufort")}</span><span class="statValue">${beaufort(speed)} BF</span></div>
            </div>
        </div>`;
}

function lineGradient(ctx, from, to) {
  const g = ctx.createLinearGradient(0, 0, 0, 240);
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  return g;
}

function renderWindChart(hourly) {
  const canvas = qs("#windChart");
  if (!canvas) return;
  const labels = hourLabels(hourly.time);
  const windData = sliceFromNow(hourly.time, hourly.wind_speed_10m).map((v) => Math.round(v));
  charts.wind?.destroy();
  const ctx = canvas.getContext("2d");
  charts.wind = new (Chart_())(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: i18n.t("chartWindSpeed24h"), data: windData,
        borderColor: "#00d9ff", backgroundColor: lineGradient(ctx, "rgba(0,217,255,0.4)", "rgba(0,217,255,0.02)"),
        borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#00d9ff", tension: 0.4, fill: true,
      }],
    },
    options: baseOptions("km/h"),
  });
}

function renderRainChart(daily) {
  const canvas = qs("#rainChart");
  if (!canvas) return;
  const DAYS = i18n.t("daysShort");
  const labels = daily.time.map((d, i) => (i === 0 ? i18n.t("today") : DAYS[new Date(d).getDay()]));
  const rainProb = daily.precipitation_probability_max;
  charts.rain?.destroy();
  const ctx = canvas.getContext("2d");
  const opts = baseOptions("%");
  charts.rain = new (Chart_())(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: i18n.t("chartRainProb7d"), data: rainProb,
        backgroundColor: rainProb.map((v) => (v > 70 ? "rgba(0,217,255,0.7)" : v > 40 ? "rgba(0,255,136,0.55)" : "rgba(0,255,136,0.3)")),
        borderColor: "rgba(0,255,136,0.8)", borderWidth: 1.5, borderRadius: 8,
      }],
    },
    options: { ...opts, scales: { ...opts.scales, y: { ...opts.scales.y, min: 0, max: 100 } } },
  });
}

function renderTempChart(hourly) {
  const canvas = qs("#tempChart");
  if (!canvas) return;
  const labels = hourLabels(hourly.time);
  const temps = sliceFromNow(hourly.time, hourly.temperature_2m).map((v) => Math.round(v));
  charts.temp?.destroy();
  const ctx = canvas.getContext("2d");
  charts.temp = new (Chart_())(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: i18n.t("chartTemp24h"), data: temps,
        borderColor: "#ff9500", backgroundColor: lineGradient(ctx, "rgba(255,149,0,0.45)", "rgba(255,71,87,0.04)"),
        borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: "#ff9500", tension: 0.45, fill: true,
      }],
    },
    options: baseOptions("°C"),
  });
}

async function loadMarine() {
  const content = qs("#marineContent");
  const waveParent = qs("#waveChart")?.parentElement;
  const { hasMarineData, marine, hourly } = await fetchMarine(state.lat, state.lon, { hourly: "wave_height,swell_wave_height" });

  if (!hasMarineData || !marine) {
    if (content) content.innerHTML = `<p class="notAvailable">⚓ ${i18n.t("notAvailable")}</p>`;
    if (waveParent) waveParent.style.display = "none";
    return;
  }
  if (waveParent) waveParent.style.display = "";
  const t = (k) => i18n.t(k);
  if (content) {
    content.innerHTML = `
        <div class="marineStatsGrid">
            ${marineCard("🌊", t("waveHeight"), marine.wave_height?.toFixed(2) ?? "—", "m")}
            ${marineCard("⏱️", t("wavePeriod"), marine.wave_period?.toFixed(1) ?? "—", "s")}
            ${marineCard("💨", t("windWave"), marine.wind_wave_height?.toFixed(2) ?? "—", "m")}
            ${marineCard("🌀", t("swell"), marine.swell_wave_height?.toFixed(2) ?? "—", "m")}
            ${marineCard("🌊", t("current"), marine.ocean_current_velocity?.toFixed(2) ?? "—", "m/s")}
            ${marineCard("🧭", t("currentDir"), Math.round(marine.ocean_current_direction ?? 0) + "°", "")}
        </div>`;
  }
  renderWaveChart(hourly);
}

function marineCard(icon, label, value, unit) {
  return `<div class="marineStatCard"><div class="statIcon">${icon}</div><div class="statLabel">${escapeHtml(label)}</div><div class="statValue">${value}</div><div class="statUnit">${unit}</div></div>`;
}

function renderWaveChart(hourly) {
  const canvas = qs("#waveChart");
  if (!canvas || !hourly?.wave_height) return;
  const labels = hourLabels(hourly.time);
  charts.wave?.destroy();
  const ctx = canvas.getContext("2d");
  charts.wave = new (Chart_())(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: i18n.t("chartWaveDataset"), data: sliceFromNow(hourly.time, hourly.wave_height).map((v) => v?.toFixed(2) ?? 0),
          borderColor: "#00d9ff", backgroundColor: lineGradient(ctx, "rgba(0,217,255,0.45)", "rgba(0,217,255,0.03)"),
          borderWidth: 2.5, pointRadius: 2, tension: 0.4, fill: true,
        },
        {
          label: i18n.t("chartSwellDataset"), data: sliceFromNow(hourly.time, hourly.swell_wave_height).map((v) => v?.toFixed(2) ?? 0),
          borderColor: "#00ff88", backgroundColor: lineGradient(ctx, "rgba(0,255,136,0.25)", "rgba(0,255,136,0.01)"),
          borderWidth: 1.5, pointRadius: 2, borderDash: [5, 3], tension: 0.4, fill: true,
        },
      ],
    },
    options: {
      ...baseOptions("m"),
      plugins: { ...baseOptions().plugins, legend: { display: true, labels: { color: "rgba(255,255,255,0.7)", font: { size: 11 }, boxWidth: 12, padding: 12 } } },
    },
  });
}

function showGlobalError(msg) {
  document.querySelectorAll(".loadingState").forEach((el) => {
    el.innerHTML = `<p class="notAvailable">⚠️ ${escapeHtml(msg)}</p>`;
  });
}
