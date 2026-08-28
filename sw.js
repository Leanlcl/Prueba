const CACHE_NAME = 'contador-truco-v2';
const FIREPLACE_IMAGE = 'https://images.unsplash.com/photo-1635194980245-66768dfc0e4d?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=80&w=2400';
const APP_SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        await cache.addAll(APP_SHELL);
        try {
          const response = await fetch(FIREPLACE_IMAGE, {mode: 'no-cors'});
          await cache.put(FIREPLACE_IMAGE, response);
        } catch (error) {
          console.warn('No se pudo precargar el fondo:', error);
        }
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
