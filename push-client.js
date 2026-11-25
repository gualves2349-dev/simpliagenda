const diag=()=>{},diagError=()=>{};
import {getMessaging,getToken,deleteToken,isSupported,onMessage} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging.js';
import {doc,getDoc,setDoc,deleteDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import {vapidKey} from './push-config.js';
export function setupPush({app,auth,db,org}){
 const $=id=>document.getElementById(id), status=$('pushStatus44');
 const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 let promptEvent, messaging, activeRef, unsubscribe;
 const key='sa44-device:'+org;
 const refresh=()=>{$('pushInstall44').hidden=standalone();$('pushGuide44').textContent=ios?'No Safari, toque em Compartilhar → Adicionar à Tela de Início → Adicionar. Abra pelo ícone. No iPhone/iPad, é necessário iOS/iPadOS 16.4 ou superior.':'No Chrome, abra o menu ⋮ → Instalar aplicativo ou Adicionar à tela inicial. Depois abra pelo ícone.';};
 const showActive=active=>{$('pushEnable44').hidden=active;$('pushDisable44').hidden=!active;$('pushBadge44').textContent=active?'● Ativas':'';};
 showActive(false);
 auth.onAuthStateChanged(async user=>{showActive(false);if(!user)return;try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved?.uid!==user.uid||!('Notification' in window)||Notification.permission!=='granted')return;const snap=await getDoc(doc(db,'customerAccounts',user.uid,'pushDevices',saved.id));if(auth.currentUser?.uid===user.uid&&snap.exists()&&snap.data().org===org){showActive(true);status.textContent='Notificações registradas neste dispositivo.';}}catch{status.textContent='Não foi possível verificar o registro. Ative novamente.';}});
 refresh();window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;});window.addEventListener('appinstalled',refresh);
 $('pushInstallButton44').onclick=async()=>{if(promptEvent){await promptEvent.prompt();promptEvent=null;}else $('pushGuide44').hidden=false;};
 async function remove(){
  const uid=auth.currentUser?.uid;if(!uid)return;
  let saved;try{saved=JSON.parse(localStorage.getItem(key)||'null')}catch{}
  const refs=new Map();if(saved?.uid===uid) {const ref=doc(db,'customerAccounts',uid,'pushDevices',saved.id);refs.set(ref.path,ref);}
  if(activeRef&&activeRef.path.startsWith('customerAccounts/'+uid+'/pushDevices/'))refs.set(activeRef.path,activeRef);
  if(!refs.size){unsubscribe?.();unsubscribe=null;return;}
  // Desvincular primeiro, enquanto a sessao ainda esta autenticada.
  for(const ref of refs.values())await deleteDoc(ref);
  if(saved?.uid===uid)localStorage.removeItem(key);activeRef=null;unsubscribe?.();unsubscribe=null;
  // Nao chamar deleteToken sem associar explicitamente o SW do projeto.
  try{
   if('serviceWorker' in navigator){
    const scope=new URL('./',import.meta.url).href;
    const registration=await navigator.serviceWorker.getRegistration(scope);
    if(registration?.scope===scope){
     const subscription=await registration.pushManager.getSubscription();
     if(subscription){
      try{if(!await isSupported())throw Error('Messaging indisponivel');messaging=getMessaging(app);await getToken(messaging,{vapidKey,serviceWorkerRegistration:registration});await deleteToken(messaging);}
      catch(e){console.warn('Limpeza FCM:',e);await subscription.unsubscribe();}
     }
    }
   }
  }catch(e){console.warn('Limpeza local push:',e);}
 }
 $('pushDisable44').onclick=async()=>{try{await remove();showActive(false);status.textContent='Notificações desativadas neste dispositivo.';}catch(e){status.textContent='Não foi possível desativar: '+e.message;}};
 $('pushEnable44').onclick=async()=>{try{const uid=auth.currentUser?.uid;if(!uid)throw Error('Entre na sua conta.');if(ios&&!standalone())throw Error('Instale na tela de início e abra pelo ícone antes de ativar.');if(!('Notification' in window)||!('serviceWorker' in navigator))throw Error('Navegador sem suporte a notificações.');diag('Solicitando permissão push');const permission=await Notification.requestPermission();diag('Permissão push',{permission});if(permission!=='granted')throw Error('Permissão não concedida. Confira as configurações do navegador.');if(!await isSupported())throw Error('Firebase Messaging não suportado neste navegador.');const registration=await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;messaging=getMessaging(app);const token=await getToken(messaging,{vapidKey,serviceWorkerRegistration:registration});if(!token||auth.currentUser?.uid!==uid)throw Error('Não foi possível registrar o dispositivo.');const id=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),x=>x.toString(16).padStart(2,'0')).join('');activeRef=doc(db,'customerAccounts',uid,'pushDevices',id);diag('Gravação pushDevices iniciada');await setDoc(activeRef,{token,org,updatedAt:serverTimestamp()});diag('Gravação pushDevices concluída');localStorage.setItem(key,JSON.stringify({uid,id}));unsubscribe?.();unsubscribe=onMessage(messaging,p=>{status.textContent=p.data?.body||'Você tem uma atualização de agendamento.';registration.showNotification(p.data?.title||'SimpliAgenda',{body:p.data?.body||'Abra a central para consultar.',tag:p.data?.tag||'simpliagenda',icon:'./icon-192.png',data:{org:p.data?.org||org}}).catch(()=>{});});showActive(true);status.textContent='Notificações ativadas neste dispositivo.';}catch(e){diagError('Ativação push',e);status.textContent=e.message;}};
 return remove;
}
