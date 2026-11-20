// Service worker de « Ma carrière » : l'appli s'ouvre même sans connexion.
// La page est cherchée d'abord sur internet (pour avoir la dernière version),
// et la copie gardée sert quand il n'y a pas de réseau.
const CACHE = "ma-carriere-v6";
const FICHIERS = ["./", "./index.html", "./manifest.json", "./icone-180.png", "./icone-192.png", "./icone-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const page = req.mode === "navigate" || req.destination === "document";
  if (page) {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put("./index.html", c)); return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { if (n.ok) { const c = n.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return n; })));
});
