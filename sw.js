const CACHE_NAME = 'ostrogradsky-v2';
const urlsToCache = [
  './',
  'auth.html',
  'home.html',
  'profile.html',
  'game_math.html',
  'game_phys.html',
  'main.js',
  'auth.js',
  'game.js',
  'home.js',
  'profile.js',
  'storage.js',
  'tasks.js',
  'manifest.json',
  'css/style.css',
  'data/answers_math.txt',
  'data/answers_phys.txt',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/assets/images/examples_')) {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});