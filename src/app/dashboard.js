/**
 * Controlador de la página principal (home).
 * Orquesta: estado (favoritos), obtención de datos (servicios) y render (cards).
 * No contiene lógica de negocio ni acceso directo a `fetch`: delega en capas.
 */

import { qs, qsa } from "../core/dom.js";
import { i18n } from "../i18n/index.js";
import { onCitySelected, onLangChanged } from "../core/events.js";
import { fetchWeather } from "../services/weather-service.js";
import { fetchMarine } from "../services/marine-service.js";
import { geocodeCity } from "../services/geocoding-service.js";
import { resolveCurrentLocation } from "../services/geolocation-service.js";
import { computeLunarTides } from "../domain/tides.js";
import { FavoritesManager } from "../state/favorites.js";
import {
  renderMainCard, renderAtmosphere, renderWind, renderForecast,
  renderAstro, renderMarine, renderHourly, renderDots,
  updateCardTitles, applyBackground,
} from "../ui/cards.js";

const favorites = new FavoritesManager();
let lastUIData = null;

function collectElements() {
  return {
    cityInput: qs("#getCity"),
    cityName: qs(".cityName"),
    cityTemp: qs(".weatherDeg"),
    cityCondition: qs(".weatherCondition"),
    todayDate: qs(".date"),
    weatherIcon: qs(".weatherIconDisplay"),
    header: qs(".appHeader"),
    mainCard: qs(".mainWeatherCard"),
    atmosphere: qs(".atmosphereInfo"),
    wind: qs(".windInfo"),
    marine: qs(".marineInfo"),
    forecast: qs(".forecastInfo"),
    astro: qs(".astroInfo"),
    hourly: qs(".hourlyInfo"),
    prevArrow: qs(".prevArrow"),
    nextArrow: qs(".nextArrow"),
    favDots: qs("#favDots"),
  };
}

let els = {};

/** Carga clima + mar + mareas para unas coordenadas y pinta la UI. */
async function loadCoordinates(lat, lon, name, country, street = "") {
  const [weather, marine] = await Promise.all([fetchWeather(lat, lon), fetchMarine(lat, lon)]);
  updateUI({ name, country, street, ...weather, ...marine, ...computeLunarTides(lat, lon) });
}

async function loadFavorite(city) {
  if (!city?.latitude || !city?.longitude) return;
  try {
    await loadCoordinates(city.latitude, city.longitude, city.name, city.country, city.street ?? "");
    favorites.saveLastCity(city.name);
  } catch {
    alert(`${i18n.t("errLoadCity")} ${city.name}.`);
  }
}

function updateUI(data) {
  lastUIData = data;
  renderMainCard(els, data);
  renderAtmosphere(els.atmosphere, data);
  renderWind(els.wind, data);
  renderForecast(els.forecast, data);
  renderAstro(els.astro, data);
  renderMarine(els.marine, data);
  renderHourly(els.hourly, data);
  renderDots(els.favDots, favorites);
  updateCardTitles();
  applyBackground(els.mainCard, data.weatherCode, data.isDay);
  scrollToTop();
}

function scrollToTop() {
  const hash = window.location.hash?.slice(1);
  if (!hash) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  setTimeout(() => {
    const target = document.getElementById(hash) || qs("." + hash);
    if (target) {
      const headerH = qs(".appHeader")?.offsetHeight || 0;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - headerH - 16, behavior: "smooth" });
    }
    history.replaceState(null, "", window.location.pathname);
  }, 200);
}

function wireEvents() {
  // Ocultar header al bajar, mostrar al subir.
  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if (els.header) {
      els.header.style.transform = st > lastScroll && st > 100 ? "translateY(-100%)" : "translateY(0)";
    }
    lastScroll = st <= 0 ? 0 : st;
  });

  // Enter en el buscador (fallback cuando no hay sugerencia seleccionada).
  els.cityInput?.addEventListener("keypress", (e) => {
    if (e.key !== "Enter") return;
    if (qs("#searchDropdown")?.classList.contains("open")) return;
    searchTyped();
  });

  // Selección de ciudad (desde header/footer u otra página).
  onCitySelected(async (e) => {
    const { name, country, latitude, longitude, street } = e.detail;
    favorites.addCity({ name, country, latitude, longitude });
    try {
      await loadCoordinates(latitude, longitude, name, country, street ?? "");
    } catch (err) {
      console.error(err);
      alert(i18n.t("errCity"));
    }
  });

  // Navegación entre favoritos.
  els.prevArrow?.addEventListener("click", async () => {
    const c = favorites.goToPrevious();
    if (c) await loadFavorite(c);
  });
  els.nextArrow?.addEventListener("click", async () => {
    const c = favorites.goToNext();
    if (c) await loadFavorite(c);
  });

  // Swipe en la tarjeta principal.
  let touchStart = 0;
  els.mainCard?.addEventListener("touchstart", (e) => {
    touchStart = e.changedTouches[0].screenX;
  });
  els.mainCard?.addEventListener("touchend", (e) => {
    const delta = touchStart - e.changedTouches[0].screenX;
    if (delta > 50) els.nextArrow?.click();
    else if (delta < -50) els.prevArrow?.click();
  });

  // Colapsar/expandir tarjetas.
  qsa(".card h4").forEach((h) => {
    h.addEventListener("click", () => h.closest(".card").classList.toggle("collapsed"));
  });

  // Re-render al cambiar idioma.
  onLangChanged(() => {
    if (lastUIData) updateUI(lastUIData);
    else updateCardTitles();
  });
}

async function searchTyped() {
  const city = els.cityInput?.value.trim();
  if (!city) {
    alert(i18n.t("errEnterCity"));
    return;
  }
  try {
    const geo = await geocodeCity(city, i18n.lang);
    if (!geo) {
      alert(i18n.t("errCityNotFound"));
      return;
    }
    const { latitude, longitude, name, country } = geo;
    favorites.addCity({ name, country, latitude, longitude });
    await loadCoordinates(latitude, longitude, name, country);
    els.cityInput.value = "";
  } catch (err) {
    console.error(err);
    alert(i18n.t("errGeneric"));
  }
}

/** Arranque del dashboard: debe llamarse tras montar el header/footer. */
export async function startDashboard() {
  els = collectElements();
  wireEvents();
  applyBackground(els.mainCard);

  try {
    const gps = await resolveCurrentLocation(i18n.lang);
    await loadCoordinates(gps.latitude, gps.longitude, gps.name, gps.country, gps.street);
    favorites.addCity(gps);
  } catch {
    if (favorites.getCount() > 0) await loadFavorite(favorites.getCurrentCity());
    else alert(i18n.t("errNoLocation"));
  }
}
