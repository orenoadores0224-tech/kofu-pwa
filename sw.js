// sw.js (v2)
const CACHE_NAME = "kofu-cache-v2";

// 必要ならここに「確実にキャッシュしたいもの」だけ入れる
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./kofu.html",
  "./parent-omamori.html",
  "./ba-kansoku.html",
  "./coldshower.html",
  "./shouba.html",
  "./kotu.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

// install: 先に必要最低限を入れて待機短縮
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

// activate: 古いキャッシュを掃除して即反映
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      ),
      self.clients.claim(),
    ])
  );
});

// fetch: 基本は cache-first（静的サイト向け）
// HTMLだけは「ネット優先」にして更新反映を強くする
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // GitHub Pages配下のみ扱う（外部は触らない）
  if (url.origin !== location.origin) return;

  // HTMLは network-first（更新反映のため）
  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("./")))
    );
    return;
  }

  // それ以外は cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});