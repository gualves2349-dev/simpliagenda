const admin=require('firebase-admin');
const {FieldValue,Timestamp}=require('firebase-admin/firestore');
const fs=require('node:fs');
const path=require('node:path');
const projectId='simpliagenda-ff92d';
const key=process.env.GOOGLE_APPLICATION_CREDENTIALS;
if(!key)throw Error('Defina GOOGLE_APPLICATION_CREDENTIALS para o JSON privado fora do repositorio.');
const credentials=JSON.parse(fs.readFileSync(key,'utf8'));
if(credentials.project_id!==projectId)throw Error('JSON de outro projeto Firebase.');
admin.initializeApp({credential:admin.credential.cert(credentials),projectId});
const db=admin.firestore(), messaging=admin.messaging();
const state=path.join(__dirname,'start-local.json');
if(!fs.existsSync(state))fs.writeFileSync(state,JSON.stringify({start:Date.now()}),{flag:'wx'});
const start=JSON.parse(fs.readFileSync(state)).start;
const listeners=new Map();let chain=Promise.resolve();
async function processEvent(org,ev){
 const e=ev.data();if(e.from!=='pending'||e.to!=='confirmed'||typeof e.bookingId!=='string'||typeof e.actor!=='string')return;
 const base=db.collection('establishments').doc(org), booking=base.collection('bookingRequests').doc(e.bookingId), claim=base.collection('pushDispatch44').doc(e.bookingId);
 const payload=await db.runTransaction(async tx=>{
  const [b,c,o,sub]=await Promise.all([tx.get(booking),tx.get(claim),tx.get(base),tx.get(db.collection('platformSubscriptions').doc(org))]);
  if(c.exists||!b.exists||!o.exists)return null;
  const x=b.data(), unit=o.data(), license=sub.data();
  if(x.status!=='confirmed'||!x.uid||!x.professional)return null;
  const pro=(await tx.get(base.collection('professionals').doc(x.professional))).data();
  if(!pro?.active||pro.uid!==e.actor||unit.ownerUid===e.actor)return null;
  const allowed=license?['active','trial'].includes(license.status)&&license.expiresAt?.toMillis()>Date.now():unit.createdAt?.toMillis()+7*86400000>Date.now();
  if(!allowed)return null;
  tx.create(claim,{state:'claimed',createdAt:FieldValue.serverTimestamp(),auditId:ev.id});return {...x,unitName:unit.name||"SimpliAgenda"};
 });
 if(!payload)return;
 try{
  const devices=await db.collection('customerAccounts').doc(payload.uid).collection('pushDevices').where('org','==',org).get();
  const [custom,global]=await Promise.all([db.collection('pushTemplates').doc('org_'+org).get(),db.collection('pushTemplates').doc('global').get()]);
  const template=custom.data()||global.data()||{title:'Agendamento confirmado!',body:'Seu horário foi confirmado. Abra a SimpliAgenda para consultar os detalhes.'};
  const render=(v,max)=>String(v).replace(/\{(empresa|data|hora)\}/g,(_,k)=>({empresa:payload.unitName,data:String(payload.date||'').split('-').reverse().join('/'),hora:payload.time||''})[k]).slice(0,max);
  let accepted=0,failed=0;
  for(const device of devices.docs){const d=device.data();try{
   await messaging.send({token:d.token,data:{title:render(template.title,100),body:render(template.body,300),org,tag:'sa44-'+e.bookingId},webpush:{headers:{TTL:'3600',Urgency:'high'}}});accepted++;
  }catch(err){failed++;console.error('Falha FCM:',err.code||'desconhecida');if(['messaging/registration-token-not-registered','messaging/invalid-registration-token'].includes(err.code))await device.ref.delete();}}
  await claim.update({state:accepted?'accepted':failed?'failed':'no_devices',accepted,failed,finishedAt:FieldValue.serverTimestamp()});await db.collection('pushMonitor').doc(org+'_'+e.bookingId).set({org,state:accepted?'accepted':failed?'failed':'no_devices',accepted,failed,finishedAt:FieldValue.serverTimestamp()});console.log('Confirmação:',e.bookingId,'aceitos:',accepted,'falhas:',failed);
 }catch(err){await claim.update({state:'unknown',finishedAt:FieldValue.serverTimestamp()}).catch(()=>{});console.error('Falha no processamento:',err.code||err.message);}
}
function attach(org){if(listeners.has(org))return;const unsub=db.collection('establishments').doc(org).collection('auditEvents').where('createdAt','>=',Timestamp.fromMillis(start)).onSnapshot(s=>{for(const change of s.docChanges())if(change.type==='added')chain=chain.then(()=>processEvent(org,change.doc)).catch(e=>console.error('Evento:',e.code||e.message));},err=>{console.error('Listener:',err.code||err.message);listeners.delete(org);});listeners.set(org,unsub);}
async function discover(){const s=await db.collection('establishments').get();for(const d of s.docs)attach(d.id);}
(async()=>{await discover();console.log('SimpliAgenda Push ativo. Unidades:',listeners.size,'Início:',new Date(start).toISOString());setInterval(()=>discover().catch(e=>console.error('Unidades:',e.code||e.message)),60000);})().catch(e=>{console.error(e.message);process.exit(1)});
