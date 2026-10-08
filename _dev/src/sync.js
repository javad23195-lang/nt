/* ============ اطلاعات مشترک: همگام‌سازی با GitHub ============
   - هر سیستمی که «کلید دسترسی» دارد ثبت می‌کند؛ نوشته همه سیستم‌ها خودکار ادغام می‌شود.
   - سیستم بدون کلید فقط مشاهده می‌کند.
   - دسترسی هر سیستم می‌تواند محدود باشد: برای هر زبانه «ثبت»، «فقط مشاهده» یا «پنهان».
   اطلاعات، قفل‌شده (رمزگذاری‌شده)، در برچسب nt-data مخزن و پرونده nt-data.json نگه داشته می‌شود. */
(function(){
'use strict';
const CFG='ntsync_cfg_v1', STK='ntsync_state_v1', BASE='ntsync_base_v1', PREV='ntsync_prev_v1';
const UKEY='nt_users_v1', SKEY='nt_seen_v1';      // لیست کاربران (فقط مدیر می‌نویسد) و آخرین اتصال هر کاربر
const TEST=window.NTSYNC_TEST||{};
const API=TEST.api||'https://api.github.com', RAW=TEST.raw||'https://raw.githubusercontent.com';
const TAG='nt-data', FILE='nt-data.json';
let OWNER='javad23195-lang', REPO='nt';
try{
  const m=/^([a-z0-9-]+)\.github\.io$/i.exec(location.hostname);
  if(m){ OWNER=m[1]; const p=decodeURIComponent(location.pathname).split('/').filter(Boolean)[0]; if(p && !/\.html?$/i.test(p)) REPO=p; }
}catch(e){}
/* کلیدهایی که مخصوص همین سیستم است و فرستاده نمی‌شود */
const SKIP={nt_lasttab:1,nt_al_seen_v1:1,nt_backup_at:1,nt_alerts_v1:1,nt_bridge_sh_v1:1,nt_tavaqof_name:1,nt_tavaqof_dev:1};
/* کلیدهای محاسبه‌ای: ادغام نمی‌شوند؛ هر سیستم خودش دوباره می‌سازد */
const CALC={nt_anbar_sum_v1:1,nt_fixed_done_v1:1};
/* کلیدهایی که اختلافشان به کاربر گزارش نمی‌شود */
const QUIET={nt_users_v1:1,nt_seen_v1:1};
/* هر زبانه کدام اطلاعات را می‌نویسد (برای دسترسی محدود) */
const TABKEYS={
  'امروز':['nt_today_todo_v1','nt_fixed_done_v1'],
  'برنامه روزانه':['nt_prog_v1','nt_prog_rules_v1'],
  'دفترچه قرائت':['nt_daftar_v1'],
  'ثبت مشکلات':['nt_moshkel_v1','nt_mk_desc_v1','nt_mk_sys_v1'],
  'شناسنامه':['nt_sh8_v1','nt_sh8_reps_v1','nt_sh8_sups_v1','nt_sh_desc_v1','nt_sh_part_v1','nt_sh_from_v1','nt_khadamat_v1'],
  'خدمات':['nt_khadamat_v1','nt_kh_act_v1','nt_kh_part_v1','nt_daftar_v1'],
  'انبار':['nt_anbar_out_v1','nt_anbar_in_v1','nt_anbar_sent_v1','nt_anbar_codes_v1','nt_anbar_sum_v1'],
  'درخواست خرید':['nt_kharid9_v1','nt_kharid9_hist_v1','nt_kharid_cat_v1','nt_kr_unit_v1','nt_anbar_in_v1'],
  'توقف شیفت':['nt_tavaqof_v1']
};
/* پیش‌فرض دسترسی محدود: واحد استخراج */
const PRESET={'توقف شیفت':'w','دفترچه قرائت':'w'};
/* راننده (کاربر یک دستگاه): هیچ زبانه‌ای نمی‌بیند؛ فقط صفحه دستگاه خودش (qr.js) — قرائت، توقف، مشکل */
const DRIVER={'توقف شیفت':'w','دفترچه قرائت':'w','ثبت مشکلات':'w'};
const devList=()=>{ try{ return (window.ntQr && ntQr.DEVS || []).map(d=>d.name); }catch(e){ return []; } };
/* نام بخش‌ها برای پیام‌ها */
const LABEL={nt_anbar_out_v1:'خروج انبار',nt_anbar_in_v1:'ورود انبار',nt_kharid9_v1:'درخواست خرید',nt_moshkel_v1:'مشکلات',nt_sh8_v1:'شناسنامه',
  nt_khadamat_v1:'خدمات',nt_daftar_v1:'قرائت',nt_prog_v1:'برنامه روزانه',nt_today_todo_v1:'یادداشت',nt_tavaqof_v1:'توقف شیفت'};
/* شناسه ردیف در لیست‌هایی که هر ردیف باید یکتا باشد */
const IDF={nt_daftar_v1:e=>(e && typeof e==='object' && e.dev && e.date)?e.dev+'|'+e.date:null};
/* زمان‌ها (میلی‌ثانیه) — gap: کم‌ترین فاصله دو ارسال (محدودیت GitHub) */
const T={deb:3000,gap:40000,maxWait:60000,tick:3000,poll:180000,pollW:20000,busy:20000,maxDefer:180000,refocus:30000,retry:60000,squash:30,seen:900000,seenMin:60000};
if(TEST.T) Object.assign(T,TEST.T);

const $=id=>document.getElementById(id);
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function lsGet(k){ try{ const o=JSON.parse(localStorage.getItem(k)||'null'); return (o && typeof o==='object')?o:{}; }catch(e){ return {}; } }
function lsSet(k,o){ try{ localStorage.setItem(k,JSON.stringify(o)); return true; }catch(e){ return false; } }

let cfg=lsGet(CFG);
const st=()=>lsGet(STK);
function stSet(p){ lsSet(STK,Object.assign(st(),p)); }
const mode=()=>cfg.mode||'';
const acl=()=>(cfg.acl && typeof cfg.acl==='object')?cfg.acl:null;
const tabAcc=name=>{ const a=acl(); return a?(a[name]||'h'):'w'; };
/** این سیستم اجازه دارد این کلید را بنویسد؟ */
function canWrite(k){
  if(mode()!=='w') return false;
  if(k===UKEY) return isAdmin();
  if(k===SKEY) return true;
  const a=acl(); if(!a) return true;
  return Object.keys(TABKEYS).some(t=>a[t]==='w' && TABKEYS[t].indexOf(k)>-1);
}
const fullWriter=()=>mode()==='w' && !acl();
/** سیستم مدیر: با کلید GitHub تنظیم شده، نه با کد اتصال */
const isAdmin=()=>mode()==='w' && !cfg.uid && !acl();
window.ntViewer = mode()==='v' || !!acl() || !!cfg.uid;      // یادآورهای شخصی فقط در سیستم اصلی باز می‌شود

/* ---------- داده ---------- */
const isSync=k=>k && k.indexOf('nt_')===0 && !SKIP[k];
function collect(){
  const keys={};
  try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(isSync(k)) keys[k]=localStorage.getItem(k); } }catch(e){}
  return keys;
}
/* امنیت: اطلاعاتی که از سیستم‌های دیگر می‌رسد نباید بتواند در صفحه کد اجرا کند (XSS).
   در همه متن‌ها «<» «>» «"» با نشانه‌های بی‌خطر هم‌شکل (‹ › ″) عوض می‌شود؛ برای اطلاعات نت این سه نشانه لازم نیست. */
