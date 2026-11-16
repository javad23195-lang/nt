# شناسنامه: فرم مرتب (چهار کارت، دکمه‌های دوتایی، راهنمای کوتاه) + «کار دیگر روی همین دستگاه»
# هر کار یک ردیف جدا در اکسل (شناسه تعمیر خودش)؛ هر فاکتور «برای» یکی از کارها.
# ستون‌های اکسل، خروجی مالی و صفحه لیست عوض نمی‌شوند. NOTES.md: «شناسنامه: چند کار روی یک دستگاه».
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='شناسنامه')
t=base64.b64decode(d['b64']).decode('utf-8')

CSS=r"""
/* ===== فرم مرتب (add_shform.py) ===== */
.sheet .sh-body{background:#F4F3F0;padding:12px 12px 20px}
.sheet .sh-body>.panel{max-width:640px;margin:0 auto}
.sheet .sh-foot{display:flex;gap:8px;padding-top:10px}
.sheet .sh-foot>*{margin:0!important}
.sheet .sh-foot #bAdd{flex:1.4}.sheet .sh-foot #xAddNext{flex:1}
@media (min-width:700px){ .sheet .sh-foot{justify-content:center} .sheet .sh-foot #bAdd{max-width:380px} .sheet .sh-foot #xAddNext{max-width:250px} }
.panel>h2,.panel>.hint,.panel>.sect,.panel>.derived:empty{display:none!important}
.fc{background:#fff;border:1px solid #ECE9E3;border-radius:18px;padding:14px;margin:0 0 12px;box-shadow:0 1px 2px rgba(21,33,44,.04)}
.fc>.fch{display:flex;align-items:center;gap:8px;margin:0 0 12px}
.fc>.fch .n{width:24px;height:24px;border-radius:8px;background:#15212C;color:#E2A12E;display:grid;place-items:center;font-size:.78rem;font-weight:900;flex:none}
.fc>.fch b{font-size:1rem;font-weight:850}
.fc .field{margin-bottom:10px}
.fc .g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fc .g2>.field{min-width:0}
.fc .fhint:not(.xch):not(.dvh){display:none}
.fc .derived.show:not(.warn){display:none}
.fc label{font-size:.8rem}
.segsel{position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important;overflow:hidden}
.seg2{display:flex;gap:3px;padding:3px;border-radius:12px;background:#F4F3F0;min-height:46px}
.seg2 button{flex:1;min-height:40px;border:0;border-radius:9px;background:none;font:inherit;font-size:.86rem;font-weight:800;color:#5E6670;cursor:pointer;padding:0 6px}
.seg2 button[aria-pressed="true"]{background:#fff;color:#15212C;box-shadow:0 1px 3px rgba(21,33,44,.14)}
.seg2.em button[data-v="EM"][aria-pressed="true"]{background:#FCECEA;color:#A32018}
.regln{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:.84rem;color:#5E6670;margin-top:2px}
.regln button{border:0;background:none;font:inherit;font-weight:800;color:#15212C;border-bottom:1px dashed #8C9198;padding:6px 2px;cursor:pointer;min-height:36px}
.regf{margin-top:8px}.regf[hidden]{display:none}
.acx{border:1px solid #E6E3DD;border-radius:14px;padding:10px 10px 0;margin-top:10px}
.acx .ach{display:flex;align-items:center;gap:8px;margin-bottom:8px;min-height:32px}
.acx .tag{font-size:.74rem;font-weight:900;background:#15212C;color:#fff;border-radius:7px;padding:2px 9px;white-space:nowrap}
.acx .acst{font-size:.74rem;font-weight:800;color:#2E7D5B}.acx .acst.nw{color:#8A5300}
.acx .acdel{margin-inline-start:auto;min-width:44px;min-height:40px;border:1px solid #E6E3DD;border-radius:10px;background:#fff;color:#A32018;cursor:pointer;font:inherit;font-size:1rem}
#acAdd,#dvAdd,#xInvAdd{min-height:46px!important;border:1.5px dashed #D6D1C8!important;border-radius:12px!important;background:#fff!important;color:#3A4450!important;font-weight:800!important}
#acAdd{width:100%;margin-top:10px;font:inherit;cursor:pointer}
#acNote{font-size:.8rem;color:#5E6670;margin-top:8px}#acNote:empty{display:none}
.xinv .invhd{flex-wrap:wrap}
.xinv .forl{display:inline-flex;align-items:center;gap:6px;font-size:.8rem;color:#5E6670;font-weight:700}
.xinv .forl select{min-height:40px;border:1px solid #E6E3DD;border-radius:10px;background:#fff;font:inherit;font-size:.85rem;font-weight:800;padding:0 6px;max-width:150px}
#dvBox{margin:4px 0 12px}
.fc .xinv{padding:10px 12px;border-radius:14px;border-color:#E6E3DD}
.fc .xinv .invhd{flex-wrap:nowrap;gap:6px;margin-bottom:8px}
.fc .xinv .invhd .t{font-size:.8rem;color:#5E6670}
.fc .xinv .invhd select{width:auto!important;min-width:0;flex:0 1 auto;min-height:40px;border:1px solid #E6E3DD;border-radius:10px;background:#fff;font:inherit;font-size:.85rem;font-weight:800;padding:0 6px}
.fc .xinv .forl{flex:0 1 auto;min-width:0}
.fc .xinv .forl select{max-width:120px}
.fc .xinv .row3{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fc .xinv .row3>.field:nth-child(3){grid-column:1/-1}
@media (min-width:600px){ .fc .xinv .row3{grid-template-columns:1fr 1fr 1fr} .fc .xinv .row3>.field:nth-child(3){grid-column:auto} }
#dvBox>.fhint,#xInvHint{display:none}
"""
k=t.rfind('</style>'); assert k>0; t=t[:k]+CSS+t[k:]

