const CACHE_VERSION = 'v2.1';
const CACHE_NAME = `aaa-ontime-${CACHE_VERSION}`;
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('Failed to cache static assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('aaa-ontime-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Offline page content
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - AAA On Time Electric</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: #083344;
      color: #f1f5f9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 400px;
      text-align: center;
    }
    .icon {
      width: 80px;
      height: 80px;
      background: rgba(6, 182, 212, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 40px;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }
    p {
      color: #94a3b8;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .phone-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #06b6d4;
      color: #083344;
      padding: 16px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: background 0.2s;
    }
    .phone-btn:hover {
      background: #22d3ee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>You are offline</h1>
    <p>Some features may be unavailable. Please check your connection or call us directly.</p>
    <a href="tel:+17862951748" class="phone-btn">📞 Call (786) 295-1748</a>
  </div>
</body>
</html>`;

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  if (event.request.url.includes('/api/')) return;

  const url = new URL(event.request.url);

  // Navigation requests - serve index.html for SPA routing
  if (url.origin === location.origin && event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html').then((cached) => {
            if (cached) return cached;
            return new Response(OFFLINE_HTML, {
              status: 503,
              headers: { 'Content-Type': 'text/html' }
            });
          });
        })
    );
    return;
  }

  // Same-origin assets - cache first, network fallback
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          // Return cached version but update in background
          fetch(event.request).then((response) => {
            if (response.ok && response.type === 'basic') {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
          }).catch(() => {}); // Silent fail for background update
          return cached;
        }

        return fetch(event.request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // External resources - network first, cache fallback
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Message handler for skip waiting
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  try {
    // Open IndexedDB and get pending submissions
    const db = await openDB('aaa-forms', 1);
    const submissions = await db.getAll('pending-submissions');

    for (const submission of submissions) {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission.data)
        });

        if (response.ok) {
          await db.delete('pending-submissions', submission.id);
        }
      } catch (err) {
        console.error('Failed to sync submission:', err);
      }
    }
  } catch (err) {
    console.error('Sync failed:', err);
  }
}

// IndexedDB helper
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-submissions')) {
        db.createObjectStore('pending-submissions', { keyPath: 'id' });
      }
    };
  });
}
