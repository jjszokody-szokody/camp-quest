const V='cq-v1';
const CORE=['./','index.html','game.js','manifest.json','icon-192.png','assets/tex/bark_c.jpg','assets/tex/rock_c.jpg',...['Worker_Male','Viking_Male','Witch','Kimono_Male','Knight_Golden_Female','Casual_Male','Cowboy_Female','Elf','Casual3_Female','Wolf','Deer','Boar'].map(n=>'assets/models/'+n+'.glb')];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).catch(()=>{}));});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET')return;
 const local=u.origin===location.origin;const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp));}return r;});
 if(local&&/\.(html|js|json)$|\/$/.test(u.pathname))e.respondWith(net.catch(()=>caches.match(e.request)));// network-first for code
 else e.respondWith(caches.match(e.request).then(c=>c||net));});
