# مصرف سوخت و روغن (قاعده در fluid.js، اطلاعات در nt_fluid_v1 — بخش دفترچه قرائت، همگام و قفل‌شده):
#  - دفترچه قرائت: زیر هر دستگاه «⛽ سوخت / روغن»: ثبت لیتر (نوع، لیتر)، نرخ ۳۰ روز و معمول، هشدار افزایش، ۵ ثبت آخر با حذف.
#  - امروز: «مصرف بالا» در «نیاز به توجه».
import json,base64,sys,os
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
FJ=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'fluid.js'),encoding='utf-8').read()
assert '</script' not in FJ
def get(name):
    d=next(x for x in docs if x['name']==name); return d,base64.b64decode(d['b64']).decode('utf-8')
def put(d,t): d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
def rep(t,a,b):
    assert t.count(a)==1,(a[:60],t.count(a)); return t.replace(a,b)

# ---------- دفترچه قرائت ----------
d,t=get('دفترچه قرائت')
t=rep(t,"      ${svcHtml(m)}\n","      ${svcHtml(m)}\n      ${typeof flHtml==='function'?flHtml(m):'<div class=\"flw\" data-fdev=\"'+esc(m.dev)+'\"></div>'}\n")
JS=FJ+r"""
/* ---------- سوخت و روغن ---------- */
const FLK='nt_fluid_v1', FLC='nt_fluid_cfg_v1'; let flOpen=null, flKind='fuel', flEd=null;
const flCfg=()=>{ try{ const o=JSON.parse((SS&&SS.getItem(FLC))||'{}'); return (o&&typeof o==='object'&&!Array.isArray(o))?o:{}; }catch(e){ return {}; } };
const flGet=()=>{ try{ const o=JSON.parse((SS&&SS.getItem(FLK))||'[]'); return Array.isArray(o)?o:[]; }catch(e){ return []; } };
const flSet=v=>{ try{ SS.setItem(FLK,JSON.stringify(v)); return true; }catch(e){ say('ذخیره نشد — حافظه پر است',true); return false; } };
const fl1=v=>v===null||v===undefined?'—':fa((Math.round(v*10)/10).toString()).replace('.','٫');
function flHtml(m){
  const all=flGet().filter(x=>x&&x.dev===m.dev), st=ntFluid.state(flGet(),log,m.dev,normDate($('fDate').value)||ntSvc.today(),m.unit==='کیلومتر');
  let h='<div class="flw">';
  st.forEach(x=>{ h+=`<div class="flr${x.warn?' warn':''}"><b>${esc(x.name)}</b><span>${x.now!==null?fl1(x.now)+' '+esc(x.unit):(x.lit30?fa(Math.round(x.lit30))+' لیتر در ۳۰ روز':'—')}${x.base!==null?` · معمول ${fl1(x.base)}`:''}</span>${x.warn?`<i>▲ ${fa(Math.round((x.ratio-1)*100))}٪ بیشتر از معمول</i>`:''}</div>`; });
  if(flOpen===m.dev){
    const KK=ntFluid.kinds(m.dev,flCfg(),svGet(SVK)); if(!KK.some(x=>x.k===flKind)) flKind='fuel';
    h+=`<div class="flf"><div class="flk" role="group" aria-label="نوع">${KK.map(x=>`<button type="button" data-flk="${esc(x.k)}" aria-pressed="${flKind===x.k}">${esc(x.name)}</button>`).join('')}</div>
      <div class="fli"><input class="fll" inputmode="decimal" placeholder="چند لیتر؟" aria-label="لیتر"><span>لیتر</span>
      <button type="button" class="ok" data-fls="${esc(m.dev)}">ثبت</button><button type="button" data-flc="1">بستن</button></div>
      ${all.length?`<div class="flh">${all.slice(-5).reverse().map(x=>`<div><span>${fa(esc(x.d))}</span>${esc(ntFluid.nameOf(x.k))} · ${fa(esc(x.l))} لیتر<button type="button" class="fld" data-fld="${esc(x.id)}" aria-label="حذف">✕</button></div>`).join('')}</div>`:''}</div>`;
    if(svW) h+=flEd===m.dev?`<div class="fle"><b>روغن‌های این دستگاه</b><small>هر خط یک روغن (بدون کلمه «روغن»). مثال: موتور، گیربکس، دیفرانسیل جلو، ترمز</small>
      <textarea class="flet" rows="6">${esc(ntFluid.parts(m.dev,flCfg(),svGet(SVK)).join('\n'))}</textarea>
      <div class="fli"><button type="button" class="ok" data-fles="${esc(m.dev)}">ذخیره فهرست</button><button type="button" data-fler="${esc(m.dev)}">پیش‌فرض</button><button type="button" data-flec="1">انصراف</button></div></div>`
      :`<button type="button" class="flb2" data-fleo="${esc(m.dev)}">✎ روغن‌های این دستگاه</button>`;
  } else if(svW) h+=`<button type="button" class="flb" data-flo="${esc(m.dev)}">⛽ سوخت / روغن${all.length?` <small>(${fa(all.length)})</small>`:''}</button>`;
  return h+'</div>';
}
if($('list')) $('list').addEventListener('click',e=>{
  const b=e.target&&e.target.closest&&e.target.closest('[data-flo],[data-flk],[data-fls],[data-flc],[data-fleo],[data-fles],[data-fler],[data-flec]'); if(!b) return;
  if(b.dataset.fleo){ flEd=b.dataset.fleo; render(); return; }
  if(b.dataset.flec){ flEd=null; render(); return; }
  if(b.dataset.fles||b.dataset.fler){ const dev=b.dataset.fles||b.dataset.fler, o=flCfg();
    if(b.dataset.fler) delete o[dev];
    else{ const L=[...new Set(String(b.closest('.fle').querySelector('.flet').value).split(/[\n،,]+/).map(x=>x.replace(/^\s*روغن\s*/,'').trim().slice(0,40)).filter(Boolean))].slice(0,15);
      if(!L.length){ say('حداقل یک روغن بنویسید',true); return; } o[dev]=L; }
    try{ SS.setItem(FLC,JSON.stringify(o)); }catch(x){ say('ذخیره نشد',true); return; }
    flEd=null; render(); say('فهرست روغن‌های «'+dev+'» ذخیره شد'); return; }
  if(b.dataset.flo){ flOpen=b.dataset.flo; render(); const i=document.querySelector('#list .fll'); if(i) i.focus(); return; }
  if(b.dataset.flc){ flOpen=null; render(); return; }
  if(b.dataset.flk){ flKind=b.dataset.flk; b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); const i=b.closest('.flf').querySelector('.fll'); if(i) i.focus(); return; }
  if(b.dataset.fls){ const dev=b.dataset.fls, inp=b.closest('.flf').querySelector('.fll');
    const v=+String(inp.value).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٫,]/g,'.');
    if(!(v>0) || v>5000){ say('لیتر را درست بنویسید',true); inp.focus(); return; }
    const day=normDate($('fDate').value)||ntSvc.today(); const cur=todayVal(dev), prev=lastOf(dev);
    const L=flGet(); L.push({id:'f'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),dev,k:flKind,l:Math.round(v*10)/10,d:day,at:cur!==undefined?+cur:(prev?prev.val:'')});
    if(flSet(L)){ flOpen=dev; render(); say(`${ntFluid.nameOf(flKind)}: ${fa(v)} لیتر ثبت شد`); } }
});
{ const _fb=bind; bind=function(){ _fb.apply(this,arguments);
  document.querySelectorAll('#list .fld').forEach(b=>armButton(b,'✕','حذف؟',()=>{ const L=flGet().filter(x=>x.id!==b.dataset.fld); if(flSet(L)){ render(); say('حذف شد'); } },4000));
  document.querySelectorAll('#list .fll').forEach(i=>i.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); const s=i.closest('.flf').querySelector('[data-fls]'); if(s) s.click(); } })); }; }
/* اولین رسم پیش از این کد بود: فقط جای خالی را پر کن (بدون render/save) */
try{ document.querySelectorAll('#list .flw[data-fdev]').forEach(el=>{ const m=DATA.d.find(x=>x.dev===el.dataset.fdev); if(m) el.outerHTML=flHtml(m); }); }catch(e){}
window.addEventListener('storage',e=>{ if(e && e.key===FLK){ const a=document.activeElement; if(a && a.tagName==='INPUT') return; try{ render(); }catch(x){} } });
"""
k=t.rfind("</script>"); t=t[:k]+JS+"\n"+t[k:]
CSS="""
.flw{margin-top:8px;display:flex;flex-direction:column;gap:4px}
.flr{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline;font-size:.82rem;background:#F4F7F9;border-radius:8px;padding:5px 9px}
.flr b{font-size:.8rem}.flr span{color:#3D4852;font-variant-numeric:tabular-nums}
.flr.warn{background:#FFF1D6;border:1px solid #E0A75E}.flr i{font-style:normal;font-weight:800;color:#8A4B00;font-size:.78rem}
.flb{align-self:flex-start;min-height:40px;border:1px dashed #9FB4C3;border-radius:10px;background:#fff;color:#0B3F5C;font:inherit;font-size:.82rem;font-weight:700;padding:0 12px;cursor:pointer}
.flb2{align-self:flex-start;min-height:36px;border:0;background:none;color:#1F5F99;font:inherit;font-size:.78rem;text-decoration:underline;cursor:pointer;padding:0 4px}
.fle{border:1px solid #CFE1E9;background:#F7FAFC;border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:6px}
.fle small{font-size:.74rem;color:#51606E}
.fle .flet{font:inherit;font-size:.92rem;border:1px solid #9AA6AF;border-radius:10px;padding:6px 8px;line-height:1.8}
.flb small{font-weight:400;color:#51606E}
.flf{border:1px solid #CFE1E9;background:#F2F8FB;border-radius:12px;padding:8px}
.flk{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px}
.flk button{min-height:40px;border-radius:20px;border:1px solid #C3CDD5;background:#fff;font:inherit;font-size:.82rem;font-weight:700;padding:0 12px;cursor:pointer;color:#17212B}
.flk button[aria-pressed=true]{background:#0B5C7A;border-color:#0B5C7A;color:#fff}
.fli{display:flex;gap:6px;align-items:center}
.fli .fll{flex:1;min-width:0;min-height:44px;border:1px solid #9AA6AF;border-radius:10px;font:inherit;font-size:1.05rem;text-align:center}
.fli span{font-size:.8rem;color:#51606E}
.fli button{min-height:44px;border-radius:10px;border:1px solid #C3CDD5;background:#fff;font:inherit;font-weight:700;padding:0 12px;cursor:pointer}
.fli button.ok{background:#1E7F4F;border-color:#1E7F4F;color:#fff}
.flh{margin-top:6px;font-size:.78rem;color:#3D4852}
.flh div{display:flex;align-items:center;gap:8px;padding:3px 0;border-top:1px solid #DDE8EE}
.flh span{color:#51606E;min-width:72px;font-variant-numeric:tabular-nums}
.flh .fld{margin-inline-start:auto;min-width:36px;min-height:32px;border:1px solid #E0A39C;border-radius:8px;background:#fff;color:#A32018;cursor:pointer}
.flh .fld.armed{background:#A32018;color:#fff}
body.fast .flw{display:none!important}
"""
k0=t.rfind("</style>"); t=t[:k0]+CSS+t[k0:]
put(d,t)

# ---------- امروز ----------
d,t=get('امروز')
JS=FJ+r"""
function flRows(){
  const E=LS('nt_fluid_v1'); if(!Array.isArray(E)||!E.length) return [];
  const unit=dv=>{ try{ const x=((parent.ntQr&&parent.ntQr.DEVS)||[]).find(z=>z.name===dv); return x?x.unit:''; }catch(e){ return ''; } };
  const W=ntFluid.warnings(E,LS('nt_daftar_v1')||[],K,unit); if(!W.length) return [];
  return [{c:'w',t:fa(W.length)+' مصرف بالاتر از معمول',s:W.slice(0,3).map(x=>x.dev+' — '+x.name+' ▲'+fa(Math.round((x.ratio-1)*100))+'٪').join('، ')+(W.length>3?' و '+fa(W.length-3)+' مورد دیگر':''),go:'دفترچه قرائت'}];
}
"""
t=rep(t,"function atRows(){",JS+"function atRows(){")
t=rep(t,"  try{ svRows().forEach(r=>R.push(r)); }catch(e){}","  try{ svRows().forEach(r=>R.push(r)); }catch(e){}\n  try{ flRows().forEach(r=>R.push(r)); }catch(e){}")
put(d,t)
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('df fluid')
