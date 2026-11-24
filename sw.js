self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
// Network only: never cache authenticated content or Firebase requests.
self.addEventListener('fetch',()=>{});
