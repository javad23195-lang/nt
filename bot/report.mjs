// گزارش روزانه نت → تلگرام و بله.
// فقط می‌خواند؛ هیچ‌چیز در مخزن نمی‌نویسد. رمز اطلاعات (NT_PASS) فقط در GitHub Secrets است.
import fs from 'node:fs'; import vm from 'node:vm'; import { webcrypto as crypto } from 'node:crypto'; import zlib from 'node:zlib';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const E=process.env, OWNER='javad23195-lang', REPO='nt', TAG='nt-data', FILE='nt-data.json';
const DRY=E.DRY==='1';

/* ---------- باز کردن اطلاعات (همان روش sync.js) ---------- */
const b64=s=>Uint8Array.from(Buffer.from(s,'base64'));
const normPass=p=>String(p||'').trim().replace(/[۰-۹]/g,d=>String(d.charCodeAt(0)-0x06F0)).replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-0x0660));
async function open(w,pass){
  const km=await crypto.subtle.importKey('raw',new TextEncoder().encode(normPass(pass)),'PBKDF2',false,['deriveBits']);
  const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:b64(w.salt),iterations:150000,hash:'SHA-256'},km,256);
  const key=await crypto.subtle.importKey('raw',bits,'AES-GCM',false,['decrypt']);
  let pt; try{ pt=Buffer.from(await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(w.iv)},key,b64(w.data))); }catch(e){ throw new Error('رمز اطلاعات درست نیست (NT_PASS)'); }
  if(w.gz) pt=zlib.gunzipSync(pt);
  const o=JSON.parse(pt.toString('utf8')); if(!o||!o.keys) throw new Error('فایل داده خراب است');
  return o;
}
async function load(){
  if(E.NT_SOURCE_FILE) return JSON.parse(fs.readFileSync(E.NT_SOURCE_FILE,'utf8'));
  const hdr={'Accept':'application/vnd.github.raw+json'}; if(E.GITHUB_TOKEN) hdr.Authorization='Bearer '+E.GITHUB_TOKEN;
  let r=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}?ref=${TAG}`,{headers:hdr,signal:AbortSignal.timeout(30000)});
  if(!r.ok) r=await fetch(`https://raw.githubusercontent.com/${OWNER}/${REPO}/${TAG}/${FILE}`,{signal:AbortSignal.timeout(30000)});
  if(!r.ok) throw new Error('فایل داده از GitHub خوانده نشد ('+r.status+')');
  return JSON.parse(await r.text());
}

