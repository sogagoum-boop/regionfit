/*
=====================================================================
REGIONFIT - Service Worker (Mode Hors Ligne)
=====================================================================
Copyright (c) 2026 Constantin Armstrong Sogagoum
=====================================================================
*/

const CACHE_NAME = 'regionfit-v3.1';
const urlsToCache = [
    '/regionfit/',
    '/regionfit/index.html',
    '/regionfit/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Cache ouvert');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activation
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Ancien cache supprimé:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interception des requêtes (mode hors ligne)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si trouvé dans le cache, retourner
                if (response) {
                    return response;
                }
                // Sinon, faire la requête réseau
                return fetch(event.request)
                    .then(response => {
                        // Mettre en cache les nouvelles ressources
                        if (response && response.status === 200) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Si hors ligne, retourner une page d'erreur
                        return new Response('🔄 Mode hors ligne - Connectez-vous pour continuer.', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});
