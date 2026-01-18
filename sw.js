// sw.js
const CACHE_NAME = "kofu-cache-v7";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./juken.html",
  "./shobai.html",
  "./ba-kansoku.html",
  "./coldshower.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./IMG_3563.jpeg",
  "./IMG_3564.jpeg",
  "./IMG_3565.jpeg"
];

// install
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

// activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

// fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});