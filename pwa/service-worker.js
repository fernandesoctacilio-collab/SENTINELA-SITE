
const CACHE='sentinela-v3';
const ASSETS=['./index.html','./assets/css/main.css','./assets/js/main.js','./assets/data/news.json','./assets/data/explica.json','./assets/data/faqs.json','./assets/data/modelos.json','./assets/data/orgaos.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin===location.origin){ e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request))); }
});
