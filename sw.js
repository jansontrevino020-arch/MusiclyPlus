const CACHE_NAME = "music-vault-v1";
const OFFLINE_ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  // add your covers and audio files here:
  "covers/synth-dawn.jpg",
  "covers/midnight-drive.jpg",
  "covers/lofi-study.jpg",
  "audio/synth-dawn/01-first-light.mp3",
  "audio/synth-dawn/02-chrome-horizon.mp3",
  "audio/synth-dawn/03-city-pulse.mp3",
  "audio/midnight-drive/01-neon-rain.mp3",
  "audio/midnight-drive/02-overpass.mp3",
  "audio/midnight-drive/03-rearview-stars.mp3",
  "audio/lofi-study/01-coffee-window.mp3",
  "audio/lofi-study/02-notebook-margins.mp3",
  "audio/lofi-study/03-soft-pages.mp3"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        return response;
      }).catch(() => cached);
    })
  );
});