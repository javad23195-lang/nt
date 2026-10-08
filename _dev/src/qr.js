/* ============ کد QR دستگاه‌ها ============
   برچسب روی هر دستگاه: آدرس سامانه + «#m=<شناسه کوتاه>». هیچ رمز یا کلیدی داخل کد نیست.
   اسکن با دوربین گوشی → سامانه باز می‌شود → صفحه همان دستگاه (قرائت، توقف، مشکل، سوابق).
   کتابخانه‌ها فقط هنگام نیاز بارگذاری می‌شوند: qrcode-generator (MIT) و html5-qrcode (Apache-2.0). */
(function(){
'use strict';
/* شناسه کوتاه ثابت ← نام دقیق دستگاه (مثل دفترچه قرائت). شناسه را هرگز عوض نکنید؛ روی برچسب‌ها چاپ شده است. */
const DEVS=[
  ['WA470','لودر کوماتسو WA470','ساعت'],['ZL50','لودر ZL50','ساعت'],['LIFT6','لیفتراک کوماتسو 6تنی','ساعت'],
  ['PC290','بیل مکانیکی کوماتسو PC290','ساعت'],['PC400','بیل مکانیکی کوماتسو PC400','ساعت'],['GD705','گریدر GD705R-2','ساعت'],
  ['G1030','ژنراتور کامینز 1030KVA','ساعت'],['G700','ژنراتور کامینز 700KVA','ساعت'],['G220','دیزل ژنراتور کوماتسو 220','ساعت'],
  ['KIPOR','دیزل ژنراتور کیپور','ساعت'],
  ['TRS01','کامیون TRS01','کیلومتر'],['TRS02','کامیون TRS02','کیلومتر'],['TRS03','کامیون TRS03','کیلومتر'],
  ['MYLER','کامیون مایلر 2624','کیلومتر'],['ZAMYAD','نیسان زامیاد','کیلومتر'],['CAPRA','کاپرا دوکابین','کیلومتر'],
  ['CITRA','مینی بوس سیترا C-140','کیلومتر']
].map(([id,name,unit])=>({id,name,unit}));
const byId=id=>DEVS.find(d=>d.id===String(id||'').toUpperCase())||null;
/* علت‌های توقف — همان فهرست فرم «توقف شیفت» */
const CAUSES=(()=>{ const N=window.ntStops; return N?[{g:'خرابی یا تعمیر',L:N.BROKEN},{g:'دستگاه سالم بود ولی کار نکرد',L:N.IDLE}]:
  [{g:'خرابی یا تعمیر',L:['خرابی موتور','خرابی هیدرولیک','خرابی برق','خرابی دیگر']},{g:'دستگاه سالم بود ولی کار نکرد',L:['نبود راننده','نبود سوخت','سایر']}]; })();
/* سیستم‌ها — همان فهرست «ثبت مشکلات» */
const SYS=['موتور و قطعات','سیستم هیدرولیک','سیستم برقی','گیربکس و دیفرانسیل','سیستم ترمز','سیستم خنک کاری','سیستم سوخت رسانی','چرخ و لاستیک',
  'سیستم حرکتی','سیستم تعلیق','سیستم بادی','سیستم اگزوز','سیستم کولر و گرمایشی','بدنه و کابین','پاکت واتصالات','سیستم آب','سیستم پمپ','سرویس و نگهداری'];
const MONTHS=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const SITE='https://javad23195-lang.github.io/nt/'+encodeURIComponent('سامانه-نت.html');
const LIB_QR=['lib/qrcode.js','https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js'];
const LIB_SCAN=['lib/html5-qrcode.min.js','https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js'];

const $=id=>document.getElementById(id);
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
const esc=t=>String(t==null?'':t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const p2=n=>String(n).padStart(2,'0');
const latin=s=>String(s==null?'':s).replace(/[۰-۹]/g,d=>'0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]).replace(/[٠-٩]/g,d=>'0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
const norm=s=>latin(s).replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[‌\s]+/g,'').toLowerCase();
const sep=n=>fa(Number(n).toLocaleString('en-US'));
function LS(k,def){ try{ const v=JSON.parse(localStorage.getItem(k)); return v==null?def:v; }catch(e){ return def; } }
function LSset(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } }
function jNow(){ try{ const p=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const g=t=>+p.find(x=>x.type===t).value; return {y:g('year'),m:g('month'),d:g('day')}; }catch(e){ return null; } }
const jStr=j=>j?`${j.y}/${p2(j.m)}/${p2(j.d)}`:'';
const nowHM=()=>{ const d=new Date(); return p2(d.getHours())+':'+p2(d.getMinutes()); };
const shiftNow=()=>{ const h=new Date().getHours(); return h>=6&&h<14?'صبح':(h>=14&&h<22?'عصر':'شب'); };
const hmOk=t=>{ const m=/^(\d{1,2}):(\d{2})$/.exec(latin(t).trim()); return m && +m[1]<24 && +m[2]<60 ? p2(+m[1])+':'+m[2] : ''; };
const S=()=>window.ntSync||null;
const canSee=n=>{ try{ return S()&&S().canSee?S().canSee(n):true; }catch(e){ return true; } };
const canW=n=>{ try{ return S()&&S().canWriteTab?S().canWriteTab(n):true; }catch(e){ return true; } };
const touch=keys=>{ try{ if(S()&&S().touch) S().touch(keys); }catch(e){} };
function toast(t,bad){ const el=$('ntSyToast'); if(!el) return; el.textContent=t; el.className='sytoast'+(bad?' bad':''); el.hidden=false;
  clearTimeout(toast.t); toast.t=setTimeout(()=>{ el.hidden=true; },3200); }
function loadLib(list,ok){
  if(ok()) return Promise.resolve();
  const one=src=>new Promise((res,rej)=>{ const s=document.createElement('script'); s.src=src; s.async=true;
    s.onload=()=>ok()?res():rej(new Error('lib')); s.onerror=()=>{ s.remove(); rej(new Error('lib')); }; document.head.appendChild(s); });
  let local=''; try{ local=new URL(list[0],location.href).href; }catch(e){}
  return (local?one(local):Promise.reject()).catch(()=>one(list[1]));
}
const qrUrl=id=>(location.protocol==='https:'?location.origin+location.pathname:SITE)+'#m='+id;

/* ---------- ظاهر ---------- */
const CSS=`
.qrdev .kv{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;font-size:.86rem;background:#F7F9FA;border:1px solid #D5DCE3;border-radius:10px;padding:8px 10px;margin:0 0 10px}
.qrdev .kv span{color:#51606E}.qrdev .kv b{font-weight:700}
.qrdev .run{color:#1E7A4C}.qrdev .stop{color:#A32018}
.qrdev .acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 8px}
.qrdev .acts button{margin:0;min-height:56px}
.qrdev .acts button.stp{border-color:#A32018;color:#8E2219}
.qrdev .acts button.rn{background:#1E8E5A;border-color:#1E8E5A;color:#fff}
.qrdev .chips{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 10px}
.qrdev .chips button{display:inline-block;width:auto;min-height:40px;margin:0;padding:0 12px;font-size:.84rem;font-weight:600;border-radius:20px}
.qrdev .chips button[aria-pressed="true"]{background:#0B5C7A;border-color:#0B5C7A;color:#fff}
.qrdev .grp{font-size:.78rem;font-weight:800;color:#51606E;margin-top:4px}
.qrdev input.big{font-size:1.4rem!important;min-height:56px!important;text-align:center!important}
.qrdev .hist{font-size:.82rem;margin:0 0 10px}
.qrdev .hist h3{margin:8px 0 4px}
.qrdev .hist div{padding:4px 0;border-top:1px solid #E3E8ED}
.qrdev .warn{background:#FFF1DB;color:#7A4300;border-radius:10px;padding:8px 10px;font-size:.86rem;font-weight:700;margin:0 0 10px}
.qrlist{max-height:46vh;overflow:auto;border:1px solid #D5DCE3;border-radius:10px;padding:4px 10px;margin:0 0 10px}
#ntQrCam{width:100%;min-height:260px;background:#17212B;border-radius:12px;overflow:hidden;margin:0 0 10px}
.qrscan{flex:none;min-height:40px;display:flex;align-items:center;gap:6px;border:1px solid #D5DCE3;background:#fff;color:#17212B;font:inherit;font-size:.78rem;
  font-weight:500;padding:0 11px;border-radius:20px;cursor:pointer;white-space:nowrap}
.qrscan:focus-visible{outline:2px solid #0B5C7A;outline-offset:2px}
@media (max-width:560px){ .qrscan{padding:0 9px} .qrscan .tx{display:none} }
body.ntlocked .qrscan{display:none}
@media print{ .qrscan{display:none!important} }
`;
function dlg(){
  if($('ntQrDlg')) return;
  const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
  const d=document.createElement('div'); d.className='sydlg'; d.id='ntQrDlg'; d.hidden=true;
  d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true'); d.setAttribute('aria-labelledby','ntQrH');
  d.innerHTML='<div class="sybox qrdev"><h2 id="ntQrH"></h2><div id="ntQrBody"></div></div>';
  d.addEventListener('click',e=>{ if(e.target===d) close(); });
  document.body.appendChild(d);
}
function view(title,html){ dlg(); $('ntQrH').textContent=title; $('ntQrBody').innerHTML=html; $('ntQrDlg').hidden=false;
  try{ $('ntQrDlg').scrollTop=0; }catch(e){} }
function close(){ stopCam(); const d=$('ntQrDlg'); if(d){ d.hidden=true; $('ntQrBody').innerHTML=''; } }
const on=(id,fn)=>{ const el=$(id); if(el) el.addEventListener('click',fn); };

/* ---------- اطلاعات دستگاه ---------- */
function readings(dev){ return (LS('nt_daftar_v1',[])||[]).filter(x=>x && norm(x.dev)===norm(dev.name))
  .map(x=>Object.assign({},x,{date:latin(x.date)})).sort((a,b)=>a.date.localeCompare(b.date)); }
function stopsOf(dev){
  const db=LS('nt_tavaqof_v1',{})||{}, out=[];
  Object.keys(db).forEach(k=>{ const [d,sh]=k.split('|'); ((db[k]&&db[k].stops)||[]).forEach(s=>{ if(norm(s.dev)===norm(dev.name)) out.push({k,day:d,sh,s}); }); });
  return out.sort((a,b)=>a.day.localeCompare(b.day)||String(a.s.from).localeCompare(String(b.s.from)));
}
const openStop=dev=>{ const L=stopsOf(dev).filter(x=>!x.s.to); return L.length?L[L.length-1]:null; };
const rowsOf=k=>{ const o=LS(k,null); return o && Array.isArray(o.rows)?o.rows:(Array.isArray(o)?o:[]); };
const rDate=r=>r.y&&r.m&&r.d?`${r.y}/${p2(r.m)}/${p2(r.d)}`:latin(r.date||'');
function probsOf(dev){ return rowsOf('nt_moshkel_v1').filter(r=>r && norm(r.dev)===norm(dev.name)); }
function outsOf(dev){ return rowsOf('nt_anbar_out_v1').filter(r=>r && norm(r.dev)===norm(dev.name)).sort((a,b)=>rDate(a).localeCompare(rDate(b))); }

let cur=null;
function home(id){
  const dev=byId(id); if(!dev){ toast('این کد QR مال سامانه نیست یا دستگاه آن حذف شده است',true); return; }
  cur=dev;
  const R=readings(dev), last=R[R.length-1], os=openStop(dev);
  const svc=outsOf(dev).filter(r=>r.svc); const lastSvc=svc[svc.length-1];
  const open=probsOf(dev).filter(r=>r.state!=='بسته');
  let kv='';
  if(canSee('دفترچه قرائت')) kv+=`<span>آخرین قرائت</span><b>${last?sep(last.val)+' '+esc(last.unit||dev.unit)+' <small style="display:inline;color:#51606E">('+fa(last.date)+')</small>':'ثبت نشده'}</b>`;
  if(canSee('توقف شیفت')) kv+=`<span>وضعیت</span><b class="${os?'stop':'run'}">${os?'● متوقف از '+fa(os.s.from)+(os.day!==jStr(jNow())?' ('+fa(os.day)+')':'')+' — '+esc(os.s.cause):'● کار می‌کند'}</b>`;
  if(canSee('انبار') && lastSvc) kv+=`<span>آخرین سرویس</span><b>${fa(rDate(lastSvc))} — ${esc(lastSvc.svcName||'تعویض روغن')}</b>`;
  if(canSee('ثبت مشکلات')) kv+=`<span>مشکل باز</span><b class="${open.length?'stop':''}">${open.length?fa(open.length)+' — '+esc(String(open[open.length-1].desc||'').slice(0,40)):'ندارد'}</b>`;
  let acts='';
  if(canW('دفترچه قرائت')) acts+='<button type="button" class="go" id="qrRead">ثبت قرائت</button>';
  const trk=!window.ntStops || ntStops.tracked(dev.name);   // توقف دقیق فقط برای بیل، لودر و کامیون
  if(canW('توقف شیفت') && (trk||os)) acts+=os?'<button type="button" class="rn" id="qrRun">پایان توقف (راه افتاد)</button>':'<button type="button" class="stp" id="qrStop">شروع توقف</button>';
  if(canW('ثبت مشکلات')) acts+='<button type="button" id="qrProb">ثبت مشکل</button>';
  acts+='<button type="button" id="qrHist">دیدن سوابق</button>';
  view(dev.name,`${kv?'<div class="kv">'+kv+'</div>':''}<div class="acts">${acts}</div><button type="button" id="qrClose">بستن</button>`);
  on('qrRead',()=>readForm(dev)); on('qrStop',()=>stopForm(dev)); on('qrRun',()=>runForm(dev));
  on('qrProb',()=>probForm(dev)); on('qrHist',()=>hist(dev)); on('qrClose',close);
  setTimeout(()=>{ try{ const b=$('ntQrBody').querySelector('.acts button'); if(b) b.focus(); }catch(e){} },50);
  try{ if(window.ntCharts && ntCharts.devMini) ntCharts.devMini(dev.name); }catch(e){}   // نمودار کوچک کارکرد
}
const back=dev=>`<button type="button" id="qrBack">بازگشت</button>`;

/* ---------- ثبت قرائت ---------- */
function readForm(dev){
  const R=readings(dev), last=R[R.length-1], today=jStr(jNow()), same=R.find(x=>x.date===today);
  view('ثبت قرائت — '+dev.name,`
    <p>${last?'آخرین قرائت: <b>'+sep(last.val)+'</b> '+esc(last.unit||dev.unit)+' ('+fa(last.date)+')':'قرائت قبلی ثبت نشده است.'}</p>
    ${same?'<div class="warn">برای امروز قرائت ثبت شده است ('+sep(same.val)+'). عدد تازه جای آن می‌نشیند.</div>':''}
    <label>عدد کنتور (${esc(dev.unit)})<input type="text" class="big" id="qrVal" inputmode="decimal" autocomplete="off" dir="ltr"></label>
    <div class="symsg" id="qrMsg"></div>
    <button type="button" class="go" id="qrSave">ثبت</button>${back(dev)}`);
  let armed='';
  const v=$('qrVal'); setTimeout(()=>{ try{ v.focus(); }catch(e){} },50);
  v.addEventListener('input',()=>{ armed=''; $('qrSave').textContent='ثبت'; $('qrMsg').textContent=''; });
  v.addEventListener('keydown',e=>{ if(e.key==='Enter') $('qrSave').click(); });
  on('qrSave',()=>{
    const s=latin(v.value).replace(/[,٬\s]/g,''), n=+s, msg=$('qrMsg');
    if(!s || isNaN(n) || n<0){ msg.className='symsg bad'; msg.textContent='عدد کنتور را درست بنویسید'; v.focus(); return; }
    const prev=R.filter(x=>x.date<today).pop();
    if(prev && n<+prev.val && armed!==s){ armed=s; msg.className='symsg bad';
      msg.textContent=`این عدد از قرائت قبلی (${sep(prev.val)}) کمتر است. اگر درست است، دوباره «ثبت» را بزنید.`; $('qrSave').textContent='ثبت با همین عدد'; return; }
    if(prev && n-prev.val>5000 && armed!==s){ armed=s; msg.className='symsg bad';
      msg.textContent=`اختلاف با قرائت قبلی ${sep(n-prev.val)} است. اگر درست است، دوباره «ثبت» را بزنید.`; $('qrSave').textContent='ثبت با همین عدد'; return; }
    const log=LS('nt_daftar_v1',[]); const L=Array.isArray(log)?log:[];
    const i=L.findIndex(x=>x && x.dev===dev.name && latin(x.date)===today);
    const rec={dev:dev.name,unit:(last&&last.unit)||dev.unit,val:n,date:today};
    if(i>-1) L[i]=rec; else L.push(rec);
    if(!LSset('nt_daftar_v1',L)){ msg.className='symsg bad'; msg.textContent='ذخیره نشد — حافظه مرورگر پر است'; return; }
    touch(['nt_daftar_v1']); toast('قرائت ثبت شد: '+sep(n)+' '+rec.unit); home(dev.id);
  });
  on('qrBack',()=>home(dev.id));
}

/* ---------- توقف ---------- */
function who(){ let n=''; try{ n=String(LS('nt_tavaqof_name','')||''); }catch(e){} if(!n){ try{ n=S()&&S().myName?S().myName():''; }catch(e){} } return n; }
function stopForm(dev){
  let cause='';
  view('شروع توقف — '+dev.name,`
    <label>ساعت توقف<input type="text" id="qrFrom" inputmode="numeric" dir="ltr" value="${nowHM()}"></label>
    <div class="grp">علت توقف</div>
    ${CAUSES.map(c=>`<div class="grp">${esc(c.g)}</div><div class="chips">${c.L.map(x=>`<button type="button" data-c="${esc(x)}" aria-pressed="false">${esc(x)}</button>`).join('')}</div>`).join('')}
    <label>توضیح (اختیاری)<input type="text" id="qrNote" autocomplete="off" style="direction:rtl;text-align:right"></label>
    <label>نام ثبت‌کننده<input type="text" id="qrWho" autocomplete="off" style="direction:rtl;text-align:right" value="${esc(who())}"></label>
    <div class="symsg" id="qrMsg"></div>
    <button type="button" class="go" id="qrSave">ثبت توقف</button>${back(dev)}`);
  $('ntQrBody').querySelectorAll('[data-c]').forEach(b=>b.addEventListener('click',()=>{
    cause=b.dataset.c; $('ntQrBody').querySelectorAll('[data-c]').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false')); }));
  on('qrSave',()=>{
    const from=hmOk($('qrFrom').value), msg=$('qrMsg'); msg.className='symsg bad';
    if(!from){ msg.textContent='ساعت را مثل 08:30 بنویسید'; return; }
    if(!cause){ msg.textContent='علت توقف را انتخاب کنید'; return; }
    if(openStop(dev)){ msg.textContent='این دستگاه همین حالا یک توقف باز دارد'; return; }
    const by=$('qrWho').value.trim(); if(by) LSset('nt_tavaqof_name',by);
    const db=LS('nt_tavaqof_v1',{})||{}, k=jStr(jNow())+'|'+shiftNow();
    if(!db[k]) db[k]={stops:[],sent:false};
    db[k].stops.push({id:'s'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),dev:dev.name,from,to:'',cause,note:$('qrNote').value.trim(),by});
    db[k].sent=false;
    if(!LSset('nt_tavaqof_v1',db)){ msg.textContent='ذخیره نشد'; return; }
    touch(['nt_tavaqof_v1']); toast('توقف ثبت شد — ساعت '+fa(from)); home(dev.id);
  });
  on('qrBack',()=>home(dev.id));
}
function runForm(dev){
  const os=openStop(dev); if(!os){ home(dev.id); return; }
  view('پایان توقف — '+dev.name,`
    <p>متوقف از <b>${fa(os.s.from)}</b>${os.day!==jStr(jNow())?' ('+fa(os.day)+')':''} — ${esc(os.s.cause)}</p>
    <label>ساعت راه افتادن<input type="text" class="big" id="qrTo" inputmode="numeric" dir="ltr" value="${nowHM()}"></label>
    <div class="symsg" id="qrMsg"></div>
    <button type="button" class="go" id="qrSave">ثبت پایان توقف</button>${back(dev)}`);
  on('qrSave',()=>{
    const to=hmOk($('qrTo').value), msg=$('qrMsg'); msg.className='symsg bad';
    if(!to){ msg.textContent='ساعت را مثل 10:15 بنویسید'; return; }
    if(to===os.s.from){ msg.textContent='ساعت پایان با ساعت توقف یکی است'; return; }
    const db=LS('nt_tavaqof_v1',{})||{}, s=((db[os.k]&&db[os.k].stops)||[]).find(x=>x.id===os.s.id);
    if(!s){ msg.textContent='این توقف پیدا نشد — شاید از سیستم دیگری حذف شده است'; return; }
    s.to=to; db[os.k].sent=false;
    if(!LSset('nt_tavaqof_v1',db)){ msg.textContent='ذخیره نشد'; return; }
    touch(['nt_tavaqof_v1']); toast('راه افتاد — ساعت '+fa(to)); home(dev.id);
  });
  on('qrBack',()=>home(dev.id));
}

/* ---------- ثبت مشکل ---------- */
function probForm(dev){
  const os=openStop(dev);
  const opt=(L,sel)=>L.map(x=>`<option${x===sel?' selected':''}>${esc(x)}</option>`).join('');
  view('ثبت مشکل — '+dev.name,`
    <label>سیستم<select id="qrSys" style="display:block;width:100%;margin-top:3px">${opt(SYS,'')}</select></label>
    <label>شرح مشکل<textarea id="qrDesc" rows="3" style="direction:rtl;text-align:right;font-family:inherit;font-size:.95rem"></textarea></label>
    <div class="syub" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <label>اهمیت<select id="qrSev" style="display:block;width:100%;margin-top:3px">${opt(['بحرانی','بالا','متوسط','پایین'],'متوسط')}</select></label>
      <label>وضعیت دستگاه<select id="qrCur" style="display:block;width:100%;margin-top:3px">${opt(['در حال کار','با ریسک','خوابیده'],os?'خوابیده':'در حال کار')}</select></label>
    </div>
    <div class="symsg" id="qrMsg"></div>
    <button type="button" class="go" id="qrSave">ثبت مشکل</button>${back(dev)}`);
  setTimeout(()=>{ try{ $('qrDesc').focus(); }catch(e){} },50);
  on('qrSave',()=>{
    const desc=$('qrDesc').value.trim(), msg=$('qrMsg');
    if(!desc){ msg.className='symsg bad'; msg.textContent='شرح مشکل را بنویسید'; return; }
    const j=jNow(), o=LS('nt_moshkel_v1',null), box=(o && Array.isArray(o.rows))?o:{row:(o&&o.row)||5,rows:[]};
    box.rows.push({y:j.y,m:j.m,d:j.d,mn:MONTHS[j.m-1],dev:dev.name,sys:$('qrSys').value,desc,sev:$('qrSev').value,cur:$('qrCur').value,
      part:'خیر',state:'باز',fix:'',src:'دفترچه'});
    if(!LSset('nt_moshkel_v1',box)){ msg.className='symsg bad'; msg.textContent='ذخیره نشد'; return; }
    touch(['nt_moshkel_v1']); toast('مشکل ثبت شد'); home(dev.id);
  });
  on('qrBack',()=>home(dev.id));
}

/* ---------- سوابق ---------- */
function hist(dev){
  const part=(t,L)=>`<div class="hist"><h3>${t}</h3>${L.length?L.join(''):'<div>چیزی ثبت نشده</div>'}</div>`;
  let h='';
  if(canSee('دفترچه قرائت')) h+=part('قرائت‌ها',readings(dev).slice(-6).reverse().map(x=>`<div>${fa(x.date)} — <b>${sep(x.val)}</b> ${esc(x.unit||'')}</div>`));
  if(canSee('توقف شیفت')) h+=part('توقف‌ها',stopsOf(dev).slice(-6).reverse().map(({day,sh,s})=>`<div>${fa(day)} ${esc(sh)} — ${fa(s.from)} تا ${s.to?fa(s.to):'<b class="stop">هنوز متوقف</b>'} — ${esc(s.cause)}</div>`));
  if(canSee('ثبت مشکلات')) h+=part('مشکلات باز',probsOf(dev).filter(r=>r.state!=='بسته').slice(-6).reverse().map(r=>`<div>${fa(rDate(r))} — ${esc(r.sys||'')}: ${esc(r.desc||'')} <small style="display:inline">(${esc(r.sev||'')})</small></div>`));
  if(canSee('انبار')) h+=part('خروج انبار',outsOf(dev).slice(-8).reverse().map(r=>`<div>${fa(rDate(r))} — ${esc(r.item||'')} × ${fa(r.qty)}${r.svc?' <small style="display:inline">('+esc(r.svcName||'تعویض روغن')+')</small>':''}</div>`));
  view('سوابق — '+dev.name,h+back(dev));
  on('qrBack',()=>home(dev.id));
}

/* ---------- اسکن داخل سامانه ---------- */
let cam=null;
function stopCam(){ const c=cam; cam=null; if(c){ try{ c.stop().catch(()=>{}).then(()=>{ try{ c.clear(); }catch(e){} }); }catch(e){} } }
function idFrom(text){ const m=/#m=([A-Za-z0-9]+)/.exec(String(text||'')); return m?m[1]:''; }
function scan(){
  view('اسکن کد QR دستگاه',`<div id="ntQrCam"></div><div class="symsg" id="qrMsg">در حال روشن کردن دوربین…</div><button type="button" id="qrClose">بستن</button>`);
  on('qrClose',close);
  loadLib(LIB_SCAN,()=>!!(window.__Html5QrcodeLibrary__||window.Html5Qrcode)).then(()=>{
    if(!$('ntQrCam')) return;
    const H=(window.__Html5QrcodeLibrary__&&window.__Html5QrcodeLibrary__.Html5Qrcode)||window.Html5Qrcode;
    cam=new H('ntQrCam');
    return cam.start({facingMode:'environment'},{fps:10,qrbox:{width:220,height:220}},text=>{
      const id=idFrom(text); if(!id){ $('qrMsg').className='symsg bad'; $('qrMsg').textContent='این کد مال سامانه نت نیست'; return; }
      stopCam(); home(id);
    },()=>{}).then(()=>{ const m=$('qrMsg'); if(m){ m.className='symsg'; m.textContent='دوربین را روی برچسب دستگاه بگیرید'; } });
  }).catch(e=>{ const m=$('qrMsg'); if(!m) return; m.className='symsg bad';
    m.textContent=/Permission|NotAllowed/i.test(String(e&&(e.name||e.message||e)))?'اجازه دوربین داده نشد. از تنظیمات مرورگر اجازه دوربین را بدهید، یا با دوربین گوشی اسکن کنید.'
      :'دوربین باز نشد. با دوربین معمولی گوشی برچسب را اسکن کنید.'; });
}

/* ---------- چاپ برچسب ---------- */
function labels(){
  view('برچسب QR دستگاه‌ها',`
    <p>دستگاه‌ها را انتخاب کنید. هر برگه A4 هشت برچسب دارد. داخل کد فقط آدرس سامانه و نام کوتاه دستگاه است (بدون رمز).</p>
    <label class="chk"><input type="checkbox" id="qrAll" checked> همه</label>
    <div class="qrlist">${DEVS.map(d=>`<label class="chk"><input type="checkbox" data-id="${d.id}" checked> ${esc(d.name)} <small style="display:inline;direction:ltr">(${d.id})</small></label>`).join('')}</div>
    <div class="symsg" id="qrMsg"></div>
    <button type="button" class="go" id="qrPrint">چاپ برچسب‌ها</button><button type="button" id="qrClose">بستن</button>`);
  const boxes=()=>[...$('ntQrBody').querySelectorAll('input[data-id]')];
  $('qrAll').addEventListener('change',()=>boxes().forEach(b=>b.checked=$('qrAll').checked));
  on('qrClose',close);
  on('qrPrint',()=>{
    const ids=boxes().filter(b=>b.checked).map(b=>b.dataset.id), msg=$('qrMsg');
    if(!ids.length){ msg.className='symsg bad'; msg.textContent='هیچ دستگاهی انتخاب نشده'; return; }
    msg.className='symsg'; msg.textContent='در حال ساخت برچسب‌ها…';
    loadLib(LIB_QR,()=>typeof window.qrcode==='function').then(()=>{
      const html=sheet(ids.map(byId));
      let fr=$('ntQrPrint'); if(fr) fr.remove();
      fr=document.createElement('iframe'); fr.id='ntQrPrint'; fr.setAttribute('aria-hidden','true');
      fr.style.cssText='position:fixed;width:0;height:0;border:0;left:-10px;top:-10px';
      document.body.appendChild(fr); window.__ntQrLast=html;
      const d=fr.contentWindow.document; d.open(); d.write(html); d.close();
      setTimeout(()=>{ try{ fr.contentWindow.focus(); fr.contentWindow.print(); }catch(e){} msg.textContent='پنجره چاپ باز شد. برای فایل PDF، «Save as PDF» را انتخاب کنید.'; },350);
    }).catch(()=>{ msg.className='symsg bad'; msg.textContent='کتابخانه کد QR بارگذاری نشد. اتصال اینترنت را بررسی کنید.'; });
  });
}
function svgFor(text){ const q=window.qrcode(0,'M'); q.addData(text); q.make(); return q.createSvgTag({cellSize:4,margin:16,scalable:true}); }
function sheet(list){
  const one=d=>`<div class="lb"><div class="q">${svgFor(qrUrl(d.id))}</div><div class="n">${esc(d.name)}</div><div class="s">سامانه نت — با دوربین گوشی اسکن کنید — ${d.id}</div></div>`;
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>برچسب QR دستگاه‌ها</title><style>
@page{size:A4;margin:10mm}
*{box-sizing:border-box}body{margin:0;font-family:Tahoma,'Vazirmatn',sans-serif;color:#000}
.pg{display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:68mm;gap:4mm;page-break-after:always}
.pg:last-child{page-break-after:auto}
.lb{border:1px dashed #888;border-radius:4mm;padding:4mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;break-inside:avoid}
.q{width:44mm;height:44mm}.q svg{width:100%;height:100%;display:block}
.n{font-size:14pt;font-weight:bold;margin-top:3mm}.s{font-size:8pt;color:#333;margin-top:1mm}
</style></head><body>${chunk(list,8).map(p=>`<div class="pg">${p.map(one).join('')}</div>`).join('')}</body></html>`;
}
const chunk=(a,n)=>{ const r=[]; for(let i=0;i<a.length;i+=n) r.push(a.slice(i,i+n)); return r; };

/* ---------- شروع ---------- */
function booted(){ try{ return typeof ntBooted!=='undefined' && ntBooted && !window.ntLocked; }catch(e){ return false; } }
function fromHash(){
  const id=idFrom(location.hash); if(!id) return;
  const go=()=>{ if(!booted()){ setTimeout(go,500); return; }
    try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){}
    home(id); };
  go();
}
function addBtn(){
  const row=document.querySelector('.tabrow'); if(!row || $('ntQrScan')) return;
  const b=document.createElement('button'); b.type='button'; b.className='qrscan'; b.id='ntQrScan'; b.setAttribute('aria-label','اسکن کد QR دستگاه');
  b.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10"/></svg><span class="tx">اسکن</span>';
  b.addEventListener('click',scan);
  const sy=$('ntSyBtn'); if(sy) row.insertBefore(b,sy); else row.appendChild(b);
}
dlg(); addBtn(); fromHash();
window.addEventListener('hashchange',fromHash);
window.addEventListener('message',e=>{ const d=e&&e.data; if(!d) return; if(d.nt==='qrlabels') labels(); else if(d.nt==='qrscan') scan(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape' && $('ntQrDlg') && !$('ntQrDlg').hidden) close(); });
window.ntQr={DEVS,home,scan,labels,qrUrl,sheet};
})();
