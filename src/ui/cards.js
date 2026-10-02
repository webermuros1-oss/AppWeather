/**
 * Render de las tarjetas del dashboard. Cada función recibe su nodo destino y
 * los datos ya normalizados. El detalle de hora/día se guarda en un array y se
 * referencia por índice (evita serializar JSON en atributos del DOM).
 */

import { escapeHtml, qs, qsa } from "../core/dom.js";
import { i18n } from "../i18n/index.js";
import { beaufort } from "../domain/wind.js";
import { pickBackgroundImage } from "../domain/backgrounds.js";
import { meteoconImg, meteoconSmall, weatherLabel, wireIconFallbacks } from "./icons.js";
import { openHourModal, openDayModal } from "./modal.js";
import { windDirectionLabel, formatTime, formatLongDate } from "./format.js";

export function renderMainCard(els, data) {
  if (els.weatherIcon) {
    els.weatherIcon.innerHTML = meteoconImg(data.weatherCode, data.isDay, 90);
    wireIconFallbacks(els.weatherIcon);
  }
  if (els.cityName) els.cityName.innerHTML = `${escapeHtml(data.name)}, ${escapeHtml(data.country)}`;
  if (els.todayDate) els.todayDate.textContent = formatLongDate(new Date());
  if (els.cityTemp) els.cityTemp.textContent = `${Math.round(data.temperature)}°C`;
  if (els.cityCondition) els.cityCondition.textContent = weatherLabel(data.weatherCode);
}

export function renderAtmosphere(el, data) {
  if (!el) return;
  const t = (k) => i18n.t(k);
  const items = [
    `💧 <strong>${data.humidity}%</strong> ${t("humidity")}`,
    `🌡️ <strong>${Math.round(data.apparentTemperature)}°C</strong> ${t("feelsLike")}`,
    `💧 <strong>${data.dewPoint?.toFixed(1) ?? 0}°C</strong> ${t("dewPoint")}`,
    `🌧️ <strong>${data.precipitation ?? 0} mm</strong> ${t("precipitation")}`,
    data.rain > 0 ? `🌧️ <strong>${data.rain} mm</strong> ${t("rain")}` : null,
    data.showers > 0 ? `🌦️ <strong>${data.showers} mm</strong> ${t("showers")}` : null,
    data.snowfall > 0 ? `❄️ <strong>${data.snowfall} cm</strong> ${t("snow")}` : null,
    `📊 <strong>${Math.round(data.pressure)} hPa</strong> ${t("pressure")}`,
    `📉 <strong>${Math.round(data.surfacePressure)} hPa</strong> ${t("surfacePressure")}`,
    `☁️ <strong>${data.cloudCover}%</strong> ${t("cloudCover")}`,
    `👁️ <strong>${(data.visibility / 1000).toFixed(1)} km</strong> ${t("visibility")}`,
    `☀️ <strong>${data.uvIndex ?? 0}</strong> ${t("uvIndex")}`,
    data.cape ? `⚡ <strong>${Math.round(data.cape)} J/kg</strong> ${t("cape")}` : null,
  ].filter(Boolean);
  el.innerHTML = items.map((i) => `<p>${i}</p>`).join("");
}

export function renderWind(el, data) {
  if (!el) return;
  const t = (k) => i18n.t(k);
  el.innerHTML = `
        <p>💨 <strong>${Math.round(data.windSpeed)} km/h</strong> ${t("windSpeed")} ${windDirectionLabel(data.windDirection)}</p>
        <p>💥 <strong>${Math.round(data.windGusts)} km/h</strong> ${t("windGusts")}</p>
        <p>🧭 <strong>${Math.round(data.windDirection)}°</strong> ${t("windDir")}</p>
        <p>🌬️ <strong>${beaufort(data.windSpeed)} Beaufort</strong> ${t("windBeaufort")}</p>
    `;
}

