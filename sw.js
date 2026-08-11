/*
=====================================================================
REGIONFIT - Service Worker
Copyright (c) 2026 Constantin Armstrong Sogagoum
=====================================================================
*/

const CACHE_NAME = 'regionfit-v1.0';

// Fichiers à mettre en cache
const urlsToCache = [
    '/regionfit/',
    '/regionfit/index.html',
    '/regionfit/manifest.json',
    '/regionfit/icon-192.png',
    '/regionfit/icon-512.png'
];

// Installation
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Cache ouvert');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.log('⚠️ Erreur cache:', err))
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

// Interception des requêtes
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
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
                        return new Response('🔄 Mode hors ligne', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});
service worker pour PWA
service worker pour PWA
