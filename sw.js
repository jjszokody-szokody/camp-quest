const V='cq-v15';
const CORE=['./','index.html','game.js','manifest.json','icon-192.png','icon-512.png','tex/bark_c.jpg','tex/bark_n.jpg','tex/grass_c.jpg','tex/grass_n.jpg','tex/rock_c.jpg','tex/rock_n.jpg','tex/sand_c.jpg','tex/sand_n.jpg','tex/snow_c.jpg','tex/snow_n.jpg','tex/water_n.jpg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).catch(()=>{}));});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);const local=u.origin===location.origin;
 const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp));}return r;});
 if(local)e.respondWith(net.catch(()=>caches.match(e.request)));else e.respondWith(caches.match(e.request).then(c=>c||net));});
