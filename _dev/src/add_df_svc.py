# دفترچه قرائت: «برنامه سرویس» زیر هر دستگاه — مانده تا تعویض روغن/فیلتر از آخرین قرائت، «تعویض شد»، اصلاح، افزودن، و چسباندن از اکسل.
# اطلاعات در nt_svc_v1 (موردها) و nt_svc_log_v1 (سابقه تعویض‌ها) — همگام و قفل‌شده؛ هیچ عددی در کد نیست. قاعده در svc.js.
import json,base64,sys,os
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='دفترچه قرائت')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)
SJ=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'svc.js'),encoding='utf-8').read()
assert '</script' not in SJ
rep('      ${hs.length?`<details class="hist">','      ${svcHtml(m)}\n      ${hs.length?`<details class="hist">')
rep('  <button class="btn btn-ghost" id="bImp">ورود لیست قرائت (چسباندن)</button>','''  <button class="btn btn-ghost" id="bImp">ورود لیست قرائت (چسباندن)</button>
  <button class="btn btn-ghost" id="bSvcImp" type="button">برنامه سرویس (چسباندن از اکسل)</button>
  <div class="imp" id="svcImp">
    <label for="svcTxt">هر خط: دستگاه، نام سرویس، آخرین سرویس (قرائت)، تاریخ آخرین سرویس، هر چند (ساعت یا کیلومتر)، سقف ماه (اختیاری). موردی که همان دستگاه و نام را دارد به‌روز می‌شود.</label>
    <textarea id="svcTxt" dir="rtl" spellcheck="false" placeholder="لودر کوماتسو WA470&#9;روغن موتور&#9;27172&#9;1405/07/18&#9;115&#9;12"></textarea>
    <div class="impinfo" id="svcInfo" aria-live="polite"></div>
    <button class="btn btn-save" id="svcGo" type="button" disabled>افزودن به برنامه سرویس</button>
  </div>''')
