const fs=require('node:fs');
const {initializeApp,applicationDefault}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const {Client,LocalAuth}=require('whatsapp-web.js');
const qr=require('qrcode-terminal');
const cfg=JSON.parse(fs.readFileSync('config.json','utf8'));
const phone=String(cfg.testPhone||'').replace(/\D/g,'');
if(!/^55\d{10,11}$/.test(phone)||!cfg.org||cfg.consent!==true) throw Error('Configure unidade, número de teste brasileiro e consentimento.');
initializeApp({credential:applicationDefault(),projectId:'simpliagenda-ff92d'});
const db=getFirestore();
const client=new Client({authStrategy:new LocalAuth({clientId:'simpliagenda-pilot'})});
const file='sent.json';let sent=new Set(fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[]);let busy=false;let previous=null;
function save(key){sent.add(key);fs.writeFileSync(file,JSON.stringify([...sent]));}
async function poll(){if(busy)return;busy=true;try{const snap=await db.collection('establishments').doc(cfg.org).collection('bookingRequests').get();const next=new Map(snap.docs.map(d=>[d.id,d.data().status]));if(previous===null){previous=next;return;}for(const d of snap.docs){const x=d.data();if(previous.get(d.id)===x.status)continue;if(previous.get(d.id)!=='pending'||x.status!=='confirmed')continue;const label='Agendamento confirmado';const key=d.id+':'+x.status;if(sent.has(key))continue;const msg=`[TESTE SimpliAgenda] ${label}. Data: ${x.date||''} às ${x.time||''}.`;if(cfg.send!==true){console.log(msg);save(key);continue;}const id=await client.getNumberId(phone);if(!id)throw Error('Número de teste não encontrado');save(key);await client.sendMessage(id._serialized,msg);console.log('Mensagem de teste enviada.');}previous=next;}catch(e){console.error('Falha no piloto:',e.message);}finally{busy=false;}}
client.on('qr',s=>qr.generate(s,{small:true}));client.on('ready',()=>{console.log('Conectado. Monitorando apenas a unidade configurada.');poll();setInterval(poll,30000);});client.on('auth_failure',()=>console.error('Falha de autenticação WhatsApp'));client.initialize().catch(e=>console.error(e.message));
