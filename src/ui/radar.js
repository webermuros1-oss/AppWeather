/**
 * Controlador de la página de radar (Leaflet vía CDN como global `L`).
 * Capa de precipitaciones de RainViewer con auto-refresh cada 10 minutos.
 */

import { escapeHtml } from "../core/dom.js";
import { i18n } from "../i18n/index.js";
import { onCitySelected, onLangChanged } from "../core/events.js";
import { fetchJson } from "../core/http.js";

const RAINVIEWER_API = "https://api.rainviewer.com/public/weather-maps.json";
const REFRESH_MS = 600000;

export function initRadarPage() {
  const L = window.L;
  if (!L) {
    console.error("Leaflet no disponible");
    return;
  }

  const map = L.map("radarMap", { center: [40.4, -3.7], zoom: 6, zoomControl: true, attributionControl: true });
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "© OpenStreetMap © CARTO",
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map);

  let radarLayer = null;
  let opacity = 0.8;

  async function loadRadar() {
    const timeEl = document.getElementById("radarTime");
    try {
      const data = await fetchJson(RAINVIEWER_API);
      if (!data.radar?.past?.length) return;
      const frame = data.radar.past[data.radar.past.length - 1];
      const url = `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
      if (radarLayer) map.removeLayer(radarLayer);
      radarLayer = L.tileLayer(url, { opacity, attribution: "RainViewer" }).addTo(map);
      const ts = new Date(frame.time * 1000);
      if (timeEl) {
        timeEl.textContent = `${i18n.t("radarUpdated")} ${ts.toLocaleTimeString(i18n.lang, { hour: "2-digit", minute: "2-digit" })}`;
      }
    } catch {
      if (timeEl) timeEl.textContent = i18n.t("radarError");
    }
  }

  document.getElementById("opacitySlider")?.addEventListener("input", (e) => {
    opacity = e.target.value / 100;
    if (radarLayer) radarLayer.setOpacity(opacity);
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 8),
      () => {},
      { timeout: 5000 },
    );
  }

  onCitySelected((e) => {
    const { latitude, longitude, name } = e.detail;
    map.setView([latitude, longitude], 8, { animate: true });
    const marker = L.marker([latitude, longitude]).addTo(map).bindPopup(`<b>${escapeHtml(name)}</b>`).openPopup();
    map.once("movestart", () => map.removeLayer(marker));
  });

  onLangChanged(() => {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      if (el.id === "radarTime") return;
      el.textContent = i18n.t(el.getAttribute("data-i18n"));
    });
  });

  loadRadar();
  setInterval(loadRadar, REFRESH_MS);
}
