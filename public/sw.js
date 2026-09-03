// 9Digits GM - PURA Gambia Contacts Upgrader Service Worker
// Automatically updated with exact asset hashes during production build
const CACHE_NAME = 'gambia-9digits-v4';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './manifest.json',
  './favicon.svg',
  './favicon.ico',
  './favicon-16x16.png',
  './favicon-32x32.png',
  './favicon-48x48.png',
  './favicon-96x96.png',
  './pwa-64x64.png',
  './pwa-128x128.png',
  './pwa-192x192.png',
  './pwa-256x256.png',
  './pwa-384x384.png',
  './pwa-512x512.png',
  './apple-touch-icon.png',
  './apple-touch-icon-180x180.png',
  './apple-touch-icon-167x167.png',
  './apple-touch-icon-152x152.png',
  './apple-touch-icon-120x120.png',
  './pwa-icon.svg',
  './pwa-icon-1.svg',
  './logo-dark.svg',
  './logo-light.svg',
  './logo-for-lightmode.svg',
  './logo-for-darkmode.svg',
  './consolidated-mockups.webp',
  './consolidated-mockups.png',
  './consolidated-mockups.svg',
  './africell.svg',
  './qcell.svg',
  './gamcel.svg',
  './gamtel.svg',
  './comium.svg',
  './gm flag-01.svg'
];

// Install Event: Pre-cache static shell using Promise.allSettled so no single asset blocks installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        STATIC_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset, { cache: 'no-cache' });
            if (response && response.ok) {
              await cache.put(asset, response);
            }
          } catch (err) {
            console.debug('[SW] Pre-cache item skipped:', asset, err);
          }
        })
      );
    })
  );
});

// Activate Event: Clear old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

// Fetch Event: Offline-first with network fallback and resilient fallbacks
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin GET requests
  if (req.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Never intercept internal Vite HMR websocket or dev server runtime modules
  if (
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@fs/') ||
    url.pathname.endsWith('.hot-update.json') ||
    url.pathname.endsWith('.hot-update.js')
  ) {
    return;
  }

  // 1. Navigation requests (HTML pages): Network-First with instant Cache Fallback
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      (async () => {
        try {
          // Attempt network with a 2.5s timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          const networkResponse = await fetch(req, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(req, networkResponse.clone());
            cache.put('./index.html', networkResponse.clone());
            cache.put('./', networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          // Network failed or timed out (OFFLINE): Return cached shell
          const cached =
            (await caches.match(req, { ignoreSearch: true })) ||
            (await caches.match('./index.html', { ignoreSearch: true })) ||
            (await caches.match('./', { ignoreSearch: true })) ||
            (await caches.match('/index.html', { ignoreSearch: true })) ||
            (await caches.match('/', { ignoreSearch: true }));

          if (cached) {
            return cached;
          }

          return new Response(
            '<!doctype html><html><head><meta charset="utf-8"><title>9Digits GM - Offline</title></head><body style="font-family:sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center;"><h2>Working Offline</h2><p>Please reopen the app or connect to load fresh data.</p></div></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
      })()
    );
    return;
  }

  // 2. Static Assets (Scripts, Stylesheets, Images, Fonts, Icons, Manifests)
  event.respondWith(
    (async () => {
      // First, try matching directly in cache (ignoring search params like ?v=2)
      const cachedResponse = await caches.match(req, { ignoreSearch: true });

      // If cached response exists, return it immediately and revalidate in background if online
      if (cachedResponse) {
        // Background revalidation
        fetch(req)
          .then(async (networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(req, networkResponse);
            }
          })
          .catch(() => {
            // Offline - ignore background fetch error
          });

        return cachedResponse;
      }

      // If not in cache, attempt network fetch
      try {
        const networkResponse = await fetch(req);
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        // Offline and not in cache: Try matching by stripped pathname
        const cleanPath = url.pathname;
        const fallbackMatch =
          (await caches.match(cleanPath, { ignoreSearch: true })) ||
          (await caches.match('.' + cleanPath, { ignoreSearch: true }));

        if (fallbackMatch) {
          return fallbackMatch;
        }

        // For image requests that fail offline, return a fallback SVG instead of broken img
        if (req.headers.get('accept')?.includes('image/')) {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }

        // Return generic 503 response if asset cannot be fetched
        return new Response('Resource unavailable offline', {
          status: 503,
          statusText: 'Service Unavailable (Offline)'
        });
      }
    })()
  );
});

// Listen for skip waiting messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
