const VERSION = 'gh-v1777011436';
const CACHE_STATIC = VERSION + '-static';
const CACHE_CDN    = VERSION + '-cdn';

const STATIC_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_STATIC)
      .then(c => c.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_STATIC && k !== CACHE_CDN)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(e.request.method !== 'GET') return;
  if(url.protocol === 'chrome-extension:') return;
  if(url.hostname.includes('maps.google') || url.hostname.includes('wa.me')) return;

  const isCDN = ['cdnjs.cloudflare.com','api.qrserver.com','cdn.jsdelivr.net',
                  'fonts.googleapis.com','fonts.gstatic.com'].some(p=>url.hostname.includes(p));

  if(isCDN){
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if(res && res.status === 200){
            const clone = res.clone();
            caches.open(CACHE_CDN).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(res && res.status === 200){
          const clone = res.clone();
          caches.open(CACHE_STATIC).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        if(e.request.headers.get('accept')&&e.request.headers.get('accept').includes('text/html')){
          return caches.match('./index.html');
        }
      });
    })
  );
});
