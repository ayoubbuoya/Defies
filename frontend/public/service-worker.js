
const CACHE_NAME = 'sei-ai-nexus-v1';


const CACHE_URLS = [
  '/',
  '/globals.css',
  // Add paths to your key assets like logos, fonts, etc.
  '/logo.png' 
];

// 1. On install, cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(CACHE_URLS);
      })
  );
});

// 2. On fetch, serve from cache if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If the request is in the cache, return it, otherwise fetch from network
        return response || fetch(event.request);
      })
  );
});