const SAFE_RE=/[<>"]/g, SAFE_MAP={'<':'‹','>':'›','"':'″'};
const safeStr=t=>String(t).replace(SAFE_RE,c=>SAFE_MAP[c]);
function safeVal(v){
  if(typeof v==='string') return safeStr(v);
  if(Array.isArray(v)) return v.map(safeVal);
  if(v && typeof v==='object'){ const o={}; Object.keys(v).forEach(k=>{ o[safeStr(k)]=safeVal(v[k]); }); return o; }
  return v;
}
function safeJson(t){
  if(!/[<>]|\\"/.test(t)) return t;                       // بیشتر وقت‌ها: بدون تغییر
  try{ return JSON.stringify(safeVal(JSON.parse(t))); }catch(e){ return safeStr(t); }
}
function pick(keys){ const o={}; Object.keys(keys||{}).forEach(k=>{ if(isSync(k) && typeof keys[k]==='string') o[k]=safeJson(keys[k]); }); return o; }
function hashOf(keys){
  let a=5381, b=52711, n=0;
  Object.keys(keys).sort().forEach(k=>{
    const s=k+'\u0001'+keys[k]+'\u0002'; n+=s.length;
    for(let i=0;i<s.length;i++){ const c=s.charCodeAt(i); a=((a<<5)+a+c)|0; b=((b<<5)+b^c)|0; }
  });
  return (a>>>0).toString(16)+'-'+(b>>>0).toString(16)+'-'+n;
}
function baseGet(){ try{ const o=JSON.parse(localStorage.getItem(BASE)||'null'); return (o && typeof o==='object')?o:null; }catch(e){ return null; } }
function baseSet(keys){ try{ localStorage.setItem(BASE,JSON.stringify(keys)); return true; }catch(e){ try{ localStorage.removeItem(BASE); }catch(e2){} return false; } }
/** آنچه این سیستم باید بفرستد: کلیدهای مجاز از همین سیستم، بقیه همان که در اطلاعات مشترک است */
function outgoing(local,base){
  if(isAdmin()) return local;
  const o={};
  Object.keys(base||{}).forEach(k=>{ if(!canWrite(k)) o[k]=base[k]; });
  Object.keys(local).forEach(k=>{ if(canWrite(k)) o[k]=local[k]; });
  return o;
}
function counts(keys){
  const P=k=>{ try{ return JSON.parse(keys[k]||'null'); }catch(e){ return null; } };
  const n=k=>{ const o=P(k); return o && Array.isArray(o.rows) ? o.rows.length : (Array.isArray(o)?o.length:0); };
  const pr=P('nt_prog_v1'), tv=P('nt_tavaqof_v1');
  const stops=tv&&typeof tv==='object'?Object.keys(tv).reduce((s,k)=>s+((tv[k]&&tv[k].stops)||[]).length,0):0;
  return [['خروج انبار',n('nt_anbar_out_v1')],['ورود انبار',n('nt_anbar_in_v1')],['درخواست خرید',n('nt_kharid9_v1')],
          ['مشکلات',n('nt_moshkel_v1')],['شناسنامه',n('nt_sh8_v1')],['خدمات',n('nt_khadamat_v1')],
          ['قرائت',n('nt_daftar_v1')],['روز برنامه',pr&&typeof pr==='object'&&!Array.isArray(pr)?Object.keys(pr).length:0],
          ['یادداشت',n('nt_today_todo_v1')],['توقف',stops]];
}
const total=keys=>counts(keys).reduce((s,x)=>s+x[1],0);
const countText=keys=>counts(keys).filter(x=>x[1]>0).map(x=>`${x[0]} ${fa(x[1])}`).join(' · ') || 'بدون ردیف';
function hms(ms){ try{ return new Intl.DateTimeFormat('fa-IR',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(ms)); }catch(e){ return ''; } }
function fmtAt(iso){
  if(!iso) return '—';
  try{
    const d=new Date(iso), n=new Date();
    const hm=new Intl.DateTimeFormat('fa-IR',{hour:'2-digit',minute:'2-digit',hour12:false}).format(d);
    if(d.toDateString()===n.toDateString()) return 'امروز '+hm;
    return new Intl.DateTimeFormat('fa-IR',{day:'numeric',month:'long'}).format(d)+' '+hm;
  }catch(e){ return String(iso).slice(0,16).replace('T',' '); }
}

/* ---------- ادغام سه‌طرفه ----------
   base: آخرین نسخه مشترکی که این سیستم دیده است · local: این سیستم · remote: اطلاعات مشترک فعلی */
let mergeNote={};          // کلید → تعداد ردیف‌هایی که هر دو نسخه‌شان نگه داشته شد
let mKey='';
const J=x=>JSON.stringify(x);
const isArr=Array.isArray, isObj=x=>x && typeof x==='object' && !isArr(x);
const clash=()=>{ if(!QUIET[mKey]) mergeNote[mKey]=(mergeNote[mKey]||0)+1; };
function merge3(b,l,r){
  const sl=J(l), sr=J(r);
  if(sl===sr) return l;
  const sb=J(b);
  if(sl===sb) return r;
  if(sr===sb) return l;
  if(isArr(l) && isArr(r)) return mergeArr(isArr(b)?b:[],l,r);
  if(isObj(l) && isObj(r)){
    const bo=isObj(b)?b:{}, out={};
    Object.keys(l).forEach(k=>{
      if(k in r) out[k]=merge3(bo[k],l[k],r[k]);
      else if(!(k in bo) || J(l[k])!==J(bo[k])) out[k]=l[k];      // تازه در این سیستم، یا این سیستم تغییرش داده
    });
    Object.keys(r).forEach(k=>{
      if(k in l) return;
      if(!(k in bo) || J(r[k])!==J(bo[k])) out[k]=r[k];           // تازه در اطلاعات مشترک، یا آنجا تغییر کرده
    });
    return out;
  }
  if(typeof l==='number' && typeof r==='number') return Math.max(l,r);
  if(typeof l==='boolean' && typeof r==='boolean') return l;
  clash(); return l;
}
function idsOf(arr,f){
  const m=new Map();
  for(const e of arr){ const id=f(e); if(id===null || id===undefined || m.has(id)) return null; m.set(id,e); }
  return m;
}
function mergeArr(b,l,r){
  /* ۱) لیست‌هایی که هر ردیف شناسه دارد */
  const f=IDF[mKey] || (e=>(isObj(e) && (typeof e.id==='string' || typeof e.id==='number'))?e.id:null);
  const L=idsOf(l,f), R=idsOf(r,f), B=idsOf(b,f);
  if(L && R && B && (l.length || r.length)){
    const out=[];
    l.forEach(e=>{ const id=f(e);
      if(R.has(id)) out.push(merge3(B.get(id),e,R.get(id)));
      else if(!B.has(id) || J(e)!==J(B.get(id))) out.push(e); });
    r.forEach(e=>{ const id=f(e);
      if(L.has(id)) return;
      if(!B.has(id) || J(e)!==J(B.get(id))) out.push(e); });
    return out;
  }
  /* ۲) لیست‌های بدون شناسه: هر ردیف با متن کاملش شناخته می‌شود */
  const bs=b.map(J), ls=l.map(J), rs=r.map(J);
  const cnt=a=>{ const m=new Map(); a.forEach(s=>m.set(s,(m.get(s)||0)+1)); return m; };
  const bc=cnt(bs), lc=cnt(ls), rc=cnt(rs);
  const rem=new Map();                                  // ردیف‌هایی که از اطلاعات مشترک حذف شده‌اند
  bc.forEach((n,s)=>{ const d=n-(rc.get(s)||0); if(d>0) rem.set(s,d); });
  const seen=new Map(), added=[];                       // جای ردیف‌هایی که در اطلاعات مشترک تازه‌اند
  rs.forEach((s,j)=>{ const n=(seen.get(s)||0)+1; seen.set(s,n); if(n>(bc.get(s)||0)) added.push(j); });
  const addSet=new Set(added);
  const out=l.map((v,i)=>({s:ls[i],v}));
  /* اصلاح ردیف در همان جای خودش */
  for(let k=0;k<Math.min(bs.length,rs.length);k++){
    if(bs[k]===rs[k] || !addSet.has(k) || !(rem.get(bs[k])>0)) continue;
    const i=out.findIndex(x=>x.s===bs[k] && !x.fromR);
    rem.set(bs[k],rem.get(bs[k])-1);
    if(i>-1){ out[i]={s:rs[k],v:r[k],fromR:1}; addSet.delete(k); }
    else clash();                                       // این سیستم هم همان ردیف را تغییر داده: هر دو نسخه می‌ماند
  }
  rem.forEach((d,s)=>{ for(;d>0;d--){ let i=-1; for(let q=out.length-1;q>=0;q--){ if(out[q].s===s && !out[q].fromR){ i=q; break; } } if(i<0) break; out.splice(i,1); } });
  const extra=new Map();                                // ردیف‌های تازه همین سیستم (برای یکی کردن ردیف‌های یکسان)
  lc.forEach((n,s)=>{ const d=n-(bc.get(s)||0); if(d>0) extra.set(s,d); });
  added.forEach(j=>{ if(!addSet.has(j)) return; const s=rs[j];
    if(extra.get(s)>0){ extra.set(s,extra.get(s)-1); return; }
    out.push({s,v:r[j]}); });
  return out.map(x=>x.v);
}
function mergeKey(k,b,l,r){
  if(l===r) return l;
  if(l===b) return r;
  if(r===b) return l;
  if(CALC[k]) return l===undefined?r:l;
  if(l===undefined || r===undefined){ return l===undefined?r:l; }   // یک طرف کل بخش را پاک کرده و طرف دیگر تغییر داده: تغییر می‌ماند
  let bv,lv,rv;
  try{ lv=JSON.parse(l); rv=JSON.parse(r); bv=b===undefined?undefined:JSON.parse(b); }catch(e){ return l; }
  mKey=k;
  return J(merge3(bv,lv,rv));
}
/** نتیجه ادغام برای همه کلیدها — کلیدهایی که این سیستم اجازه نوشتن ندارد، همان اطلاعات مشترک می‌شود */
function mergeAll(base,local,remote){
  const out={}, ks={};
  [base,local,remote].forEach(o=>Object.keys(o||{}).forEach(k=>ks[k]=1));
  Object.keys(ks).forEach(k=>{
    const v = canWrite(k) ? mergeKey(k,(base||{})[k],local[k],remote[k]) : remote[k];
    if(typeof v==='string') out[k]=v;
  });
  return out;
}

/* ---------- رمزگذاری ---------- */
const enc=new TextEncoder(), dec=new TextDecoder();
const hasCrypto=()=>!!(window.crypto && crypto.subtle);
function b64e(u8){ let s=''; for(let i=0;i<u8.length;i+=0x8000) s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000)); return btoa(s); }
function b64d(s){ const b=atob(s), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u; }
async function pipe(u8,ts){ return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(ts)).arrayBuffer()); }
function normPass(p){ return String(p||'').trim().replace(/[۰-۹]/g,d=>String(d.charCodeAt(0)-0x06F0)).replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-0x0660)); }
async function derive(pass,saltB64){
  const km=await crypto.subtle.importKey('raw',enc.encode(normPass(pass)),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:b64d(saltB64),iterations:150000,hash:'SHA-256'},km,256);
  return b64e(new Uint8Array(bits));
}
const newSalt=()=>b64e(crypto.getRandomValues(new Uint8Array(16)));
const aesKey=raw=>crypto.subtle.importKey('raw',b64d(raw),'AES-GCM',false,['encrypt','decrypt']);
async function seal(keys,n){
  const at=new Date().toISOString();
  let body=enc.encode(JSON.stringify({keys,at})), g=0;
  try{ if(window.CompressionStream){ body=await pipe(body,new CompressionStream('gzip')); g=1; } }catch(e){ g=0; body=enc.encode(JSON.stringify({keys,at})); }
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await aesKey(cfg.key),body));
  const ivs=b64e(iv);
  return {text:JSON.stringify({app:'nt-sync',v:2,at,n:n||0,salt:cfg.salt,iv:ivs,gz:g,data:b64e(ct)}), iv:ivs, at};
}
async function unseal(w,rawKey){
  let pt;
  try{ pt=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(w.iv)},await aesKey(rawKey),b64d(w.data))); }
  catch(e){ throw new Error('PASS'); }
  if(w.gz) pt=await pipe(pt,new DecompressionStream('gzip'));
  const o=JSON.parse(dec.decode(pt));
  if(!o || !o.keys || typeof o.keys!=='object') throw new Error('BAD');
  return o;
}

