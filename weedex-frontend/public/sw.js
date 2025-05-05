const CACHE_NAME = 'weedex-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Log de démarrage du Service Worker
console.log('Service Worker starting...');

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened successfully');
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('All resources cached successfully');
          });
      })
      .catch((error) => {
        console.error('Error during cache installation:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('Found caches:', cacheNames);
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  console.log('Fetching:', event.request.url);
  
  // Ne pas mettre en cache les requêtes API
  if (event.request.url.includes('/api/') || event.request.url.includes('localhost:3333')) {
    console.log('API request detected, bypassing cache');
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        console.log('Not in cache, fetching from network:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              console.log('Invalid response, not caching:', event.request.url);
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                console.log('Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.error('Error caching response:', error);
              });
            return response;
          })
          .catch((error) => {
            console.error('Fetch failed:', error);
            return new Response('Network error', { status: 503 });
          });
      })
  );
}); 