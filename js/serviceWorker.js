const CACHE_NAME = "meteo-cache-v3"; // Cambia versión para forzar actualización

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
    
    const apiDomains = [
        'api.open-meteo.com',
        'geocoding-api.open-meteo.com',
        'marine-api.open-meteo.com',
        'air-quality-api.open-meteo.com'
    ];

    const url = new URL(event.request.url);

    
    if (apiDomains.some(domain => url.hostname.includes(domain))) {
        event.respondWith(fetch(event.request));
        return;
    }

    
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