JS=r"""
/* ===== فرم مرتب و «کار دیگر روی همین دستگاه» (add_shform.py) ===== */
(function(){ try{
const Q=id=>document.getElementById(id), fld=id=>{ const e=Q(id); return e?e.closest('.field'):null; };
const panel=document.querySelector('section.panel'); if(!panel||!Q('fType')) return;
/* ---------- دکمه‌های دوتایی به جای منو (منوی اصلی پنهان می‌ماند و مقدار را نگه می‌دارد) ---------- */
const SEGS=[];
function seg(sel,labels,cls){ if(!sel) return; const w=document.createElement('div'); w.className='seg2'+(cls?' '+cls:''); w.setAttribute('role','group');
  const lb=document.querySelector('label[for="'+sel.id+'"]'); if(lb) w.setAttribute('aria-label',lb.textContent.replace('*','').trim());
  [...sel.options].forEach((o,k)=>{ const b=document.createElement('button'); b.type='button'; b.dataset.v=o.value; b.textContent=labels[k]||o.text; w.appendChild(b); });
  w.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; sel.value=b.dataset.v; sel.dispatchEvent(new Event('change',{bubbles:true})); segSync(); });
  sel.classList.add('segsel'); sel.setAttribute('tabindex','-1'); sel.setAttribute('aria-hidden','true'); sel.after(w); SEGS.push([sel,w]); }
function segSync(){ SEGS.forEach(([s,w])=>w.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===s.value)))); }
seg(Q('fKind'),['EM خرابی','PM پیشگیرانه'],'em');
seg(Q('fStop'),['بله','خیر']);
seg(Q('fCond'),['فعال','در حال تعمیر']);
seg(Q('fShift'),['۹ ساعت','۸ ساعت']);
['fKind','fStop','fCond','fShift'].forEach(id=>{ const e=Q(id); if(e) e.addEventListener('change',segSync); });
/* ---------- کارت‌ها ---------- */
const card=(n,title)=>{ const c=document.createElement('div'); c.className='fc'; c.innerHTML='<div class="fch"><span class="n">'+n+'</span><b>'+title+'</b></div>'; return c; };
const g2=(...F)=>{ const g=document.createElement('div'); g.className='g2'; F.filter(Boolean).forEach(f=>g.appendChild(f)); return g; };
const anchor=Q('fromBox')||Q('editBar');
const C1=card('۱','دستگاه و تاریخ'), C2=card('۲','کارها'), C3=card('۳','حال دستگاه'), C4=card('۴','فاکتورها');
{ const at=anchor?anchor.nextSibling:panel.firstChild; [C1,C2,C3,C4].forEach(c=>panel.insertBefore(c,at)); }
// ۱: دستگاه، فرستادن و برگشت، ثبت در فایل (کوچک)
C1.appendChild(fld('fDev'));
const lS=document.querySelector('label[for="fStart"]'), lE=document.querySelector('label[for="fEnd"]');
if(lS) lS.innerHTML='فرستادن برای تعمیر <span class="req">*</span>'; if(lE) lE.innerHTML='برگشت از تعمیر';
const fE=Q('fEnd'); if(fE) fE.placeholder='همان روز';
C1.appendChild(g2(fld('fStart'),fld('fEnd')));
if(Q('dDate')) C1.appendChild(Q('dDate'));
const rl=document.createElement('div'); rl.className='regln'; rl.innerHTML='<span>ثبت در فایل:</span><button type="button" id="regTg" aria-expanded="false"></button>';
const rf=document.createElement('div'); rf.className='regf'; rf.hidden=true; rf.appendChild(fld('fReg')); if(Q('dReg')) rf.appendChild(Q('dReg'));
C1.appendChild(rl); C1.appendChild(rf);
const RT=rl.querySelector('#regTg');
function regUpd(){ const v=(Q('fReg').value||'').trim(), b=RT; if(!b) return; b.textContent=(v?(v===TODAY?'امروز، '+fa(v):fa(v)):'—')+' ✎'; }
RT.addEventListener('click',()=>{ rf.hidden=!rf.hidden; RT.setAttribute('aria-expanded',String(!rf.hidden)); if(!rf.hidden) try{ Q('fReg').focus(); }catch(e){} });
Q('fReg').addEventListener('input',regUpd); Q('fReg').addEventListener('blur',regUpd);
// ۲: نوع نگهداری، کار ۱، کارهای دیگر
C2.appendChild(fld('fKind'));
const a1=document.createElement('div'); a1.className='acx'; a1.id='ac0';
a1.innerHTML='<div class="ach"><span class="tag">کار ۱</span><span class="acst" id="ac0st"></span></div>';
const lD=document.querySelector('label[for="fDur"]'); if(lD) lD.innerHTML='مدت (ساعت) <span class="req">*</span>';
const lT=document.querySelector('label[for="fType"]'); if(lT) lT.innerHTML='نوع کار <span class="req">*</span>';
const lA=document.querySelector('label[for="fAct"]'); if(lA) lA.innerHTML='دسته <span class="req">*</span>';
a1.appendChild(g2(fld('fAct'),fld('fType')));
if(Q('dAct')) a1.appendChild(Q('dAct')); if(Q('dType')) a1.appendChild(Q('dType'));
a1.appendChild(g2(fld('fDur'),fld('fStop')));
C2.appendChild(a1);
const AL=document.createElement('div'); AL.id='acList'; C2.appendChild(AL);
const AB=document.createElement('button'); AB.type='button'; AB.id='acAdd'; AB.textContent='+ کار دیگر روی همین دستگاه'; C2.appendChild(AB);
const AN=document.createElement('div'); AN.id='acNote'; AN.setAttribute('role','status'); C2.appendChild(AN);
// ۳: حال دستگاه
C3.appendChild(fld('fCond')); C3.appendChild(g2(fld('fMeter'),fld('fShift')));
const lM=document.querySelector('label[for="fMeter"]'); if(lM) lM.textContent='ساعت کارکرد'; const lH=document.querySelector('label[for="fShift"]'); if(lH) lH.textContent='کار روزانه';
// ۴: فاکتورها
['xInvBox','descAlone','tot'].forEach(id=>{ if(Q(id)) C4.appendChild(Q(id)); });
const xa=Q('xInvAdd'); if(xa) xa.textContent='+ فاکتور (اجرت یا خرید قطعه)';
// جای کارت‌ها: بعد از کادر «از خدمات آمده»؛ «دستگاه دیگر با همین کار» بعد از فاکتورها
const dv=Q('dvBox'); if(dv){ C4.after(dv); const b=Q('dvAdd'); if(b) b.textContent='+ همین کار برای دستگاه دیگر'; }
// «می‌چسبانم از ردیف» یک بار لازم است: به «ابزارها و پشتیبان» در صفحه لیست
const mr=fld('mRow')||(Q('mRow')&&Q('mRow').parentElement);
const tools=[...document.querySelectorAll('details.fold')].find(x=>/ابزار/.test((x.querySelector('summary')||{}).textContent||''));
if(mr && tools) tools.appendChild(mr);
panel.querySelectorAll('.row2,.row3').forEach(r=>{ if(!r.querySelector('input,select,textarea')) r.hidden=true; });

/* ---------- کارهای دیگر ---------- */
let acts=[], acC=[];
const TS=n=>{ try{ return TYPESET.get(norm(n)); }catch(e){ return null; } };
const AS=n=>{ try{ return ACTSET.get(norm(n)); }catch(e){ return null; } };
function stTxt(v){ v=String(v||'').trim(); if(!v) return ['','']; return TS(v)?['✓ شناسه تعمیر آماده','']:['نوع تازه: کد تازه ساخته می‌شود','nw']; }
function st0(){ const [x,c]=stTxt(Q('fType').value), e=Q('ac0st'); if(e){ e.textContent=x; e.className='acst'+(c?' '+c:''); } }
Q('fType').addEventListener('input',()=>{ st0(); forUpd(); note(); }); Q('fType').addEventListener('change',()=>{ st0(); forUpd(); note(); });
function acSync(){ AL.querySelectorAll('.acx').forEach(c=>{ const k=+c.dataset.k; if(!acts[k]) return; c.querySelectorAll('input[data-f]').forEach(e=>{ acts[k][e.dataset.f]=e.value; }); }); }
function acRender(){
  const ed=(typeof editIdx!=='undefined' && editIdx!==null);
  AB.hidden=ed; if(ed) acts=[];
  AL.innerHTML=acts.map((x,k)=>{ const n=fa(k+2); return `<div class="acx" data-k="${k}">
    <div class="ach"><span class="tag">کار ${n}</span><span class="acst" id="ac${k}st"></span><button type="button" class="acdel" data-k="${k}" aria-label="حذف کار ${n}">✕</button></div>
    <div class="g2"><div class="field"><label for="ac${k}a">دسته <span class="req">*</span></label><div class="combo"><input id="ac${k}a" data-f="act" value="${esc(x.act||'')}" autocomplete="off"><div class="combo-list" id="acl${k}a"></div></div><div class="err" id="ac${k}ae">دسته را وارد کنید.</div></div>
      <div class="field"><label for="ac${k}t">نوع کار <span class="req">*</span></label><div class="combo"><input id="ac${k}t" data-f="type" value="${esc(x.type||'')}" autocomplete="off" placeholder="مثلاً: استارت"><div class="combo-list" id="acl${k}t"></div></div><div class="err" id="ac${k}te">نوع کار را وارد کنید.</div></div></div>
    <div class="g2"><div class="field"><label for="ac${k}d">مدت (ساعت) <span class="req">*</span></label><input id="ac${k}d" data-f="dur" class="mono tm" value="${esc(x.dur||'')}" placeholder="8:00" inputmode="numeric" autocomplete="off"><div class="err" id="ac${k}de">قالب ساعت:دقیقه</div></div>
      <div class="field"><label>توقف</label><div class="seg2" role="group" aria-label="توقف کار ${n}" data-k="${k}">${['بله','خیر'].map(v=>`<button type="button" data-v="${v}" aria-pressed="${String((x.stop||'بله')===v)}">${v}</button>`).join('')}</div></div></div>
  </div>`; }).join('');
  acC=acts.map((x,k)=>{ const c=[null,null]; try{ c[0]=combo('ac'+k+'a','acl'+k+'a',src(DATA.act),true,()=>{ acSync(); }); c[1]=combo('ac'+k+'t','acl'+k+'t',src(DATA.type8),true,()=>{ acSync(); acSt(k); forUpd(); note(); }); }catch(e){} return c; });
  acts.forEach((x,k)=>acSt(k)); forUpd(); note();
}
function acSt(k){ const [x,c]=stTxt(acts[k]&&acts[k].type), e=Q('ac'+k+'st'); if(e){ e.textContent=x; e.className='acst'+(c?' '+c:''); } }
AB.addEventListener('click',()=>{ acSync(); try{ xSync(); }catch(e){} acts.push({act:Q('fAct').value.trim(),type:'',dur:'',stop:'بله'}); acRender();
  try{ Q('ac'+(acts.length-1)+'t').focus(); }catch(e){} try{ xRender(); }catch(e){} });
AL.addEventListener('click',e=>{
  const s=e.target.closest('.seg2 button'); if(s){ const k=+s.closest('.seg2').dataset.k; acSync(); if(acts[k]) acts[k].stop=s.dataset.v; s.parentElement.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===s))); return; }
  const b=e.target.closest('.acdel'); if(!b) return; const k=+b.dataset.k; acSync(); try{ xSync(); }catch(x){}
  acts.splice(k,1);
  try{ xinv.forEach(x=>{ const f=+x.for||0; if(f===k+1) x.for=0; else if(f>k+1) x.for=f-1; }); }catch(x){}
  acRender(); try{ xRender(); }catch(x){} });
AL.addEventListener('input',e=>{ const f=e.target.dataset.f; if(!f) return; if(f==='dur') maskTime(e.target); acSync(); if(f==='type'){ acSt(+e.target.closest('.acx').dataset.k); forUpd(); note(); } });
AL.addEventListener('focusout',e=>{ const el=e.target; if(!el||el.dataset.f!=='dur') return;
  let v=el.value.trim(); if(/^\d{1,2}$/.test(v)) v='0:'+v.padStart(2,'0');
  const mm=/^(\d{1,3}):(\d{0,2})$/.exec(v); if(mm) v=mm[1]+':'+(mm[2]===''?'00':mm[2].padStart(2,'0'));
  const t=parseTime(v); if(t!==null&&v!=='') el.value=hhmm(t).replace(/:00$/,''); acSync(); });
const aName=k=>{ const v=k===0?Q('fType').value.trim():String((acts[k-1]||{}).type||'').trim(); return v||('کار '+fa(k+1)); };
function note(){ AN.textContent=acts.length?'با «افزودن»، '+fa(acts.length+1)+' ردیف جدا ساخته می‌شود: '+[...Array(acts.length+1).keys()].map(aName).join('، '):''; }
/* ---------- فاکتور «برای» کدام کار ---------- */
function forUpd(){ document.querySelectorAll('#xInv select[data-f="for"]').forEach(s=>{ [...s.options].forEach((o,k)=>{ o.textContent=aName(k); }); }); }
{ const _xr=xRender; xRender=function(){ _xr.apply(this,arguments); try{
    const ed=(typeof editIdx!=='undefined' && editIdx!==null);
    if(!acts.length||ed){ xinv.forEach(x=>{ x.for=0; }); return; }
    document.querySelectorAll('#xInv .xinv').forEach(c=>{ const k=+c.dataset.k, x=xinv[k]; if(!x) return; let f=+x.for||0; if(f>acts.length) f=x.for=0;
      const hd=c.querySelector('.invhd'), del=hd&&hd.querySelector('.xdel'); if(!hd) return;
      const l=document.createElement('label'); l.className='forl'; l.innerHTML='برای <select data-f="for" aria-label="این فاکتور برای کدام کار است">'+[...Array(acts.length+1).keys()].map(j=>'<option value="'+j+'"'+(j===f?' selected':'')+'>'+esc(aName(j))+'</option>').join('')+'</select>';
      hd.insertBefore(l,del||null); });
  }catch(e){ console.error(e); } }; }
/* فاکتورهای کار ۱ همان راه قبلی (ردیف اول)؛ فاکتورهای کارهای دیگر کنار گذاشته می‌شوند */
invMain=function(){ const m=x=>!(+x.for>0); return {a:xinv.findIndex(x=>x.t==='A'&&m(x)), k:xinv.findIndex(x=>x.t==='K'&&m(x))}; };
function acValid(){ acSync(); let ok=true, first=null;
  acts.forEach((x,k)=>{ const ba=!String(x.act||'').trim(), bt=!String(x.type||'').trim(), bd=parseTime(x.dur)===null||!String(x.dur||'').trim();
    [['ac'+k+'ae',ba],['ac'+k+'te',bt],['ac'+k+'de',bd]].forEach(([id,b])=>{ const e=Q(id); if(e) e.classList.toggle('show',b); });
    if((ba||bt||bd)&&!first) first=Q('ac'+k+(ba?'a':bt?'t':'d')); if(ba||bt||bd) ok=false; });
  if(!ok&&first){ try{ first.focus(); first.scrollIntoView({block:'center'}); }catch(e){} say('اطلاعات کارهای دیگر کامل نیست',true); }
  return ok; }
Q('bAdd').addEventListener('click',e=>{
  try{ if(!normDate(Q('fReg').value)){ rf.hidden=false; RT.setAttribute('aria-expanded','true'); } }catch(x){}
  if((typeof editIdx==='undefined'||editIdx===null) && acts.length && !acValid()) e.stopImmediatePropagation(); },true);
/** ردیف اصلی و فاکتورهایش مثل قبل؛ بعد برای هر کار دیگر یک ردیف (با اولین اجرت و خرید خودش) و فاکتورهای دیگرش */
{ const _xp=xPush; xPush=function(rec,at){
    try{ xSync(); }catch(e){}
    const ed=(typeof editIdx!=='undefined' && editIdx!==null);
    const all=xinv.slice(), mine=all.filter(x=>!(+x.for>0)), others=all.filter(x=>+x.for>0);
    const L=acts.slice(); acSync();
    const box=Q('xInv'); if(box) box.innerHTML='';
    xinv=mine; let n=_xp(rec,at);
    if(ed||!L.length) return n;
    const filled=x=>String(x.desc||'').trim()||String(x.who||'').trim()||String(x.cost||'').trim()||String(x.doc||'').trim();
    acts.forEach((a,k)=>{ const inv=others.filter(x=>+x.for===k+1&&filled(x)); inv.forEach(x=>{ delete x.__main; });
      const A=inv.find(x=>x.t==='A'), K=inv.find(x=>x.t==='K');
      const tl=String(a.type||'').trim(), al=String(a.act||'').trim(), type=TS(tl)||tl, act=AS(al)||al;
      try{ if(!TS(tl) && !newTypes.find(z=>norm(z.label)===norm(tl))) newTypes.push({label:tl,code:nextCode()}); }catch(e){}
      try{ if(!AS(al) && !newActs.find(z=>norm(z)===norm(al))) newActs.push(al); }catch(e){}
      const r=Object.assign({},rec,{act,type,dur:hhmm(parseTime(a.dur)),stop:a.stop||'بله',
        hasA:!!A, rep:A?String(A.who||'').trim():'', costA:A?String(A.cost||'').trim():'', payA:A?(A.pay||''):'', docA:A?String(A.doc||'').trim():'',
        byA:(A&&A.pay==='نقدی')?String(A.by||'').trim():'',
        hasK:!!K, sup:K?String(K.who||'').trim():'', costK:K?String(K.cost||'').trim():'', payK:K?(K.pay||''):'', docK:K?String(K.doc||'').trim():'',
        byK:(K&&K.pay==='نقدی')?String(K.by||'').trim():'',
        desc:(A&&String(A.desc||'').trim())?String(A.desc).trim():rec.desc, part:(K&&String(K.desc||'').trim())?String(K.desc).trim():'**'});
      delete r.__i; delete r.xof; rows.push(r); n++;
      try{ if(r.hasA) remember(r.rep,myReps,cRep); if(r.hasK) remember(r.sup,mySups,cSup); rememberIn(r.desc,myDesc2,cDesc); rememberIn(r.part,myPart2,cPart); payRemember(r.byA); payRemember(r.byK); }catch(e){}
      xinv=inv.filter(x=>x!==A&&x!==K); n+=_xp(r);
    });
    acts=[]; acRender(); rows.forEach((r,q)=>{ r.__i=q; });
    return n; }; }
/* ---------- هماهنگی با پاک کردن، ویرایش و پر کردن فرم ---------- */
{ const _cf=clearForm; clearForm=function(){ _cf.apply(this,arguments); acts=[]; try{ acRender(); }catch(e){} segSync(); regUpd(); st0(); }; }
{ const _ff=fillForm; fillForm=function(){ _ff.apply(this,arguments); segSync(); regUpd(); st0(); }; }
{ const _se=stopEdit; stopEdit=function(){ _se.apply(this,arguments); setTimeout(()=>{ try{ acRender(); }catch(e){} },0); }; }
{ const _be=beginEdit; beginEdit=function(){ acts=[]; const r=_be.apply(this,arguments); try{ acRender(); }catch(e){} return r; }; }
segSync(); regUpd(); st0(); acRender();
window.ntShActs={get:()=>acts};
}catch(e){ try{ console.error(e); }catch(_){} } })();
"""
k=t.rfind('</script></body>'); assert k>0; t=t[:k]+JS+t[k:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('shform')
