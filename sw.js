// Sem cache de dados autenticados. O FCM usa este mesmo service worker.
self.addEventListener('notificationclick',event=>{event.notification.close();const org=event.notification.data?.org;const url=new URL('./index.html',self.registration.scope);url.searchParams.set('acesso','customer');if(org)url.searchParams.set('agenda',org);event.waitUntil(self.clients.openWindow(url.href));});
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js','https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');
firebase.initializeApp({apiKey:'AIzaSyBo3AfXToj3v7zdIabfh0ROGAd_7zztJ74',authDomain:'simpliagenda-ff92d.firebaseapp.com',projectId:'simpliagenda-ff92d',messagingSenderId:'971941455859',appId:'1:971941455859:web:8af44db3af9eff249b9486'});
firebase.messaging().onBackgroundMessage(p=>self.registration.showNotification(p.data?.title||'SimpliAgenda',{body:p.data?.body||'Abra a central para consultar.',icon:new URL('icon-192.png',self.registration.scope).href,tag:p.data?.tag||'simpliagenda',data:{org:p.data?.org}}));
self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',()=>{});

// Release 44.30: network-first browser defaults; no application data cache.
