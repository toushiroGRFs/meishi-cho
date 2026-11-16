// 名刺帳: 一度開けば電波のない場所でも起動できるようにする。
// 通信できるときは常に新しい版を取りに行き、だめなら保存済みの版を返す。
const CACHE = "meishi-cho-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-180.png",
  "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || Response.error()))
  );
});
