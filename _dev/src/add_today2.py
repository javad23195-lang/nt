# طرح تازه — مرحله ۲: «امروز» (و کارت‌های «نیاز به توجه» در «مدیریت»)
# ۱) چهار کاشی بالای «امروز»: خراب، متوقف، سرویس گذشته، عقب‌افتاده — زدن روی کاشی «نیاز به توجه» را فیلتر می‌کند (دوباره = همه).
# ۲) کارت‌های «نیاز به توجه»: کارت جدا، آیکون رنگی پر، نام دستگاه + وضعیت رنگی، علت، «از ساعت … · … توقف».
#    سرویس گذشته: یک کارت برای هر دستگاه (نه یک خط خلاصه)؛ زدن = پرونده همان دستگاه.
# ۳) گوشی: عنوان و تاریخ تکراری داخل صفحه پنهان (سربرگ بالا همان را نشان می‌دهد)؛ برچسب «بخش …» می‌ماند.
# پیش از add_mgmt اجرا می‌شود تا «مدیریت» هم کارت‌های تازه را داشته باشد.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='امروز')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b,n=1):
    global t
    assert t.count(a)==n,(a[:80],t.count(a)); t=t.replace(a,b)
# زمان شروع توقف در دسترس باشد
rep("open[dk]={cause:x.cause||'نامشخص',el}","open[dk]={cause:x.cause||'نامشخص',el,from:x.from||''}")
# ردیف‌های ناوگان: دسته، نام، وضعیت، توضیح زمان
rep("D.list.filter(x=>x.st==='bad').forEach(x=>R.push({c:'r',t:x.n+' خراب است',",
    "D.list.filter(x=>x.st==='bad').forEach(x=>R.push({c:'r',cat:'bad',nm:x.n,st:'خراب',m:atMeta(x),t:x.n+' خراب است',")
rep("D.list.filter(x=>x.st==='wa'||x.st==='svc').forEach(x=>R.push({c:'w',t:x.n+(x.st==='svc'?' در سرویس':' منتظر است'),",
    "D.list.filter(x=>x.st==='wa'||x.st==='svc').forEach(x=>R.push({c:'w',cat:'stop',nm:x.n,st:x.st==='svc'?'در سرویس':'منتظر',m:atMeta(x),t:x.n+(x.st==='svc'?' در سرویس':' منتظر است'),")
rep("    R.push({c:'w',t:x.t,s:x.s,go:x.go}); }); }catch(e){}","    R.push({c:'w',cat:x.go==='برنامه روزانه'?'late':'oth',t:x.t,s:x.s,go:x.go}); }); }catch(e){}")
# سرویس گذشته: کارت هر دستگاه
rep("""  if(R.length) out.push({c:'r',t:fa(R.length)+' سرویس گذشته است',s:lst(R),go:'دفترچه قرائت'});
  if(O.length) out.push({c:'w',t:fa(O.length)+' سرویس نزدیک است',s:lst(O),go:'دفترچه قرائت'});""",
"""  { const G={}; R.forEach(x=>(G[x.it.dev]=G[x.it.dev]||[]).push(x));
    Object.keys(G).forEach(dv=>{ const L=G[dv], u=L.map(svPast).filter(Boolean);
      out.push({c:'r',cat:'svc',nm:dv,st:'سرویس گذشته',t:dv+' — سرویس گذشته',s:L.map(x=>x.it.name).join('، '),m:u[0]||'',dev:dv,go:'دفترچه قرائت'}); }); }
  if(O.length) out.push({c:'w',cat:'svc',t:fa(O.length)+' سرویس نزدیک است',s:lst(O),go:'دفترچه قرائت'});""")
# رسم: فیلتر کاشی + کارت تازه
rep("  const box=$('atCard'); if(!box) return; const R=atRows(), MAX=7; box.hidden=false;\n  const n=$('atN'); n.textContent=R.length?fa(R.length):'✓'; n.classList.toggle('z',!R.length);",
    "  const box=$('atCard'); if(!box) return; const R0=atRows(), R=AT_F?R0.filter(r=>r.cat===AT_F||(AT_F==='stop'&&r.cat==='bad')):R0, MAX=AT_F?99:7; box.hidden=false;\n  try{ tiRender(R0); }catch(e){}\n  const n=$('atN'); n.textContent=R0.length?fa(R0.length):'✓'; n.classList.toggle('z',!R0.length);")
