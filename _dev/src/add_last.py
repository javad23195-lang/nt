# «مثل دفعه قبل»: بعد از انتخاب دستگاه، آخرین ثبتِ همان دستگاه نشان داده می‌شود و با یک ضربه فرم پر می‌شود.
#   توقف شیفت: علت + توضیح.  ثبت مشکلات: سیستم + شرح + شدت، و هشدار «این دستگاه خرابی باز دارد» با دکمه ویرایش.
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
def get(name):
    d=next(x for x in docs if x['name']==name); return d,base64.b64decode(d['b64']).decode('utf-8')
def put(d,t): d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
def rep(t,a,b):
    assert t.count(a)==1,(a[:60],t.count(a)); return t.replace(a,b)
def addjs(t,js,css):
    k=t.rfind("</script>"); t=t[:k]+js+"\n"+t[k:]
    k0=t.rfind("</style>"); return t[:k0]+css+t[k0:]
CSS_LAST="""
.lastbox{margin-top:8px;display:flex;flex-direction:column;gap:6px}
.lastbox:empty{display:none}
.lastbox .lb2{font-size:.8rem;color:#51606E;font-weight:700}
.lastbox button.lk{min-height:44px;text-align:right;border-radius:10px;border:1px dashed #0B5C7A;background:#F2F8FB;color:#0B3F5C;font:inherit;font-size:.88rem;padding:8px 12px;cursor:pointer;line-height:1.6}
.lastbox button.lk b{font-weight:800}
.lastbox button.lk small{display:block;color:#51606E;font-size:.75rem;font-weight:400}
.lastbox .openw{border-radius:10px;background:#FBE5E2;border:1px solid #E0A39C;color:#7A1A12;padding:8px 12px;font-size:.86rem;line-height:1.6}
.lastbox .openw button{margin-top:6px;min-height:40px;border-radius:8px;border:1px solid #A32018;background:#fff;color:#7A1A12;font:inherit;font-weight:700;padding:0 12px;cursor:pointer}
"""

# ---------- توقف شیفت ----------
d,t=get('توقف شیفت')
t=rep(t,'''      <span class="err" id="eDev">دستگاه را انتخاب کنید.</span>
    </div>''','''      <span class="err" id="eDev">دستگاه را انتخاب کنید.</span>
      <div class="lastbox" id="fLast" aria-live="polite"></div>
    </div>''')
JS=r"""
/* ---------- مثل دفعه قبل (توقف) ---------- */
function lastStop(dev){
  const cur=recKey(); let best=null, bk='';
  Object.keys(db).forEach(k=>{ const R=db[k]; if(!R||!Array.isArray(R.stops)) return;
    R.stops.forEach(x=>{ if(!x||x.dev!==dev||x.id===editId||!x.cause) return; const kk=k+'|'+(x.from||'');
      if(kk>bk){ bk=kk; best={...x,day:k.split('|')[0]}; } }); });
  return best;
}
function lastDraw(){
  const box=$('fLast'); if(!box) return;
  if(!fDev || editId){ box.innerHTML=''; return; }
  const x=lastStop(fDev); if(!x){ box.innerHTML=''; return; }
  box.innerHTML=`<button type="button" class="lk" id="fLastGo"><b>مثل دفعه قبل:</b> ${esc(x.cause)}${x.note?' — '+esc(x.note):''}<small>${fa(esc(x.day))} · ساعت ${fa(esc(x.from||''))}</small></button>`;
  $('fLastGo').addEventListener('click',()=>{ fCause=x.cause; $('eWhy').classList.remove('show'); whyDraw();
    if(!$('fNote').value.trim()) $('fNote').value=x.note||''; box.innerHTML=''; say('علت و توضیح دفعه قبل گذاشته شد'); });
}
{ const _ds=devSet; devSet=function(){ _ds.apply(this,arguments); try{ lastDraw(); }catch(e){} }; }
"""
t=addjs(t,JS,CSS_LAST); put(d,t)

# ---------- ثبت مشکلات ----------
d,t=get('ثبت مشکلات')
t=rep(t,'''      <div class="err" id="eDev">دستگاه را انتخاب کنید.</div>''','''      <div class="err" id="eDev">دستگاه را انتخاب کنید.</div>
      <div class="lastbox" id="mkLast" aria-live="polite"></div>''')
JS=r"""
/* ---------- مثل دفعه قبل + خرابی باز (ثبت مشکلات) ---------- */
function mkLastDraw(){
  const box=$('mkLast'); if(!box) return;
  const dev=cDev.value();
  if(!dev || editIdx!==null){ box.innerHTML=''; return; }
  const ix=rows.map((r,i)=>({r,i})).filter(x=>x.r.dev===dev);
  const open=ix.filter(x=>String(x.r.state||'باز').trim()!=='بسته');
  const last=ix.length?ix[ix.length-1]:null;
  let h='';
  if(open.length){
    const o=open[open.length-1];
    h+=`<div class="openw">این دستگاه <b>${fa(open.length)} خرابی باز</b> دارد. آخری: «${esc(o.r.sys)} — ${esc(o.r.desc)}» (${esc(o.r.state||'باز')}).<br>اگر همان خرابی است، ثبت تازه لازم نیست.
      <br><button type="button" id="mkOpenEd" data-i="${o.i}">ویرایش همان خرابی</button></div>`;
  }
  if(last && last.r.sys && last.r.desc){
    h+=`<button type="button" class="lk" id="mkLastGo"><b>مثل دفعه قبل:</b> ${esc(last.r.sys)} — ${esc(last.r.desc)}<small>${fa(esc(`${last.r.y}/${last.r.m}/${last.r.d}`))} · شدت ${esc(last.r.sev||'')}</small></button>`;
  }
  box.innerHTML=h;
  const ed=$('mkOpenEd'); if(ed) ed.addEventListener('click',()=>{ box.innerHTML=''; beginEdit(+ed.dataset.i); });
  const go=$('mkLastGo'); if(go) go.addEventListener('click',()=>{ const r=last.r;
    cSys.force(r.sys); cDesc.force(r.desc); if(r.sev) $('fSev').value=r.sev; try{ showSev(); }catch(e){}
    ['eSys','eDesc'].forEach(id=>{ const e=$(id); if(e) e.classList.remove('show'); });
    go.remove(); say('سیستم و شرح دفعه قبل گذاشته شد — اگر لازم است عوض کنید'); });
}
{ const f=$('fDev'); let tm=0; const later=()=>{ clearTimeout(tm); tm=setTimeout(()=>{ try{ mkLastDraw(); }catch(e){} },120); };
  f.addEventListener('input',later); f.addEventListener('blur',()=>setTimeout(later,260));
  $('lDev').addEventListener('mousedown',()=>setTimeout(later,30)); $('lDev').addEventListener('click',later);
  f.addEventListener('keydown',e=>{ if(e.key==='Enter') later(); }); }
{ const _sd=stopEdit; stopEdit=function(){ _sd.apply(this,arguments); try{ mkLastDraw(); }catch(e){} }; }
{ const _rn=render; render=function(){ _rn.apply(this,arguments); try{ mkLastDraw(); }catch(e){} }; }
{ const _be=beginEdit; beginEdit=function(){ _be.apply(this,arguments); try{ mkLastDraw(); }catch(e){} }; }
"""
t=addjs(t,JS,CSS_LAST); put(d,t)

s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('last')
