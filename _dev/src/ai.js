/* ============ «خلاصه برای Claude» — فقط سیستم مدیر ============
   یک متن ساده از اطلاعات همین سیستم می‌سازد، نشان می‌دهد و کپی می‌کند. هیچ چیز را جایی نمی‌فرستد؛
   کاربر خودش متن را در Claude می‌چسباند. گزینه «بدون مبلغ و نام» مبلغ‌ها و نام تعمیرکار/فروشنده/پرداخت‌کننده را حذف می‌کند. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS=k=>{ try{ return JSON.parse(localStorage.getItem(k)||'null'); }catch(e){ return null; } };
const lat=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const num=v=>{ const n=+lat(v).replace(/[,\s٬]/g,''); return isFinite(n)&&n>0?n:0; };
const p2=n=>String(n).padStart(2,'0');
const MON=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const MLEN=m=>m<=6?31:(m<=11?30:29);
const one=s=>String(s==null?'':s).replace(/[\r\n\t]+/g,' ').trim().slice(0,120);
function today(){ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const g=t=>+p.find(x=>x.type===t).value; return {y:g('year'),m:g('month'),d:g('day')}; }
const key=(y,m,d)=>`${y}/${p2(m)}/${p2(d)}`;
function back(k,n){ let [y,m,d]=k.split('/').map(Number); for(let i=0;i<n;i++){ d--; if(d<1){ m--; if(m<1){ m=12; y--; } d=MLEN(m); } } return key(y,m,d); }
const money=(v,anon)=>anon?'':Math.round(v).toLocaleString('en-US')+' ریال';
const hrs=min=>(Math.round((min||0)/6)/10)+' ساعت';
const shRows=()=>{ const o=LS('nt_sh8_v1'); return (o&&Array.isArray(o.rows))?o.rows:[]; };
const mkRows=()=>{ const o=LS('nt_moshkel_v1'); return (o&&Array.isArray(o.rows))?o.rows:[]; };
const rDate=r=>r.st || (r.y?key(+lat(r.y),+lat(r.m),+lat(r.d)):'');

function head(title,anon){
  return ['# '+title+' — سامانه نگهداری و تعمیرات (ماشین‌آلات معدن)','تاریخ: '+key(...Object.values(today()))+(anon?' — مبلغ‌ها و نام اشخاص/فروشنده‌ها حذف شده است':''),
    'لطفاً با این اطلاعات تحلیل کن: مشکل‌های مهم، خرابی‌های تکراری، دستگاه‌های پرهزینه یا پرتوقف، و پیشنهاد عملی برای نگهداری. جواب را فارسی و کوتاه بنویس.',''];
}
function secStops(from,to,devName){
  const N=window.ntStops; if(!N||!N.list) return [];
  let L=N.list(from,to); if(devName) L=L.filter(x=>x.dev===devName); if(!L.length) return ['## توقف‌ها ('+from+' تا '+to+')','- توقفی ثبت نشده',''];
  const per={}; L.forEach(x=>{ const p=per[x.dev]=per[x.dev]||{m:0,n:0,c:{}}; p.m+=x.min||0; p.n++; p.c[x.cause]=(p.c[x.cause]||0)+(x.min||0); });
  const out=['## توقف‌ها ('+from+' تا '+to+') — جمع '+hrs(L.reduce((a,x)=>a+(x.min||0),0))+'، '+L.length+' مورد'];
  Object.entries(per).sort((a,b)=>b[1].m-a[1].m).slice(0,20).forEach(([d,p])=>out.push(`- ${one(d)}: ${hrs(p.m)} در ${p.n} توقف — علت‌ها: ${Object.entries(p.c).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([c,m])=>one(c)+' '+hrs(m)).join('، ')}`));
  const open=L.filter(x=>x.min===null); if(open.length) out.push('- هنوز متوقف: '+open.map(x=>one(x.dev)+' ('+one(x.cause)+' از '+x.day+')').join('، '));
  out.push(''); return out;
}
function secProblems(devName){
  let L=mkRows().filter(r=>r&&r.dev&&String(r.state||'باز').trim()!=='بسته'); if(devName) L=L.filter(r=>r.dev===devName);
  const out=['## خرابی‌های باز ('+L.length+')']; if(!L.length) out.push('- خرابی بازی نیست');
  L.slice(0,40).forEach(r=>out.push(`- ${one(r.dev)} | ${one(r.sys)} | ${one(r.desc)} | شدت: ${one(r.sev)} | وضعیت: ${one(r.state||'باز')} | ثبت: ${r.y}/${p2(r.m)}/${p2(r.d)}${r.cur==='خوابیده'?' | دستگاه خوابیده':''}`));
  out.push(''); return out;
}
function secSvc(devName){
  const items=LS('nt_svc_v1'); if(!Array.isArray(items)||!items.length||!window.ntSvc) return [];
  let A=ntSvc.all(items,LS('nt_daftar_v1')||[]); if(devName) A=A.filter(x=>x.it.dev===devName); else A=A.filter(x=>x.st==='r'||x.st==='o');
  const out=['## سرویس‌ها (تعویض روغن و فیلتر)'+(devName?'':' — گذشته و نزدیک')]; if(!A.length) out.push('- موردی نیست');
  A.slice(0,40).forEach(x=>out.push(`- ${one(x.it.dev)} — ${one(x.it.name)}: ${x.st==='r'?'گذشته':x.st==='o'?'نزدیک':x.st==='g'?'وقت هست':'فاصله ندارد'}${x.rem!==null?` (${x.rem>=0?x.rem+' مانده':(-x.rem)+' گذشته'}، هر ${x.every})`:''}${x.it.ld?' — آخرین '+x.it.ld:''}`));
  out.push(''); return out;
}
function secRepeat(devName){
  if(!window.ntRepeat) return []; let R=ntRepeat.find(shRows(),{days:30}); if(devName) R=R.filter(x=>x.dev===devName); if(!R.length) return [];
  const out=['## خرابی تکراری (همان نوع تعمیر، ۲ بار یا بیشتر در ۳۰ روز)'];
  R.slice(0,20).forEach(x=>out.push(`- ${one(x.dev)} — ${one(x.type)}: ${x.n} بار در ${x.gap} روز (${x.list.map(l=>l.date).join('، ')})`)); out.push(''); return out;
}
function secCost(months,anon,devName){
  if(!window.ntCost) return []; const T=today(); let y=T.y, m=T.m; const out=['## هزینه تعمیرات خارجی (شناسنامه، ماه = تاریخ ارسال)'+(anon?' — فقط تعداد فاکتور':'')];
  for(let q=0;q<months;q++){ const C=ntCost.month(devName?shRows().filter(r=>r.dev===devName):shRows(),y,m);
    out.push(`- ${MON[m-1]} ${y}: ${anon?C.n+' فاکتور':money(C.sum)+' ('+C.n+' فاکتور؛ اجرت '+money(C.a)+'، خرید '+money(C.k)+')'}`);
    if(!devName) C.devs.slice(0,5).forEach(x=>out.push(`   • ${one(x.dev)}: ${anon?x.n+' فاکتور':money(x.sum)+' ('+x.n+' فاکتور)'}`));
    m--; if(m<1){ m=12; y--; } }
  out.push(''); return out;
}
function secRepairs(devName,anon){
  const L=shRows().filter(r=>r.dev===devName && !r.old).slice(-40); const out=['## تعمیرات خارجی این دستگاه (آخرین '+L.length+')'];
  L.forEach(r=>out.push(`- ${rDate(r)} | ${one(r.type)} | ${one(r.desc)}${r.part&&r.part!=='**'?' | قطعه: '+one(r.part):''}${anon?'':(r.rep?' | تعمیرکار: '+one(r.rep):'')+(r.sup?' | فروشنده: '+one(r.sup):'')+((num(r.costA)+num(r.costK))?' | '+money(num(r.costA)+num(r.costK)):'')}${r.dur?' | مدت '+r.dur:''}`));
  out.push(''); return out;
}
function secReadings(devName){
  const L=(LS('nt_daftar_v1')||[]).filter(x=>x&&x.dev===devName).sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(-12);
  if(!L.length) return []; return ['## قرائت کارکرد (آخرین '+L.length+')',...L.map(x=>`- ${x.date}: ${x.val} ${x.unit||''}`),''];
}
function build(kind,anon,dev){
  const T=today(), K=key(T.y,T.m,T.d), M1=key(T.y,T.m,1);
  if(kind==='month') return [...head('خلاصه ماه '+MON[T.m-1]+' '+T.y,anon),...secStops(M1,K),...secProblems(),...secSvc(),...secRepeat(),...secCost(2,anon)].join('\n');
  if(kind==='cost') return [...head('هزینه تعمیرات ۶ ماه',anon),...secCost(6,anon),...secRepeat()].join('\n');
  return [...head('سابقه دستگاه «'+one(dev)+'»',anon),...secReadings(dev),...secSvc(dev),...secProblems(dev),...secStops(back(K,90),K,dev),...secRepairs(dev,anon),...secRepeat(dev),...secCost(6,anon,dev)].join('\n');
}
async function copy(t){
  try{ if(navigator.clipboard && window.isSecureContext){ await navigator.clipboard.writeText(t); return true; } }catch(e){}
  try{ const ta=document.createElement('textarea'); ta.value=t; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;top:0;left:0;opacity:0'; document.body.appendChild(ta); ta.select(); const ok=document.execCommand('copy'); ta.remove(); return ok; }catch(e){ return false; }
}
function devList(){ const s=new Set(); try{ (window.ntQr&&ntQr.DEVS||[]).forEach(d=>s.add(d.name)); }catch(e){} (LS('nt_daftar_v1')||[]).forEach(x=>x&&x.dev&&s.add(x.dev)); shRows().forEach(r=>r&&r.dev&&s.add(r.dev)); return [...s].sort(); }
function open(){
  let el=$('ntAi'); if(el) el.remove();
  el=document.createElement('div'); el.id='ntAi'; el.className='sydlg'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-labelledby','ntAiH');
  el.innerHTML=`<div class="sybox"><h2 id="ntAiH">خلاصه برای Claude</h2>
    <small>یک متن از اطلاعات همین سیستم ساخته و کپی می‌شود. چیزی فرستاده نمی‌شود؛ خودتان در Claude می‌چسبانید. فقط سیستم مدیر این را دارد.</small>
    <div class="sycard">
      <label class="chk"><input type="radio" name="aiK" value="month" checked> ماه جاری: توقف، خرابی باز، سرویس، خرابی تکراری، هزینه</label>
      <label class="chk"><input type="radio" name="aiK" value="cost"> هزینه تعمیرات ۶ ماه</label>
      <label class="chk"><input type="radio" name="aiK" value="dev"> سابقه یک دستگاه</label>
      <select id="aiDev" style="display:block;width:100%;margin-top:4px" aria-label="دستگاه" disabled>${devList().map(n=>`<option>${esc(n)}</option>`).join('')}</select>
      <label class="chk" style="margin-top:8px"><input type="checkbox" id="aiAnon"> بدون مبلغ و نام تعمیرکار و فروشنده</label>
    </div>
    <label>متنی که کپی می‌شود (پیش‌نمایش)<textarea id="aiTxt" rows="9" readonly dir="rtl" style="width:100%;font:inherit;font-size:.82rem;line-height:1.7"></textarea></label>
    <div class="symsg" id="aiMsg" role="status"></div>
    <button type="button" class="go" id="aiCopy">کپی خلاصه</button>
    <button type="button" id="aiOpen">باز کردن Claude</button>
    <button type="button" id="aiClose">بستن</button></div>`;
  document.body.appendChild(el);
  const upd=()=>{ const k=el.querySelector('input[name=aiK]:checked').value; $('aiDev').disabled=k!=='dev'; let t='';
    try{ t=build(k,$('aiAnon').checked,$('aiDev').value); }catch(e){ t='خلاصه ساخته نشد.'; } $('aiTxt').value=t; $('aiMsg').textContent=''; };
  el.querySelectorAll('input,select').forEach(i=>i.addEventListener('change',upd)); upd();
  $('aiCopy').addEventListener('click',async()=>{ const ok=await copy($('aiTxt').value); const m=$('aiMsg'); m.className='symsg'+(ok?'':' bad');
    m.textContent=ok?'کپی شد ('+$('aiTxt').value.split('\n').length+' خط). Claude را باز کنید، بچسبانید و سؤالتان را بنویسید.':'کپی نشد. متن پیش‌نمایش را خودتان انتخاب و کپی کنید.'; });
  $('aiOpen').addEventListener('click',()=>{ try{ window.open('https://claude.ai/new','_blank','noopener'); }catch(e){} });
  const close=()=>el.remove(); $('aiClose').addEventListener('click',close);
  el.addEventListener('keydown',e=>{ if(e.key==='Escape') close(); });
  try{ el.querySelector('input[name=aiK]').focus(); }catch(e){}
}
window.ntAi={open,build};
})();
