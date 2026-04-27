    const CACHE_NAME = 'ostrogradsky-v4';
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
      'data/answers_phys.txt'
      // Font Awesome кэшируем отдельно, т.к. это внешний ресурс
    ];

    self.addEventListener('install', event => {
      event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).catch(err => {
          console.warn('Некоторые ресурсы не удалось закэшировать:', err);
        })
      );
    });

    self.addEventListener('fetch', event => {
      // Пропускаем не-GET запросы
      if (event.request.method !== 'GET') return;
      
      // Для внешних ресурсов (CDN) используем network-first стратегию
      if (event.request.url.startsWith('https://')) {
        event.respondWith(
          fetch(event.request).then(response => {
            // Кэшируем успешные ответы
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
            return response;
          }).catch(() => caches.match(event.request))
        );
        return;
      }
      
      // Для локальных ресурсов используем cache-first стратегию
      event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
      );
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