export function renderAstro(el, data) {
  if (!el || !data.dailyForecast) return;
  const t = (k) => i18n.t(k);
  const df = data.dailyForecast;
  el.innerHTML = `
        <p>🌅 <strong>${formatTime(df.sunrise[0])}</strong> ${t("sunrise")}</p>
        <p>🌇 <strong>${formatTime(df.sunset[0])}</strong> ${t("sunset")}</p>
        <p>☀️ <strong>${(df.daylight_duration[0] / 3600).toFixed(1)} h</strong> ${t("daylight")}</p>
        <p>🌞 <strong>${(df.sunshine_duration[0] / 3600).toFixed(1)} h</strong> ${t("sunshine")}</p>
        <p>☀️ <strong>${df.uv_index_max?.[0] ?? 0}</strong> ${t("uvMax")}</p>
    `;
}

export function renderForecast(el, data) {
  if (!el || !data.dailyForecast) return;
  const df = data.dailyForecast;
  const DAYS = i18n.days();
  const MONTHS = i18n.months();
  const details = [];

  el.innerHTML = df.time
    .slice(0, 7)
    .map((date, i) => {
      const d = new Date(date);
      const dayName = i === 0 ? i18n.t("today") : DAYS[d.getDay()];
      const dateStr = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
      const code = df.weather_code[i];
      const maxT = Math.round(df.temperature_2m_max[i]);
      const minT = Math.round(df.temperature_2m_min[i]);
      const rain = df.precipitation_probability_max?.[i] ?? 0;
      details[i] = {
        dayName, dateStr, code, label: weatherLabel(code),
        maxTemp: df.temperature_2m_max[i], minTemp: df.temperature_2m_min[i],
        rainProb: rain, precipSum: df.precipitation_sum?.[i] ?? 0, snowSum: df.snowfall_sum?.[i] ?? 0,
        sunrise: formatTime(df.sunrise[i]), sunset: formatTime(df.sunset[i]),
        daylightH: (df.daylight_duration[i] / 3600).toFixed(1),
        sunshineH: (df.sunshine_duration[i] / 3600).toFixed(1),
        uvMax: df.uv_index_max?.[i] ?? 0,
        windMax: df.wind_speed_10m_max?.[i] ?? 0,
        gustMax: df.wind_gusts_10m_max?.[i] ?? 0,
        windDir: df.wind_direction_10m_dominant?.[i] ?? 0,
      };
      return `
        <div class="forecastDay" data-idx="${i}">
            <span class="forecastDayName">${escapeHtml(dayName)}</span>
            <span class="forecastIcon">${meteoconSmall(code, 1)}</span>
            <div class="forecastTemps">
                <span class="forecastMax">${maxT}°</span>
                <span class="forecastMin">${minT}°</span>
            </div>
            <span class="forecastRain">💧 ${rain}%</span>
            <span class="forecastTapHint">${i18n.t("moreInfo")}</span>
        </div>`;
    })
    .join("");

  wireIconFallbacks(el);
  qsa(".forecastDay", el).forEach((card) => {
    card.addEventListener("click", () => openDayModal(details[Number(card.dataset.idx)]));
  });
}

export function renderHourly(el, data) {
  if (!el) return;
  if (!data.hourlyForecast) {
    el.innerHTML = `<p class="notAvailable">${i18n.t("notAvailable")}</p>`;
    return;
  }
  const h = data.hourlyForecast;
  const now = new Date();
  const start = h.time.findIndex((tm) => new Date(tm) > now);
  const idx = start !== -1 ? start : 0;
  const details = [];

  el.innerHTML = h.time
    .slice(idx, idx + 24)
    .map((time, i) => {
      const hi = idx + i;
      const label = new Date(time).toLocaleTimeString(i18n.lang, { hour: "2-digit", minute: "2-digit", hour12: false });
      const temp = Math.round(h.temperature_2m[hi]);
      const code = h.weather_code[hi];
      const isDay = h.is_day?.[hi] ?? 1;
      const rain = h.precipitation_probability[hi] ?? 0;
      const prec = h.precipitation[hi] ?? 0;
      details[i] = {
        time: label, code, isDay, description: weatherLabel(code),
        temp: h.temperature_2m[hi], feelsLike: h.apparent_temperature?.[hi],
        humidity: h.relative_humidity_2m?.[hi], windSpeed: h.wind_speed_10m?.[hi],
        windDir: h.wind_direction_10m?.[hi], visibility: h.visibility?.[hi],
        cloudCover: h.cloud_cover?.[hi], dewPoint: h.dew_point_2m?.[hi],
        rainProb: rain, precip: prec,
      };
      return `
        <div class="hourItem" data-idx="${i}">
            <span class="hour">${escapeHtml(label)}</span>
            <span class="hourIcon">${meteoconSmall(code, isDay)}</span>
            <span class="hourTemp">${temp}°</span>
            ${prec > 0 ? `<span class="hourRain">💧 ${prec}mm</span>` : `<span class="hourRain">💧 ${rain}%</span>`}
            <span class="hourTapHint">${i18n.t("moreInfo")}</span>
        </div>`;
    })
    .join("");

  wireIconFallbacks(el);
  qsa(".hourItem", el).forEach((card) => {
    card.addEventListener("click", () => openHourModal(details[Number(card.dataset.idx)]));
  });
}

