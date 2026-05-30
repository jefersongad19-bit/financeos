const C="financeos-v2";
self.addEventListener("install",e=>e.waitUntil(caches.open(C).then(c=>c.addAll(["/","/index.html","/manifest.json"])).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(cached=>{const net=fetch(e.request).then(r=>{if(r&&r.status===200)caches.open(C).then(c=>c.put(e.request,r.clone()));return r;}).catch(()=>cached);return cached||net;}));});
