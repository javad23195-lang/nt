# زبانه «برون‌سپاری» + کارت «فاکتور باز» در زبانه «امروز»
import json,base64,sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
assert not any(d['name']=='برون‌سپاری' for d in docs)
h=open('outsource-src.html',encoding='utf-8').read()
docs.append({"name":"برون‌سپاری","icon":"↗","color":"#7A5BB0","b64":base64.b64encode(h.encode('utf-8')).decode('ascii')})

d=next(x for x in docs if x['name']=='امروز')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b,n=1):
    global t
    assert t.count(a)==n,(a[:60],t.count(a)); t=t.replace(a,b)
CSS=r"""
/* ---------- فاکتور باز ---------- */
.os h2{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.os h2 small{font-size:.74rem;font-weight:400;color:#51606E}
.osr{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-height:48px;margin-top:6px;padding:8px 12px;text-align:start;font:inherit;color:#17212B;background:#fff;border:1px solid #DDE3E9;border-radius:14px;cursor:pointer}
.osr.od{border-color:#B3261E;box-shadow:inset -5px 0 0 #B3261E}
.osr b{font-size:.95rem;overflow-wrap:anywhere}.osr span{font-size:.74rem;color:#51606E}
.osr em{font-style:normal;font-size:.74rem;font-weight:800;color:#B3261E;white-space:nowrap}
"""
k=t.find("</style>"); assert k>0; t=t[:k]+CSS+t[k:]
rep('  <div id="alBox" aria-live="polite"></div>\n','''  <div class="card os" id="osCard" hidden>
    <h2 style="color:#1B2430">فاکتور برون‌سپاری <small id="osSub"></small></h2>
    <div id="osList"></div>
  </div>

  <div id="alBox" aria-live="polite"></div>\n''')
JS=r"""
/* ============ فاکتور باز (فقط می‌خواند) ============ */
function osDays(dy){ const m=/^(\d{4})\/(\d{2})\/(\d{2})$/.exec(String(dy||'')); if(!m) return null; const g=flJ2G(dy); if(!g) return null; const n=new Date(); return Math.round((Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())-Date.UTC(g[0],g[1]-1,g[2]))/864e5); }
function osCan(){ try{ return !parent.ntSync || parent.ntSync.canSee('برون‌سپاری'); }catch(e){ return true; } }
const OS_STEPS=['ann','chk','ord','snd','rep','fin'], OS_N={ann:'اعلام خرابی',chk:'بررسی خرابی',ord:'دستور تعمیر',snd:'ارسال کالا',rep:'گزارش',fin:'فاکتور'};
function osRender(){
  const box=$('osCard'); if(!box) return;
  let jobs=[]; try{ jobs=JSON.parse(localStorage.getItem('nt_outsrc_v1')||'[]'); }catch(e){}
  if(!Array.isArray(jobs)) jobs=[];
  const open=jobs.filter(j=>j&&j.id&&!(j.steps&&j.steps.fin));
  if(!osCan() || !open.length){ box.hidden=true; return; }
  const rows=open.map(j=>{ const d=osDays(j.we||j.ws||j.bd), late=(d!==null && (j.we||j.ws) && d>3)?d-3:0, nx=OS_STEPS.find(k=>!(j.steps&&j.steps[k]));
    return {j,late,nx}; }).sort((a,b)=>b.late-a.late);
  box.hidden=false;
  const nl=rows.filter(r=>r.late).length;
  $('osSub').textContent=fa(open.length)+' کار باز'+(nl?' · '+fa(nl)+' دیرکرد':'');
  $('osList').innerHTML=rows.slice(0,3).map(r=>`<button type="button" class="osr${r.late?' od':''}" data-os="1"><div><b>${esc(r.j.dev)}</b><br><span>${esc(r.j.ven||'')} · قدم بعد: ${esc(OS_N[r.nx]||'')}</span></div>${r.late?`<em>${fa(r.late)} روز دیرکرد</em>`:''}</button>`).join('')+(rows.length>3?`<div class="flnote">و ${fa(rows.length-3)} کار دیگر…</div>`:'');
  box.querySelectorAll('[data-os]').forEach(b=>b.addEventListener('click',()=>{ try{ parent.postMessage({nt:'go',tab:'برون‌سپاری'},'*'); }catch(e){} }));
}
setInterval(()=>{ try{ osRender(); }catch(e){} },20000);
"""
rep("function refreshLive(){ try{ head(); }catch(e){} try{ flRender(); }catch(e){}", JS+"function refreshLive(){ try{ head(); }catch(e){} try{ flRender(); }catch(e){} try{ osRender(); }catch(e){}")
rep("  try{ flRender(); }catch(e){}\n  try{ bkState(); }catch(e){}","  try{ flRender(); }catch(e){}\n  try{ osRender(); }catch(e){}\n  try{ bkState(); }catch(e){}")
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('outsource tab + card added')
