# انبار: بعد از «افزودن به لیست» در «سرویس دوره‌ای»، اگر همان سرویس در برنامه سرویس هست، یک سؤال: «برنامه سرویس هم به‌روز شود؟»
# با یک ضربه: آخرین سرویس = قرائت (پیش‌فرض آخرین قرائت دفترچه، قابل اصلاح)، تاریخ = تاریخ خروج؛ یک ردیف سابقه. قاعده در svc.js.
import json,base64,sys,os
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
i=s.find("const DOCS = ")+13; j=s.find("];\nconst $",i)+1
docs=json.loads(s[i:j])
d=next(x for x in docs if x['name']=='انبار')
t=base64.b64decode(d['b64']).decode('utf-8')
def rep(a,b):
    global t
    assert t.count(a)==1,(a[:60],t.count(a)); t=t.replace(a,b)
SJ=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'svc.js'),encoding='utf-8').read()
assert '</script' not in SJ
rep("    say(`${fa(n)} قلم برای «${s.act}» اضافه شد`);\n  }));","    say(`${fa(n)} قلم برای «${s.act}» اضافه شد`);\n    try{ svAsk(card,dev,s.act,dt.s); }catch(e){}\n  }));")
JS=SJ+r"""
/* ---------- پیوند با برنامه سرویس (دفترچه قرائت) ---------- */
function svLS(k){ try{ const o=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(o)?o:[]; }catch(e){ return []; } }
function svAsk(card,dev,act,day){
  let W=true; try{ W=!parent.ntSync || parent.ntSync.canWriteTab('دفترچه قرائت'); }catch(e){}
  if(!W) return;
  const it=svLS('nt_svc_v1').find(x=>x && norm(x.dev)===norm(dev) && norm(x.name)===norm(act)); if(!it) return;
  const cur=ntSvc.latest(svLS('nt_daftar_v1'))[it.dev];
  const old=card.querySelector('.svask'); if(old) old.remove();
  const el=document.createElement('div'); el.className='svask'; el.setAttribute('role','group');
  el.innerHTML=`<b>برنامه سرویس هم به‌روز شود؟</b>
    <span>«${esc(it.name)}» در ${esc(day)} تعویض شد، با قرائت:</span>
    <input class="svq mono" inputmode="numeric" value="${cur?esc(cur.val):''}" aria-label="قرائت هنگام تعویض" placeholder="قرائت">
    <div class="svb"><button type="button" class="svyes">بله، ثبت شود</button><button type="button" class="svno">نه</button></div>`;
  card.appendChild(el);
  el.querySelector('.svno').addEventListener('click',()=>el.remove());
  el.querySelector('.svyes').addEventListener('click',()=>{
    const v=ntSvc.num(el.querySelector('.svq').value); if(v===null){ say('قرائت را بنویسید',true); el.querySelector('.svq').focus(); return; }
    const L=svLS('nt_svc_v1'), x=L.find(y=>y.id===it.id); if(!x){ el.remove(); return; }
    const prev=ntSvc.state(x,v,day); x.last=v; x.ld=day; delete x.ok;
    const G=svLS('nt_svc_log_v1'); G.push({id:'s'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),item:x.id,dev:x.dev,name:x.name,at:v,d:day,due:prev.next,late:(prev.next!==null&&v>prev.next)?1:0,src:'انبار'});
    try{ localStorage.setItem('nt_svc_v1',JSON.stringify(L)); localStorage.setItem('nt_svc_log_v1',JSON.stringify(G)); }catch(e){ say('ذخیره نشد',true); return; }
    const ev=ntSvc.num(x.every);
    el.className='svask done'; el.textContent='✓ برنامه سرویس به‌روز شد'+(ev?' — بعدی '+fa(v+ev):'');
    setTimeout(()=>{ try{ el.remove(); }catch(e){} },6000);
  });
}
"""
rep("/* ============ سرویس دوره‌ای (نت) ============ */",JS+"\n/* ============ سرویس دوره‌ای (نت) ============ */")
CSS=""".svask{margin-top:8px;padding:10px;border:1px solid #C9A227;border-radius:10px;background:#FFF8E1;display:flex;flex-direction:column;gap:6px;font-size:.85rem;color:#2A2000}
.svask b{font-size:.9rem}
.svask input{width:100%!important;box-sizing:border-box;min-height:44px;border:1px solid #9AA6AF;border-radius:8px;padding:0 8px;text-align:center}
.svask .svb{display:flex;gap:6px}.svask .svb button{flex:1;min-height:44px;border-radius:8px;border:1px solid #C3CDD5;background:#fff;font:inherit;font-weight:700;cursor:pointer;margin:0!important;color:#17212B}
.svask .svyes{background:#1E7F4F!important;border-color:#1E7F4F!important;color:#fff!important}
.svask.done{border-color:#1E7F4F;background:#E8F5EC;color:#14532D;font-weight:700}
"""
k0=t.rfind("</style>"); t=t[:k0]+CSS+t[k0:]
d['b64']=base64.b64encode(t.encode('utf-8')).decode('ascii')
s=s[:i]+json.dumps(docs,ensure_ascii=False)+s[j:]
open(out,'w',encoding='utf-8').write(s); print('an svc')
