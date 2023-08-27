
// Files to cache
const cacheName = 'storybook-v1';
const version = '0.0.1'
const appShellFiles = [
  '/',
  '/index.html',
  '/app.js',
  '/global.css',
  '/ELCLogo.png',
  '/manifest.json',
];

const contentToCache = appShellFiles;

// Installing Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install version', version);
  return; // skip caching
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(contentToCache);
  })());
});

self.addEventListener('message', function (event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});