a0=t.index("  $('atList').innerHTML=R.length?R.slice(0,MAX).map((r,i)=>"); a1=t.index("\n",a0)
t=t[:a0]+"""  $('atList').innerHTML=(AT_F?`<div class="atf"><span>فقط «${esc(TI_N[AT_F]||'')}» — ${fa(R.length)} مورد</span><button type="button" id="atFx">نمایش همه</button></div>`:'')+(R.length?R.slice(0,MAX).map((r,i)=>`<button type="button" class="ar ${r.c}${r.cat?' k-'+r.cat:''}" data-i="${i}"><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${r.cat==='svc'?AT_SVC:AT_I[r.c]}</svg></span><span class="tx">${r.nm?`<b><bdi>${esc(r.nm)}</bdi> <em class="st">${esc(r.st||'')}</em></b>`:`<b>${esc(r.t)}</b>`}${r.s?`<span>${esc(r.s)}</span>`:''}${r.m?`<small>${esc(r.m)}</small>`:''}</span>${r.tag&&!r.m?`<span class="tag">${esc(r.tag)}</span>`:''}<span class="go" aria-hidden="true">‹</span></button>`).join('')+(R.length>MAX?`<div class="atm">و ${fa(R.length-MAX)} مورد دیگر در بخش‌های پایین</div>`:''):(AT_F?'<div class="atz">در این دسته موردی نیست</div>':'<div class="atz">✓ چیزی نیاز به توجه ندارد</div>'));
  { const fx=$('atFx'); if(fx) fx.addEventListener('click',()=>{ AT_F=''; atRender(); }); }"""+t[a1:]
