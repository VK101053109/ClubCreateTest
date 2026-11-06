const CACHE_NAME = "kids-club-cache-v6";

const files = [
    "./",
    "./index.html",
    "./application.html",
    "./dashboard.html",
    "./admin.html",
    "./login.html",
    "./userlogin.html",
    "./style.css",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./supabase-config.js",
    "./application.js",
    "./dashboard.js",
    "./admin.js",
    "./login.js",
    "./userlogin.js"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Cache each file on its own so one missing file can't block install.
            return Promise.all(files.map(file => cache.add(file).catch(() => {})));
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
        await self.clients.claim();
        // Reload open tabs so they leave the old cached page behind.
        const windowClients = await self.clients.matchAll({ type: "window" });
        windowClients.forEach(client => client.navigate(client.url));
    })());
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;
    if (new URL(event.request.url).origin !== self.location.origin) return;
    // Network first so edits show up immediately; fall back to cache offline.
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                return response;
            })
            .catch(() => caches.match(event.request, { ignoreSearch: true }))
    );
});