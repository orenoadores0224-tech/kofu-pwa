const CACHE_NAME = 'kofu-pwa-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',

  './icon-192.png',
  './icon-512.png',

  './shouba.html',
  './kotu.html',
  './coldshower.html',
  './ba-kansoku.html'
];

// インストール時にキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 古いキャッシュ削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

// 基本はキャッシュ優先（オフライン強い）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((res) => {
        // 同一オリジンのGETだけキャッシュ
        try {
          const url = new URL(event.request.url);
          if (event.request.method === 'GET' && url.origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
        } catch (_) {}
        return res;
      }).catch(() => cached);
    })
  );
});