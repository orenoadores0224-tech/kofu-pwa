// sw.js (v4)
const CACHE_NAME = "kofu-cache-v4";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./juken.html",
  "./shobai.html",
  "./ba-kansoku.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./IMG_3563.jpeg",
  "./IMG_3564.jpeg",
  "./IMG_3565.jpeg"
];

// install: 先に必要最低限を入れて待機短縮
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

// activate: 古いキャッシュ掃除
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key)))
      )
    ).then(() => self.clients.claim())
  );
});

// fetch: キャッシュ優先（なければ取りに行く）
self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((res) => {
          // GETだけキャッシュ
          if (req.method === "GET" && res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        }).catch(() => cached)
      );
    })
  );
});