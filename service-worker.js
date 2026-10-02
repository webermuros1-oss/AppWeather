/**
 * Service Worker de PlusWeather.
 *
 * Estrategias:
 *  - App shell (HTML/CSS/manifest/iconos) precacheado en `install`.
 *  - APIs dinámicas (meteo, geocoding, radar, tiles): siempre a red (nunca
 *    servir datos meteorológicos obsoletos desde caché).
 *  - Resto (módulos JS propios, fuentes/iconos de CDN): stale-while-revalidate
 *    (respuesta rápida desde caché + actualización en segundo plano). Así no hay
 *    que enumerar cada módulo: se cachean en la primera visita y la app funciona
 *    offline después.
 */

const CACHE = "pw-cache-v5";

const APP_SHELL = [
  "./",
  "./index.html",
  "./json/manifest.json",
  "./css/index.css",
  "./css/header.css",
  "./css/footer.css",
  "./css/charts.css",
  "./css/radar.css",
  "./pages/charts.html",
  "./pages/radar.html",
  "./src/main.js",
  "./media/images/logoRemaster.png",
  "./media/images/logoRemaster192.png",
  "./media/images/logoRemaster512.png",
];

// Hosts cuyas respuestas NO se cachean (datos que deben ser frescos).
const NETWORK_ONLY_HOSTS = [
  "open-meteo.com",
  "nominatim.openstreetmap.org",
  "bigdatacloud.net",
  "rainviewer.com",
  "basemaps.cartocdn.com",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  if (NETWORK_ONLY_HOSTS.some((h) => url.hostname.includes(h))) {
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith(staleWhileRevalidate(req));
});

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      // Solo cacheamos respuestas válidas (u opacas de CDN).
      if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || (await network) || new Response("", { status: 504, statusText: "Offline" });
}