/* ---------- ارتباط با GitHub ---------- */
async function gh(path,opt){
  opt=opt||{};
  const h=Object.assign({'Accept':'application/vnd.github+json'},opt.headers||{});
  if(opt.auth && cfg.token) h['Authorization']='Bearer '+cfg.token;
  if(opt.body) h['Content-Type']='application/json';
  try{ return await fetch(API+path,{method:opt.method||'GET',headers:h,body:opt.body?JSON.stringify(opt.body):undefined,cache:'no-store'}); }
  catch(e){ throw new Error('NET'); }
}
async function bad(res){
  let msg=''; try{ msg=(await res.json()).message||''; }catch(e){}
  const rate = res.status===429 || (res.status===403 && (res.headers.get('x-ratelimit-remaining')==='0' || /rate limit/i.test(msg)));
  const e=new Error(res.status===401?'AUTH':rate?'RATE':(res.status===403||res.status===404)?'PERM':'HTTP');
  e.status=res.status; e.detail=msg; return e;
}
const repoPath=()=>`/repos/${OWNER}/${REPO}`;
async function getRef(){
  const r=await gh(`${repoPath()}/git/ref/tags/${TAG}`,{auth:true});
  if(r.status===404) return null;
  if(!r.ok) throw await bad(r);
  const j=await r.json();
  return (j && j.object && j.object.sha) || null;
}
function parseFile(t){ let w=null; try{ w=JSON.parse(t); }catch(e){} if(!w || w.app!=='nt-sync' || !w.data || !w.iv || !w.salt) throw new Error('BAD'); return w; }
/** at: شناسه دقیق نسخه. با شناسه، GitHub همیشه همان نسخه را می‌دهد؛ با نام برچسب ممکن است چند دقیقه نسخه قبلی را بدهد. */
async function getFile(auth,etag,at){
  const h={'Accept':'application/vnd.github.raw+json'}; if(etag) h['If-None-Match']=etag;
  const r=await gh(`${repoPath()}/contents/${FILE}?ref=${at||TAG}`,{auth,headers:h});
  if(r.status===304) return {same:true};
  if(r.status===404) return {none:true};
  if(!r.ok) throw await bad(r);
  return {w:parseFile(await r.text()), etag:r.headers.get('ETag')||''};
}
async function getRaw(){
  let r; try{ r=await fetch(`${RAW}/${OWNER}/${REPO}/${TAG}/${FILE}?t=${Date.now()}`,{cache:'no-store'}); }catch(e){ throw new Error('NET'); }
  if(r.status===404) return {none:true};
  if(!r.ok) throw new Error('HTTP');
  return {w:parseFile(await r.text()), etag:''};
}
async function getAny(etag){
  try{ return await getFile(false,etag); }
  catch(e){ if(e && e.message==='RATE') return await getRaw(); throw e; }
}
/** پرونده را روی نسخه parent می‌گذارد. اگر در همین فاصله سیستم دیگری ارسال کرده باشد، خطای MOVED می‌دهد
    (چیزی روی نوشته دیگران نوشته نمی‌شود). با force تاریخچه دور ریخته می‌شود تا مخزن بزرگ نشود. */
async function putFile(text,parent,force){
  const P=repoPath()+'/git';
  let r=await gh(P+'/blobs',{method:'POST',auth:true,body:{content:text,encoding:'utf-8'}}); if(!r.ok) throw await bad(r);
  const blob=(await r.json()).sha;
  r=await gh(P+'/trees',{method:'POST',auth:true,body:{tree:[{path:FILE,mode:'100644',type:'blob',sha:blob}]}}); if(!r.ok) throw await bad(r);
  const tree=(await r.json()).sha;
  r=await gh(P+'/commits',{method:'POST',auth:true,body:{message:'nt-data',tree,parents:(parent && !force)?[parent]:[]}}); if(!r.ok) throw await bad(r);
  const commit=(await r.json()).sha;
  if(parent){
    r=await gh(P+'/refs/tags/'+TAG,{method:'PATCH',auth:true,body:{sha:commit,force:!!force}});
    if(r.status===422){ let m=''; try{ m=(await r.clone().json()).message||''; }catch(e){}
      if(/fast.?forward/i.test(m)) throw new Error('MOVED');
      if(/does not exist/i.test(m)) r=await gh(P+'/refs',{method:'POST',auth:true,body:{ref:'refs/tags/'+TAG,sha:commit}}); }
  }else{
    r=await gh(P+'/refs',{method:'POST',auth:true,body:{ref:'refs/tags/'+TAG,sha:commit}});
    if(r.status===422){ let m=''; try{ m=(await r.clone().json()).message||''; }catch(e){} if(/already exists/i.test(m)) throw new Error('MOVED'); }
  }
  if(!r.ok) throw await bad(r);
  return commit;
}
function errText(e){
  const c=e && e.message;
  if(c==='NET')  return 'اینترنت قطع است یا GitHub باز نمی‌شود';
  if(c==='AUTH') return 'کلید دسترسی اشتباه است یا تاریخ آن تمام شده است';
  if(c==='PERM') return 'کلید دسترسی اجازه نوشتن در مخزن ندارد';
  if(c==='RATE') return 'GitHub موقتاً اجازه نمی‌دهد — چند دقیقه بعد دوباره امتحان می‌شود';
  if(c==='PASS') return 'رمز اطلاعات درست نیست';
  if(c==='BAD')  return 'پرونده اطلاعات مشترک خراب است';
  if(c==='FULL') return 'حافظه مرورگر پر است';
  return 'خطا در ارتباط با GitHub'+(e && e.status?' ('+e.status+')':'');
}

/* ---------- نوشتن در این سیستم و تازه کردن زبانه‌ها ---------- */
let frameKeys=null;
function keysOfFrame(i){
  if(!frameKeys) frameKeys=[];
  if(!frameKeys[i]){ const m={}; try{ (srcFor(i).match(/nt_[A-Za-z0-9_]+/g)||[]).forEach(k=>m[k]=1); }catch(e){} frameKeys[i]=m; }
  return frameKeys[i];
}
/* آخرین لحظه‌ای که کاربر در زبانه باز کاری کرده است */
let lastAct=0;
function watchFrame(){
  try{
    const fr=frames[active], w=fr && fr.contentWindow; if(!w || w.__ntW) return;
    const d=w.document; if(!d || d.readyState==='loading') return;
    w.__ntW=1; const hit=()=>{ lastAct=Date.now(); };
    ['input','keydown','pointerdown'].forEach(ev=>d.addEventListener(ev,hit,true));
  }catch(e){}
}
function reloadFrame(i,keepScroll){
  const old=frames[i]; if(!old) return;
  const on=old.classList.contains('on'); let y=0;
  if(keepScroll){ try{ y=old.contentWindow.scrollY||0; }catch(e){} }
  const fr=document.createElement('iframe');
  fr.setAttribute('title',DOCS[i].name); fr.setAttribute('allow','microphone; clipboard-write');
  if(on) fr.classList.add('on');
  old.replaceWith(fr); frames[i]=fr;                 // قاب تازه: بدون پرسش «خارج می‌شوید؟»
  if(on || (i===0 && tabAcc(DOCS[0].name)!=='h')){
    fr.srcdoc=srcFor(i); fr.dataset.loaded='1';
    if(on && y) fr.addEventListener('load',()=>setTimeout(()=>{ try{ fr.contentWindow.scrollTo(0,y); }catch(e){} },120),{once:true});
  }
}
let deferSince=0;
/** کاربر در زبانه باز، در یک کادر چیزی نوشته و هنوز همان‌جا است؟ */
function typing(){
  try{ const a=frames[active].contentDocument.activeElement;
       return !!(a && /^(INPUT|TEXTAREA)$/.test(a.tagName) && !/^(checkbox|radio|button|submit)$/i.test(a.type||'') && a.value); }catch(e){ return false; }
}
/** اطلاعات این سیستم را با keys یکی می‌کند. اگر کاربر همین حالا در زبانه‌ای که باید تازه شود کار می‌کند، false برمی‌گرداند (کمی بعد). */
function applyKeys(keys,opt){
  opt=opt||{};
  const cur=collect(), changed={};
  Object.keys(cur).forEach(k=>{ if(!(k in keys)) changed[k]=1; });
  Object.keys(keys).forEach(k=>{ if(cur[k]!==keys[k]) changed[k]=1; });
  if(!Object.keys(changed).length){ deferSince=0; return true; }
  const hit=[]; let isBooted=true; try{ isBooted=!!ntBooted; }catch(e){}
  /* زبانه «امروز» بیشتر اطلاعات را فقط می‌خواند و خودش تازه می‌شود؛ فقط وقتی یادداشت‌های خودش عوض شده دوباره باز می‌شود */
  const own0=TABKEYS[DOCS[0].name]||null;
  try{ frames.forEach((f,i)=>{ if(!f.dataset.loaded) return;
    const ks=(i===0 && own0)?own0:Object.keys(keysOfFrame(i));
    if(ks.some(k=>changed[k])) hit.push(i); }); }catch(e){}
  if(!opt.now && isBooted && !document.hidden && hit.indexOf(active)>-1){
    const now=Date.now(); if(!deferSince) deferSince=now;
    if((now-lastAct<T.busy || typing()) && now-deferSince<T.maxDefer) return false;
  }
  deferSince=0;
  if(opt.keepPrev && total(cur)>0) lsSet(PREV,{at:Date.now(),keys:cur});
  const write=()=>{
    Object.keys(cur).forEach(k=>{ if(!(k in keys)) localStorage.removeItem(k); });
    Object.keys(keys).forEach(k=>{ if(localStorage.getItem(k)!==keys[k]) localStorage.setItem(k,keys[k]); });
  };
  try{ localStorage.setItem('ntbak_lock',String(Date.now())); }catch(e){}
  let ok=true;
  try{ write(); }
  catch(e){
    try{ localStorage.removeItem(PREV); write(); }
    catch(e2){ ok=false; try{ Object.keys(collect()).forEach(k=>localStorage.removeItem(k)); Object.keys(cur).forEach(k=>localStorage.setItem(k,cur[k])); }catch(e3){} }
  }
  try{ localStorage.removeItem('ntbak_lock'); }catch(e){}
  if(!ok) throw new Error('FULL');
  try{ hit.forEach(i=>reloadFrame(i,true)); badges();
       if(hit.indexOf(0)<0 && frames[0].dataset.loaded) frames[0].contentWindow.postMessage({nt:'show'},'*'); }catch(e){}
  return true;
}

