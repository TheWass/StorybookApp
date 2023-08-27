
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
self.addEventListener('install', async (e) => {
  console.log('[Service Worker] Install version', version);

  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(contentToCache);
  })());
});

self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

const broadcast = new BroadcastChannel('metadata');
broadcast.onmessage = () => {
  broadcast.postMessage({ action: 'version', version });
};
