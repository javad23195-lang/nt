# «امروز» و «مدیریت»: چیدمان و ظاهر تازه کارت‌ها (یک کد برای هر دو نما؛ add_mgmt.py بعد از این کپی می‌سازد).
# امروز (رایانه): ستون اصلی = هشدارها، نیاز به توجه، نیمه‌تمام، زمان‌دار | ستون کنار = یادداشت امروز، تقویم | پایین: بخش‌ها، QR، پشتیبان.
# مدیریت: نوار خلاصه (یک کارت با ۴ خانه) ← ناوگان (کاشی‌های دستگاه) ← نیاز به توجه ← خط زمان ← نمودار و گزارش کنار هم.
# گوشی: یک ستون با ترتیب (order). ستون‌ها با JS ساخته می‌شوند (div.col با display:contents در گوشی).
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='امروز')
t=base64.b64decode(d['b64']).decode('utf-8')
CSS=r"""
/* ===== چیدمان و ظاهر تازه (add_layout) ===== */
:root{--nv:#1B2430;--am:#E6A52E;--ln:#DDE3E9;--mut:#5B6874;--red:#B3261E;--amd:#8A5300;--grn:#1E7F4F;--blu:#1F5F99}
body{background:#EEF2F5}
.card{border:1px solid var(--ln);border-radius:16px;padding:16px;margin-bottom:14px;box-shadow:none}
.card h2{font-size:1rem;font-weight:800;color:var(--nv)!important;display:flex;align-items:center;gap:8px;margin:0 0 10px}
.card h2 small{margin-inline-start:auto;font-size:.76rem;font-weight:500;color:var(--mut)}
header h1{font-size:1.35rem;color:var(--nv)}
.col{min-width:0}
/* نوار خلاصه: یک کارت، چهار خانه */
.kpis{gap:0;background:#fff;border:1px solid var(--ln);border-radius:16px;overflow:hidden;margin:0 0 14px}
.kp{border:0;border-radius:0;background:transparent;min-height:112px;padding:14px 16px}
.kp+.kp{border-inline-start:1px solid #EEF1F4}
.kp:nth-child(3){border-inline-start:0}
.kp:nth-child(n+3){border-top:1px solid #EEF1F4}
.kp:hover{background:#F8FAFB}
.kp:focus-visible{outline:3px solid var(--nv);outline-offset:-3px}
.kpv{font-size:1.9rem;color:var(--nv)}
/* نیاز به توجه: نوار رنگی کنار هر ردیف */
.atl{margin:6px -16px -16px}
.ar{position:relative;padding:10px 16px;min-height:60px}
.ar::before{content:"";position:absolute;inset-block:10px;inset-inline-start:0;width:4px;border-radius:0 4px 4px 0;background:transparent}
.ar.r::before{background:var(--red)}.ar.w::before{background:var(--am)}.ar.i::before{background:var(--blu)}
.ar .ico{width:34px;height:34px;border-radius:10px}
.ar .tx b{font-size:.93rem}
/* هشدارها: کارت سفید با نوار کهربایی */
.albox{background:#fff;border:1px solid var(--ln);border-radius:16px;padding:14px 16px;margin-bottom:14px;box-shadow:inset 0 4px 0 var(--am)}
.albox h2{color:var(--nv)}
.albox h2 b{background:var(--am);color:var(--nv)}
.al{border:0;border-bottom:1px solid #EEF1F4;border-radius:0;padding:10px 2px;margin:0;background:transparent}
.al:last-child{border-bottom:0}
.al.due{border:0;border-bottom:1px solid #EEF1F4;box-shadow:inset 4px 0 0 var(--red);padding-inline-start:12px}
.al button{border-radius:10px;border-color:var(--nv);color:var(--nv);font-weight:700}
.almore{border-color:var(--ln);color:var(--mut)}
/* ابزارهای مدیریت: نمودار و گزارش */
.tools{display:grid;grid-template-columns:1fr;gap:0}
.tools .card{display:flex;flex-direction:column}
.tools .card .bkrow{margin-top:auto}
@media (min-width:700px){
  .tools{grid-template-columns:1fr 1fr;gap:0 14px}
}
@media (max-width:959px){
  .wrap{display:flex!important;flex-direction:column}
  .cols,.col{display:contents}
  .wrap>*,.col>*{order:50}
  header{order:0!important}
  #alBox{order:1}#atCard{order:2}#dayCard{order:3}#fxCard{order:4}#auCard{order:5}#calCard{order:6}#tiles{order:7}#qrCard{order:8}#bkCard{order:9}
  #kpis{order:1}#flCard{order:3}.tools{order:5}#tlCard{order:4}
  html.mgmt #atCard{order:2}
}
@media (min-width:960px){
  .wrap{max-width:1240px;display:block!important}
  .wrap>*{grid-column:auto!important;grid-row:auto!important}
  .cols{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:0 18px;align-items:start}
  html.mgmt .kpis{grid-template-columns:repeat(4,minmax(0,1fr))}
  #tiles{grid-template-columns:repeat(4,minmax(0,1fr))}
  #tiles .tile:last-child:nth-child(odd){grid-column:auto}
  .kp:nth-child(n+3){border-top:0}
  .kp:nth-child(3){border-inline-start:1px solid #EEF1F4}
  /* ناوگان: کاشی‌های دستگاه */
  html.mgmt .flg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
  html.mgmt .fld{display:flex!important;flex-direction:column;align-items:flex-start;gap:4px;min-height:118px;padding:12px 14px!important;border:1px solid var(--ln)!important;border-radius:12px!important;box-shadow:inset 0 4px 0 var(--c)!important;background:#fff}
  html.mgmt .fld.fl-ok,html.mgmt .fld.fl-off{box-shadow:inset 0 4px 0 #D5DCE3!important}
  html.mgmt .fld.fl-bad{background:#FFF8F7}
  html.mgmt .fld .ch{margin-top:2px}
  html.mgmt .fld .tk{grid-column:auto}
  /* نیاز به توجه در مدیریت: دو ستون */
  html.mgmt #atList{display:grid;grid-template-columns:1fr 1fr;column-gap:0}
  html.mgmt #atList .ar{border-bottom:1px solid #EEF1F4}
  html.mgmt #atList .ar:nth-child(even){border-inline-start:1px solid #EEF1F4}
  html.mgmt #atList .atm{grid-column:1/-1}
}
#flGrid.grp{display:block}
.flgrp+.flgrp{margin-top:16px}
.flgrp h3{display:flex;align-items:baseline;gap:10px;margin:0 2px 8px;font-size:.92rem;font-weight:800;color:var(--nv)}
.flgrp h3 span{padding-inline-start:10px;border-inline-start:4px solid var(--am)}
.flgrp h3 small{font-size:.76rem;font-weight:600;color:var(--mut)}
.flgrp h3 small.b{color:var(--red)}

"""
k=t.rfind("</style>"); assert k>0
t=t[:k]+CSS+t[k:]
JS=r"""
/* ===== چیدمان: ستون‌ها (add_layout) ===== */
(function(){ try{
  const $$=id=>document.getElementById(id), W=document.querySelector('.wrap'); if(!W) return;
  const tag=(el,id)=>{ if(el && !el.id) el.id=id; return el; };
  tag($$('fixed')&&$$('fixed').closest('.card'),'fxCard'); tag($$('auto')&&$$('auto').closest('.card'),'auCard');
  tag(document.querySelector('.card.cal'),'calCard'); tag(document.querySelector('.card.day'),'dayCard');
  const al=$$('alBox'); if(al) al.classList.add('alwrap');
  const mk=(cls)=>{ const d=document.createElement('div'); d.className=cls; return d; };
  const head=W.querySelector('header');
  if(document.documentElement.classList.contains('mgmt')){
    const tools=mk('tools'); [$$('chCard'),$$('rpCard')].forEach(e=>e&&tools.appendChild(e));
    [ $$('kpis'), $$('flCard'), $$('atCard'), $$('tlCard'), tools ].forEach(e=>e&&W.appendChild(e));
    if(head) W.insertBefore(head,W.firstChild);
  } else {
    const row=mk('cols'), a=mk('col main'), b=mk('col side');
    [ $$('alBox'), $$('atCard'), $$('auCard'), $$('fxCard') ].forEach(e=>e&&a.appendChild(e));
    [ $$('dayCard'), $$('calCard') ].forEach(e=>e&&b.appendChild(e));
    row.appendChild(a); row.appendChild(b);
    const after=head?head.nextSibling:W.firstChild; W.insertBefore(row,after);
    [ $$('tiles'), $$('qrCard'), $$('bkCard') ].forEach(e=>e&&W.appendChild(e));
  }
}catch(e){} })();
/* مدیریت: ناوگان بر اساس بخش (parent.ntDept) — بعد از هر flRender، کاشی‌ها در گروه‌ها چیده می‌شوند */
(function(){ try{
  if(!document.documentElement.classList.contains('mgmt') || typeof flRender!=='function') return;
  const orig=flRender;
  const group=()=>{ try{ const D=parent.ntDept; const g=$('flGrid'); if(!D||!g) return; const tiles=[...g.querySelectorAll(':scope > .fld')]; if(!tiles.length) return;
    const names=D.groups().concat(['سایر']), by={}; names.forEach(n=>by[n]=[]);
    tiles.forEach(b=>{ const n=D.of(b.dataset.dev); (by[n]||by['سایر']).push(b); });
    g.innerHTML=''; g.classList.add('grp');
    names.forEach(n=>{ const L=by[n]; if(!L.length) return; const ok=L.filter(b=>!/fl-(bad|wa|svc)/.test(b.className)).length, bad=L.filter(b=>/fl-bad/.test(b.className)).length;
      const sec=document.createElement('section'); sec.className='flgrp';
      sec.innerHTML='<h3><span>'+esc(n)+'</span><small class="'+(bad?'b':'')+'">'+fa(ok)+' از '+fa(L.length)+' در کار'+(bad?'، '+fa(bad)+' خراب':'')+'</small></h3><div class="flg"></div>';
      const box=sec.querySelector('.flg'); L.forEach(b=>box.appendChild(b)); g.appendChild(sec); });
  }catch(e){} };
  flRender=function(){ const r=orig.apply(this,arguments); group(); return r; };
  group();
}catch(e){} })();
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('layout')
