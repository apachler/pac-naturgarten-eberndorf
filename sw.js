// Service Worker des Beetplaners – damit er im Garten auch ohne Empfang funktioniert.
// Zuerst das Netz (neue Pläne kommen sofort an), ohne Netz der zuletzt gespeicherte Stand.
// Fremde Adressen (Wettervorhersage, GitHub) laufen unverändert durch.
// Neue Laufzeitdateien in GRUNDGERUEST ergänzen; CACHE nur erhöhen, wenn sich der Aufbau ändert.

const CACHE = 'beetplaner-v1';
const GRUNDGERUEST = [
  './', './index.html',
  './beetplaner/app.js', './beetplaner/modell.js', './beetplaner/naturjahr.js', './beetplaner/wetter.js',
  './beetplaner/style.css', './beetplaner/icon.svg', './beetplaner/manifest.json', './beetplaner/vendor/js-yaml.mjs',
  './beetplaner/fonts/open-sans-400.woff2', './beetplaner/fonts/open-sans-700.woff2',
  './beetplaner/fonts/cormorant-garamond-400.woff2', './beetplaner/fonts/cormorant-garamond-700.woff2',
  './Gemüsegarten/jahre.yaml',
  './Gemüsegarten/Grundlagen/kulturen.yaml', './Gemüsegarten/Grundlagen/flaechen.yaml', './Gemüsegarten/Grundlagen/familien.yaml',
  './Gemüsegarten/Grundlagen/standort.yaml', './Gemüsegarten/Grundlagen/schaedlinge.yaml', './Gemüsegarten/Grundlagen/Merkliste.md',
];

self.addEventListener('install', (e) => {
  // einzeln laden: fehlt eine Datei, bleibt der Rest trotzdem gespeichert
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(GRUNDGERUEST.map((u) => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((namen) => Promise.all(namen.filter((n) => n.startsWith('beetplaner-') && n !== CACHE).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((antwort) => {
        if (antwort.ok) {
          const kopie = antwort.clone();
          e.waitUntil(caches.open(CACHE).then((c) => c.put(req, kopie)));
        }
        return antwort;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then((treffer) => treffer || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))),
  );
});