JS=r"""
/* ===== طرح تازه: کاشی‌های «امروز» و کارت‌های «نیاز به توجه» (add_today2) ===== */
var AT_F='';
const AT_SVC='<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>';
const TI_N={bad:'خراب',stop:'متوقف',svc:'سرویس',late:'عقب‌افتاده'};
function atMeta(x){ if(!x||!x.o) return ''; const f=String(x.o.from||'').trim(); const el=x.o.el!==null&&x.o.el!==undefined?flDur(x.o.el):'';
  return [f?'از ساعت '+fa(f):'', el?el+' توقف':''].filter(Boolean).join(' · '); }
function svPast(x){ if(!x) return ''; if(x.by==='use'&&x.rem!==null&&x.rem<0) return fa(Math.round(-x.rem).toLocaleString('en-US'))+' '+(x.it.unit||'ساعت')+' از موعد گذشته';
  if(x.days!==null&&x.days<0) return fa(-x.days)+' روز از موعد گذشته'; return ''; }
const TI_I={bad:'<circle cx="12" cy="12" r="10" fill="#C62828"/><path d="M12 7v6M12 16.5h.01" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>',
  stop:'<circle cx="12" cy="12" r="10" fill="#1B2430"/><path d="M9.6 8.3v7.4M14.4 8.3v7.4" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>',
  svc:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="#E6A52E" stroke="#8A5A12" stroke-width="1.6" stroke-linejoin="round"/>',
  late:'<rect x="5" y="4" width="14" height="17" rx="2.5" fill="#B7791F"/><rect x="9" y="2.5" width="6" height="3.6" rx="1.2" fill="#7A4F10"/><path d="M12 9v5M12 17h.01" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>'};
function tiRender(R0){
  if(document.documentElement.classList.contains('mgmt')) return;
  let box=$('tiBox'); const at=$('atCard'); if(!at) return;
  if(!box){ box=document.createElement('div'); box.id='tiBox'; box.className='tiles4'; box.setAttribute('role','group'); box.setAttribute('aria-label','خلاصه امروز'); }
  { const par=at.parentNode, first=par.firstElementChild; if(box.parentNode!==par || (first!==box && par.classList.contains('col'))) par.insertBefore(box, par.classList.contains('col')?first:at); }   /* بالای ستون اصلی (چیدمان ممکن است بعداً کارت را جابه‌جا کند) */
  let svN=0; try{ const it=LS('nt_svc_v1'); if(Array.isArray(it)) svN=ntSvc.all(it.filter(x=>x&&ntIn(x.dev)),LS('nt_daftar_v1')||[],K).filter(x=>x.st==='r').length; }catch(e){}
  let lt=0; try{ lt+=progLate(LS('nt_prog_v1')||{}); }catch(e){} try{ lt+=todo.filter(x=>!x.done && !x.time && x.date && x.date<K).length; }catch(e){}
  const C={bad:R0.filter(r=>r.cat==='bad').length, stop:R0.filter(r=>r.cat==='bad'||r.cat==='stop').length, svc:svN, late:lt};
  box.innerHTML=['bad','stop','svc','late'].map(k=>`<button type="button" class="ti ti-${k}${C[k]?'':' z'}${AT_F===k?' on':''}" data-k="${k}" aria-pressed="${AT_F===k}"><svg viewBox="0 0 24 24" aria-hidden="true">${TI_I[k]}</svg><b>${fa(C[k])}</b><span>${TI_N[k]==='سرویس'?'سرویس گذشته':TI_N[k]}</span></button>`).join('');
  box.querySelectorAll('.ti').forEach(b=>b.addEventListener('click',()=>{ const k=b.dataset.k;
    if(k==='late' && !R0.some(r=>r.cat==='late')){ AT_F=''; atRender(); const e=$('tList')||$('dayCard'); if(e) try{ e.scrollIntoView({behavior:'smooth',block:'start'}); }catch(x){} return; }
    AT_F=AT_F===k?'':k; atRender(); try{ $('atCard').scrollIntoView({behavior:'smooth',block:'nearest'}); }catch(x){} }));
}
"""
k=t.index("<script>")+8; t=t[:k]+JS+"\n"+t[k:]   # در اولین اسکریپت: پیش از اولین atRender تعریف شده باشد
CSS="""
/* ===== طرح تازه (add_today2) ===== */
.tiles4{order:0;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:4px 0 12px}
.ti{display:flex;flex-direction:column;align-items:center;gap:2px;min-height:96px;padding:10px 4px 8px;border-radius:16px;border:1.5px solid #D5DCE3;background:#fff;font:inherit;color:#17212B;cursor:pointer;box-shadow:0 1px 2px rgba(27,36,48,.05)}
.ti svg{width:24px;height:24px}
.ti b{font-size:1.65rem;font-weight:900;line-height:1.15}
.ti span{font-size:.74rem;font-weight:700;color:#3B4856;white-space:nowrap}
.ti-bad b{color:#C62828}.ti-svc b,.ti-late b{color:#8A5A12}
.ti.z{opacity:.55}.ti.z b{color:#51606E}
.ti.on{border-color:#1B2430;box-shadow:inset 0 0 0 1.5px #1B2430;background:#F6F8FA}
.ti:focus-visible{outline:3px solid #E6A52E;outline-offset:2px}
#atCard.card.at{background:transparent;border:0;box-shadow:none;padding:0}
#atCard>h2{padding:0 2px;margin:6px 0 10px}
#atList{display:flex;flex-direction:column;gap:10px;margin:0!important}
#atList .ar{border:1px solid #D5DCE3!important;border-radius:16px;background:#fff;min-height:72px;padding:12px 14px;box-shadow:0 1px 2px rgba(27,36,48,.05)}
#atList .ar::before{display:none!important}
#atList .ar .ico{width:44px;height:44px;border-radius:12px}
#atList .ar .ico svg{width:24px;height:24px}
#atList .ar.r .ico{background:#C62828;color:#fff}
#atList .ar.w .ico{background:#E6A52E;color:#1B2430}
#atList .ar.i .ico{background:#1F5F99;color:#fff}
#atList .ar .tx b{font-size:1rem;font-weight:800}
#atList .ar .tx b bdi{font-weight:800}
#atList .ar .tx em.st{font-style:normal;font-size:.8rem;font-weight:800;margin-inline-start:6px}
#atList .ar.r .tx em.st{color:#C62828}#atList .ar.w .tx em.st{color:#8A5A12}
#atList .ar .tx span{font-size:.86rem;color:#2B3846;margin-top:1px}
#atList .ar .tx small{display:block;font-size:.76rem;color:#5B6874;margin-top:2px}
#atList .ar .go{font-size:1.3rem;color:#8A96A1}
#atList .atm,#atList .atz{padding:4px 4px}
.atf{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;border-radius:12px;background:#1B2430;color:#fff;font-size:.86rem;font-weight:700}
.atf button{min-height:36px;padding:0 12px;border-radius:10px;border:0;background:#E6A52E;color:#1B2430;font:inherit;font-weight:800}
html.mgmt #atList{display:grid}
@media (max-width:899px){
  header h1{font-size:0!important;margin:0!important;line-height:0}
  header h1>span:first-child{display:none}
  header h1 .dpt{font-size:.78rem!important;line-height:1.6;margin:0 0 6px!important}
  #hDate{display:none!important}
  header{padding-top:8px!important;padding-bottom:0!important;min-height:0}
  header:not(:has(.dpt)){display:none!important}
  html:not(.mgmt) #atCard{order:1!important} html:not(.mgmt) #alBox{order:2!important}   /* نیاز به توجه پیش از هشدارها */
}
"""
k=t.rfind("</style>"); t=t[:k]+CSS+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('today2')
