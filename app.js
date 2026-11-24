import {app} from './firebase-config.js';
import {getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,sendPasswordResetEmail,updateProfile} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore,collection,doc,query,where,getDocs,writeBatch,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
const auth=getAuth(app),db=getFirestore(app),$=id=>document.getElementById(id);let user;
const run=async fn=>{try{$('status').textContent='';await fn()}catch(e){$('status').textContent='Não foi possível concluir: '+e.message}};
$('theme').onclick=()=>document.body.classList.toggle('dark');
$('auth').onsubmit=e=>{e.preventDefault();run(()=>signInWithEmailAndPassword(auth,$('email').value,$('password').value))};
$('register').onclick=()=>run(async()=>{if(!$('auth').reportValidity())return;if(!$('name').value.trim())throw Error('Informe seu nome.');const c=await createUserWithEmailAndPassword(auth,$('email').value,$('password').value);await updateProfile(c.user,{displayName:$('name').value.trim()});$('welcome').textContent='Olá, '+c.user.displayName;});
$('reset').onclick=()=>run(async()=>{await sendPasswordResetEmail(auth,$('email').value);$('status').textContent='Se a conta existir, confira seu e-mail.'});
$('logout').onclick=()=>run(()=>signOut(auth));
async function load(){const uid=user.uid;const snap=await getDocs(query(collection(db,'establishments'),where('ownerUid','==',uid)));if(user?.uid!==uid)return;$('orgs').replaceChildren();snap.forEach(d=>{const b=document.createElement('button');b.className='secondary';b.textContent=d.data().name;b.onclick=()=>{$('dashboard').hidden=false;$('orgTitle').textContent=d.data().name};$('orgs').append(b)});}
onAuthStateChanged(auth,u=>{user=u;$('login').hidden=!!u;$('panel').hidden=!u;$('dashboard').hidden=true;$('orgs').replaceChildren();if(u){$('welcome').textContent='Olá, '+(u.displayName||u.email);run(load)}});
$('create').onsubmit=e=>{e.preventDefault();run(async()=>{const uid=user.uid,ref=doc(collection(db,'establishments')),batch=writeBatch(db);batch.set(ref,{name:$('orgName').value.trim(),segment:$('segment').value,ownerUid:uid,createdAt:serverTimestamp()});batch.set(doc(ref,'members',uid),{role:'owner',uid});await batch.commit();$('create').reset();await load();$('status').textContent='Estabelecimento cadastrado!';})};