/* ---------- وضعیت روی صفحه ---------- */
let lastErr=null;      // آخرین خطا (برای نمایش در پنجره وضعیت)
let needCode=false;   // کلید یا رمز عوض شده: این کاربر کد اتصال جدید لازم دارد
let phase='', note='', busy=false, conflict=null, incoming=null, waiting=false, lastPush=0, lastChk=0, changedAt=0, dirtyAt=0, mayDirty=true, tip='';
function toast(t,isBad){
  const el=$('ntSyToast'); if(!el) return;
  el.textContent=t; el.className='sytoast'+(isBad?' bad':''); el.hidden=false;
  clearTimeout(toast._t); toast._t=setTimeout(()=>{ el.hidden=true; },isBad?6000:3500);
}
const CLOUD='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 10.5a3.75 3.75 0 0 1-.25 7.5H7z"></path></svg>';
function paint(){
  const b=$('ntSyBtn'), bar=$('ntSyBar'), s=st(), m=mode();
  if(!b) return;
  let cls='', txt='اطلاعات مشترک';
  if(m==='w'){
    if(conflict){ cls='err'; txt='نیاز به انتخاب'; }
    else if(phase==='busy'){ cls='busy'; txt='در حال همگام‌سازی…'; }
    else if(phase==='err'){ cls='err'; txt='همگام نشد'; }
    else if(phase==='off'){ cls='busy'; txt='بدون اینترنت'; }
    else { cls='ok'; txt=s.at?'همگام '+fmtAt(s.at).replace('امروز ',''):'ثبت‌کننده'; }
  }else if(m==='v'){
    if(phase==='busy'){ cls='busy'; txt='در حال دریافت…'; }
    else if(phase==='err'){ cls='err'; txt='دریافت نشد'; }
    else if(phase==='off'){ cls='busy'; txt='بدون اینترنت'; }
    else { cls='ok'; txt='مشاهده'; }
  }
  /* فرزندان دکمه یک بار ساخته می‌شوند؛ اگر وسط کلیک عوض شوند، کلیک گم می‌شود */
  let tx=b.querySelector('.tx');
  if(!tx || !b.querySelector('svg')){ b.innerHTML='<span class="d"></span>'+CLOUD+'<span class="tx"></span>'; tx=b.querySelector('.tx'); }
  if(b.className!=='sybtn '+cls) b.className='sybtn '+cls;
  if(tx.textContent!==txt){ tx.textContent=txt; b.setAttribute('aria-label','اطلاعات مشترک: '+txt); }
  b.title = m==='w'?(cfg.uid?'کاربر: '+(cfg.uname||''):isAdmin()?'سیستم مدیر':'این سیستم ثبت‌کننده است'):m==='v'?'این سیستم فقط مشاهده می‌کند':'اتصال به اطلاعات مشترک';
  /* نوار زیر زبانه‌ها */
  let show=false, bc='', bt='', bb='', act=null;
  if(m==='w' && conflict){ show=true; bc='err'; bt='اطلاعات مشترک با اطلاعات این سیستم فرق دارد. همگام‌سازی متوقف است.'; bb='انتخاب'; act=()=>viewConflict(); }
  else if((m==='w' || m==='v') && phase==='off'){ show=true; bc='new'; bb='تلاش دوباره'; act=()=>sync({manual:true});
    bt=m==='w'?'اینترنت نیست. ثبت‌ها روی همین گوشی ذخیره می‌شود و وقتی اینترنت آمد، خودکار فرستاده می‌شود.'+(unsent()?' (ثبت ارسال‌نشده دارد)':'')
             :'اینترنت نیست. اطلاعات آخرین دریافت نشان داده می‌شود: '+fmtAt(s.at); }
  else if((m==='w' || m==='v') && phase==='err'){ show=true; bc='err'; bt=(m==='w'?'همگام نشد — ':'دریافت نشد — ')+note+(m==='v'?'. اطلاعات نشان داده شده: '+fmtAt(s.at):''); bb='تلاش دوباره'; act=()=>sync({manual:true}); if(needCode){ bb='وارد کردن کد'; act=()=>viewJoin(''); } }
  else if((m==='w' || m==='v') && waiting){ show=true; bc='new'; bt='اطلاعات جدید رسید.'; bb='نمایش'; act=()=>sync({now:true}); }
  else if(m==='w' && tip){ show=true; bc='new'; bt=tip; bb='دیدم'; act=()=>{ tip=''; paint(); }; }
  else if(m==='v'){ show=true; bt='حالت مشاهده — آخرین اطلاعات: '+fmtAt(s.at)+(s.at?'':' (هنوز دریافت نشده)'); bb='تازه‌سازی'; act=()=>sync({manual:true}); }
  if(bar.hidden!==!show) bar.hidden=!show;
  const bcl='sybar'+(bc?' '+bc:''); if(bar.className!==bcl) bar.className=bcl;
  const btEl=$('ntSyBarT'); if(btEl.textContent!==bt) btEl.textContent=bt;
  const bbEl=$('ntSyBarB'); if(bbEl.hidden!==!bb) bbEl.hidden=!bb; if(bbEl.textContent!==bb) bbEl.textContent=bb; bbEl.onclick=act;
}
function setPhase(p,n){ phase=p; note=n||''; paint(); }

/* ---------- همگام‌سازی ---------- */
/** اطلاعات مشترک را می‌گیرد (اگر تغییر کرده)، با این سیستم ادغام می‌کند، و اگر این سیستم چیز تازه‌ای دارد می‌فرستد. */
async function sync(opt){
  opt=opt||{}; if(opt.manual) opt.verify=true;
  const m=mode();
  if((m!=='w' && m!=='v') || busy || (conflict && !opt.resolve)) return;
  busy=true; if(!waiting) setPhase('busy');
  let again=false;
  try{
    lastChk=Date.now();
    /* ۱) اطلاعات مشترک فعلی */
    let ref=null, s=st();
    const reuse = waiting && incoming && !opt.manual && Date.now()-incoming.t<30000;   // کاربر مشغول بود: همان که گرفته شده
    if(reuse){ ref=incoming.ref||null; }
    else if(m==='w'){
      ref=await getRef();
      if(opt.replace) incoming=null;                     // رمز جدید: اطلاعات مشترک قبلی خوانده نمی‌شود
      else if(ref && (ref!==s.sha || opt.verify) && !(incoming && incoming.ref===ref)){
        const f=await getFile(true,'',ref);
        if(f.none) ref=null;
        else if(ref===s.sha && f.w.iv===s.iv){ /* همان است که این سیستم دارد */ }
        else{ const o=await unseal(f.w,cfg.key); incoming={keys:pick(o.keys),ref,iv:f.w.iv,at:f.w.at,n:f.w.n||0,t:Date.now(),fix:ref===s.sha}; }
      }
      if(!ref || (ref===s.sha && !(incoming && incoming.fix && incoming.ref===ref))) incoming=null;
    }else{
      const f=await getAny(opt.manual?'':s.etag);
      if(f.none){ busy=false; setPhase('err','اطلاعات مشترک هنوز ارسال نشده است'); return; }
      if(f.same || f.w.iv===s.iv){ if(f.etag) stSet({etag:f.etag}); incoming=null; }
      else{
        if(f.w.salt!==cfg.salt) throw new Error('PASS');
        const o=await unseal(f.w,cfg.key); incoming={keys:pick(o.keys),ref:'',iv:f.w.iv,at:f.w.at,etag:f.etag,n:f.w.n||0,t:Date.now()};
      }
    }
    /* ۲) ادغام اطلاعات تازه در این سیستم */
    let base=baseGet(), local=collect();
    if(incoming){
      const first=!s.iv && !s.sha;                       // این سیستم تا حالا همگام نشده است
      if(m==='w' && fullWriter() && !base && !opt.resolve && total(local)>0 && hashOf(incoming.keys)!==hashOf(local)){
        conflict=incoming; busy=false; waiting=false; setPhase('ok'); viewConflict(); return;
      }
      if(opt.resolve==='give') base=incoming.keys;       // اطلاعات این سیستم جای اطلاعات مشترک را می‌گیرد
      let merged;
      mergeNote={};
      if(opt.resolve==='take' || m==='v') merged=incoming.keys;
      else if(opt.resolve==='give') merged=outgoing(local,incoming.keys);
      else merged=mergeAll(base||{},local,incoming.keys);
      if(!applyKeys(merged,{now:opt.now||opt.manual||first||!!opt.resolve,keepPrev:first||opt.resolve==='take'})){
        waiting=true; busy=false; setPhase('ok'); return;                  // کاربر مشغول است: کمی بعد
      }
      waiting=false; conflict=null;
      /* فقط «آخرین اتصال» یا لیست کاربران عوض شده؟ پس پیامی لازم نیست */
      const real=Object.keys(Object.assign({},local,merged)).some(k=>!QUIET[k] && local[k]!==merged[k]);
      baseSet(incoming.keys);
      stSet({sha:incoming.ref||s.sha||'',iv:incoming.iv,at:incoming.at,n:incoming.n,hash:hashOf(incoming.keys),etag:incoming.etag||s.etag||''});
      const dup=Object.keys(mergeNote);
      if(dup.length) tip='در «'+dup.map(k=>LABEL[k]||k).join('»، «')+'» دو سیستم هم‌زمان یک ردیف را تغییر داده بودند. آن بخش را بررسی کنید؛ اگر ردیفی دو بار آمده، نسخه اضافه را پاک کنید.';
      else if(!first && !opt.resolve && m==='w'){ if(real) toast('اطلاعات جدید از سیستم دیگر رسید'); }
      else if(m==='v' && !first && real) toast('اطلاعات جدید نشان داده شد — '+fmtAt(incoming.at));
      incoming=null; local=collect(); base=baseGet(); s=st();
    }
    /* ۳) ارسال نوشته‌های این سیستم */
    if(m==='w'){
      if(!isAdmin() && base && local[UKEY]!==base[UKEY]){    // لیست کاربران فقط از مدیر می‌آید
        try{ if(base[UKEY]===undefined) localStorage.removeItem(UKEY); else localStorage.setItem(UKEY,base[UKEY]); }catch(e){}
        local=collect();
      }
      let out=outgoing(local,base||{}), h=hashOf(out);
      if(touchSeen(h!==s.hash)){ local=collect(); out=outgoing(local,base||{}); h=hashOf(out); }
      const must = !ref || h!==s.hash || opt.replace;
      if(must){
        const now=Date.now();
        const hold = !opt.force && !opt.manual && !opt.resolve && ref && ((lastPush && now-lastPush<T.gap) || (now-changedAt<T.deb && now-(dirtyAt||now)<T.maxWait));
        if(hold){ mayDirty=true; if(!dirtyAt) dirtyAt=now; }
        else{
          const n=((s.n||0)+1), squash=n>=T.squash || opt.replace;
          const z=await seal(out,squash?0:n);
          let sha;
          try{ sha=await putFile(z.text,ref,squash); }
          catch(e){ if(e && e.message==='MOVED'){ again=true; sha=null; } else throw e; }
          if(sha){
            baseSet(out); stSet({sha,hash:h,iv:z.iv,at:z.at,n:squash?0:n,sent:z.at}); lastPush=Date.now(); dirtyAt=0;
          }
        }
      }else{ dirtyAt=0; if(!base) baseSet(out); }
    }
    if(!again){ needCode=false; setPhase('ok'); }
  }catch(e){
    const c=e && e.message;
    if(cfg.uid && (c==='PASS' || c==='AUTH')){ needCode=true; setPhase('err','کلید یا رمز اطلاعات عوض شده است. از مدیر کد اتصال جدید بگیرید'); }
    else if(c==='PASS'){ setPhase('err','رمز اطلاعات مشترک عوض شده است'); viewPass(m); }
    else if(c==='NET') setPhase('off',errText(e));     // بدون اینترنت: ثبت‌ها روی همین سیستم می‌ماند و بعداً فرستاده می‌شود
    else setPhase('err',errText(e));
    lastErr={t:note,at:Date.now()};
  }finally{ busy=false; }
  if(!again && phase==='ok' && !checkMe()) return;
  if(again && (opt._n||0)<4) return sync(Object.assign({},opt,{_n:(opt._n||0)+1,replace:false}));
  if(opt.manual && phase==='ok' && !waiting) toast(m==='v'?'اطلاعات به‌روز است — '+fmtAt(st().at):'همگام شد — '+fmtAt(st().at));
}
/** این سیستم نوشته‌ای دارد که هنوز ارسال نشده است؟ */
function unsent(){ try{ return hashOf(outgoing(collect(),baseGet()||{}))!==st().hash; }catch(e){ return false; } }
function tick(){
  watchFrame();
  const m=mode(); if((m!=='w' && m!=='v') || busy || conflict) return;
  const now=Date.now();
  if(waiting){ sync({}); return; }
  if(phase==='err' || phase==='off'){ if(now-lastChk>(phase==='off'?Math.min(T.retry,30000):T.retry)) sync({}); return; }
  if(document.hidden) { if(m==='v') return; }
  if(now-lastChk >= (m==='w'?T.pollW:T.poll)){ sync({}); return; }
  if(m!=='w' || !mayDirty) return;
  const h=hashOf(outgoing(collect(),baseGet()||{}));
  if(h===st().hash){ mayDirty=false; dirtyAt=0; return; }
  if(!dirtyAt) dirtyAt=now;
  const quiet = now-changedAt>=T.deb, late = now-dirtyAt>=T.maxWait;
  if((quiet || late) && now-lastPush>=T.gap) sync({});
}