/* ---------- تاریخ شمسی (به وقت تهران) ---------- */
const p2=n=>String(n).padStart(2,'0');
function jalali(d){
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).map(x=>[x.type,x.value]));
  return `${p.year}/${p2(p.month)}/${p2(p.day)}`;
}
const MONTHS=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const nice=s=>{ const [y,m,d]=s.split('/').map(Number); return `${d} ${MONTHS[m-1]}`; };
const latin=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]).replace(/[٠-٩]/g,d=>'0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
const normDay=s=>{ const m=/^(1[34]\d{2})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/.exec(latin(s).trim()); return m?`${m[1]}/${p2(+m[2])}/${p2(+m[3])}`:''; };
const FA=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const hm=min=>{ min=Math.round(min); const h=Math.floor(min/60), m=min%60; return h&&m?`${FA(h)} ساعت و ${FA(m)} دقیقه`:h?`${FA(h)} ساعت`:`${FA(m)} دقیقه`; };

/* ---------- ساخت گزارش ---------- */
export function buildReport(keys,now){
  const store=keys, ls={getItem:k=>(typeof store[k]==='string'?store[k]:null)};
  const win={}; vm.runInNewContext(fs.readFileSync(path.join(HERE,'..','_dev','src','stops.js'),'utf8'),{window:win,localStorage:ls,JSON,Set,Math,String,Number,Object,Array});
  const today=jalali(now), yest=jalali(new Date(now.getTime()-864e5));
  const L=[`گزارش نت — ${FA(nice(today))}`,''];

  // دیروز: توقف‌ها (همان قاعده نمودار و گزارش اکسل)
  const stops=win.ntStops.list(yest,yest);
  L.push(`دیروز (${FA(nice(yest))}):`);
  if(!stops.length) L.push('• توقفی ثبت نشده');
  else{
    const sum=a=>a.reduce((s,x)=>s+(x.min||0),0), by=c=>stops.filter(x=>x.cls===c);
    L.push(`• توقف: ${FA(stops.length)} مورد، ${hm(sum(stops))}`);
    const per={}; stops.forEach(x=>{ (per[x.dev]=per[x.dev]||{m:0,c:{}}); per[x.dev].m+=x.min||0; per[x.dev].c[x.cause]=(per[x.dev].c[x.cause]||0)+(x.min||0); });
    const top=Object.entries(per).sort((a,b)=>b[1].m-a[1].m)[0];
    const cause=Object.entries(top[1].c).sort((a,b)=>b[1]-a[1])[0][0];
    L.push(`• بیشترین توقف: ${top[0]} (${hm(top[1].m)}، ${cause})`);
    L.push(`• خرابی: ${FA(by('em').length)} — سرویس: ${FA(by('pm').length)} — سالم ولی کار نکرد: ${FA(by('idle').length)}`);
    const open=stops.filter(x=>x.min===null); if(open.length) L.push(`• هنوز متوقف: ${open.map(x=>x.dev).join('، ')}`);
  }

  // برنامه روزانه
  let db={}; try{ db=JSON.parse(store.nt_prog_v1||'{}')||{}; }catch(e){}
  const day=d=>{ const k=Object.keys(db).find(x=>normDay(x)===d); return (k&&db[k])||{}; };
  const dT=day(today), dY=day(yest);
  const tasks=(dT.tasks||[]).filter(t=>t&&t.dev&&(t.prog||t.act));
  L.push('','امروز (برنامه روزانه):');
  if(!tasks.length) L.push('• برنامه امروز هنوز ثبت نشده');
  else{ L.push(`• ${FA(tasks.length)} کار برنامه‌ریزی شده`); tasks.slice(0,6).forEach(t=>L.push(`  - ${t.dev}: ${String(t.prog||t.act).slice(0,60)}`)); if(tasks.length>6) L.push(`  و ${FA(tasks.length-6)} کار دیگر`); }
  const left=(dY.tasks||[]).filter(t=>t&&t.dev&&t.prog&&!t.done);
  if(left.length){ L.push(`• ${FA(left.length)} کار دیروز انجام نشده:`); left.slice(0,5).forEach(t=>L.push(`  - ${t.dev}: ${String(t.prog).slice(0,60)}`)); }
  const faults=[...(dT.faults||[]),...(dY.faults||[])].filter(f=>f&&f.dev&&f.fdesc);
  if(faults.length){ L.push('','خرابی‌های ثبت‌شده:'); faults.slice(0,6).forEach(f=>L.push(`• ${f.dev}: ${String(f.fdesc).slice(0,60)}${f.pri?' (اولویت '+FA(f.pri)+')':''}`)); }
  return L.join('\n').slice(0,3800);
}

/* ---------- ارسال ---------- */
async function send(name,base,token,chat,text){
  const r=await fetch(`${base}/bot${token}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chat,text}),signal:AbortSignal.timeout(30000)});
  const j=await r.json().catch(()=>null);
  if(!r.ok||!(j&&j.ok)) throw new Error(`${name}: خطا ${r.status}`);
  console.log(name+': فرستاده شد');
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  if(!E.NT_PASS){ console.log('Secret کم است: NT_PASS'); process.exit(1); }
  const text=buildReport((await open(await load(),E.NT_PASS)).keys,E.NT_NOW?new Date(E.NT_NOW):new Date());
  if(DRY){ console.log(text); process.exit(0); }
  const jobs=[]; let fail=0;
  if(E.TELEGRAM_TOKEN&&E.TELEGRAM_CHAT) jobs.push(send('تلگرام','https://api.telegram.org',E.TELEGRAM_TOKEN,E.TELEGRAM_CHAT,text));
  if(E.BALE_TOKEN&&E.BALE_CHAT) jobs.push(send('بله','https://tapi.bale.ai',E.BALE_TOKEN,E.BALE_CHAT,text));
  if(!jobs.length){ console.log('هیچ مقصدی تنظیم نشده'); process.exit(1); }
  for(const r of await Promise.allSettled(jobs)) if(r.status==='rejected'){ fail++; console.log(String(r.reason.message||r.reason)); }
  process.exit(fail===jobs.length?1:0);
}
