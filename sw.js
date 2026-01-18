// sw.js (v3)
const CACHE_NAME = "kofu-cache-v3";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./juken.html",
  "./shobai.html",
  "./shouba.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./IMG_3563.jpeg",
  "./IMG_3564.jpeg",
  "./IMG_3565.jpeg"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null))
        )
      ),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      }).catch(() => cached);
    })
  );
});