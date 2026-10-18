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
JS=r"""
/* ============ فاکتور باز (فقط می‌خواند) ============ */
function osDays(dy){ const m=/^(\d{4})\/(\d{2})\/(\d{2})$/.exec(String(dy||'')); if(!m) return null; const g=flJ2G(dy); if(!g) return null; const n=new Date(); return Math.round((Date.UTC(n.getFullYear(),n.getMonth(),n.getDate())-Date.UTC(g[0],g[1]-1,g[2]))/864e5); }
function osCan(){ try{ return !parent.ntSync || parent.ntSync.canSee('برون‌سپاری'); }catch(e){ return true; } }
function osOne(rc,base){ const d=osDays(rc||base); return d===null?0:Math.max(0,d-(rc?1:3)); }
function osXs(j){ return Array.isArray(j.more)?j.more.filter(x=>x&&x.id&&!(x.steps&&x.steps.fin)):[]; }
function osOpen(j){ return !(j.steps&&j.steps.fin)||osXs(j).length>0; }
function osLate(j){ let m=0; if(!(j.steps&&j.steps.fin)) m=osOne(j.steps&&j.steps.rcv,j.ws||j.bd); osXs(j).forEach(x=>{ m=Math.max(m,osOne(x.steps&&x.steps.rcv,x.d)); }); return m; }
function osNx(j){ if(!(j.steps&&j.steps.fin)) return (j.steps&&j.steps.rcv)?'ثبت فاکتور در شناسنامه':'گرفتن فاکتور از '+(j.ven||'پیمانکار'); const x=osXs(j)[0]; return (x&&x.steps&&x.steps.rcv)?'ثبت فاکتور دیگر در شناسنامه':'گرفتن فاکتور دیگر'+(x&&x.note?' ('+x.note+')':''); }
function osRows(){
  let jobs=[]; try{ jobs=JSON.parse(localStorage.getItem('nt_outsrc_v1')||'[]'); }catch(e){}
  if(!Array.isArray(jobs) || !osCan()) return [];
  return jobs.filter(j=>j&&j.id&&!j.del&&osOpen(j)).map(j=>({j,late:osLate(j)})).filter(r=>r.late>0).sort((a,b)=>b.late-a.late)
    .map(r=>({c:'w',t:osNx(r.j),s:r.j.dev+(r.j.desc?' · '+String(r.j.desc).slice(0,30):''),tag:fa(r.late)+' روز دیرکرد',go:'برون‌سپاری'}));
}
function osRender(){}
"""
rep("function refreshLive(){ try{ head(); }catch(e){} try{ flRender(); }catch(e){}", JS+"function refreshLive(){ try{ head(); }catch(e){} try{ flRender(); }catch(e){} try{ osRender(); }catch(e){}")
rep("  try{ flRender(); }catch(e){}\n  try{ bkState(); }catch(e){}","  try{ flRender(); }catch(e){}\n  try{ osRender(); }catch(e){}\n  try{ bkState(); }catch(e){}")
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('outsource tab + card added')