/* ---------- پنجره تنظیم ---------- */
function dlg(title,html){ $('ntSyH').textContent=title; $('ntSyBody').innerHTML=html; $('ntSyDlg').hidden=false; try{ $('ntSyDlg').scrollTop=0; }catch(e){} }
function dlgClose(){ $('ntSyDlg').hidden=true; $('ntSyBody').innerHTML=''; }
function msg(t,isBad){ const el=$('syMsg'); if(el){ el.textContent=t||''; el.className='symsg'+(isBad?' bad':''); if(t){ try{ el.scrollIntoView({block:'nearest'}); }catch(e){} } } }
function on(id,fn){ const el=$(id); if(el) el.addEventListener('click',fn); }
/** دکمه‌ای که برای کارهای برگشت‌ناپذیر باید دو بار زده شود */
function armEl(el,again,fn){
  if(!el) return; const t0=el.textContent; let t=null;
  el.addEventListener('click',()=>{
    if(t){ clearTimeout(t); t=null; el.textContent=t0; fn(); return; }
    el.textContent=again; t=setTimeout(()=>{ t=null; el.textContent=t0; },5000);
  });
}
const arm=(id,again,fn)=>armEl($(id),again,fn);
function lock(v){ document.querySelectorAll('#ntSyBody button').forEach(b=>{ if(b.id!=='syClose') b.disabled=v; }); }
const showBox='<label class="chk"><input type="checkbox" id="syShow">نمایش رمزها</label>';
function bindShow(){ const c=$('syShow'); if(c) c.addEventListener('change',()=>document.querySelectorAll('#ntSyBody input[data-p]').forEach(i=>i.type=c.checked?'text':'password')); }
const NOCRYPTO='<div class="symsg bad">این مرورگر رمزگذاری را پشتیبانی نمی‌کند. سامانه را با مرورگر Edge یا Chrome و از آدرس اینترنتی باز کنید.</div>';
async function copyText(t){
  try{ if(navigator.clipboard && window.isSecureContext){ await navigator.clipboard.writeText(t); return true; } }catch(e){}
  try{ const ta=document.createElement('textarea'); ta.value=t; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;top:0;left:0;opacity:0';
       document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0,t.length); const ok=document.execCommand('copy'); ta.remove(); return ok; }catch(e){ return false; }
}

/* ---------- کاربران ---------- */
function usersGet(src){
  try{ const o=JSON.parse((src===undefined?localStorage.getItem(UKEY):src)||'null'); return (o && isObj(o.users))?o.users:null; }catch(e){ return null; }
}
function usersSet(users){
  try{ localStorage.setItem(UKEY,JSON.stringify({users})); }catch(e){ toast('ذخیره نشد — حافظه مرورگر پر است',true); return; }
  mayDirty=true; changedAt=0; sync({force:true});
}
function seenGet(){ try{ const o=JSON.parse(localStorage.getItem(SKEY)||'null'); return isObj(o)?o:{}; }catch(e){ return {}; } }
function devLabel(){
  const u=navigator.userAgent||'';
  return /Android/i.test(u)?'اندروید':/iPhone|iPad/i.test(u)?'آیفون':/Windows/i.test(u)?'ویندوز':/Mac/i.test(u)?'مک':'دستگاه دیگر';
}
/** این سیستم «آخرین اتصال» خودش را ثبت می‌کند (هر ۱۵ دقیقه، یا همراه ارسال بعدی) */
function touchSeen(dirty){
  if(!cfg.uid) return false;
  const seen=seenGet(), mine=seen[cfg.uid], age=mine&&mine.at?Date.now()-Date.parse(mine.at):Infinity;
  if(!(age>=T.seen || (dirty && age>=T.seenMin))) return false;
  seen[cfg.uid]={at:new Date().toISOString(),dev:devLabel()};
  try{ localStorage.setItem(SKEY,JSON.stringify(seen)); }catch(e){ return false; }
  return true;
}
function accText(a){
  if(!a) return 'کامل (همه زبانه‌ها)';
  const w=[], r=[]; DOCS.forEach(d=>{ if(a[d.name]==='w') w.push(d.name); else if(a[d.name]==='r') r.push(d.name); });
  return ((w.length?'ثبت: '+w.join('، '):'')+(w.length&&r.length?' · ':'')+(r.length?'مشاهده: '+r.join('، '):'')) || 'بدون دسترسی';
}
/** بعد از هر همگام‌سازی: دسترسی این سیستم همان است که مدیر تعیین کرده؟ */
function checkMe(){
  if(!cfg.uid || mode()!=='w') return true;
  const b=baseGet(), U=b?usersGet(b[UKEY]||''):null;      // از آخرین نسخه اطلاعات مشترک، نه از نسخه این سیستم
  if(!U) return true;                                     // لیست کاربران در دسترس نیست: چیزی عوض نمی‌شود
  const me=U[cfg.uid];
  if(!me || me.off){ revoke(); return false; }
  const a=isObj(me.acl)?me.acl:null, dv=Array.isArray(me.dev)&&me.dev.length?me.dev:null;
  if(J(a)!==J(acl()) || (me.name||'')!==(cfg.uname||'') || J(dv)!==J(cfg.devs||null)){
    if(a) cfg.acl=a; else delete cfg.acl;
    if(dv) cfg.devs=dv; else delete cfg.devs;
    cfg.uname=me.name||''; lsSet(CFG,cfg);
    toast('دسترسی این سیستم تغییر کرد — سامانه دوباره باز می‌شود'); setTimeout(()=>location.reload(),900);
    return false;
  }
  return true;
}
/** مدیر دسترسی را قطع کرده است: اطلاعات از این سیستم برداشته می‌شود */
function revoke(){
  try{ Object.keys(collect()).forEach(k=>localStorage.removeItem(k)); [STK,BASE,PREV].forEach(k=>localStorage.removeItem(k)); }catch(e){}
  cfg={mode:'off',revoked:1}; lsSet(CFG,cfg);
  location.reload();
}

/* --- کد اتصال: کلید و رمز اطلاعات، قفل‌شده با رمز ۶ رقمی --- */
const u64e=u8=>b64e(u8).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const u64d=s=>b64d(s.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((s.length+3)%4));
const pinNorm=p=>normPass(p).replace(/\D/g,'');
async function pinKey(pin,salt){
  const km=await crypto.subtle.importKey('raw',enc.encode(pinNorm(pin)),'PBKDF2',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:400000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function codeMake(uid,pin){
  const salt=crypto.getRandomValues(new Uint8Array(16)), iv=crypto.getRandomValues(new Uint8Array(12));
  const body=enc.encode(JSON.stringify({v:1,o:OWNER,r:REPO,t:cfg.token,k:cfg.key,s:cfg.salt,u:uid}));
  const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await pinKey(pin,salt),body));
  return 'NT1.'+u64e(salt)+'.'+u64e(iv)+'.'+u64e(ct);
}
const CODE_RE=/NT1\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{20,}/;
function codeFind(t){ const m=CODE_RE.exec(String(t||'').replace(/[\s​-‏‪-‮⁦-⁩]+/g,'')); return m?m[0]:''; }
async function codeOpen(code,pin){
  const p=code.split('.');
  let pt;
  try{ pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:u64d(p[2])},await pinKey(pin,u64d(p[1])),u64d(p[3])); }catch(e){ throw new Error('PIN'); }
  const o=JSON.parse(dec.decode(pt));
  if(!o || !o.t || !o.k || !o.s || !o.u) throw new Error('PIN');
  return o;
}
/** لینک اتصال همیشه به آدرس اینترنتی سامانه اشاره می‌کند (نه به پرونده روی همین سیستم) */
const joinLink=code=>(/^https?:$/.test(location.protocol)?location.href.split('#')[0].split('?')[0]:'https://'+OWNER+'.github.io/'+REPO+'/'+encodeURIComponent('سامانه-نت.html'))+'#join='+code;
function hashCode(){
  const m=/[#&]join=([^&]+)/.exec(location.hash||''); if(!m) return '';
  try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){}
  try{ return codeFind(decodeURIComponent(m[1])); }catch(e){ return ''; }
}
function viewJoin(code){
  const locked=!!window.ntLocked;
  dlg(locked?'ورود به سامانه':'اتصال به اطلاعات مشترک',`
    ${cfg.revoked?'<div class="symsg bad">دسترسی این سیستم قطع شده است. برای اتصال دوباره، از مدیر کد اتصال جدید بگیرید.</div>':''}
    ${needCode?'<div class="symsg bad">کلید یا رمز اطلاعات عوض شده است. از مدیر کد اتصال جدید بگیرید.</div>':''}
    <p>${code?'کد اتصال از لینک خوانده شد. رمز ۶ رقمی را که از مدیر گرفته‌اید وارد کنید.':'کد اتصال و رمز ۶ رقمی را که از مدیر گرفته‌اید وارد کنید.'}</p>
    ${hasCrypto()?'':NOCRYPTO}
    <div class="symsg" id="syMsg"></div>
    <label ${code?'hidden':''}>کد اتصال (یا لینک اتصال)<textarea id="syCode" rows="3" dir="ltr" spellcheck="false" autocomplete="off">${esc(code||'')}</textarea></label>
    <label>رمز ۶ رقمی<input id="syPin" type="text" inputmode="numeric" autocomplete="off" maxlength="12"></label>
    <button type="button" class="go" id="syJoin">اتصال</button>
    ${mode()==='w'||mode()==='v'?'<small>با اتصال، تنظیم قبلی این سیستم جایگزین می‌شود.</small>':''}
    <button type="button" id="syOther">سیستم مدیر، یا مشاهده با رمز اطلاعات…</button>
    ${locked?'':'<button type="button" id="syClose">بستن</button>'}`);
  on('syJoin',join);
  $('syPin').addEventListener('keydown',e=>{ if(e.key==='Enter') join(); });
  on('syOther',viewSetup);
  on('syClose',dlgClose);
  try{ (code?$('syPin'):$('syCode')).focus(); }catch(e){}
}
async function join(){
  if(!hasCrypto()) return;
  const code=codeFind($('syCode').value), pin=pinNorm($('syPin').value);
  if(!code){ msg('کد اتصال درست نیست. کد را کامل کپی کنید.',true); return; }
  if(pin.length<6){ msg('رمز ۶ رقمی را وارد کنید',true); return; }
  lock(true); msg('در حال اتصال…');
  const keep=cfg, ko=OWNER, kr=REPO;
  const fail=t=>{ cfg=keep; OWNER=ko; REPO=kr; lsSet(CFG,cfg); lock(false); msg(t,true); };
  try{
    let c; try{ c=await codeOpen(code,pin); }catch(e){ return fail('رمز ۶ رقمی یا کد اتصال درست نیست'); }
    if(c.o) OWNER=c.o; if(c.r) REPO=c.r;
    cfg={token:c.t,key:c.k,salt:c.s};
    const ref0=await getRef();
    const f=ref0?await getFile(true,'',ref0):{none:true};
    if(f.none) return fail('اطلاعات مشترک پیدا نشد');
    let o; try{ if(f.w.salt!==c.s) throw new Error('PASS'); o=await unseal(f.w,c.k); }catch(e){ return fail('این کد قدیمی است. از مدیر کد اتصال جدید بگیرید.'); }
    const U=usersGet(o.keys[UKEY]||''), me=U && U[c.u];
    if(!me || me.off) return fail('این کد دیگر معتبر نیست. از مدیر کد اتصال جدید بگیرید.');
    cfg={mode:'w',token:c.t,key:c.k,salt:c.s,uid:c.u,uname:me.name||'',o:OWNER,r:REPO}; if(isObj(me.acl)) cfg.acl=me.acl;
    lsSet(CFG,cfg); lsSet(STK,{}); try{ localStorage.removeItem(BASE); }catch(e){}
    incoming=null; conflict=null; waiting=false; needCode=false;
    await sync({force:true});
    if((phase==='err'||phase==='off')){ const n=note; lsSet(STK,{}); return fail(n); }
    if(conflict) return;
    toast('وصل شد — سامانه دوباره باز می‌شود'); setTimeout(()=>location.reload(),700);
  }catch(e){ fail(e && e.message==='AUTH'?'این کد دیگر معتبر نیست (کلید باطل شده است). از مدیر کد جدید بگیرید.':errText(e)); }
}

