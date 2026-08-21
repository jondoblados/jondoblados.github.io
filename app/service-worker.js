// Service worker for My Gospel Journey.
// Caches the app shell and the offline public-domain WEB Bible JSON files so the app keeps
// working offline once installed. Only runs when the app is served over http(s) — it cannot
// register when opened directly as a file:// page, which is fine; the app still works from
// local files without it. ESV/NIV/NLT live responses are intentionally NOT cached here (they
// are cached briefly, per-chapter, inside the app's own IndexedDB store to respect each
// publisher's license limits).

const CACHE_NAME = "gospel-journey-shell-v2";

const SHELL_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./db.js",
  "./bible-loader.js",
  "./commentary-loader.js",
  "./bible-books.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Cache-first for local WEB bible book JSON (public domain, safe to cache indefinitely).
  if (url.pathname.includes("/bible/web/") && url.pathname.endsWith(".json")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const res = await fetch(event.request);
        if (res.ok) cache.put(event.request, res.clone());
        return res;
      })
    );
    return;
  }

  // Never intercept live translation API calls (ESV/NIV/NLT) or cross-origin requests.
  if (url.origin !== self.location.origin) return;

  // Cache-first for app shell files, network fallback.
  if (SHELL_FILES.some((f) => url.pathname.endsWith(f.replace("./", "/")) || url.pathname.endsWith(f.replace("./", "")))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
