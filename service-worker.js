
const CACHE = 'sentinela-v1';
const ASSETS = [
  './index.html',
  './assets/css/main.css',
  './assets/js/main.js',
  './assets/data/news.json',
  './assets/data/explica.json'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  if(url.origin === location.origin){
    e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
  }
});