/* --- لیست کاربران (فقط سیستم مدیر) --- */
function viewUsers(){
  const U=usersGet()||{}, S=seenGet();
  const ids=Object.keys(U).sort((a,b)=>String(U[a].name||'').localeCompare(String(U[b].name||''),'fa'));
  dlg('کاربران',`
    <div class="symsg" id="syMsg"></div>
    ${ids.length?ids.map(id=>{ const u=U[id], s=S[id];
      return `<div class="syuser${u.off?' off':''}" data-id="${esc(id)}">
        <b>${esc(u.name||'بدون نام')}${u.off?'<span class="sychip">قطع شده</span>':''}</b>
        <small>${Array.isArray(u.dev)&&u.dev.length?'راننده — فقط '+esc(u.dev.join('، ')):esc(accText(isObj(u.acl)?u.acl:null))}</small>
        <small>آخرین اتصال: ${s&&s.at?esc(fmtAt(s.at))+(s.dev?' ('+esc(s.dev)+')':''):'هنوز وصل نشده'}</small>
        <div class="syub"><button type="button" data-act="code">کد اتصال</button><button type="button" data-act="edit">دسترسی</button><button type="button" data-act="off">${u.off?'وصل دوباره':'قطع دسترسی'}</button><button type="button" class="warn" data-act="del">حذف</button></div>
      </div>`; }).join(''):'<p>هنوز کاربری ساخته نشده است. برای هر همکار یا هر سیستم، یک کاربر بسازید.</p>'}
    <button type="button" class="go" id="syUNew">کاربر جدید</button>
    <button type="button" id="syURef">تازه‌سازی لیست</button>
    <small>«آخرین اتصال» حدود ۱۵ دقیقه دقت دارد. سیستم‌هایی که فقط با رمز اطلاعات وصل شده‌اند در این لیست نیستند.</small>
    <button type="button" id="syBack">بازگشت</button>`);
  document.querySelectorAll('#ntSyBody .syuser').forEach(row=>{
    const id=row.dataset.id;
    row.querySelector('[data-act="code"]').addEventListener('click',()=>{ if(U[id].off){ msg('این کاربر قطع شده است. اول «وصل دوباره» را بزنید.',true); return; } viewCode(id); });
    row.querySelector('[data-act="edit"]').addEventListener('click',()=>viewUserEdit(id));
    row.querySelector('[data-act="off"]').addEventListener('click',()=>{ const X=usersGet()||{}; if(!X[id]) return; if(X[id].off) delete X[id].off; else X[id].off=true; usersSet(X); viewUsers(); toast(X[id].off?'دسترسی «'+X[id].name+'» قطع شد':'«'+X[id].name+'» دوباره وصل شد'); });
    armEl(row.querySelector('[data-act="del"]'),'حذف شود؟',()=>{ const X=usersGet()||{}; delete X[id]; usersSet(X); viewUsers(); toast('کاربر حذف شد'); });
  });
  on('syUNew',()=>viewUserEdit(null));
  on('syURef',async()=>{ lock(true); await sync({manual:true}); viewUsers(); });
  on('syBack',viewMain);
}
function viewUserEdit(id){
  const U=usersGet()||{}, u=id?U[id]:null, cur=u&&isObj(u.acl)?u.acl:null, lim=u?!!cur:true, a=cur||PRESET;
  dlg(u?'دسترسی کاربر':'کاربر جدید',`
    <div class="symsg" id="syMsg"></div>
    <label>نام کاربر یا سیستم<input id="syUName" type="text" autocomplete="off" maxlength="40" value="${esc(u?u.name:'')}" placeholder="مثلاً: استخراج — شیفت صبح" style="direction:rtl;text-align:right"></label>
    <div class="sycard"><h3>راننده (فقط یک دستگاه)</h3>
      <label>دستگاه<select id="syUDev" style="display:block;width:100%;margin-top:3px"><option value="">— کاربر عادی (همه دستگاه‌ها) —</option>${devList().map(n=>`<option ${u&&Array.isArray(u.dev)&&u.dev[0]===n?'selected':''}>${esc(n)}</option>`).join('')}</select></label>
      <small>راننده هیچ زبانه‌ای نمی‌بیند؛ فقط صفحه دستگاه خودش: ثبت قرائت، شروع و پایان توقف، ثبت مشکل.</small></div>
    <div class="sycard" id="syAccCard"><h3>دسترسی</h3>
      <label class="chk"><input type="radio" name="syAcc" value="lim" ${lim?'checked':''}>محدود — فقط زبانه‌های انتخاب‌شده</label>
      <label class="chk"><input type="radio" name="syAcc" value="full" ${lim?'':'checked'}>کامل — همه زبانه‌ها (ثبت در همه)</label>
      <div id="syAclList" ${lim?'':'hidden'}>
        ${DOCS.map((d,i)=>`<div class="syrow"><span>${esc(d.name)}</span><select data-tab="${i}" aria-label="دسترسی ${esc(d.name)}">
          ${[['w','ثبت'],['r','فقط مشاهده'],['h','پنهان']].map(o=>`<option value="${o[0]}" ${(a[d.name]||'h')===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select></div>`).join('')}
      </div></div>
    <button type="button" class="go" id="syUSave">${u?'ذخیره':'ساخت کاربر و کد اتصال'}</button>
    <button type="button" id="syBack">انصراف</button>`);
  document.querySelectorAll('input[name="syAcc"]').forEach(r=>r.addEventListener('change',()=>{ $('syAclList').hidden=document.querySelector('input[name="syAcc"]:checked').value!=='lim'; }));
  const dvSync=()=>{ $('syAccCard').hidden=!!$('syUDev').value; }; $('syUDev').addEventListener('change',dvSync); dvSync();
  on('syUSave',()=>{
    const name=$('syUName').value.trim().replace(/\s+/g,' ');
    if(!name){ msg('نام کاربر را بنویسید',true); return; }
    const X=usersGet()||{};
    if(Object.keys(X).some(k=>k!==id && (X[k].name||'')===name)){ msg('کاربری با همین نام هست. نام دیگری بنویسید.',true); return; }
    let ac=null; const dev=$('syUDev').value;
    if(dev) ac=Object.assign({},DRIVER);
    else if(document.querySelector('input[name="syAcc"]:checked').value==='lim'){
      ac={}; let vis=0;
      document.querySelectorAll('#syAclList select').forEach(s=>{ ac[DOCS[+s.dataset.tab].name]=s.value; if(s.value!=='h') vis++; });
      if(!vis){ msg('حداقل یک زبانه باید «ثبت» یا «فقط مشاهده» باشد',true); return; }
    }
    const nid=id || ('u'+Date.now().toString(36)+Math.random().toString(36).slice(2,6));
    X[nid]=Object.assign({},X[nid]||{id:nid,made:new Date().toISOString()},{name});
    if(ac) X[nid].acl=ac; else delete X[nid].acl;
    if(dev) X[nid].dev=[dev]; else delete X[nid].dev;
    usersSet(X);
    if(id){ viewUsers(); toast('ذخیره شد — تا ۲ دقیقه دیگر در سیستم کاربر اجرا می‌شود'); } else viewCode(nid);
  });
  on('syBack',viewUsers);
}
async function viewCode(id){
  const U=usersGet()||{}, u=U[id]; if(!u) return viewUsers();
  dlg('کد اتصال',`<p>در حال ساخت کد…</p>`);
  const d=crypto.getRandomValues(new Uint32Array(1))[0]%1000000, pin=String(d).padStart(6,'0');
  let code=''; try{ code=await codeMake(id,pin); }catch(e){ dlg('کد اتصال','<div class="symsg bad">کد ساخته نشد.</div><button type="button" id="syBack">بازگشت</button>'); on('syBack',viewUsers); return; }
  const link=joinLink(code);
  dlg('کد اتصال',`
    <p>برای «${esc(u.name)}»: لینک را بفرستید و رمز ۶ رقمی را <b>تلفنی یا حضوری</b> بگویید.</p>
    <div class="symsg" id="syMsg"></div>
    <label>لینک اتصال<textarea id="syLink" rows="4" dir="ltr" readonly>${esc(link)}</textarea></label>
    <button type="button" class="go" id="syCopyL">کپی لینک اتصال</button>
    <button type="button" id="syCopyC">کپی فقط کد (بدون لینک)</button>
    <div class="sypin">رمز ۶ رقمی<b id="syPinOut" dir="ltr">${pin.slice(0,3)} ${pin.slice(3)}</b></div>
    <small>همکار لینک را باز می‌کند و رمز ۶ رقمی را وارد می‌کند. این رمز فقط همین‌جا دیده می‌شود. اگر گم شد، دوباره «کد اتصال» را بزنید تا لینک و رمز تازه ساخته شود.</small>
    <small>هر کسی لینک و رمز را با هم داشته باشد، با دسترسی این کاربر وصل می‌شود.</small>
    <button type="button" id="syBack">بازگشت به کاربران</button>`);
  on('syCopyL',async()=>msg(await copyText(link)?'لینک کپی شد':'کپی نشد — متن لینک را خودتان انتخاب و کپی کنید',false));
  on('syCopyC',async()=>msg(await copyText(code)?'کد کپی شد':'کپی نشد',false));
  on('syBack',viewUsers);
}

/* --- پنجره اصلی --- */
function viewMain(){
  const m=mode(), s=st();
  if(m!=='w' && m!=='v'){ if(window.ntLocked) viewJoin(''); else viewSetup(); return; }
  const admin=isAdmin(), U=usersGet()||{}, nU=Object.keys(U).length;
  const who = admin?'این سیستم، سیستم مدیر است.':cfg.uid?'کاربر: '+(cfg.uname||'—'):m==='v'?'این سیستم فقط مشاهده می‌کند.':'این سیستم ثبت‌کننده است.';
  dlg('اطلاعات مشترک',`
    <div class="sykv"><b>${esc(who)}</b>${cfg.uid?'دسترسی: '+esc(accText(acl()))+'<br>':''}آخرین همگام‌سازی: ${esc(fmtAt(s.at))}${admin?'<br>این سیستم: '+esc(countText(collect())):''}</div>
    ${m==='w'?`<div class="sykv"><b>وضعیت</b>آخرین بررسی اطلاعات مشترک: ${esc(lastChk?hms(lastChk):'—')}<br>آخرین ارسال از این سیستم: ${esc(s.sent?fmtAt(s.sent):'—')}<br>نوشته ارسال‌نشده در این سیستم: <b style="display:inline">${unsent()?'دارد':'ندارد'}</b>${lastErr?'<br>آخرین خطا ('+esc(hms(lastErr.at))+'): '+esc(lastErr.t):''}</div>`:''}
    ${m==='v'?'<small>هر تغییری که در این سیستم بدهید، با اطلاعات جدید جایگزین می‌شود.</small>':''}
    <div class="symsg" id="syMsg"></div>
    <button type="button" class="go" id="syNow">همگام‌سازی الان</button>
    ${admin?`<button type="button" class="go" id="syUsers">کاربران${nU?' ('+fa(nU)+')':''}</button>
      <div class="sycard"><h3>کلید دسترسی جدید</h3>
        <label>فقط اگر کلید قبلی باطل شده است<input id="syTok" data-p type="password" autocomplete="off" placeholder="github_pat_..."></label>
        <button type="button" id="syTokSave">ذخیره کلید جدید</button></div>
      <details class="sycard"><summary>قطع قطعی همه کاربران</summary>
        <small>وقتی لازم است که یک کاربر قطع‌شده دیگر به هیچ روشی نتواند اطلاعات را بخواند. بعد از این کار، همه کاربران باید کد اتصال جدید بگیرند.</small>
        <small>۱) در GitHub یک کلید جدید بسازید. ۲) کلید جدید و رمز جدید را اینجا وارد کنید. ۳) کلید قدیمی را در GitHub پاک کنید (Delete).</small>
        <label>کلید دسترسی جدید GitHub<input id="syRTok" data-p type="password" autocomplete="off" placeholder="github_pat_..."></label>
        <label>رمز اطلاعات جدید (حداقل ۶ حرف)<input id="syRP1" data-p type="password" autocomplete="new-password"></label>
        <label>تکرار رمز اطلاعات جدید<input id="syRP2" data-p type="password" autocomplete="new-password"></label>
        <button type="button" class="warn" id="syRot">تعویض کلید و رمز</button></details>
      ${showBox}`:''}
    ${m==='v'?'<button type="button" id="syToJoin">اتصال با کد اتصال…</button>':''}
    <button type="button" class="warn" id="syOff">قطع اتصال این سیستم</button>
    <small>${cfg.uid?'برای اتصال دوباره، کد اتصال لازم است.':'با قطع اتصال، اطلاعات این سیستم پاک نمی‌شود. فقط همگام‌سازی متوقف می‌شود.'}</small>
    <button type="button" id="syClose">بستن</button>`);
  on('syNow',async()=>{ lock(true); msg('در حال همگام‌سازی…'); await sync({manual:true}); lock(false); if(conflict) return; msg(phase==='ok'?'همگام شد — '+fmtAt(st().at):'همگام نشد — '+note,phase!=='ok'); });
  on('syUsers',viewUsers);
  on('syToJoin',()=>viewJoin(''));
  on('syTokSave',async()=>{
    const t=$('syTok').value.trim(); if(!t){ msg('کلید را وارد کنید',true); return; }
    const old=cfg.token; cfg.token=t; lock(true); msg('در حال بررسی کلید…');
    try{ const r=await gh(repoPath(),{auth:true}); if(!r.ok) throw await bad(r); lsSet(CFG,cfg); msg('کلید ذخیره شد. کاربران باید کد اتصال جدید بگیرند.'); sync({manual:true}); }
    catch(e){ cfg.token=old; msg(errText(e),true); }
    lock(false);
  });
  arm('syRot','همه کاربران قطع می‌شوند. دوباره بزنید',rotate);
  arm('syOff','مطمئن هستید؟ دوباره بزنید',()=>{ disconnect(); toast('اتصال این سیستم قطع شد'); setTimeout(()=>location.reload(),600); });
  bindShow();
  on('syClose',dlgClose);
}
/** کلید GitHub و/یا رمز اطلاعات عوض می‌شود و اطلاعات مشترک با قفل تازه نوشته می‌شود */
async function rotate(){
  const tok=$('syRTok').value.trim(), p1=normPass($('syRP1').value), p2=normPass($('syRP2').value);
  if(!tok && !p1){ msg('کلید جدید یا رمز جدید را وارد کنید',true); return; }
  if(p1 && p1.length<6){ msg('رمز اطلاعات باید حداقل ۶ حرف باشد',true); return; }
  if(p1!==p2){ msg('رمز و تکرار آن یکی نیست',true); return; }
  lock(true); msg('در حال انجام…');
  const keep=Object.assign({},cfg);
  try{
    await sync({force:true});                              // اول آخرین نوشته‌های دیگران گرفته شود
    if(tok){ cfg.token=tok; const r=await gh(repoPath(),{auth:true}); if(!r.ok) throw await bad(r); }
    if(p1){ cfg.salt=newSalt(); cfg.key=await derive(p1,cfg.salt); }
    lsSet(CFG,cfg);
    await sync({replace:true,force:true});
    if((phase==='err'||phase==='off')) throw Object.assign(new Error('X'),{text:note});
    lock(false); msg('انجام شد. حالا کلید قدیمی را در GitHub پاک کنید و از بخش «کاربران» به هر کاربر کد اتصال جدید بدهید.');
  }catch(e){ cfg=keep; lsSet(CFG,cfg); lock(false); msg(e.text||errText(e),true); }
}
/** تنظیم سیستم مدیر با کلید GitHub، یا مشاهده ساده با رمز اطلاعات */
function viewSetup(){
  const n=total(collect());
  dlg('اطلاعات مشترک',`
    ${hasCrypto()?'':NOCRYPTO}
    <div class="symsg" id="syMsg"></div>
    <div class="sycard"><h3>سیستم مدیر</h3>
      <small>این سیستم همه زبانه‌ها را دارد و کاربران را مدیریت می‌کند. نوشته‌های این سیستم (${esc(n?countText(collect()):'بدون ردیف')}) با اطلاعات مشترک یکی می‌شود.</small>
      <label>کلید دسترسی GitHub<input id="syTok" data-p type="password" autocomplete="off" placeholder="github_pat_..."></label>
      <label>رمز اطلاعات (حداقل ۶ حرف)<input id="syP1" data-p type="password" autocomplete="new-password"></label>
      <label>تکرار رمز اطلاعات<input id="syP2" data-p type="password" autocomplete="new-password"></label>
      <button type="button" class="go" id="syStartW">شروع همگام‌سازی</button></div>
    <div class="sycard"><h3>فقط مشاهده با رمز اطلاعات</h3>
      <small>${n?'توجه: اطلاعات فعلی این سیستم با اطلاعات مشترک جایگزین می‌شود.':'همه زبانه‌ها دیده می‌شود، بدون ثبت. این سیستم در لیست کاربران نمی‌آید.'}</small>
      <label>رمز اطلاعات<input id="syPv" data-p type="password" autocomplete="off"></label>
      <button type="button" class="go" id="syStartV">دریافت اطلاعات</button></div>
    ${showBox}
    <button type="button" id="syBack">بازگشت</button>`);
  on('syStartW',()=>startWriter(false));
  on('syStartV',()=>startViewer($('syPv').value));
  on('syBack',()=>{ if(window.ntLocked) viewJoin(''); else dlgClose(); });
  bindShow();
}
async function startWriter(replace){
  if(!hasCrypto()) return;
  const tok=$('syTok').value.trim(), p1=normPass($('syP1').value), p2=normPass($('syP2').value);
  if(!tok){ msg('کلید دسترسی را وارد کنید',true); return; }
  if(p1.length<6){ msg('رمز اطلاعات باید حداقل ۶ حرف باشد',true); return; }
  if(p1!==p2){ msg('رمز و تکرار آن یکی نیست',true); return; }
  lock(true); msg('در حال بررسی کلید…');
  const keep=cfg; cfg={token:tok};
  const fail=(t)=>{ cfg=keep; lsSet(CFG,cfg); lock(false); msg(t,true); };
  try{
    const r=await gh(repoPath(),{auth:true});
    if(r.status===404) return fail('مخزن '+OWNER+'/'+REPO+' با این کلید پیدا نشد');
    if(!r.ok) throw await bad(r);
    const ref0=await getRef();
    const f=ref0?await getFile(true,'',ref0):{none:true};
    let salt, key;
    if(f.none || replace){ salt=newSalt(); key=await derive(p1,salt); }
    else{
      salt=f.w.salt; key=await derive(p1,salt);
      try{ await unseal(f.w,key); }
      catch(e){
        cfg=keep; lock(false);
        msg('اطلاعات مشترک از قبل با رمز دیگری وجود دارد. همان رمز را وارد کنید.',true);
        if(!$('syRep')){
          const b=document.createElement('button'); b.type='button'; b.className='warn'; b.id='syRep'; b.textContent='رمز قبلی را ندارم — اطلاعات مشترک با اطلاعات این سیستم و رمز جدید جایگزین شود';
          $('syStartW').after(b); arm('syRep','اطلاعات مشترک قبلی پاک می‌شود. دوباره بزنید',()=>startWriter(true));
        }
        return;
      }
    }
    cfg={mode:'w',token:tok,salt,key};
    lsSet(CFG,cfg); lsSet(STK,{}); try{ localStorage.removeItem(BASE); }catch(e){}
    incoming=null; conflict=null; waiting=false; needCode=false;
    msg('در حال همگام‌سازی…');
    if(replace) await sync({replace:true,resolve:'give',force:true}); else await sync({force:true});
    if((phase==='err'||phase==='off')){ const n=note; lsSet(STK,{}); return fail(n); }
    if(conflict) return;                                   // پنجره انتخاب باز شده است
    toast('این سیستم، سیستم مدیر شد — سامانه دوباره باز می‌شود'); setTimeout(()=>location.reload(),700);
  }catch(e){ fail(e.text||errText(e)); }
}
async function startViewer(pass,w){
  if(!hasCrypto()) return;
  pass=normPass(pass);
  if(!pass){ msg('رمز اطلاعات را وارد کنید',true); return; }
  lock(true); msg('در حال دریافت…');
  try{
    if(!w){ const f=await getAny(''); if(f.none){ lock(false); msg('اطلاعات مشترک هنوز ارسال نشده است. اول سیستم مدیر را تنظیم کنید.',true); return; } w=f.w; }
    const key=await derive(pass,w.salt); await unseal(w,key);
    const tok=(mode()==='w' && !cfg.uid)?cfg.token:undefined, was=mode();
    cfg={mode:tok?'w':'v',salt:w.salt,key}; if(tok) cfg.token=tok;
    lsSet(CFG,cfg);
    if(was!=='w' && was!=='v'){ lsSet(STK,{}); try{ localStorage.removeItem(BASE); }catch(e){} }
    incoming=null; waiting=false; needCode=false;
    await sync({manual:true,now:true});
    if((phase==='err'||phase==='off')){ lock(false); msg(note,true); return; }
    toast('اطلاعات دریافت شد — سامانه دوباره باز می‌شود'); setTimeout(()=>location.reload(),700);
  }catch(e){ lock(false); msg(e.text||errText(e),true); }
}
/** رمز اطلاعات عوض شده است (سیستم مدیر دوم، یا سیستمی که با رمز اطلاعات می‌بیند) */
function viewPass(kind,w){
  dlg('اطلاعات مشترک',`
    <p>رمز اطلاعات مشترک عوض شده است. رمز جدید را وارد کنید.</p>
    ${hasCrypto()?'':NOCRYPTO}
    <div class="symsg" id="syMsg"></div>
    <label>رمز اطلاعات<input id="syPv" data-p type="password" autocomplete="off"></label>
    ${showBox}
    <button type="button" class="go" id="syStartV">تأیید</button>
    <button type="button" id="syClose">بستن</button>`);
  bindShow();
  on('syStartV',()=>startViewer($('syPv').value,w));
  const inp=$('syPv'); if(inp) inp.addEventListener('keydown',e=>{ if(e.key==='Enter') startViewer(inp.value,w); });
  on('syClose',dlgClose);
}
function viewConflict(){
  if(!conflict) return;
  dlg('با اطلاعات این سیستم چه کنم؟',`
    <p>این سیستم اطلاعاتی دارد که با اطلاعات مشترک فرق دارد. یکی را انتخاب کنید.</p>
    <div class="sykv"><b>اطلاعات مشترک — ${esc(fmtAt(conflict.at))}</b>${esc(countText(conflict.keys))}</div>
    <div class="sykv"><b>این سیستم</b>${esc(countText(collect()))}</div>
    <div class="symsg" id="syMsg"></div>
    <button type="button" class="go" id="syMerge">ادغام — هر دو نگه داشته شود</button>
    <button type="button" id="syTake">فقط اطلاعات مشترک (اطلاعات این سیستم جایگزین می‌شود)</button>
    <button type="button" id="syGive">فقط اطلاعات این سیستم (اطلاعات مشترک جایگزین می‌شود)</button>
    <button type="button" id="syClose">بعداً</button>`);
  const run=async(how,okText)=>{
    lock(true); msg('در حال همگام‌سازی…');
    await sync({resolve:how,force:true});
    lock(false);
    if(phase==='ok' && !conflict){ toast(okText+' — سامانه دوباره باز می‌شود'); setTimeout(()=>location.reload(),700); }
    else msg('انجام نشد — '+(note||'دوباره امتحان کنید'),true);
  };
  on('syMerge',()=>run('merge','ادغام شد'));
  arm('syTake','مطمئن هستید؟ دوباره بزنید',()=>run('take','اطلاعات مشترک دریافت شد'));
  arm('syGive','مطمئن هستید؟ دوباره بزنید',()=>run('give','اطلاعات این سیستم ارسال شد'));
  on('syClose',dlgClose);
}
/** راننده: دستگاه‌هایی که این سیستم فقط برای آن‌ها ثبت می‌کند (از لیست کاربران مدیر) */
function myDevs(){ return cfg.uid && mode()==='w' && Array.isArray(cfg.devs) && cfg.devs.length ? cfg.devs.slice() : null; }
function disconnect(){
  cfg={mode:'off'}; lsSet(CFG,cfg);
  try{ localStorage.removeItem(STK); localStorage.removeItem(BASE); }catch(e){}
  conflict=null; incoming=null; waiting=false; window.ntViewer=false; setPhase('');
}

/* ---------- زبانه‌های مجاز ---------- */
function applyAcl(){
  const a=acl(); if(!a) return;
  if(myDevs()){ DOCS.forEach((d,i)=>{ try{ tabs[i].hidden=true; }catch(e){} }); document.body.classList.add('ntdriver'); window.show=function(){}; return; }
  let first=-1;
  DOCS.forEach((d,i)=>{ const h=tabAcc(d.name)==='h'; try{ tabs[i].hidden=h; }catch(e){} if(!h && first<0) first=i; });
  try{ if(first>-1 && tabAcc(DOCS[start].name)==='h') start=first; }catch(e){}
  const _show=window.show;
  window.show=function(i){ if(DOCS[i] && tabAcc(DOCS[i].name)==='h') return; _show(i); };
}

/* ---------- شروع ---------- */
let timers=false;
function startTimers(){
  if(timers) return; timers=true;
  window.addEventListener('storage',e=>{ if(!e || !e.key || isSync(e.key)){ mayDirty=true; changedAt=Date.now(); } });
  setInterval(tick,T.tick);
  setInterval(()=>{ mayDirty=true; },15000);
  const wake=()=>{
    if(busy || conflict) return;
    if(document.hidden){ if(mode()==='w' && unsent()) sync({force:true}); return; }
    if(Date.now()-lastChk>=T.refocus || (mode()==='w' && unsent())) sync({});
  };
  document.addEventListener('visibilitychange',wake);
  window.addEventListener('pagehide',()=>{ if(!busy && !conflict && mode()==='w' && unsent()) sync({force:true}); });
  window.addEventListener('focus',wake);
  /* اینترنت برگشت: هر چه روی این سیستم مانده فرستاده شود */
  window.addEventListener('online',()=>{ if(!busy && !conflict) sync({force:true}); });
  /* اطلاعات تازه هنگام رفتن به زبانه دیگر نشان داده می‌شود */
  $('tabs').addEventListener('click',()=>{ if(waiting) sync({now:true}); },true);
}
/* ---------- قفل ورود ----------
   سیستمی که وصل نشده است، هیچ زبانه‌ای را نمی‌بیند؛ فقط پنجره ورود با کد اتصال.
   تنها استثنا: وقتی هنوز هیچ اطلاعات مشترکی ساخته نشده است (تنظیم اول سیستم مدیر). */
function lockOn(){
  window.ntLocked=true; document.body.classList.add('ntlocked');
  try{ const l=$('load'); if(l) l.textContent='برای ورود به سامانه، کد اتصال لازم است.'; }catch(e){}
  if(!lockOn.done){ lockOn.done=1; const _s=window.show; window.show=function(i){ if(window.ntLocked) return; _s(i); }; }
}
function lockOff(){
  window.ntLocked=false; document.body.classList.remove('ntlocked');
  try{ const l=$('load'); if(l) l.textContent='در حال آماده‌سازی…'; }catch(e){}
  try{ ntBoot(); }catch(e){}
}
async function probeLock(jc){
  let exists=true;                                        // اگر GitHub جواب نداد، قفل می‌ماند
  try{ const f=await getFile(false); if(f.none) exists=false; }catch(e){}
  if(!exists && !jc && !cfg.revoked){ lockOff(); return; }
  viewJoin(jc||'');
}
function init(){
  if(cfg.o) OWNER=cfg.o; if(cfg.r) REPO=cfg.r;
  $('ntSyBtn').addEventListener('click',viewMain);
  applyAcl(); paint();
  const m=mode(), jc=hashCode();
  const go=()=>{ try{ ntBoot(); }catch(e){} };
  if((m==='w' || m==='v') && !hasCrypto()){ setPhase('err','این مرورگر رمزگذاری را پشتیبانی نمی‌کند'); go(); return; }
  if(m==='w'){ go(); startTimers(); sync({force:true,verify:true}); }
  else if(m==='v'){ startTimers(); sync({now:true}).then(go,go); }
  else{ lockOn(); probeLock(jc); return; }
  if(jc){ if(isAdmin()) setTimeout(()=>toast('این سیستم، سیستم مدیر است. لینک اتصال برای سیستم‌های دیگر است.',true),400); else setTimeout(()=>viewJoin(jc),300); }
}
/** نوشتن از خود پوسته (صفحه دستگاه): زبانه‌هایی که این کلیدها را دارند تازه شوند و ارسال شود */
function touch(keys){
  mayDirty=true; changedAt=Date.now();
  try{ frames.forEach((f,i)=>{ if(!f || !f.dataset.loaded) return; const m=keysOfFrame(i); if((keys||[]).some(k=>m[k])) reloadFrame(i,true); }); }catch(e){}
}
function myName(){ try{ const u=cfg.uid && usersGet(); return (u && u[cfg.uid] && u[cfg.uid].name)||''; }catch(e){ return ''; } }
window.ntSync={T,get cfg(){ return cfg; },st,sync,collect,hashOf,mergeAll,baseGet,outgoing,usersGet,seenGet,canSee:n=>tabAcc(n)!=='h',
  canWriteTab:n=>mode()!=='v' && tabAcc(n)==='w',touch,myName,myDevs};
init();
})();
