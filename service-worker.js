self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("static").then((cache) =>
      cache.addAll([
        "./",
        "./index.html",
        "./script.js",
        "./style.css",
        "./manifest.json",
        "./icon-192.png",
        "./icon-512.png"
      ])
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
