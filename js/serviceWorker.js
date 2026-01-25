const CACHE_NAME = "meteo-cache-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./json/manifest.json",
    "./css/index.css",
    "./css/header.css",
    "./css/footer.css",
    "./js/index.js",
    "./js/header.js",
    "./js/footer.js",
    "./media/images/logoRemaster192.png",
    "./media/images/logoRemaster512.png"
    // Añade aquí más fondos si quieres cachearlos:
    // "./media/images/sunny1.jpg",
    // "./media/images/sunny2.jpg",
    // etc.
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