export function renderMarine(el, data) {
  if (!el) return;
  const t = (k) => i18n.t(k);
  let html = "";

  if (data.hasMarineData && data.marine) {
    const m = data.marine;
    html += `
            <p>🌊 <strong>${m.wave_height?.toFixed(2) ?? 0} m</strong> ${t("waveHeight")}</p>
            <p>🧭 <strong>${Math.round(m.wave_direction ?? 0)}°</strong> ${t("waveDir")}</p>
            <p>⏱️ <strong>${m.wave_period?.toFixed(1) ?? 0} s</strong> ${t("wavePeriod")}</p>
            <p>💨 <strong>${m.wind_wave_height?.toFixed(2) ?? 0} m</strong> ${t("windWave")}</p>
            <p>🌀 <strong>${m.swell_wave_height?.toFixed(2) ?? 0} m</strong> ${t("swell")}</p>
            <p>🌊 <strong>${m.ocean_current_velocity?.toFixed(2) ?? 0} m/s</strong> ${t("current")}</p>
        `;
  }

  if (data.hasTideData && data.tides?.length) {
    const tideCards = data.tides
      .map((tide) => {
        const time = formatTime(tide.dt * 1000);
        const isHigh = tide.type === "High";
        return `
            <div class="tideItem ${isHigh ? "high" : "low"}">
                <span class="tideIcon">${isHigh ? "⬆️" : "⬇️"}</span>
                <span class="tideType">${isHigh ? t("highTide") : t("lowTide")}</span>
                <span class="tideTime">${time}</span>
            </div>`;
      })
      .join("");
    html += `
        <div class="tideSection">
            <p class="tideSectionTitle">🌊 ${t("tides")}</p>
            <div class="tideGrid">${tideCards}</div>
        </div>`;
  }

  el.innerHTML = html || `<p class="notAvailable">${t("notAvailable")}</p>`;
}

export function renderDots(el, favoritesManager) {
  if (!el) return;
  el.innerHTML = favoritesManager
    .getAllCities()
    .map((_, i) => `<div class="dot ${i === favoritesManager.currentIndex ? "active" : ""}"></div>`)
    .join("");
}

/** Reaplica los títulos de las tarjetas al cambiar de idioma. */
export function updateCardTitles() {
  const map = {
    ".hourlyCard h4": "cardHourly",
    ".forecastCard h4": "cardForecast",
    ".atmosphereCard h4": "cardAtmosphere",
    ".windCard h4": "cardWind",
    ".astroCard h4": "cardAstro",
    ".marineCard h4": "cardMarine",
  };
  Object.entries(map).forEach(([sel, key]) => {
    const el = qs(sel);
    if (!el) return;
    const icon = el.querySelector("i");
    el.textContent = i18n.t(key);
    if (icon) el.appendChild(icon);
  });
  const chartsBtn = qs(".windCard .analytics-btn");
  if (chartsBtn) chartsBtn.innerHTML = `<i class="fa-solid fa-chart-line"></i> ${escapeHtml(i18n.t("cardChartsBtn"))}`;
  const marineBtn = qs(".marineCard .analytics-btn");
  if (marineBtn) marineBtn.innerHTML = `<i class="fa-solid fa-water"></i> ${escapeHtml(i18n.t("cardMarineBtn"))}`;
}

/** Cambia el fondo de la tarjeta principal según clima/día. */
export function applyBackground(mainCard, code = null, isDay = 1) {
  if (!mainCard) return;
  const img = pickBackgroundImage(code, isDay);
  mainCard.style.backgroundImage = `url('media/images/${img}.jpg')`;
}
