// sw.js (v3)
const CACHE_NAME = "kofu-cache-v3";

// ここは「今サイトに存在してるページだけ」入れる（無いファイルがあるとエラーになりやすい）
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./juken.html",
  "./kofu.html",
  "./shouba.html",
  "./ba-kansoku.html",
  "./coldshower.html",
  "./kotu.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// install: 先に最低限をキャッシュ
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

// activate: 古いキャッシュを削除
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("kofu-cache-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// fetch: 基本は「キャッシュ優先」、無ければネット
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // 同一オリジンだけキャッシュ（外部は無理にキャッシュしない）
        const url = new URL(req.url);
        if (url.origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});