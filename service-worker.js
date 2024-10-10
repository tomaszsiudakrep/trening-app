const CACHE_NAME = 'timer-cache-v1';
const urlsToCache = [
    '/trening-app',
    '/trening-app/index.html',
    '/trening-app/style.css',
    '/trening-app/script.js',
    '/trening-app/manifest.json',
    '/trening-app/icons/icon-192x192.png',
    '/trening-app/icons/icon-512x512.png'
];

// Instalowanie Service Workera i dodanie zasobów do cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Pobieranie zasobów z cache
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

// Aktualizacja cache
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
