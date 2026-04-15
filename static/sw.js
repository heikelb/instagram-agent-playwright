// Service Worker — Ventes Orange
const CACHE_NAME = 'ventes-orange-v1';

// Fichiers statiques à mettre en cache au démarrage
const STATIC_ASSETS = [
  '/static/css/bootstrap.min.css',
  '/static/css/bootstrap-icons.min.css',
  '/static/js/bootstrap.bundle.min.js',
  '/static/fonts/bootstrap-icons.woff2',
  '/static/icons/icon-192.png',
  '/static/manifest.json',
  '/offline',
];

// ── Installation : mise en cache des assets statiques ──────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ── Activation : nettoyage des anciens caches ──────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch : stratégie selon le type de ressource ──────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Assets statiques → Cache First
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Pages HTML → Network First, fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/offline').then(r => r || new Response(
          '<h1 style="font-family:sans-serif;text-align:center;margin-top:40vh;color:#ff7900">Pas de connexion</h1><p style="text-align:center">Reconnecte-toi pour accéder à tes ventes.',
          { headers: { 'Content-Type': 'text/html' } }
        ))
      )
    );
    return;
  }

  // Tout le reste → Network First
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