JS=SJ+r"""
/* ---------- برنامه سرویس ---------- */
const SVK='nt_svc_v1', SVL='nt_svc_log_v1';
const svW=(()=>{ try{ return !parent.ntSync || parent.ntSync.canWriteTab('دفترچه قرائت'); }catch(e){ return true; } })();
let svEdit=null, svNew=null;
function svGet(k){ try{ const o=JSON.parse((SS&&SS.getItem(k))||'[]'); return Array.isArray(o)?o:[]; }catch(e){ return []; } }
function svSet(k,v){ try{ SS.setItem(k,JSON.stringify(v)); return true; }catch(e){ say('ذخیره نشد — حافظه پر است',true); return false; } }
const svId=()=>'s'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function svDay(){ return normDate($('fDate').value)||ntSvc.today(); }
function svText(x,unit){
  if(x.st==='n' && x.every===null) return 'فاصله ثبت نشده';
  let a='';
  if(x.rem!==null) a = x.rem>=0 ? `${faN(x.rem)} ${unit} مانده` : `${faN(-x.rem)} ${unit} گذشته`;
  else if(x.every!==null && x.last===null) a='آخرین سرویس ثبت نشده';
  if(x.by==='time' && x.days!==null) a = (x.days<0 ? `${fa(-x.days)} روز از سقف ${ntSvc.moTxt(x.it.months,fa)} گذشته` : `${fa(x.days)} روز تا سقف ${ntSvc.moTxt(x.it.months,fa)}`) + (a?' · '+a:'');
  return a;
}
function svRow(x,unit){
  const it=x.it;
  if(svEdit===it.id) return svForm(it,unit);
  return `<div class="sr st-${x.st}" data-id="${esc(it.id)}"><i class="sdot" aria-hidden="true"></i>
    <span class="sn">${esc(it.name)}${it.ok===0?' <em class="snok">تأیید نشده</em>':''}</span>
    <span class="sm">${esc(svText(x,unit))}${x.next!==null?` · بعدی ${faN(x.next)}`:''}</span>
    ${svW?`<span class="sb"><button type="button" class="sdone" data-id="${esc(it.id)}">تعویض شد</button><button type="button" class="sed" data-id="${esc(it.id)}" aria-label="اصلاح ${esc(it.name)}">✎</button></span>`:''}</div>`;
}
function svForm(it,unit){
  return `<div class="sr sform" data-id="${esc(it.id||'')}">
    <label>نام سرویس<input data-f="name" value="${esc(it.name||'')}" placeholder="مثلاً روغن موتور"></label>
    <label>هر چند ${esc(unit)}<input data-f="every" inputmode="numeric" value="${esc(it.every??'')}"></label>
    <label>آخرین سرویس (${esc(unit)})<input data-f="last" inputmode="numeric" value="${esc(it.last??'')}"></label>
    <label>تاریخ آخرین سرویس<input data-f="ld" inputmode="numeric" value="${esc(it.ld||'')}" placeholder="1405/07/18"></label>
    ${(()=>{ const s=ntSvc.moSplit(it.months??12); return `<div class="smo"><span>سقف زمانی (هر کدام زودتر برسد)</span><div><label><input data-f="mo" inputmode="numeric" value="${esc(s.mo)}" aria-label="ماه"> ماه</label><label><input data-f="md" inputmode="numeric" value="${esc(s.d)}" aria-label="روز"> روز</label></div></div>`; })()}
    <div class="sfb"><button type="button" class="ssave" data-id="${esc(it.id||'')}">ذخیره</button>
      ${it.id?`<button type="button" class="sdel" data-id="${esc(it.id)}">حذف</button>`:''}
      <button type="button" class="scan">انصراف</button></div></div>`;
}
function svcHtml(m){
  const items=svGet(SVK).filter(x=>x&&x.dev===m.dev);
  if(!items.length && svNew!==m.dev) return svW?`<div class="svc empty"><button type="button" class="sadd" data-dev="${esc(m.dev)}">+ سرویس (تعویض روغن، فیلتر…)</button></div>`:'';
  const A=ntSvc.all(items,log,svDay()), hot=A.filter(x=>x.st==='r'||x.st==='o'||svEdit===x.it.id), rest=A.filter(x=>hot.indexOf(x)<0);
  const nR=A.filter(x=>x.st==='r').length, nO=A.filter(x=>x.st==='o').length;
  return `<div class="svc"><div class="svh">سرویس‌ها${nR?` <b class="sbr">${fa(nR)} گذشته</b>`:''}${nO?` <b class="sbo">${fa(nO)} نزدیک</b>`:''}</div>
    ${hot.map(x=>svRow(x,m.unit)).join('')}
    ${rest.length?`<details class="srest"><summary>${fa(rest.length)} سرویس دیگر (وقت هست)</summary>${rest.map(x=>svRow(x,m.unit)).join('')}</details>`:''}
    ${svNew===m.dev?svForm({dev:m.dev,months:12},m.unit):(svW?`<button type="button" class="sadd" data-dev="${esc(m.dev)}">+ سرویس</button>`:'')}
  </div>`;
}
function svFind(id){ return svGet(SVK).find(x=>x&&x.id===id); }
function svBind(){
  const box=$('list'); if(!box) return;
  box.querySelectorAll('.sdone').forEach(b=>{ const it=svFind(b.dataset.id); if(!it) return;
    const cur=ntSvc.latest(log)[it.dev];
    if(!cur){ b.addEventListener('click',()=>say('اول قرائت این دستگاه را ثبت کنید',true)); return; }
    armButton(b,'تعویض شد',`با قرائت ${faN(cur.val)}؟`,()=>{
      const L=svGet(SVK), x=L.find(y=>y.id===it.id); if(!x) return;
      const prev=ntSvc.state(x,cur.val,svDay()), day=svDay();
      x.last=cur.val; x.ld=day; delete x.ok;
      const G=svGet(SVL); G.push({id:svId(),item:x.id,dev:x.dev,name:x.name,at:cur.val,d:day,due:prev.next,late:(prev.next!==null&&cur.val>prev.next)?1:0});
      if(svSet(SVK,L) && svSet(SVL,G)){ render(); say(`${x.name} ثبت شد — بعدی ${faN(ntSvc.num(x.every)!==null?cur.val+ntSvc.num(x.every):null)}`+(prev.next!==null&&cur.val>prev.next?' (دیر)':'')); }
    },8000); });
  box.querySelectorAll('.sform [data-f=ld]').forEach(el=>el.addEventListener('input',()=>{ try{ maskDate(el); }catch(e){} }));
  box.querySelectorAll('.sed').forEach(b=>b.addEventListener('click',()=>{ svEdit=b.dataset.id; svNew=null; render(); }));
  box.querySelectorAll('.sadd').forEach(b=>b.addEventListener('click',()=>{ svNew=b.dataset.dev; svEdit=null; render(); const f=box.querySelector('.sform [data-f=name]'); if(f) f.focus(); }));
  box.querySelectorAll('.scan').forEach(b=>b.addEventListener('click',()=>{ svEdit=null; svNew=null; render(); }));
  box.querySelectorAll('.sdel').forEach(b=>armButton(b,'حذف','دوباره بزنید',()=>{ const L=svGet(SVK).filter(x=>x.id!==b.dataset.id); if(svSet(SVK,L)){ svEdit=null; render(); say('حذف شد'); } },6000));
  box.querySelectorAll('.ssave').forEach(b=>b.addEventListener('click',()=>{
    const f=b.closest('.sform'), g=k=>(f.querySelector('[data-f='+k+']')||{}).value||'';
    const name=g('name').trim().slice(0,80); if(!name){ say('نام سرویس را بنویسید',true); return; }
    const ldr=String(g('ld')).trim().replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/^(\d{4})(\d{2})(\d{2})$/,'$1/$2/$3');
    const every=ntSvc.num(g('every')), last=ntSvc.num(g('last')), months=ntSvc.moJoin(g('mo'),g('md'))||12, ld=ldr?normDate(ldr):'';
    if((g('mo').trim()&&ntSvc.num(g('mo'))===null)||(g('md').trim()&&ntSvc.num(g('md'))===null)){ say('«سقف زمانی» باید عدد باشد',true); return; }
    if(g('every').trim() && (every===null||every<=0)){ say('«هر چند» باید عدد باشد',true); return; }
    if(g('last').trim() && last===null){ say('«آخرین سرویس» باید عدد باشد',true); return; }
    if(g('ld').trim() && !ld){ say('تاریخ درست نیست',true); return; }
    const L=svGet(SVK); let x=b.dataset.id?L.find(y=>y.id===b.dataset.id):null;
    if(!x){ const dev=f.closest('.dev').querySelector('.rv').dataset.dev; x={id:svId(),dev}; L.push(x); }
    Object.assign(x,{name,every:every===null?'':every,last:last===null?'':last,ld:ld||'',months}); delete x.ok;
    if(svSet(SVK,L)){ svEdit=null; svNew=null; render(); say('ذخیره شد'); }
  }));
}
{ const _rn=render; render=function(){ _rn.apply(this,arguments); try{ svBind(); }catch(e){ console.error(e); } }; }
/* چسباندن برنامه سرویس */
$('bSvcImp').addEventListener('click',()=>{ const b=$('svcImp'); b.classList.toggle('show'); if(b.classList.contains('show')){ try{ $('svcTxt').focus(); b.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){} } });
$('svcTxt').addEventListener('input',()=>{ const P=ntSvc.parse($('svcTxt').value);
  $('svcInfo').textContent=P.ok.length?`${fa(P.ok.length)} مورد خوانده شد`+(P.bad.length?` — ${fa(P.bad.length)} خط نامعتبر (خط ${P.bad.slice(0,5).map(fa).join('، ')})`:''):(P.bad.length?'قالب خط‌ها درست نیست':'');
  $('svcGo').disabled=!P.ok.length || !svW; });
$('svcGo').addEventListener('click',()=>{ const P=ntSvc.parse($('svcTxt').value); if(!P.ok.length) return;
  const L=svGet(SVK); let n=0,u=0;
  P.ok.forEach(r=>{ const k=norm(r.dev)+'|'+norm(r.name), x=L.find(y=>norm(y.dev)+'|'+norm(y.name)===k);
    if(x){ Object.assign(x,{every:r.every,last:r.last,ld:r.ld,months:r.months}); if(r.every==='') x.ok=0; else delete x.ok; u++; }
    else{ const y=Object.assign({id:svId()},r); if(r.every==='') y.ok=0; L.push(y); n++; } });
  if(svSet(SVK,L)){ $('svcTxt').value=''; $('svcInfo').textContent=''; $('svcGo').disabled=true; $('svcImp').classList.remove('show'); render(); say(`${fa(n)} مورد تازه، ${fa(u)} به‌روز شد`); } });
"""
rep("function render(){",JS+"\nfunction render(){")
CSS=""".svc{margin-top:10px;border-top:1px dashed #D5DCE2;padding-top:8px}
.svc.empty{border-top:0;padding-top:0}
.svh{font-size:.85rem;font-weight:800;color:#3D4852;margin-bottom:4px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.svh b{font-size:.75rem;border-radius:10px;padding:1px 8px}
.svh .sbr{background:#FBE5E2;color:#A32018}.svh .sbo{background:#FFF1D6;color:#7A4300}
.sr{display:grid;grid-template-columns:14px 1fr auto;gap:2px 8px;align-items:center;padding:7px 0;border-bottom:1px solid #EEF1F4}
.sr .sdot{width:10px;height:10px;border-radius:50%;background:#9AA6AF}
.sr.st-r .sdot{background:#B3261E}.sr.st-o .sdot{background:#C98A1B}.sr.st-g .sdot{background:#1E7F4F}
.sr .sn{font-weight:700;font-size:.9rem}
.sr .snok{font-style:normal;font-size:.72rem;font-weight:700;color:#7A4300;background:#FFF1D6;border-radius:8px;padding:0 6px}
.sr .sm{grid-column:2;font-size:.8rem;color:#3D4852}
.sr.st-r .sm{color:#A32018;font-weight:700}.sr.st-o .sm{color:#7A4300;font-weight:700}
.sr .sb{grid-column:3;grid-row:1/span 2;display:flex;gap:4px}
.sr .sb button,.svc .sadd,.sform button{min-height:44px;border-radius:8px;border:1px solid #C3CDD5;background:#fff;font:inherit;font-size:.85rem;font-weight:700;cursor:pointer;padding:0 10px;color:#17212B}
.sr .sb .sdone{border-color:#1E7F4F;color:#1E7F4F}
.sr .sb .sdone.armed{background:#1E7F4F;color:#fff}
.sr .sb .sed{min-width:44px}
.svc .sadd{width:100%;margin-top:6px;border-style:dashed;color:#3D4852}
.srest summary{cursor:pointer;font-size:.82rem;color:#3D4852;padding:8px 0;min-height:32px}
.sform{display:block;background:#F4F6F8;border-radius:10px;padding:10px;margin:6px 0}
.sform label{display:block;font-size:.8rem;font-weight:700;margin-bottom:6px}
.sform input{display:block;width:100%;box-sizing:border-box;margin-top:3px;min-height:44px;border:1px solid #9AA6AF;border-radius:8px;padding:0 8px;font:inherit}
.sform .sfb{display:flex;gap:6px;flex-wrap:wrap}.sform .sfb button{flex:1}
.sform .smo{margin-bottom:6px;font-size:.8rem;font-weight:700}
.sform .smo>div{display:flex;gap:10px;margin-top:3px}
.sform .smo label{display:flex;align-items:center;gap:6px;flex:1;margin:0}
.sform .smo input{margin:0;text-align:center}
.sform .ssave{background:#0B5C7A;border-color:#0B5C7A;color:#fff}.sform .sdel{color:#A32018;border-color:#E0A39C}
.sform .sdel.armed{background:#A32018;color:#fff}
"""
k0=t.rfind("</style>"); t=t[:k0]+CSS+t[k0:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('df svc')
